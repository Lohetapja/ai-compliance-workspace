import type {
  AIRisk,
  AISystem,
  Control,
  ControlCategory,
  Evidence,
  FrameworkId,
  Impact,
  Incident,
  Likelihood,
} from '../types';
import { blankControl, blankEvidence, blankIncident, blankRisk, blankSystem } from './factories';
import { computeSeverity } from '../lib/severity';

/* ------------------------------------------------------------------ */
/* Vocabularies used in dropdowns                                      */
/* ------------------------------------------------------------------ */

export const EVIDENCE_TYPES: string[] = [
  'AI system description',
  'Risk assessment',
  'Risk classification notes',
  'Data source description',
  'Data provenance note',
  'Model card',
  'Data card',
  'System card',
  'Vendor assessment',
  'DPIA / privacy assessment note',
  'Human oversight plan',
  'Logging configuration',
  'Monitoring plan',
  'Incident response process',
  'Security review notes',
  'Access control review',
  'Test results',
  'Bias/fairness evaluation',
  'Red-team / misuse testing notes',
  'Prompt injection test notes',
  'Change approval',
  'Audit review notes',
  'Policy documents',
  'User instructions',
  'Training record',
  'Business continuity notes',
];

/* ------------------------------------------------------------------ */
/* AI system templates                                                 */
/* ------------------------------------------------------------------ */

export interface AISystemTemplate {
  templateName: string;
  shortDescription: string;
  reviewNote?: string;
  values: Partial<Omit<AISystem, 'id' | 'createdAt' | 'updatedAt'>>;
}

const elevatedReviewNote =
  'Template uses a possible elevated-risk context. Legal/privacy review recommended before real-world use.';

