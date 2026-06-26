import {
  CONTROL_STATUS_LABELS,
  EVIDENCE_STATUS_LABELS,
  INCIDENT_STATUS_LABELS,
  RISK_CATEGORY_LABELS,
  RISK_STATUS_LABELS,
  SYSTEM_STATUS_LABELS,
  type ControlStatus,
  type EvidenceStatus,
  type IncidentStatus,
  type RiskCategory,
  type RiskStatus,
  type Severity,
  type SystemStatus,
} from '../../types';
import { REVIEW_STATE_LABELS, type ReviewState } from '../../lib/dates';
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
export const ReviewChip = ({ state }: { state: ReviewState }) =>
  state === 'none' ? null : (
    <Chip tone={REVIEW_TONE[state]}>{REVIEW_STATE_LABELS[state]}</Chip>
  );
