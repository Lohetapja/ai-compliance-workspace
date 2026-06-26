import type {
  ClassificationAnswers,
  ClassificationResult,
  RiskCategory,
  Tri,
} from '../types';
import { nowISO } from './id';

/**
 * The Risk Classification Helper is a *guided questionnaire*, not a legal
 * classifier. It never asserts a legal conclusion. It surfaces areas that may
 * warrant review and proposes a non-binding "possible risk area" band.
 */

export type ReviewFlagKey =
  | 'legal'
  | 'privacy'
  | 'security'
  | 'vendor'
  | 'humanOversight';

export interface HelperQuestion {
  id: string;
  text: string;
  group: string;
  help?: string;
  /** Which review flags this question raises when answered "yes". */
  raisesFlags?: ReviewFlagKey[];
  /** Weight added toward an elevated band when answered "yes". */
  weightYes?: number;
  /** Weight when answered "unknown" (uncertainty still counts a little). */
  weightUnknown?: number;
  /** A "yes" here points to a possible high-risk *context* needing legal review. */
  highRiskContext?: boolean;
  /** A "no" here is the concerning answer (e.g. "Are logs available?"). */
  concerningWhenNo?: boolean;
}

export const HELPER_QUESTIONS: HelperQuestion[] = [
  {
    id: 'sensitive-domain',
    group: 'Context & use',
    text: 'Is the AI used in employment, education, healthcare, finance, law enforcement, critical infrastructure, public services, safety, or legal contexts?',
    help: 'These are domains where regulators often apply heightened obligations.',
    raisesFlags: ['legal'],
    highRiskContext: true,
    weightYes: 3,
    weightUnknown: 1,
  },
  {
    id: 'affects-access',
    group: 'Context & use',
    text: 'Does it affect access to rights, services, money, employment, education, healthcare, housing, credit, or legal outcomes?',
    raisesFlags: ['legal'],
    highRiskContext: true,
    weightYes: 3,
    weightUnknown: 1,
  },
  {
    id: 'customer-facing',
    group: 'Context & use',
    text: 'Is it customer-facing (rather than internal-only)?',
    raisesFlags: ['security'],
    weightYes: 1,
  },
  {
    id: 'autonomous',
    group: 'Autonomy & oversight',
    text: 'Does it act autonomously or semi-autonomously (rather than advisory only)?',
    raisesFlags: ['humanOversight'],
    weightYes: 2,
    weightUnknown: 1,
  },
  {
    id: 'no-human-review',
    group: 'Autonomy & oversight',
    text: 'Can it take or trigger actions WITHOUT human review beforehand?',
    help: 'If a human must approve actions, residual risk is usually lower.',
    raisesFlags: ['humanOversight'],
    weightYes: 2,
    weightUnknown: 1,
  },
  {
    id: 'personal-data',
    group: 'Data',
    text: 'Is personal data processed?',
    raisesFlags: ['privacy'],
    weightYes: 2,
    weightUnknown: 1,
  },
  {
    id: 'sensitive-data',
    group: 'Data',
    text: 'Is special-category / sensitive data processed (health, biometrics, etc.)?',
    raisesFlags: ['privacy', 'legal'],
    highRiskContext: true,
    weightYes: 3,
    weightUnknown: 1,
  },
  {
    id: 'biometric-profiling',
    group: 'Data',
    text: 'Is it used for biometric identification, emotion recognition, profiling, or automated decision support?',
    raisesFlags: ['legal', 'privacy'],
    highRiskContext: true,
    weightYes: 3,
    weightUnknown: 1,
  },
  {
    id: 'material-harm',
    group: 'Potential harm',
    text: 'Could incorrect output cause material harm (financial, physical, legal, reputational)?',
    raisesFlags: ['legal', 'security'],
    weightYes: 2,
    weightUnknown: 1,
  },
  {
    id: 'bias',
    group: 'Potential harm',
    text: 'Could bias or discrimination occur in its outputs?',
    raisesFlags: ['legal'],
    weightYes: 2,
    weightUnknown: 1,
  },
  {
    id: 'misuse',
    group: 'Potential harm',
    text: 'Could the system be misused or abused?',
    raisesFlags: ['security'],
    weightYes: 1,
    weightUnknown: 1,
  },
  {
    id: 'prompt-injection',
    group: 'AI security',
    text: 'Could prompt injection affect its outputs or actions?',
    help: 'Relevant for LLM-based systems that read untrusted input or call tools.',
    raisesFlags: ['security'],
    weightYes: 2,
    weightUnknown: 1,
  },
  {
    id: 'data-leakage',
    group: 'AI security',
    text: 'Could sensitive data leak through prompts, logs, tools, or outputs?',
    raisesFlags: ['security', 'privacy'],
    weightYes: 2,
    weightUnknown: 1,
  },
  {
    id: 'logs-available',
    group: 'Operational readiness',
    text: 'Are logs available for this system?',
    concerningWhenNo: true,
    raisesFlags: ['security'],
    weightYes: 0,
  },
  {
    id: 'audit-trail',
    group: 'Operational readiness',
    text: 'Is an audit trail available?',
    concerningWhenNo: true,
    weightYes: 0,
  },
  {
    id: 'vendor-documented',
    group: 'Operational readiness',
    text: 'Is vendor / provider information documented?',
    concerningWhenNo: true,
    raisesFlags: ['vendor'],
    weightYes: 0,
  },
  {
    id: 'oversight-owner',
    group: 'Operational readiness',
    text: 'Is there a named human-oversight owner?',
    concerningWhenNo: true,
    raisesFlags: ['humanOversight'],
    weightYes: 0,
  },
  {
    id: 'incident-handling',
    group: 'Operational readiness',
    text: 'Is incident handling defined for this system?',
    concerningWhenNo: true,
    weightYes: 0,
  },
];

