# AI Compliance Workspace

A practical, browser-based workspace for **AI governance, risk tracking, evidence collection, decision traceability, incident tracking, and audit preparation.**

> AI compliance work is not only about knowing regulations. It is about creating structure: what systems exist, who owns them, what risks they create, what controls reduce those risks, what evidence exists, what decisions were made, and what needs review.

---

## ⚠️ Disclaimer (please read)

This is a **demo / portfolio tool**, not a legal compliance engine.

- It does **not** tell you that you are compliant.
- It does **not** guarantee EU AI Act compliance or certify ISO/IEC 42001.
- It does **not** make final legal risk classifications.
- It is **not** legal advice and does not replace legal, privacy, or security review.

It helps you **structure the work** and decide where human review is needed. The Risk Classification Helper produces *careful review flags and a non-binding "possible risk area"*, never a legal conclusion. Anything that looks like a score is called **Evidence Coverage** and is explicitly *not* a compliance score.

**Demo workspace only — do not enter real confidential, personal, customer, regulated, or sensitive company data.** All data stays in your browser.

---

## Live demo

- **Live demo:** _add your GitHub Pages URL here_ → `https://<user>.github.io/ai-compliance-workspace/`
- The demo seeds a fictional company (**Northstar AI Cloud**, a made-up European AI infrastructure provider) on first load. You can reset, clear, export, or import data at any time from **Settings / Data**.

## Screenshots

_Add screenshots here (Dashboard, AI System detail, Risk Helper, Reports)._

| Dashboard | System detail | Risk helper |
| --- | --- | --- |
| _screenshot_ | _screenshot_ | _screenshot_ |

---

## Purpose

The app helps a team answer practical questions before an audit or internal review:

- What AI systems do we have, who owns them, and what are they for?
- What data do they process? Is personal or sensitive data involved?
- What risks exist, and what controls reduce them?
- What evidence supports those controls — and what is missing?
- What decisions were made, by whom, on what basis, and when should they be revisited?
- What incidents happened? What needs review now / soon / overdue?

It is built in the same spirit as a SOC case-management workspace, but for **AI governance cases** instead of security investigations.

## Features

- **Dashboard** — "needs attention" overview: systems by risk band, possible high-risk systems, open high/critical risks, overdue & due-soon reviews, controls without evidence, missing evidence, open incidents, pending reviews, and an **Evidence Coverage** meter.
- **AI System Inventory** — rich records (ownership, data, deployment, oversight, autonomy, review flags) with create / edit / **clone** / archive / delete.
- **AI System detail hub** — linked **Risks, Controls, Evidence, Decisions, Incidents** panels with one-click creation that auto-links to the system, plus open-gap detection, evidence coverage, review flags, and a one-click **Audit Pack** export.
- **Risk Classification Helper** — a guided questionnaire that outputs a *possible* risk band, uncertainty warning, review flags (legal / privacy / security / vendor / human oversight), and recommended next actions. Results can be applied back to a system.
- **AI Risk Register** — likelihood × impact → derived severity, treatment status, templates for 21 common AI risks (prompt injection, data leakage, hallucination, bias, excessive agency, model theft, training-data poisoning, …).
- **Controls & Evidence** — 21 control categories, control/evidence templates, status tracking, and missing-evidence warnings.
- **Decision Journal** — decision traceability (rationale, reviewers, evidence used, next review) with Markdown export.
- **Incident / Issue Log** — AI-specific incidents with impact, containment, root cause and lessons learned.
- **Reports** — Markdown export of 6 workspace reports plus a per-system **Single-System Audit Pack**.
- **Framework Mapping** — high-level mapping to EU AI Act, ISO/IEC 42001, ISO/IEC 27001, GDPR, NIS2, NIST AI RMF, OWASP LLM Top 10, MITRE ATLAS, SOC 2, with editable requirement-area notes.
- **Quality-of-life** — global search (Ctrl/⌘K), quick filters, status chips, review-date tracking (overdue / 7d / 30d), tooltips/glossary, empty states that teach, autosave indicator, JSON import/export, load/reset/clear sample data, persistent demo warning, and mobile-friendly tables that collapse to cards.

## Use cases

- Preparing an internal AI governance review or external audit.
- Building an AI system inventory and risk register from scratch.
- Triaging which systems need legal / privacy / security review.
- Demonstrating responsible-AI and AI-governance thinking in a portfolio.

