import {
  CONTROL_STATUS_LABELS,
  EVIDENCE_STATUS_LABELS,
  GAP_ACTION_STATUS_LABELS,
  INCIDENT_STATUS_LABELS,
  INTAKE_STATUS_LABELS,
  REVIEW_STATUS_LABELS,
  RISK_CATEGORY_LABELS,
  RISK_STATUS_LABELS,
  SYSTEM_STATUS_LABELS,
  type ControlStatus,
  type EvidenceStatus,
  type GapActionStatus,
  type IncidentStatus,
  type IntakeStatus,
  type ReviewStatus,
  type RiskCategory,
  type RiskLevel,
  type RiskStatus,
  type Severity,
  type SystemStatus,
} from '../../types';
import { REVIEW_STATE_LABELS, type ReviewState } from '../../lib/dates';
import { FRESHNESS_LABELS, type Freshness } from '../../lib/freshness';
import { Chip, type Tone } from './Chip';

const SYSTEM_STATUS_TONE: Record<SystemStatus, Tone> = {
  draft: 'neutral',
  'in-review': 'info',
  approved: 'brand',
  active: 'ok',
  'needs-review': 'warn',
  paused: 'warn',
  retired: 'neutral',
  archived: 'neutral',
};

const RISK_CATEGORY_TONE: Record<RiskCategory, Tone> = {
  unassessed: 'neutral',
  minimal: 'ok',
  limited: 'info',
  elevated: 'warn',
  'high-review-needed': 'danger',
};

const RISK_STATUS_TONE: Record<RiskStatus, Tone> = {
  open: 'danger',
  'in-progress': 'warn',
  mitigated: 'ok',
  accepted: 'info',
  transferred: 'violet',
  avoided: 'ok',
  closed: 'neutral',
};

const CONTROL_STATUS_TONE: Record<ControlStatus, Tone> = {
  'not-started': 'neutral',
  planned: 'info',
  implemented: 'ok',
  'needs-review': 'warn',
  'missing-evidence': 'danger',
  retired: 'neutral',
};

const EVIDENCE_STATUS_TONE: Record<EvidenceStatus, Tone> = {
  missing: 'danger',
  draft: 'warn',
  available: 'info',
  reviewed: 'ok',
  expired: 'danger',
};

const SEVERITY_TONE: Record<Severity, Tone> = {
  low: 'ok',
  medium: 'info',
  high: 'warn',
  critical: 'critical',
};

const REVIEW_TONE: Record<ReviewState, Tone> = {
  none: 'neutral',
  ok: 'ok',
  'due-30': 'info',
  'due-7': 'warn',
  overdue: 'danger',
};

const INCIDENT_STATUS_TONE: Record<IncidentStatus, Tone> = {
  open: 'danger',
  investigating: 'warn',
  contained: 'info',
  resolved: 'ok',
  closed: 'neutral',
};

const GAP_ACTION_STATUS_TONE: Record<GapActionStatus, Tone> = {
  open: 'danger',
  'in-progress': 'warn',
  blocked: 'critical',
  done: 'ok',
  'accepted-risk': 'info',
};

export const SystemStatusChip = ({ value }: { value: SystemStatus }) => (
  <Chip tone={SYSTEM_STATUS_TONE[value]}>{SYSTEM_STATUS_LABELS[value]}</Chip>
);
export const RiskCategoryChip = ({ value }: { value: RiskCategory }) => (
  <Chip tone={RISK_CATEGORY_TONE[value]}>{RISK_CATEGORY_LABELS[value]}</Chip>
);
export const RiskStatusChip = ({ value }: { value: RiskStatus }) => (
  <Chip tone={RISK_STATUS_TONE[value]}>{RISK_STATUS_LABELS[value]}</Chip>
);
export const ControlStatusChip = ({ value }: { value: ControlStatus }) => (
  <Chip tone={CONTROL_STATUS_TONE[value]}>{CONTROL_STATUS_LABELS[value]}</Chip>
);
export const EvidenceStatusChip = ({ value }: { value: EvidenceStatus }) => (
  <Chip tone={EVIDENCE_STATUS_TONE[value]}>{EVIDENCE_STATUS_LABELS[value]}</Chip>
);
export const SeverityChip = ({ value }: { value: Severity }) => (
  <Chip tone={SEVERITY_TONE[value]}>{value}</Chip>
);
export const IncidentStatusChip = ({ value }: { value: IncidentStatus }) => (
  <Chip tone={INCIDENT_STATUS_TONE[value]}>{INCIDENT_STATUS_LABELS[value]}</Chip>
);
export const GapActionStatusChip = ({ value }: { value: GapActionStatus }) => (
  <Chip tone={GAP_ACTION_STATUS_TONE[value]}>{GAP_ACTION_STATUS_LABELS[value]}</Chip>
);
export const ReviewChip = ({ state }: { state: ReviewState }) =>
  state === 'none' ? null : (
    <Chip tone={REVIEW_TONE[state]}>{REVIEW_STATE_LABELS[state]}</Chip>
  );

const INTAKE_STATUS_TONE: Record<IntakeStatus, Tone> = {
  draft: 'neutral',
  submitted: 'info',
  'needs-security-review': 'warn',
  'needs-privacy-review': 'warn',
  'needs-legal-review': 'warn',
  'needs-product-review': 'warn',
  'approved-pilot': 'brand',
  'approved-production': 'ok',
  rejected: 'danger',
  paused: 'neutral',
};

const REVIEW_STATUS_TONE: Record<ReviewStatus, Tone> = {
  'not-started': 'danger',
  'in-progress': 'warn',
  complete: 'ok',
  'not-required': 'neutral',
};

const RISK_LEVEL_TONE: Record<RiskLevel, Tone> = {
  low: 'ok',
  medium: 'warn',
  high: 'danger',
};

const FRESHNESS_TONE: Record<Freshness, Tone> = {
  fresh: 'ok',
  'due-soon': 'warn',
  expired: 'danger',
  'missing-review-date': 'neutral',
};

export const IntakeStatusChip = ({ value }: { value: IntakeStatus }) => (
  <Chip tone={INTAKE_STATUS_TONE[value]}>{INTAKE_STATUS_LABELS[value]}</Chip>
);
export const ReviewStatusChip = ({ value }: { value: ReviewStatus }) => (
  <Chip tone={REVIEW_STATUS_TONE[value]}>{REVIEW_STATUS_LABELS[value]}</Chip>
);
export const RiskLevelChip = ({ value }: { value: RiskLevel }) => (
  <Chip tone={RISK_LEVEL_TONE[value]}>{value}</Chip>
);
export const FreshnessChip = ({ value }: { value: Freshness }) => (
  <Chip tone={FRESHNESS_TONE[value]}>{FRESHNESS_LABELS[value]}</Chip>
);