export const AI_SYSTEM_TEMPLATES: AISystemTemplate[] = [
  {
    templateName: 'Customer-facing chatbot',
    shortDescription: 'Support or knowledge-base assistant exposed to customers.',
    values: {
      systemName: 'Customer-facing chatbot',
      description: 'Customer-facing assistant that answers support or product questions from approved knowledge sources.',
      businessPurpose: 'Improve support response time while keeping humans available for escalation.',
      userGroups: 'Customers, support agents',
      internalOrExternalUse: 'external',
      customerFacing: true,
      modelType: 'LLM with retrieval-augmented generation',
      vendorOrProvider: 'Fictional model provider',
      openSourceOrCommercial: 'commercial',
      deploymentEnvironment: 'Web application',
      dataUsed: 'Product documentation, sanitized support examples, user prompts',
      personalDataInvolved: 'yes',
      dataSources: 'Approved knowledge base and sanitized ticket examples',
      humanReviewRequired: 'yes',
      autonomyLevel: 'advisory',
      loggingEnabled: 'yes',
      auditTrailAvailable: 'yes',
      monitoringEnabled: 'yes',
      riskCategory: 'elevated',
      legalReviewNeeded: true,
      privacyReviewNeeded: true,
      securityReviewNeeded: true,
      vendorReviewNeeded: true,
      humanOversightReviewNeeded: true,
      frameworkTags: ['EU AI Act', 'GDPR', 'OWASP LLM Top 10', 'NIST AI RMF'],
    },
  },
  {
    templateName: 'Internal coding assistant',
    shortDescription: 'Developer productivity assistant for internal engineering teams.',
    values: {
      systemName: 'Internal coding assistant',
      description: 'Assistant that helps internal developers explain code and draft implementation suggestions.',
      businessPurpose: 'Reduce developer friction while preserving code review and secure development controls.',
      userGroups: 'Internal engineering teams',
      internalOrExternalUse: 'internal',
      modelType: 'Code-capable LLM',
      vendorOrProvider: 'Fictional model provider',
      dataUsed: 'Internal documentation, snippets provided by developers, source-code context when approved',
      dataSources: 'Repository context, engineering docs, developer prompts',
      personalDataInvolved: 'unknown',
      sensitiveDataInvolved: 'yes',
      humanReviewRequired: 'yes',
      autonomyLevel: 'advisory',
      loggingEnabled: 'yes',
      auditTrailAvailable: 'yes',
      monitoringEnabled: 'yes',
      riskCategory: 'elevated',
      securityReviewNeeded: true,
      privacyReviewNeeded: true,
      frameworkTags: ['ISO/IEC 27001', 'OWASP LLM Top 10', 'MITRE ATLAS'],
    },
  },
  {
    templateName: 'AI document summarizer',
    shortDescription: 'Summarizes internal documents for employee productivity.',
    values: {
      systemName: 'AI document summarizer',
      description: 'Summarizes uploaded or selected internal documents for internal staff.',
      businessPurpose: 'Help employees extract key points from long documents faster.',
      userGroups: 'Internal employees',
      internalOrExternalUse: 'internal',
      modelType: 'LLM summarization workflow',
      dataUsed: 'User-selected documents and generated summaries',
      dataSources: 'Internal document repository',
      personalDataInvolved: 'unknown',
      sensitiveDataInvolved: 'unknown',
      humanReviewRequired: 'yes',
      autonomyLevel: 'advisory',
      loggingEnabled: 'yes',
      auditTrailAvailable: 'unknown',
      monitoringEnabled: 'yes',
      riskCategory: 'limited',
      privacyReviewNeeded: true,
      securityReviewNeeded: true,
      frameworkTags: ['GDPR', 'ISO/IEC 42001', 'NIST AI RMF'],
    },
  },
  {
    templateName: 'Model deployment portal',
    shortDescription: 'Portal for teams to deploy models into controlled environments.',
    values: {
      systemName: 'Model deployment portal',
      description: 'Internal portal used to request, approve, and deploy model versions.',
      businessPurpose: 'Standardize model release controls and deployment approvals.',
      userGroups: 'ML engineers, platform team, reviewers',
      internalOrExternalUse: 'internal',
      modelType: 'MLOps / deployment workflow',
      dataUsed: 'Model artifacts, deployment configuration, approval metadata',
      sensitiveDataInvolved: 'yes',
      humanReviewRequired: 'yes',
      autonomyLevel: 'semi-autonomous',
      loggingEnabled: 'yes',
      auditTrailAvailable: 'yes',
      monitoringEnabled: 'yes',
      riskCategory: 'limited',
      securityReviewNeeded: true,
      humanOversightReviewNeeded: true,
      frameworkTags: ['ISO/IEC 27001', 'SOC 2', 'NIST AI RMF'],
    },
  },
  {
    templateName: 'Inference API gateway',
    shortDescription: 'Central gateway for model inference requests and policy enforcement.',
    values: {
      systemName: 'Inference API gateway',
      description: 'Gateway that routes inference traffic, applies policy checks, and records usage metadata.',
      businessPurpose: 'Provide a controlled entry point for internal and customer model usage.',
      userGroups: 'Applications, platform team, service owners',
      internalOrExternalUse: 'both',
      customerFacing: true,
      modelType: 'API gateway / policy layer',
      dataUsed: 'Request metadata, API key identifiers, policy decisions, usage records',
      personalDataInvolved: 'unknown',
      sensitiveDataInvolved: 'unknown',
      humanReviewRequired: 'unknown',
      autonomyLevel: 'semi-autonomous',
      loggingEnabled: 'yes',
      auditTrailAvailable: 'yes',
      monitoringEnabled: 'yes',
      riskCategory: 'limited',
      securityReviewNeeded: true,
      vendorReviewNeeded: true,
      frameworkTags: ['ISO/IEC 27001', 'SOC 2', 'OWASP LLM Top 10'],
    },
  },
  {
    templateName: 'GPU training job scheduler',
    shortDescription: 'Schedules and prioritizes model training jobs.',
    values: {
      systemName: 'GPU training job scheduler',
      description: 'Schedules model training jobs across shared compute resources.',
      businessPurpose: 'Improve training capacity usage and record compute allocation decisions.',
      userGroups: 'ML teams, infrastructure team',
      internalOrExternalUse: 'internal',
      modelType: 'Scheduling / optimization system',
      dataUsed: 'Job metadata, resource usage, priority tiers',
      humanReviewRequired: 'unknown',
      autonomyLevel: 'semi-autonomous',
      loggingEnabled: 'yes',
      auditTrailAvailable: 'yes',
      monitoringEnabled: 'yes',
      riskCategory: 'limited',
      securityReviewNeeded: true,
      frameworkTags: ['ISO/IEC 27001', 'NIS2', 'SOC 2'],
    },
  },
  {
    templateName: 'Model registry / evaluation pipeline',
    shortDescription: 'Tracks model versions, evaluations, and approval evidence.',
    values: {
      systemName: 'Model registry / evaluation pipeline',
      description: 'Registry and evaluation workflow for model versions, metrics, and release evidence.',
      businessPurpose: 'Keep model provenance, evaluation, and approval records connected.',
      userGroups: 'ML platform, reviewers, model owners',
      internalOrExternalUse: 'internal',
      modelType: 'Model registry and evaluation pipeline',
      dataUsed: 'Model artifacts, evaluation datasets, metrics, approval notes',
      dataProvenanceKnown: 'yes',
      humanReviewRequired: 'yes',
      autonomyLevel: 'advisory',
      loggingEnabled: 'yes',
      auditTrailAvailable: 'yes',
      monitoringEnabled: 'yes',
      riskCategory: 'limited',
      humanOversightReviewNeeded: true,
      frameworkTags: ['ISO/IEC 42001', 'NIST AI RMF', 'SOC 2'],
    },
  },
  {
    templateName: 'Abuse / misuse detection classifier',
    shortDescription: 'Flags possible abuse, misuse, or policy violations for review.',
    values: {
      systemName: 'Abuse / misuse detection classifier',
      description: 'Classifier that flags possible abuse or misuse patterns for human review.',
      businessPurpose: 'Support trust and safety review while keeping human escalation available.',
      userGroups: 'Trust and safety analysts',
      internalOrExternalUse: 'internal',
      modelType: 'Classifier',
      dataUsed: 'Workload metadata, sampled prompts, abuse signals',
      personalDataInvolved: 'yes',
      humanReviewRequired: 'yes',
      autonomyLevel: 'advisory',
      loggingEnabled: 'yes',
      auditTrailAvailable: 'yes',
      monitoringEnabled: 'yes',
      riskCategory: 'high-review-needed',
      legalReviewNeeded: true,
      privacyReviewNeeded: true,
      securityReviewNeeded: true,
      humanOversightReviewNeeded: true,
      frameworkTags: ['EU AI Act', 'NIST AI RMF', 'OWASP LLM Top 10'],
    },
  },
  {
    templateName: 'HR screening assistant',
    shortDescription: 'Sensitive HR support scenario requiring careful review.',
    reviewNote: elevatedReviewNote,
    values: {
      systemName: 'HR screening assistant',
      description: 'Prototype assistant that summarizes candidate materials for human HR reviewers.',
      businessPurpose: 'Explore structured review support while preserving human decision-making.',
      userGroups: 'HR reviewers',
      internalOrExternalUse: 'internal',
      modelType: 'LLM-assisted document analysis',
      dataUsed: 'Synthetic candidate profiles and job descriptions',
      personalDataInvolved: 'yes',
      sensitiveDataInvolved: 'yes',
      humanReviewRequired: 'yes',
      autonomyLevel: 'advisory',
      loggingEnabled: 'yes',
      auditTrailAvailable: 'yes',
      monitoringEnabled: 'yes',
      riskCategory: 'high-review-needed',
      legalReviewNeeded: true,
      privacyReviewNeeded: true,
      securityReviewNeeded: true,
      humanOversightReviewNeeded: true,
      frameworkTags: ['EU AI Act', 'GDPR', 'NIST AI RMF'],
    },
  },
  {
    templateName: 'Finance / credit decision assistant',
    shortDescription: 'Sensitive finance decision-support scenario requiring careful review.',
    reviewNote: elevatedReviewNote,
    values: {
      systemName: 'Finance / credit decision assistant',
      description: 'Prototype decision-support assistant for reviewing synthetic credit application summaries.',
      businessPurpose: 'Explore risk review support while keeping final decisions with qualified humans.',
      userGroups: 'Finance reviewers',
      internalOrExternalUse: 'internal',
      modelType: 'Decision-support model',
      dataUsed: 'Synthetic financial application data and policy notes',
      personalDataInvolved: 'yes',
      sensitiveDataInvolved: 'yes',
      humanReviewRequired: 'yes',
      autonomyLevel: 'advisory',
      loggingEnabled: 'yes',
      auditTrailAvailable: 'yes',
      monitoringEnabled: 'yes',
      riskCategory: 'high-review-needed',
      legalReviewNeeded: true,
      privacyReviewNeeded: true,
      securityReviewNeeded: true,
      humanOversightReviewNeeded: true,
      frameworkTags: ['EU AI Act', 'GDPR', 'NIST AI RMF'],
    },
  },
  {
    templateName: 'Healthcare decision-support prototype',
    shortDescription: 'Sensitive healthcare support scenario requiring careful review.',
    reviewNote: elevatedReviewNote,
    values: {
      systemName: 'Healthcare decision-support prototype',
      description: 'Prototype that summarizes synthetic clinical notes for educational review workflows.',
      businessPurpose: 'Explore governance documentation for health-related decision-support prototypes.',
      userGroups: 'Clinical reviewers, governance reviewers',
      internalOrExternalUse: 'internal',
      modelType: 'Decision-support prototype',
      dataUsed: 'Synthetic clinical notes and guidelines',
      personalDataInvolved: 'yes',
      sensitiveDataInvolved: 'yes',
      humanReviewRequired: 'yes',
      autonomyLevel: 'advisory',
      loggingEnabled: 'yes',
      auditTrailAvailable: 'yes',
      monitoringEnabled: 'yes',
      riskCategory: 'high-review-needed',
      legalReviewNeeded: true,
      privacyReviewNeeded: true,
      securityReviewNeeded: true,
      humanOversightReviewNeeded: true,
      frameworkTags: ['EU AI Act', 'GDPR', 'NIST AI RMF'],
    },
  },
  {
    templateName: 'Critical infrastructure monitoring assistant',
    shortDescription: 'Sensitive operational monitoring scenario requiring careful review.',
    reviewNote: elevatedReviewNote,
    values: {
      systemName: 'Critical infrastructure monitoring assistant',
      description: 'Prototype assistant that summarizes synthetic operational alerts for human operators.',
      businessPurpose: 'Explore monitoring support while preserving human operational control.',
      userGroups: 'Operations analysts, security reviewers',
      internalOrExternalUse: 'internal',
      modelType: 'Alert summarization and prioritization assistant',
      dataUsed: 'Synthetic telemetry, alert metadata, operator notes',
      sensitiveDataInvolved: 'yes',
      humanReviewRequired: 'yes',
      autonomyLevel: 'advisory',
      loggingEnabled: 'yes',
      auditTrailAvailable: 'yes',
      monitoringEnabled: 'yes',
      riskCategory: 'high-review-needed',
      legalReviewNeeded: true,
      privacyReviewNeeded: true,
      securityReviewNeeded: true,
      humanOversightReviewNeeded: true,
      frameworkTags: ['EU AI Act', 'NIS2', 'ISO/IEC 27001', 'NIST AI RMF'],
    },
  },
];

