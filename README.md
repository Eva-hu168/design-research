# Design research

Consumer interview for Herfect daily gummies.

- **[Quick Questions](https://eva-hu168.github.io/design-research/)**: seven short questions for respondents; answers are saved on submit.
- **[Results](https://eva-hu168.github.io/design-research/results.html)**: every answer, counted per question with shares, a table of all responses, date filters and a CSV download. Opens with the team passcode.

## How it works

Plain HTML, CSS and JavaScript, published with GitHub Pages from `main`. Answers go to a Supabase table that the page's publishable key may insert into but not read; the Results page reads them through a database function that checks the passcode.

| File | Holds |
|---|---|
| `index.html`, `questions.js` | the questionnaire and its submit |
| `results.html`, `results.js` | the passcode gate, the per-question summary, the table and the CSV export |
| `config.js` | the Supabase URL and publishable key, the survey id and every question with its options |
| `style.css` | both pages |
| `assets/` | the option images |

To change a question, edit `config.js`; the answer columns and their allowed values are checked by the database too, so a new option needs the table's check constraint updated as well.

Preview locally with `python3 -m http.server`, then open `http://localhost:8000`.
