import { QUESTIONS, SUPABASE_KEY, SUPABASE_URL, SURVEY } from "./config.js";

const gate = document.getElementById("gate");
const gateError = document.getElementById("gate-error");
const report = document.getElementById("report");
const summary = document.getElementById("summary");
const total = document.getElementById("total");
const table = document.getElementById("rows");
const from = document.getElementById("from");
const to = document.getElementById("to");
// Kept for this tab only, so a refresh does not ask again; the database checks it on every load.
const KEY = "herfect-interview-passcode";
let all = [];

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  node.append(...children);
  return node;
}

const label = (name, id) => QUESTIONS[name].options.find((o) => o.id === id)?.label ?? id;

async function load(passcode) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/interview_results`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ p_survey: SURVEY, p_passcode: passcode }),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function visible() {
  const start = from.value ? new Date(`${from.value}T00:00:00`) : null;
  const end = to.value ? new Date(`${to.value}T23:59:59.999`) : null;
  return all.filter((row) => {
    const at = new Date(row.created_at);
    return (!start || at >= start) && (!end || at <= end);
  });
}

function bars(name, rows, number) {
  const question = QUESTIONS[name];
  const counts = new Map(question.options.map((o) => [o.id, 0]));
  for (const row of rows) {
    const values = Array.isArray(row[name]) ? row[name] : [row[name]];
    for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  // Single-choice shares are of respondents; for the pick-three question too, so the shares sum to 300%.
  const n = rows.length || 1;
  const top = Math.max(...counts.values());
  const ordered = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const card = el("section", { class: "card" },
    el("h3", {}, el("span", { class: "num" }, `${number}`), question.title));
  if (question.pick) card.append(el("p", { class: "hint" }, `Each respondent picked ${question.pick}; shares are of respondents.`));
  for (const [id, count] of ordered) {
    const option = question.options.find((o) => o.id === id);
    const share = Math.round((count / n) * 100);
    const row = el("div", { class: `bar-row${count === top && count > 0 ? " lead" : ""}` });
    if (option?.img) row.append(el("img", { src: option.img, alt: "" }));
    row.append(el("span", { class: "bar-label" }, option?.label ?? id, option?.note ? el("small", {}, ` ${option.note}`) : ""),
      el("span", { class: "bar" }, el("span", { class: "fill", style: `width:${share}%` })),
      el("span", { class: "bar-value" }, `${count} · ${share}%`));
    card.append(row);
  }
  return card;
}

function influencers(rows, number) {
  const counts = new Map();
  for (const row of rows) {
    for (const raw of row.influencers ?? []) {
      const handle = raw.trim().replace(/^@?/, "@").toLowerCase();
      if (handle !== "@") counts.set(handle, (counts.get(handle) ?? 0) + 1);
    }
  }
  const card = el("section", { class: "card" },
    el("h3", {}, el("span", { class: "num" }, `${number}`), QUESTIONS.influencers.title));
  if (!counts.size) {
    card.append(el("p", { class: "hint" }, "No influencers named yet."));
    return card;
  }
  const list = el("ol", { class: "handles-list" });
  for (const [handle, count] of [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) {
    list.append(el("li", {}, el("a", { href: `https://www.instagram.com/${handle.slice(1)}/`, target: "_blank", rel: "noopener" }, handle),
      el("span", { class: "count" }, `${count}`)));
  }
  card.append(list);
  return card;
}

function render() {
  const rows = visible();
  total.textContent = `${rows.length} ${rows.length === 1 ? "response" : "responses"}${rows.length !== all.length ? ` of ${all.length}` : ""}`;
  summary.replaceChildren();
  let number = 0;
  for (const name of Object.keys(QUESTIONS)) {
    number += 1;
    summary.append(name === "influencers" ? influencers(rows, number) : bars(name, rows, number));
  }
  const head = el("tr", {}, ...["Time", "Bought gummies", "Brand", "Product", "Shape", "Packaging", "Benefits", "Influencers"].map((h) => el("th", {}, h)));
  table.replaceChildren(el("thead", {}, head), el("tbody", {}, ...rows.map((row) => el("tr", {},
    el("td", {}, new Date(row.created_at).toLocaleString()),
    el("td", {}, label("bought_gummies", row.bought_gummies)),
    el("td", {}, label("brand", row.brand)),
    el("td", {}, label("product", row.product)),
    el("td", {}, label("shape", row.shape)),
    el("td", {}, label("packaging", row.packaging)),
    el("td", {}, row.benefits.map((b) => label("benefits", b)).join("; ")),
    el("td", {}, (row.influencers ?? []).join(", "))))));
}

function csv() {
  // SAFETY: a leading apostrophe keeps spreadsheets from evaluating respondent text that starts like a formula.
  const quote = (v) => {
    const text = String(v);
    return `"${(/^[\s\x00-\x1f]*[=+\-@]/.test(text) ? `'${text}` : text).replaceAll('"', '""')}"`;
  };
  const lines = [["time", "bought_gummies", "brand", "product", "shape", "packaging", "benefits", "influencers"].join(",")];
  for (const row of visible()) {
    lines.push([row.created_at, row.bought_gummies, row.brand, row.product, row.shape, row.packaging,
      row.benefits.join("; "), (row.influencers ?? []).join("; ")].map(quote).join(","));
  }
  const link = el("a", { href: URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" })), download: `herfect-${SURVEY}.csv` });
  link.click();
  URL.revokeObjectURL(link.href);
}

async function open(passcode) {
  gateError.hidden = true;
  try {
    const rows = await load(passcode);
    if (rows === null) {
      sessionStorage.removeItem(KEY);
      gate.hidden = false;
      report.hidden = true;
      gateError.textContent = "That passcode is not right.";
      gateError.hidden = false;
      return;
    }
    sessionStorage.setItem(KEY, passcode);
    all = rows;
    gate.hidden = true;
    report.hidden = false;
    render();
  } catch {
    gateError.textContent = "Couldn't load the results. Check your connection and try again.";
    gateError.hidden = false;
  }
}

gate.addEventListener("submit", (event) => {
  event.preventDefault();
  open(document.getElementById("passcode").value.trim());
});
from.addEventListener("change", render);
to.addEventListener("change", render);
document.getElementById("refresh").addEventListener("click", () => open(sessionStorage.getItem(KEY) ?? ""));
document.getElementById("csv").addEventListener("click", csv);

// `results.html#k=<passcode>` opens the report directly: the fragment never reaches a server, and it is removed from
// the address bar and the history entry at once.
const fragment = new URLSearchParams(location.hash.slice(1)).get("k");
if (fragment) history.replaceState(null, "", location.pathname + location.search);
const saved = fragment ?? sessionStorage.getItem(KEY);
if (saved) open(saved);