export function systemFromTemplate(t: AISystemTemplate): AISystem {
  const base = blankSystem();
  return {
    ...base,
    ...t.values,
    systemName: t.values.systemName ?? t.templateName,
    notes: [t.reviewNote, t.values.notes].filter(Boolean).join('\n\n'),
  };
}

export const INCIDENT_TYPES: string[] = [
  'Data leakage',
  'Prompt injection',
  'Harmful output',
  'Unauthorized access',
  'Model misuse',
  'Policy violation',
  'Hallucinated critical recommendation',
  'Bias complaint',
  'Vendor outage',
  'Monitoring failure',
  'Logging failure',
  'Insecure tool/plugin action',
  'Abuse or misuse attempt',
  'Access control failure',
];

export const RISK_CATEGORIES: string[] = [
  'AI security',
  'Data protection / privacy',
  'Safety / harm',
  'Fairness / bias',
  'Governance / oversight',
  'Vendor / supply chain',
  'Operational / reliability',
  'Regulatory / legal',
];

/* ------------------------------------------------------------------ */
/* Risk templates (the 21 common AI risks)                             */
/* ------------------------------------------------------------------ */

interface RiskTemplate {
  riskTitle: string;
  riskDescription: string;
  riskCategory: string;
  likelihood: Likelihood;
  impact: Impact;
  mitigation: string;
  frameworkTags: FrameworkId[];
}

