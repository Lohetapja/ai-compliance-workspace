import type { AISystem, WorkspaceData } from '../types';
import type { IconName } from '../components/ui/Icon';

/** The id of the fictional system used as the default walkthrough subject. */
export const DEMO_SYSTEM_ID = 'sys-support';

/**
 * Pick the best system to showcase: the canonical sample system if present,
 * otherwise the first active customer-facing system, otherwise any system.
 * Returns undefined only when the workspace has no systems at all.
 */
export function pickShowcaseSystem(data: WorkspaceData): AISystem | undefined {
  return (
    data.systems.find((s) => s.id === DEMO_SYSTEM_ID) ??
    data.systems.find((s) => s.customerFacing && s.currentStatus !== 'archived') ??
    data.systems.find((s) => s.currentStatus !== 'archived') ??
    data.systems[0]
  );
}

/** One step of the guided walkthrough. `to` is resolved with the system id. */
export interface DemoStep {
  title: string;
  body: string;
  cta: string;
  icon: IconName;
  /** Route the CTA navigates to. */
  to: (systemId: string) => string;
  /** Optional element id to scroll into view after navigating. */
  anchor?: string;
  /** Last step downloads the single-system audit pack instead of navigating. */
  audit?: boolean;
}

/**
 * 7-step tour: Dashboard → sample system → risk flags → traceability chain →
 * Framework Lenses → Review Queue → Single-System Audit Pack.
 */
export const DEMO_STEPS: DemoStep[] = [
  {
    title: 'Welcome to the guided demo',
    body: 'A short 7-step tour that follows one AI system from risk flags to evidence to an exportable audit pack. Everything uses the fictional sample dataset and stays in your browser.',
    cta: 'Start at the Dashboard',
    icon: 'dashboard',
    to: () => '/dashboard',
  },
  {
    title: 'Open the sample AI system',
    body: 'Meet the Customer Support Assistant — a customer-facing LLM assistant. The AI System Detail page is the heart of the workspace: its summary strip and actions sit right at the top.',
    cta: 'Open the sample system',
    icon: 'systems',
    to: (id) => `/systems/${id}`,
    anchor: 'system-summary',
  },
  {
    title: 'Review the risk flags',
    body: 'Review flags (legal, privacy, security, vendor) mark where human review is recommended — never an automatic legal verdict. The “What to review next” panel highlights what is open for this system.',
    cta: 'Show what to review next',
    icon: 'warning',
    to: (id) => `/systems/${id}`,
    anchor: 'review-next',
  },
  {
    title: 'Follow the traceability chain',
    body: 'System → Risks → Controls → Evidence → Decisions → Incidents → Gap Actions → Reports. Click any node to jump to it. This high-level chain is what makes the workspace audit-ready.',
    cta: 'Show the traceability chain',
    icon: 'link',
    to: (id) => `/systems/${id}`,
    anchor: 'trace-chain',
  },
  {
    title: 'See it through Framework Lenses',
    body: 'The same data, viewed through governance angles (EU AI Act, GDPR, ISO/IEC 42001, NIS2, AI security). Indicative orientation only — not a compliance determination.',
    cta: 'Open Framework Lenses',
    icon: 'layers',
    to: () => '/framework-lenses',
  },
  {
    title: 'Check the Review Queue',
    body: 'Governance work is time-based. The Review Queue gathers everything overdue or due soon across systems, evidence, vendors, risks, controls and gap actions.',
    cta: 'Open the Review Queue',
    icon: 'clock',
    to: () => '/review-queue',
  },
  {
    title: 'Export the audit pack',
    body: 'Bundle this system’s risks, controls, evidence, decisions and gaps into one Markdown audit-preparation pack — the kind of high-level artifact you would bring to an internal review.',
    cta: 'Download the audit pack',
    icon: 'download',
    to: (id) => `/systems/${id}`,
    audit: true,
  },
];

export const DEMO_STEP_COUNT = DEMO_STEPS.length;
