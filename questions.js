import { QUESTIONS, SUPABASE_KEY, SUPABASE_URL, SURVEY } from "./config.js";

const form = document.getElementById("survey");
const host = document.getElementById("questions");
const error = document.getElementById("error");
const thanks = document.getElementById("thanks");

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  node.append(...children);
  return node;
}

function choiceQuestion(name, number, question) {
  const multi = Boolean(question.pick);
  const set = el("fieldset", { class: "question", "data-name": name });
  const hint = multi ? el("span", { class: "hint" }, ` Pick ${question.pick}.`) : "";
  set.append(el("legend", {}, el("span", { class: "num" }, `${number}`), question.title, hint));
  const grid = el("div", { class: question.options.some((o) => o.img) ? "options cards" : "options list" });
  for (const option of question.options) {
    const input = el("input", { type: multi ? "checkbox" : "radio", name, value: option.id });
    const parts = [input];
    if (option.img) parts.push(el("img", { src: option.img, alt: "", loading: "lazy" }));
    parts.push(el("span", { class: "label" }, option.label));
    if (option.note) parts.push(el("span", { class: "note" }, option.note));
    grid.append(el("label", { class: "option" }, ...parts));
  }
  set.append(grid);
  if (multi) {
    // Once three are ticked the rest are disabled, so the answer always has exactly `pick` items.
    set.addEventListener("change", () => {
      const ticked = set.querySelectorAll("input:checked").length;
      for (const box of set.querySelectorAll("input:not(:checked)")) box.disabled = ticked >= question.pick;
    });
  }
  return set;
}

function influencerQuestion(number, question) {
  const set = el("fieldset", { class: "question", "data-name": "influencers" });
  set.append(el("legend", {}, el("span", { class: "num" }, `${number}`), question.title,
    el("span", { class: "hint" }, " Optional.")));
  const list = el("div", { class: "handles" });
  for (let i = 1; i <= 3; i += 1) {
    list.append(el("input", { type: "text", name: "influencers", placeholder: `@influencer ${i}`,
      autocomplete: "off", autocapitalize: "none", maxlength: "60", "aria-label": `Influencer ${i}` }));
  }
  set.append(list);
  return set;
}

let number = 0;
for (const [name, question] of Object.entries(QUESTIONS)) {
  number += 1;
  host.append(name === "influencers" ? influencerQuestion(number, question) : choiceQuestion(name, number, question));
}

function answers() {
  const data = new FormData(form);
  const one = (name) => data.get(name);
  return {
    survey: SURVEY,
    bought_gummies: one("bought_gummies"),
    brand: one("brand"),
    product: one("product"),
    shape: one("shape"),
    packaging: one("packaging"),
    benefits: data.getAll("benefits"),
    influencers: data.getAll("influencers").map((h) => h.trim()).filter(Boolean),
  };
}

function firstMissing(row) {
  for (const name of ["bought_gummies", "brand", "product", "shape", "packaging"]) {
    if (!row[name]) return name;
  }
  if (row.benefits.length !== QUESTIONS.benefits.pick) return "benefits";
  return null;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const row = answers();
  const missing = firstMissing(row);
  for (const set of host.querySelectorAll(".question")) set.classList.toggle("missing", set.dataset.name === missing);
  if (missing) {
    error.textContent = missing === "benefits" ? "Please pick three benefits." : "Please answer every question.";
    error.hidden = false;
    host.querySelector(`[data-name="${missing}"]`).scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  error.hidden = true;
  const button = form.querySelector(".submit");
  button.disabled = true;
  button.textContent = "Saving…";
  try {
    // INVARIANT: `return=minimal`; the publishable key may insert but not read rows back.
    const response = await fetch(`${SUPABASE_URL}/rest/v1/interview_responses`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(row),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    form.hidden = true;
    thanks.hidden = false;
    thanks.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch {
    error.textContent = "Couldn't save your answers. Check your connection and try again.";
    error.hidden = false;
  } finally {
    button.disabled = false;
    button.textContent = "Submit";
  }
});

document.getElementById("again").addEventListener("click", () => {
  form.reset();
  for (const box of host.querySelectorAll("input")) box.disabled = false;
  thanks.hidden = true;
  form.hidden = false;
  window.scrollTo({ top: 0 });
});