export const RISK_TEMPLATES: RiskTemplate[] = [
  {
    riskTitle: 'Prompt injection',
    riskDescription:
      'Untrusted input manipulates the model into ignoring instructions, leaking data, or triggering unintended tool actions.',
    riskCategory: 'AI security',
    likelihood: 'high',
    impact: 'high',
    mitigation: 'Input/output filtering, tool allow-lists, least-privilege tool access, human approval for high-impact actions.',
    frameworkTags: ['OWASP LLM Top 10', 'MITRE ATLAS', 'NIST AI RMF'],
  },
  {
    riskTitle: 'Sensitive data leakage',
    riskDescription:
      'Personal or confidential data is exposed through prompts, logs, tool calls, caches, or model outputs.',
    riskCategory: 'Data protection / privacy',
    likelihood: 'medium',
    impact: 'critical',
    mitigation: 'Data minimisation, redaction, log scrubbing, retention limits, access controls.',
    frameworkTags: ['GDPR', 'OWASP LLM Top 10', 'ISO/IEC 27001'],
  },
  {
    riskTitle: 'Hallucinated critical output',
    riskDescription:
      'The model produces confident but incorrect output that is acted upon without verification.',
    riskCategory: 'Safety / harm',
    likelihood: 'high',
    impact: 'high',
    mitigation: 'Human review for critical decisions, grounding/citations, evaluation tests, clear user warnings.',
    frameworkTags: ['EU AI Act', 'NIST AI RMF'],
  },
  {
    riskTitle: 'Biased or discriminatory output',
    riskDescription:
      'Outputs systematically disadvantage individuals or groups, creating fairness and legal exposure.',
    riskCategory: 'Fairness / bias',
    likelihood: 'medium',
    impact: 'high',
    mitigation: 'Bias/fairness evaluation, representative test sets, monitoring, appeal/escalation path.',
    frameworkTags: ['EU AI Act', 'NIST AI RMF', 'ISO/IEC 42001'],
  },
  {
    riskTitle: 'Unauthorized model use',
    riskDescription:
      'Models or endpoints are used outside approved purposes or by unauthorised users.',
    riskCategory: 'Governance / oversight',
    likelihood: 'medium',
    impact: 'medium',
    mitigation: 'Access control, usage policies, authentication, quota and audit logging.',
    frameworkTags: ['ISO/IEC 27001', 'SOC 2'],
  },
  {
    riskTitle: 'Lack of human oversight',
    riskDescription:
      'No defined human able to review, override, or stop the system before harmful action.',
    riskCategory: 'Governance / oversight',
    likelihood: 'medium',
    impact: 'high',
    mitigation: 'Named oversight owner, override/kill-switch, escalation procedure, documented oversight plan.',
    frameworkTags: ['EU AI Act', 'ISO/IEC 42001'],
  },
  {
    riskTitle: 'Missing audit trail',
    riskDescription:
      'Insufficient records of inputs, outputs, and decisions to reconstruct or investigate behaviour.',
    riskCategory: 'Operational / reliability',
    likelihood: 'medium',
    impact: 'medium',
    mitigation: 'Structured, tamper-evident logging with retention; capture configuration as evidence.',
    frameworkTags: ['ISO/IEC 27001', 'SOC 2', 'NIS2'],
  },
  {
    riskTitle: 'Vendor dependency',
    riskDescription:
      'Critical reliance on a third-party model/provider whose changes, outages, or terms affect the service.',
    riskCategory: 'Vendor / supply chain',
    likelihood: 'medium',
    impact: 'high',
    mitigation: 'Vendor assessment, SLAs, fallback provider, contractual data terms, version pinning.',
    frameworkTags: ['NIS2', 'ISO/IEC 27001', 'SOC 2'],
  },
  {
    riskTitle: 'Unclear data provenance',
    riskDescription:
      'The origin, licensing, or consent basis of training/inference data is not documented.',
    riskCategory: 'Data protection / privacy',
    likelihood: 'medium',
    impact: 'high',
    mitigation: 'Data source inventory, licensing review, provenance documentation, data card.',
    frameworkTags: ['GDPR', 'EU AI Act', 'ISO/IEC 42001'],
  },
  {
    riskTitle: 'Weak access control',
    riskDescription:
      'Over-broad permissions to models, data, prompts, or admin functions.',
    riskCategory: 'AI security',
    likelihood: 'medium',
    impact: 'high',
    mitigation: 'RBAC, least privilege, periodic access reviews, MFA for admin paths.',
    frameworkTags: ['ISO/IEC 27001', 'SOC 2'],
  },
  {
    riskTitle: 'Model drift',
    riskDescription:
      'Model performance degrades over time as data, behaviour, or environment changes.',
    riskCategory: 'Operational / reliability',
    likelihood: 'medium',
    impact: 'medium',
    mitigation: 'Ongoing evaluation, monitoring of quality metrics, retraining/triggers, drift alerts.',
    frameworkTags: ['NIST AI RMF', 'ISO/IEC 42001'],
  },
  {
    riskTitle: 'Insecure plugin / tool use',
    riskDescription:
      'Tools or plugins invoked by the model perform unsafe actions or expand the attack surface.',
    riskCategory: 'AI security',
    likelihood: 'medium',
    impact: 'high',
    mitigation: 'Tool allow-lists, sandboxing, scoped credentials, output validation, approval gates.',
    frameworkTags: ['OWASP LLM Top 10', 'MITRE ATLAS'],
  },
  {
    riskTitle: 'Excessive agency',
    riskDescription:
      'The system is granted more autonomy or permissions than its task requires.',
    riskCategory: 'Governance / oversight',
    likelihood: 'medium',
    impact: 'high',
    mitigation: 'Minimise capabilities/permissions, require confirmation for impactful actions.',
    frameworkTags: ['OWASP LLM Top 10', 'EU AI Act'],
  },
  {
    riskTitle: 'Overreliance on AI output',
    riskDescription:
      'Users trust outputs without verification, especially for high-stakes decisions.',
    riskCategory: 'Safety / harm',
    likelihood: 'high',
    impact: 'medium',
    mitigation: 'User instructions, uncertainty signalling, required verification steps, training.',
    frameworkTags: ['EU AI Act', 'NIST AI RMF'],
  },
  {
    riskTitle: 'Model theft',
    riskDescription:
      'Proprietary model weights or behaviour are extracted or exfiltrated.',
    riskCategory: 'AI security',
    likelihood: 'low',
    impact: 'high',
    mitigation: 'Access controls, rate limiting, watermarking, monitoring for extraction patterns.',
    frameworkTags: ['MITRE ATLAS', 'ISO/IEC 27001'],
  },
  {
    riskTitle: 'Supply chain vulnerability',
    riskDescription:
      'Compromised dependencies, base models, or datasets introduce risk.',
    riskCategory: 'Vendor / supply chain',
    likelihood: 'medium',
    impact: 'high',
    mitigation: 'Dependency scanning, provenance/SBOM, trusted sources, integrity checks.',
    frameworkTags: ['NIS2', 'MITRE ATLAS', 'ISO/IEC 27001'],
  },
  {
    riskTitle: 'Training data poisoning',
    riskDescription:
      'Malicious or low-quality data corrupts model behaviour during training or fine-tuning.',
    riskCategory: 'AI security',
    likelihood: 'low',
    impact: 'high',
    mitigation: 'Data validation, source controls, anomaly detection, curated datasets.',
    frameworkTags: ['MITRE ATLAS', 'NIST AI RMF'],
  },
  {
    riskTitle: 'Incident response gaps',
    riskDescription:
      'No defined process to detect, contain, and learn from AI-specific incidents.',
    riskCategory: 'Operational / reliability',
    likelihood: 'medium',
    impact: 'medium',
    mitigation: 'AI incident runbook, named owner, severity scheme, post-incident review.',
    frameworkTags: ['NIS2', 'SOC 2', 'ISO/IEC 27001'],
  },
  {
    riskTitle: 'Regulatory deadline risk',
    riskDescription:
      'Obligations or deadlines (e.g. documentation, reviews) are missed due to lack of tracking.',
    riskCategory: 'Regulatory / legal',
    likelihood: 'medium',
    impact: 'high',
    mitigation: 'Review-date tracking, owners, audit-readiness reporting, legal review cadence.',
    frameworkTags: ['EU AI Act', 'GDPR'],
  },
  {
    riskTitle: 'Monitoring failure',
    riskDescription:
      'Monitoring is absent or silently broken, so problems go undetected.',
    riskCategory: 'Operational / reliability',
    likelihood: 'medium',
    impact: 'medium',
    mitigation: 'Monitoring plan, health checks on the monitors themselves, alerting, dashboards.',
    frameworkTags: ['NIS2', 'SOC 2'],
  },
  {
    riskTitle: 'Customer data used in unsafe way',
    riskDescription:
      'Customer data is used for training, prompts, or sharing beyond agreed purposes.',
    riskCategory: 'Data protection / privacy',
    likelihood: 'medium',
    impact: 'critical',
    mitigation: 'Purpose limitation, contractual controls, tenant isolation, opt-in for training.',
    frameworkTags: ['GDPR', 'EU AI Act', 'SOC 2'],
  },
];