export function emptyAnswers(): ClassificationAnswers {
  const a: ClassificationAnswers = {};
  for (const q of HELPER_QUESTIONS) a[q.id] = 'unknown';
  return a;
}

function val(answers: ClassificationAnswers, id: string): Tri {
  return answers[id] ?? 'unknown';
}

export function classify(answers: ClassificationAnswers): ClassificationResult {
  const flags = {
    legal: false,
    privacy: false,
    security: false,
    vendor: false,
    humanOversight: false,
  };
  const reasons: string[] = [];
  const actions = new Set<string>();

  // "score" comes from concrete, concerning answers. "unknownScore" tracks
  // uncertainty separately so that an unanswered questionnaire never maps
  // straight to the top band — missing information raises caution, not a verdict.
  let score = 0;
  let unknownScore = 0;
  let unknownCount = 0;
  let highContextHit = false;

  for (const q of HELPER_QUESTIONS) {
    const answer = val(answers, q.id);

    const concerning =
      q.concerningWhenNo ? answer === 'no' : answer === 'yes';

    if (concerning) {
      score += q.weightYes ?? 1;
      if (q.raisesFlags) for (const f of q.raisesFlags) flags[f] = true;
      if (q.highRiskContext) highContextHit = true;
      reasons.push(reasonFor(q, answer));
    } else if (answer === 'unknown') {
      unknownCount++;
      if (q.weightUnknown) {
        unknownScore += q.weightUnknown;
        reasons.push(`Uncertain: "${q.text}"`);
      }
    }
  }

  // Map raised flags to recommended actions.
  if (flags.legal)
    actions.add(
      'Request a legal review to determine whether high-risk obligations may apply.'
    );
  if (flags.privacy)
    actions.add('Request a privacy / data-protection review (e.g. DPIA note).');
  if (flags.security)
    actions.add('Request a security review (prompt injection, data leakage, abuse).');
  if (flags.vendor)
    actions.add('Document vendor / provider details and complete a vendor assessment.');
  if (flags.humanOversight)
    actions.add('Define and document a human-oversight plan and named owner.');

  // Operational gaps → concrete next steps.
  if (val(answers, 'logs-available') === 'no')
    actions.add('Enable and document logging before production use.');
  if (val(answers, 'audit-trail') === 'no')
    actions.add('Establish an audit trail and capture it as evidence.');
  if (val(answers, 'incident-handling') === 'no')
    actions.add('Define an incident-handling process and assign an owner.');

  // Determine a *non-binding* band from concrete answers first.
  let suggestedCategory: RiskCategory;
  if (highContextHit && score >= 6) suggestedCategory = 'high-review-needed';
  else if (score >= 8) suggestedCategory = 'high-review-needed';
  else if (score >= 4) suggestedCategory = 'elevated';
  else if (score >= 1) suggestedCategory = 'limited';
  else suggestedCategory = 'minimal';

  // Uncertainty raises caution by at most one band on its own — it cannot, by
  // itself, reach "high-review-needed".
  if (unknownScore >= 10 && (suggestedCategory === 'minimal' || suggestedCategory === 'limited'))
    suggestedCategory = 'elevated';
  else if (unknownScore >= 5 && suggestedCategory === 'minimal')
    suggestedCategory = 'limited';

  const summary = summaryFor(suggestedCategory, unknownCount);

  if (unknownCount >= 4) {
    actions.add(
      'Resolve open "unknown" answers — several inputs are undocumented.'
    );
  }
  actions.add('Record the outcome as a decision and set a review date.');

  return {
    suggestedCategory,
    summary,
    reviewFlags: flags,
    reasons,
    recommendedActions: [...actions],
    answers,
    ranAt: nowISO(),
  };
}

function reasonFor(q: HelperQuestion, answer: Tri): string {
  if (q.concerningWhenNo && answer === 'no') {
    return `Gap: "${q.text}" answered "no".`;
  }
  return q.text;
}

function summaryFor(category: RiskCategory, unknownCount: number): string {
  const base: Record<RiskCategory, string> = {
    unassessed: 'Not yet assessed.',
    minimal:
      'Possible minimal-risk area based on the answers given. Keep basic documentation and revisit if the use changes.',
    limited:
      'Possible limited-risk area. Maintain transparency, logging and documentation, and revisit periodically.',
    elevated:
      'Possible elevated risk area. Legal / privacy / security review is recommended before production use.',
    'high-review-needed':
      'This may require legal review to determine whether high-risk obligations apply. Treat as elevated until reviewed.',
  };
  const note =
    unknownCount > 0
      ? ` ${unknownCount} answer(s) were "unknown" — this result is uncertain and should not be treated as final.`
      : '';
  return base[category] + note;
}

/** Shared disclaimer string reused across the helper UI and reports. */
export const HELPER_DISCLAIMER =
  'This questionnaire is a structuring aid, not a legal classification. ' +
  'It does not determine EU AI Act risk tiers or any compliance status. ' +
  'Use it to decide where human (legal / privacy / security) review is needed.';
