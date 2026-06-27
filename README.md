# AI Compliance Workspace

A practical, browser-based workspace for organizing AI governance, risk,
evidence, decisions, incidents, and audit-preparation information.

**Live demo:** https://lohetapja.github.io/ai-compliance-workspace/

**Start here:** open the live demo and click **“Start guided demo”** on the
Dashboard. It runs a short 7-step tour through one sample AI system. This is a
local-first browser demo — it runs entirely in your browser using fictional
sample data, with no backend and nothing leaving your machine.

AI Compliance Workspace is not a legal compliance engine. It is a practical
workspace for organizing AI governance, risk, evidence, decisions, incidents,
and audit-preparation information.

## Purpose

AI compliance work is not only about knowing regulations. It is about creating
structure: what systems exist, who owns them, what risks they create, what
controls reduce those risks, what evidence exists, what decisions were made, and
what needs review.

This project turns that structure into a local-first portfolio app. It helps a
reviewer see how AI governance records can be connected without pretending to
automate legal judgement.

The bundled sample dataset is fictional: **Fictional AI Test Company**.

## Important disclaimer

This project is **not legal advice** and does not certify or guarantee
compliance with the EU AI Act, ISO/IEC 42001, GDPR, NIS2, SOC 2, or any other
framework.

Risk bands, framework notes, evidence coverage, and reports are working review
artifacts. They are designed to support human governance, legal, privacy, and
security review.

This project uses fictional sample data only. It does not represent or reference
any real company. All organizations, systems, people, risks, incidents, and
evidence records in the sample dataset are fictional and created only for
demonstration purposes. Any resemblance to real companies, products, people, or
incidents is unintentional.

Do not enter real confidential, personal, customer, regulated, or sensitive
company data into the public demo.

## What problem it solves

AI governance information often gets scattered across spreadsheets, documents,
tickets, wiki pages, and risk registers. This project shows one way to keep the
core review trail connected:

- which AI systems exist
- who owns them
- why they are used
- what risks they create
- what controls reduce those risks
- what evidence supports those controls
- what decisions were made
- what incidents or issues occurred
- what still needs review

## Features

- **Guided Demo Mode** — a built-in 7-step walkthrough (Dashboard → sample system → risk flags → traceability chain → Framework Lenses → Review Queue → audit pack) with browser-saved progress
- Dashboard with portfolio, risk, review, and evidence coverage signals
- AI Systems inventory with detail pages (summary strip, governance actions, "What to review next", and section jump links)
- Risk Helper for structured review questions and possible risk areas
- AI Risk Register
- Controls & Evidence workspace
- Decision Journal
- Incidents / Issues log
- Gap Actions (turn review warnings into owned follow-up tasks)
- **Framework Lenses** — AI Act, ISO/IEC 42001, GDPR, NIS2, AI Security, and Audit Evidence views over the same data
- **Use Case Intake** — lightweight intake/triage for proposed AI use cases, convertible into an AI System record
- **Vendor Register** — third-party AI providers with contract/privacy/security/DPA review status and dependency risk
- **Traceability chain** on each AI system (System → Risks → Controls → Evidence → Decisions → Incidents → Reports)
- **Evidence freshness** (Fresh / Due Soon / Expired / Missing Review Date) based on review dates
- Framework Mapping notes
- **Research Sources** page (high-level learning references with a verify-with-professionals disclaimer)
- Markdown report preview and download, including **Framework Lens Summary**, **Vendor Risk Summary**, and **Open Actions** reports
- **Appearance settings** (theme dark/light/system, density, text size, high-contrast mode) stored per-browser
- Single-system audit pack export
- JSON import/export for local backups (includes use cases and vendors)
- Load/reset fictional sample data
- Local browser storage only
- Responsive layout for smaller screens

## Recommended Demo Path

**Fastest start:** click **Start guided demo** on the Dashboard. Guided Demo Mode is a
built-in 7-step walkthrough that opens the sample AI system, points out its risk flags
and traceability chain, and ends by exporting a single-system audit pack. Progress is
saved in your browser, and you can exit or restart at any time.

Prefer to explore manually? Follow the same path by hand:

1. Open the Dashboard (note the "Best place to start: Sample AI System" card).
2. Open the sample AI system and scan its summary strip, actions, and "What to review next" panel.
3. Review its risk flags (legal / privacy / security / vendor — review-recommended, not legal verdicts).
4. Follow the traceability chain: risks → controls → evidence → decisions → incidents → gap actions.
5. Open Framework Lenses and compare the same data through AI Act, GDPR, ISO/IEC 42001, NIS2, AI Security, and Audit Evidence views.
6. Open the Review Queue to see overdue and due-soon governance work.
7. Generate a Single-System Audit Pack from the AI System Detail page or the Reports page.
8. Export a JSON backup from Settings / Data.