## Example workflow

1. **Create an AI system** (or load the sample data).
2. **Run the Risk Classification Helper** → get review flags and a possible risk band, apply it to the system.
3. **Add AI-specific risks** (from templates or blank), linked to the system.
4. **Add controls** that reduce those risks, and **attach evidence**.
5. **Record decisions** (e.g. "approve for production with human oversight").
6. **Log incidents / issues** when things go wrong, capturing lessons learned.
7. **Export an Audit Pack** (Markdown) and a JSON backup.
8. **Review again later** — the dashboard surfaces what's overdue or missing.

## Data model overview

All data is a single JSON document persisted in `localStorage` and exportable/importable:

- `AISystem` — the central entity; links to risks, controls, evidence, decisions, incidents.
- `AIRisk` — likelihood/impact/severity, treatment status, linked controls/evidence.
- `Control` — category, status, evidence-required flag, linked systems/risks/evidence.
- `Evidence` — type, status (missing → draft → available → reviewed → expired), references.
- `Decision` — rationale, reviewers, evidence used, risk treatment, next review.
- `Incident` — severity, type, containment, root cause, lessons learned.
- `FrameworkNote` — high-level notes per (framework, requirement area).

Types are defined in [`src/types/index.ts`](src/types/index.ts).

## Framework mapping explanation

Framework mapping is intentionally **high-level**. It does **not** reproduce copyrighted standard text, quote ISO clauses, or interpret the law. Each control, risk, evidence item, and system can carry framework **tags** and a **requirement area**; the Framework Mapping page aggregates these into an orientation view with open-gap counts and editable notes. Always treat it as a starting point for human review.

## Limitations

- No backend, accounts, or multi-user sync — single browser, single device.
- Risk classification is heuristic and non-legal by design.
- Evidence is referenced by note/URL; the app intentionally does not store files.
- Framework mapping is coarse and indicative, not authoritative.

## Security & privacy notes

- 100% client-side. No server, no analytics, no network calls for your data.
- Data lives in `localStorage` under a single key and never leaves the browser.
- Export a JSON backup before clearing data or switching machines.
- The app is designed for **fictional demo data only**.

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · Zustand (with `localStorage` persistence) · React Router (HashRouter, for GitHub Pages). No backend.

## Run locally

```bash
npm install
npm run dev
```

Then open the printed URL (e.g. `http://localhost:5173/ai-compliance-workspace/`).

## Build

```bash
npm run build      # type-checks and builds to dist/
npm run preview    # preview the production build locally
```

## Deploy to GitHub Pages

This repo is configured for project-site deployment (the Vite `base` is `/ai-compliance-workspace/`) and uses **HashRouter**, so deep links and refreshes work without extra 404 handling.

**Option A — GitHub Actions (recommended).** A workflow is included at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Push to `main`, then in **Settings → Pages**, set **Source: GitHub Actions**.

**Option B — `gh-pages` branch.**

```bash
npm run deploy     # builds and publishes dist/ to the gh-pages branch
```

Then set **Settings → Pages → Source: Deploy from a branch → `gh-pages`**.

> If your repository name differs, update `base` in [`vite.config.ts`](vite.config.ts) and `homepage` in `package.json` accordingly.

## Roadmap

- [ ] PDF export for reports and audit packs.
- [ ] Optional encrypted local storage.
- [ ] Optional backend + authentication for multi-user teams.
- [ ] More framework requirement-area templates and saved filters.
- [ ] Richer charts and trend tracking over time.

## Why this project exists

It demonstrates practical thinking for an **AI Compliance Analyst**-type role at a European AI infrastructure / AI cloud company: EU AI Act-style risk categorisation, ISO/IEC 42001-style AI management-system thinking, AI-specific risk registers, GDPR/NIS2-relevant governance, AI security risks (prompt injection, data leakage), audit trails, control logs, evidence management, and cross-functional collaboration between engineering, legal, security, product and audit.

## Portfolio value

It shows the ability to build structured tools around AI governance, AI security, risk management, evidence collection, audit preparation, documentation, decision traceability, responsible AI, and practical compliance workflows — humbly and without legal overclaiming.

It says, through the work: *"I am learning AI governance and compliance by building a structured tool around it."*

## License

MIT — see [LICENSE](LICENSE).
