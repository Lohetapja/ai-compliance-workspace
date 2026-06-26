import type { Impact, Likelihood, Severity } from '../types';

const LIKELIHOOD_SCORE: Record<Likelihood, number> = { low: 1, medium: 2, high: 3 };
const IMPACT_SCORE: Record<Impact, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

/**
 * Derive a severity band from likelihood × impact.
 * This is a simple, transparent heuristic — not a formal risk-scoring standard.
 */
export function computeSeverity(likelihood: Likelihood, impact: Impact): Severity {
  const score = LIKELIHOOD_SCORE[likelihood] * IMPACT_SCORE[impact];
  if (score >= 9) return 'critical';
  if (score >= 6) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}

export const SEVERITY_ORDER: Record<Severity, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};