## Data Relationship Model

```mermaid
flowchart LR
    Intake[Use Case Intake] --> System[AI System]
    Vendor[Vendor Register] --> System
    System --> Risks[Risks]
    Risks --> Controls[Controls]
    Controls --> Evidence[Evidence]
    System --> Decisions[Decisions]
    System --> Incidents[Incidents / Issues]
    System --> Gaps[Gap Actions]
    Evidence --> Reports[Reports]
    Risks --> Reports
    Controls --> Reports
    Decisions --> Reports
    Incidents --> Reports
    Gaps --> Reports
```

## Why Not Just a Spreadsheet?

A spreadsheet can track rows.

AI Compliance Workspace is designed to show relationships:

- AI systems linked to risks
- risks linked to controls
- controls linked to evidence
- evidence linked to reports
- decisions linked to systems and risks
- incidents linked to follow-up actions
- framework lenses showing the same records from different review angles

The goal is not to replace enterprise GRC tools. The goal is to make AI governance structure visible in a lightweight, local-first demo.

## Example workflow

1. Open the live demo.
2. Review the **Dashboard** for portfolio status and open gaps.
3. Open **AI Systems** and select a sample system.
4. Review the system purpose, owner, risk band, review flags, and evidence
   coverage.
5. Open **Risk Helper** to see structured questions and recommended review
   actions.
6. Review linked **Risks**, **Controls & Evidence**, **Decisions**, and
   **Incidents**.
7. Open **Framework Mapping** to inspect high-level review notes.
8. Open **Reports** to preview/download a Markdown report.
9. Open **Settings / Data** to export JSON, import JSON, reset demo data, or
   clear local data.

**Quick guided demo path:** **AI Systems** → open one system → follow its
traceability chain (risks → controls → evidence → decisions → incidents → gap
actions) → open a **Framework Lens** (e.g. GDPR or AI Security) → check the
**Review Queue** → **Generate a Single-System Audit Pack** from Reports.

## Modules

| Module | Purpose |
| --- | --- |
| Dashboard | Summarizes review status, open risks, evidence coverage, and due dates. |
| AI Systems | Tracks system purpose, ownership, model/provider context, data use, review flags, and status. |
| Risk Helper | Structures assessment questions and suggests possible risk areas for human review. |
| Risk Register | Records AI-specific risks, likelihood, impact, treatment, owner, controls, and evidence. |
| Controls & Evidence | Connects controls to systems, risks, framework tags, and supporting evidence. |
| Decision Journal | Captures governance decisions, rationale, reviewers, linked risks, and evidence. |
| Incidents / Issues | Records AI-related incidents, impact, containment, root cause, and follow-up actions. |
| Gap Actions | Tracks missing-evidence/review follow-up tasks with owner, severity, due date, and status. |
| Use Case Intake | Captures proposed AI use cases and the reviews they need; approved intakes convert into AI systems. |
| Vendor Register | Tracks third-party AI providers, data shared, review statuses, and dependency/exit risk. |
| Framework Lenses | High-level AI Act / GDPR / ISO/IEC 42001 / NIS2 / AI Security / Audit Evidence / Vendor Risk / Management views — indicative only. |
| Framework Mapping | Stores high-level notes by framework and requirement area. |
| Research Sources | Official/primary references first (EUR-Lex, European Commission, EU AI Office, EDPB, ENISA, ISO, NIST, OWASP, MITRE ATLAS, AICPA), with non-official convenience sites grouped under background reading. |
| Review Queue | Time-based queue of what is overdue or due soon across systems, evidence, vendors, risks, controls, gap actions, and intake. |
| Owners & Responsibilities | A responsibility matrix showing who owns what (based on owner-name strings — no accounts). |
| Reports | 12 Markdown reports (incl. Framework Lens Summary, Vendor Risk, Open Actions, GDPR Privacy Review, AI Security) + single-system audit packs + CSV exports of key tables. |
| Settings / Data | Manages sample data, JSON backup/restore, local data clearing, appearance (theme, density, text size, high contrast), and workflow preferences. |

### How this differs from enterprise tools

This project intentionally does **not** include: auto-discovery of AI systems, runtime telemetry
ingestion, continuous model monitoring, policy enforcement, enterprise integrations,
authentication/authorization, collaboration workflows, immutable audit logs, real evidence
attachments, legal compliance determination, certification workflows, or official framework content
libraries. It is a local-first portfolio and learning project focused on structure, workflow,
evidence, and audit-preparation thinking.

