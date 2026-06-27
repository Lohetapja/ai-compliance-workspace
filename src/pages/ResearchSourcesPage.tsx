import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Chip } from '../components/ui/Chip';
import { Icon } from '../components/ui/Icon';

interface Source {
  name: string;
  area: string;
  publisher: string;
  description: string;
  url: string;
}

/**
 * Official / primary sources, shown first. These are the authoritative bodies
 * and texts (EUR-Lex, the European Commission, EU agencies, ISO, NIST, OWASP,
 * MITRE, AICPA). Convenience explainers live under "Background reading" below.
 */
const OFFICIAL: Source[] = [
  {
    name: 'EU AI Act — Regulation (EU) 2024/1689',
    area: 'AI regulation',
    publisher: 'EUR-Lex (Official Journal)',
    description: 'The official consolidated text of the EU AI Act, including its risk-tiered approach and obligations.',
    url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj',
  },
  {
    name: 'Regulatory framework for AI',
    area: 'AI regulation',
    publisher: 'European Commission',
    description: 'Official EU policy material and updates on AI governance and the AI Act.',
    url: 'https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai',
  },
  {
    name: 'European AI Office',
    area: 'AI regulation',
    publisher: 'European Commission',
    description: 'The Commission body coordinating implementation and enforcement of the AI Act across the EU.',
    url: 'https://digital-strategy.ec.europa.eu/en/policies/ai-office',
  },
  {
    name: 'GDPR — Regulation (EU) 2016/679',
    area: 'Privacy',
    publisher: 'EUR-Lex (Official Journal)',
    description: 'The official text of the EU General Data Protection Regulation governing personal-data processing.',
    url: 'https://eur-lex.europa.eu/eli/reg/2016/679/oj',
  },
  {
    name: 'European Data Protection Board (EDPB)',
    area: 'Privacy',
    publisher: 'EDPB',
    description: 'Official EU guidelines, recommendations and best practices on data protection.',
    url: 'https://www.edpb.europa.eu/',
  },
  {
    name: 'NIS2 — Directive (EU) 2022/2555',
    area: 'Cybersecurity',
    publisher: 'EUR-Lex (Official Journal)',
    description: 'The official text of the EU directive on cybersecurity risk management and incident reporting.',
    url: 'https://eur-lex.europa.eu/eli/dir/2022/2555/oj',
  },
  {
    name: 'ENISA — EU Agency for Cybersecurity',
    area: 'Cybersecurity',
    publisher: 'ENISA',
    description: 'The EU cybersecurity agency, with guidance supporting NIS2 and related security practices.',
    url: 'https://www.enisa.europa.eu/',
  },
  {
    name: 'ISO/IEC 42001',
    area: 'AI management system',
    publisher: 'ISO',
    description: 'The international standard for an AI management system (official overview page only — this app does not reproduce the standard).',
    url: 'https://www.iso.org/standard/81230.html',
  },
  {
    name: 'ISO/IEC 27001',
    area: 'Information security',
    publisher: 'ISO',
    description: 'The international standard for an information security management system (official overview page only).',
    url: 'https://www.iso.org/standard/27001',
  },
  {
    name: 'NIST AI Risk Management Framework',
    area: 'AI risk',
    publisher: 'NIST',
    description: 'A voluntary framework to help organizations manage AI risks across the lifecycle.',
    url: 'https://www.nist.gov/itl/ai-risk-management-framework',
  },
  {
    name: 'OWASP Top 10 for LLM Applications',
    area: 'AI security',
    publisher: 'OWASP',
    description: 'Community guidance on the most critical security risks for LLM-based applications.',
    url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/',
  },
  {
    name: 'MITRE ATLAS',
    area: 'AI security',
    publisher: 'MITRE',
    description: 'A knowledge base of adversarial threats and tactics against AI/ML systems.',
    url: 'https://atlas.mitre.org/',
  },
  {
    name: 'SOC 2 / Trust Services Criteria',
    area: 'Audit & assurance',
    publisher: 'AICPA',
    description: 'The body behind SOC 2 and the trust-services criteria for evidence-based assurance (background concepts only).',
    url: 'https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2',
  },
];

/**
 * Non-official convenience explainers. Useful for plain-language orientation,
 * but always confirm against the official sources above before relying on them.
 */
const BACKGROUND: Source[] = [
  {
    name: 'artificialintelligenceact.eu',
    area: 'AI regulation',
    publisher: 'Future of Life Institute (non-official)',
    description: 'A convenience explorer of the AI Act text and timelines. Helpful for orientation; not an official source.',
    url: 'https://artificialintelligenceact.eu/',
  },
  {
    name: 'gdpr.eu',
    area: 'Privacy',
    publisher: 'Third-party (non-official)',
    description: 'A plain-language GDPR explainer. Convenient for learning; confirm specifics against EUR-Lex and the EDPB.',
    url: 'https://gdpr.eu/',
  },
];

function SourceCard({ s, official }: { s: Source; official?: boolean }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-ink">{s.name}</h3>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-brand">{s.area}</span>
            <Chip tone={official ? 'ok' : 'neutral'}>{official ? 'Official' : 'Background'}</Chip>
          </div>
          <div className="mt-0.5 text-xs text-faint">{s.publisher}</div>
        </div>
        <a
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-muted hover:text-brand"
        >
          Open <Icon name="external" size={11} />
        </a>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted">{s.description}</p>
    </Card>
  );
}

export function ResearchSourcesPage() {
  return (
    <>
      <PageHeader
        title="Research Sources"
        description="Official and primary references used while learning AI governance, security, privacy, and audit concepts for this project."
      />

      <div className="mb-4 rounded-xl border border-warn/25 bg-warn/10 px-4 py-3 text-xs leading-relaxed text-warn">
        <Icon name="warning" size={14} className="mr-1 inline" />
        Use official sources for decisions; this page is for learning and orientation. References are
        summarized in plain language and this project does not reproduce or interpret the official texts.
        Always confirm against the primary sources and consult qualified legal, privacy, and security professionals.
      </div>

      <h2 className="mb-2 text-sm font-semibold text-ink">Official &amp; primary sources</h2>
      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2">
        {OFFICIAL.map((s) => (
          <SourceCard key={s.name} s={s} official />
        ))}
      </div>

      <h2 className="mb-1 text-sm font-semibold text-ink">Background reading</h2>
      <p className="mb-2 text-xs text-muted">
        Convenience explainers for orientation only — confirm anything important against the official sources above.
      </p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {BACKGROUND.map((s) => (
          <SourceCard key={s.name} s={s} />
        ))}
      </div>
    </>
  );
}
