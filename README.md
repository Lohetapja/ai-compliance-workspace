# AI Compliance Workspace

A practical, browser-based workspace for organizing AI governance, risk,
evidence, decisions, incidents, and audit-readiness information.

Live site:

**https://lohetapja.github.io/ai-compliance-workspace/**

## What this project is

AI Compliance Workspace is a portfolio project for structuring AI governance
work in one local-first interface. It helps a user document:

- AI system inventory and ownership
- risk classification notes and review flags
- AI-specific risks and treatments
- controls and supporting evidence
- governance decisions
- incidents and issues
- framework mapping notes
- Markdown reports and JSON workspace backups

The bundled sample dataset is fictional: **Northstar AI Cloud**.

## What this project is not

AI Compliance Workspace is **not a legal compliance engine**. It does not provide
legal advice, certify compliance, or guarantee compliance with the EU AI Act,
ISO/IEC 42001, GDPR, NIS2, SOC 2, or any other framework.

It is a practical workspace for organizing governance records and review
artifacts. Human legal, privacy, security, and governance review is still
required.

Do not enter real confidential, personal, customer, regulated, or sensitive
company data into the public demo.

## Why local-first

The app runs entirely in the browser:

- no backend
- no database
- no account system
- no API keys
- no cloud sync
- no telemetry
- no external AI, SIEM, GRC, or ticketing integrations

Workspace data is stored in browser `localStorage`. Export/import is file-based
and user-controlled through JSON backups.

## Current feature summary

- Dashboard with AI portfolio, risk, review, and evidence coverage signals
- AI Systems inventory with detail pages
- Risk Helper for structured review questions and suggested risk bands
- AI Risk Register
- Controls & Evidence workspace
- Decision Journal
- Incidents / Issues log
- Framework Mapping notes
- Markdown report preview/download
- JSON export/import
- Reset/load fictional sample data
- Responsive app shell for smaller screens

## 60-second demo path

1. Open the live demo.
2. Review the **Dashboard** for portfolio status and open gaps.
3. Open **AI Systems** and select a Northstar sample system.
4. Review linked risks, controls, evidence, decisions, and incidents.
5. Open **Risk Helper** to see structured classification questions.
6. Open **Risk Register** and **Controls & Evidence** to inspect linked records.
7. Open **Framework Mapping** for high-level framework notes.
8. Open **Reports** and preview/download a Markdown report.
9. Open **Settings / Data** to export JSON, import JSON, reset demo data, or
   clear local data.

## Local development

Requires Node.js 22+ with npm.

```bash
npm install
npm run dev
```

## Production build and preview

```bash
npm run build
npm run preview
```

The app uses Vite and is configured for the GitHub Pages project URL:

```ts
base: "/ai-compliance-workspace/"
```

Routing uses `HashRouter`, which is simple and reliable for GitHub Pages project
hosting because routes live after `#` and do not require a custom SPA fallback.

## GitHub Pages deployment

Deployment is prepared through GitHub Actions:

```text
.github/workflows/deploy.yml
```

Manual GitHub setting to verify:

```text
Repository → Settings → Pages → Build and deployment → Source → GitHub Actions
```

After pushing to `main`, check:

```text
Repository → Actions → Deploy AI Compliance Workspace to GitHub Pages
```

If the workflow has not been renamed, the Actions entry may appear as:

```text
Deploy to GitHub Pages
```

Expected live URL:

```text
https://lohetapja.github.io/ai-compliance-workspace/
```

## Data safety and demo boundaries

- Sample data is fictional and uses the made-up organization **Northstar AI
  Cloud**.
- Do not import or type real sensitive investigation, legal, customer, personal,
  regulated, or confidential business data into a public/shared browser.
- Markdown reports are working review artifacts, not legal opinions or
  certifications.
- JSON export files may contain everything in your browser workspace. Treat them
  as local files under your control.

## Tech stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router with `HashRouter`
- Zustand with browser `localStorage`
- GitHub Pages + GitHub Actions

## Project status

Built and locally verified as a frontend-only portfolio project. The next step is
GitHub Pages deployment review and manual publish.