export function riskFromTemplate(t: RiskTemplate, systemId = ''): AIRisk {
  return {
    ...blankRisk(systemId),
    riskTitle: t.riskTitle,
    riskDescription: t.riskDescription,
    riskCategory: t.riskCategory,
    likelihood: t.likelihood,
    impact: t.impact,
    severity: computeSeverity(t.likelihood, t.impact),
    mitigation: t.mitigation,
    frameworkTags: t.frameworkTags,
  };
}

/* ------------------------------------------------------------------ */
/* Control templates                                                   */
/* ------------------------------------------------------------------ */

interface ControlTemplate {
  controlTitle: string;
  controlCategory: ControlCategory;
  purpose: string;
  frameworkTags: FrameworkId[];
}

export const CONTROL_TEMPLATES: ControlTemplate[] = [
  {
    controlTitle: 'AI system inventory & ownership',
    controlCategory: 'Governance',
    purpose: 'Maintain a current inventory of AI systems with named owners and purpose.',
    frameworkTags: ['ISO/IEC 42001', 'EU AI Act'],
  },
  {
    controlTitle: 'AI risk assessment process',
    controlCategory: 'Risk Management',
    purpose: 'Assess and document risks for each AI system before and during production use.',
    frameworkTags: ['ISO/IEC 42001', 'NIST AI RMF'],
  },
  {
    controlTitle: 'Human oversight & override',
    controlCategory: 'Human Oversight',
    purpose: 'Ensure a named human can review, override, or stop the system.',
    frameworkTags: ['EU AI Act', 'ISO/IEC 42001'],
  },
  {
    controlTitle: 'Prompt-injection & input handling',
    controlCategory: 'Secure AI Development',
    purpose: 'Reduce the impact of untrusted input on model behaviour and tool use.',
    frameworkTags: ['OWASP LLM Top 10', 'MITRE ATLAS'],
  },
  {
    controlTitle: 'Logging & audit trail',
    controlCategory: 'Logging & Monitoring',
    purpose: 'Capture inputs, outputs and key actions to support investigation and audit.',
    frameworkTags: ['ISO/IEC 27001', 'SOC 2', 'NIS2'],
  },
  {
    controlTitle: 'Access control & least privilege',
    controlCategory: 'Access Control',
    purpose: 'Restrict access to models, data and admin functions to those who need it.',
    frameworkTags: ['ISO/IEC 27001', 'SOC 2'],
  },
  {
    controlTitle: 'Data governance & provenance',
    controlCategory: 'Data Governance',
    purpose: 'Document data sources, provenance, licensing and retention.',
    frameworkTags: ['GDPR', 'EU AI Act', 'ISO/IEC 42001'],
  },
  {
    controlTitle: 'Privacy assessment (DPIA note)',
    controlCategory: 'Privacy / GDPR',
    purpose: 'Assess privacy impact where personal or sensitive data is processed.',
    frameworkTags: ['GDPR'],
  },
  {
    controlTitle: 'Model evaluation & testing',
    controlCategory: 'Model Evaluation',
    purpose: 'Evaluate quality, safety and robustness before and after release.',
    frameworkTags: ['NIST AI RMF', 'ISO/IEC 42001'],
  },
  {
    controlTitle: 'Bias / fairness testing',
    controlCategory: 'Bias / Fairness Testing',
    purpose: 'Test for unfair or discriminatory outcomes and track remediation.',
    frameworkTags: ['EU AI Act', 'NIST AI RMF'],
  },
  {
    controlTitle: 'Vendor / third-party assessment',
    controlCategory: 'Vendor / Third-party Risk',
    purpose: 'Assess third-party model/providers for security, privacy and reliability.',
    frameworkTags: ['NIS2', 'ISO/IEC 27001', 'SOC 2'],
  },
  {
    controlTitle: 'AI incident response',
    controlCategory: 'Incident Response',
    purpose: 'Detect, contain and learn from AI-specific incidents.',
    frameworkTags: ['NIS2', 'SOC 2'],
  },
  {
    controlTitle: 'Monitoring & drift detection',
    controlCategory: 'Logging & Monitoring',
    purpose: 'Monitor performance and detect drift or degradation in production.',
    frameworkTags: ['NIST AI RMF', 'SOC 2'],
  },
  {
    controlTitle: 'Change & release management',
    controlCategory: 'Change Management',
    purpose: 'Approve and document changes to models, prompts and configuration.',
    frameworkTags: ['ISO/IEC 27001', 'SOC 2'],
  },
  {
    controlTitle: 'Transparency & user communication',
    controlCategory: 'Transparency',
    purpose: 'Tell users they are interacting with AI and explain limitations.',
    frameworkTags: ['EU AI Act'],
  },
  {
    controlTitle: 'Abuse / misuse prevention',
    controlCategory: 'Abuse / Misuse Prevention',
    purpose: 'Detect and prevent misuse, abuse, and policy-violating use.',
    frameworkTags: ['OWASP LLM Top 10', 'EU AI Act'],
  },
];

export function controlFromTemplate(t: ControlTemplate, systemId = ''): Control {
  return {
    ...blankControl(systemId),
    controlTitle: t.controlTitle,
    controlCategory: t.controlCategory,
    purpose: t.purpose,
    frameworkTags: t.frameworkTags,
  };
}

/* ------------------------------------------------------------------ */
/* Evidence templates                                                  */
/* ------------------------------------------------------------------ */

export function evidenceFromType(type: string, systemId = ''): Evidence {
  return {
    ...blankEvidence(systemId),
    evidenceTitle: type,
    evidenceType: type,
    status: 'draft',
  };
}

/* ------------------------------------------------------------------ */
/* Incident templates                                                  */
/* ------------------------------------------------------------------ */

export function incidentFromType(type: string, systemId = ''): Incident {
  return {
    ...blankIncident(systemId),
    incidentTitle: type,
    type,
  };
}