Enterprise tools such as AI governance/GRC platforms usually provide integrations, automation,
collaboration, monitoring, and formal audit workflows. **This project is not a replacement for those
tools.**

## Screenshots

All screenshots use the fictional **Fictional AI Test Company** sample dataset.

### Dashboard

![Dashboard overview](assets/screenshots/Dashboard_part1.jpg)

![Dashboard continued](assets/screenshots/Dashboard_part2.jpg)

![Dashboard lower sections](assets/screenshots/Dashboard_part3.jpg)

### AI Systems Inventory

![AI Systems inventory](assets/screenshots/AISystems.jpg)

### AI System Detail

The main showcase page: summary strip, governance actions, "What to review next" panel, the
traceability chain, and all linked governance records.

![AI System Detail — summary strip, actions, what to review next, and traceability chain](assets/screenshots/SystemDetail_part1.jpg)

![AI System Detail — overview, privacy/GDPR fields, linked risks, evidence coverage, and open gaps](assets/screenshots/SystemDetail_part2.jpg)

![AI System Detail — linked controls, evidence, decisions, and incidents](assets/screenshots/SystemDetail_part3.jpg)

### Framework Lenses

![Framework Lenses](assets/screenshots/FrameworkLenses.jpg)

### Review Queue

![Review Queue](assets/screenshots/ReviewQueue.jpg)

### Reports

![Reports and Audit Pack](assets/screenshots/Reports.jpg)

### Use Case Intake

![Use Case Intake](assets/screenshots/UseCaseIntake.jpg)

### Vendor Register

![Vendor Register](assets/screenshots/VendorRegister.jpg)

## Data and privacy model

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

JSON exports can contain everything in the local workspace. Treat exported files
as local records under your control.

## Evidence coverage

Evidence Coverage is not a compliance score. It only shows how much of the
recommended evidence checklist has been documented for the AI systems in the
workspace.

Low or partial coverage in the fictional sample data is intentional. It makes
the demo show realistic gaps, review needs, and work-in-progress governance
records.

## Tech stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router with `HashRouter`
- Zustand with browser `localStorage`
- GitHub Pages + GitHub Actions

## Run locally

Requires Node.js 22+ with npm.

```bash
npm install
npm run dev
```

## Build locally

```bash
npm run build
npm run preview
```

The app is configured for the GitHub Pages project URL:

```ts
base: "/ai-compliance-workspace/"
```

Routing uses `HashRouter`, which is simple and reliable for GitHub Pages project
hosting because routes live after `#` and do not require a custom SPA fallback.

## Deploy to GitHub Pages

Deployment is prepared through GitHub Actions:

```text
.github/workflows/deploy.yml
```

Manual GitHub setting to verify:

```text
Repository -> Settings -> Pages -> Build and deployment -> Source -> GitHub Actions
```

After pushing to `main`, check:

```text
Repository -> Actions -> Deploy to GitHub Pages
```

Expected live URL:

```text
https://lohetapja.github.io/ai-compliance-workspace/
```

## Limitations

- This is a portfolio project, not a production GRC platform.
- No backend, authentication, multi-user workflow, approval workflow, or audit
  log service.
- No legal determination or framework certification.
- No live integrations with GRC, SIEM, ticketing, cloud, identity, model
  registry, or document systems.
- Data is per-browser unless exported/imported manually.
- Risk Helper output is indicative and should be reviewed by qualified humans.

## Portfolio value

This project demonstrates:

- structured AI governance thinking
- cautious compliance wording
- local-first data handling
- AI risk and evidence relationships
- Markdown report generation
- GitHub Pages deployment for a TypeScript React app
- practical UI for governance, risk, evidence, decisions, and incidents

## Roadmap

Near-term polish:

- Continue mobile usability checks.
- Add more guided empty states and examples.
- Add focused tests for pure report/risk helper logic.
- Refine import validation and backup messaging.

## Future ideas

These are intentionally not part of the current local-first portfolio demo:

- optional static read-only export
- richer framework mapping templates
- per-system evidence checklist customization
- accessibility audit
- optional backend only if the local workflow is proven useful

Not planned for the public demo:

- legal advice automation
- automatic compliance certification
- AI API calls
- OAuth/API-key storage
- live GRC/SIEM/ticketing integrations
- real customer data handling

## Author and links

Built by **Riivo Maadla**.

- Live demo: https://lohetapja.github.io/ai-compliance-workspace/
- Repository: https://github.com/Lohetapja/ai-compliance-workspace
- GitHub: https://github.com/Lohetapja
- LinkedIn: https://www.linkedin.com/in/riivo-m-43530a154/

## License

MIT — see [LICENSE](LICENSE).
