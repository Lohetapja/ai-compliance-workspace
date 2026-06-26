import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';

interface Source {
  name: string;
  area: string;
  description: string;
  url: string;
}

const SOURCES: Source[] = [
  {
    name: 'EU AI Act',
    area: 'AI regulation',
    description: 'The EU regulatory framework for AI, including a risk-tiered approach and obligations for higher-risk systems.',
    url: 'https://artificialintelligenceact.eu/',
  },
  {
    name: 'European Commission — AI',
    area: 'AI regulation',
    description: 'Official EU policy material and updates on AI governance and the AI Act.',
    url: 'https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai',
  },
  {
    name: 'ISO/IEC 42001',
    area: 'AI management system',
    description: 'The international standard for an AI management system (overview only — this app does not reproduce the standard).',
    url: 'https://www.iso.org/standard/81230.html',
  },
  {
    name: 'NIST AI Risk Management Framework',
    area: 'AI risk',
    description: 'A voluntary framework to help organizations manage AI risks across the lifecycle.',
    url: 'https://www.nist.gov/itl/ai-risk-management-framework',
  },
  {
    name: 'OWASP Top 10 for LLM Applications',
    area: 'AI security',
    description: 'Community guidance on the most critical security risks for LLM-based applications.',
    url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/',
  },
  {
    name: 'MITRE ATLAS',
    area: 'AI security',
    description: 'A knowledge base of adversarial threats and tactics against AI/ML systems.',
    url: 'https://atlas.mitre.org/',
  },
  {
    name: 'GDPR',
    area: 'Privacy',
    description: 'EU data protection regulation relevant to personal-data processing, including by AI systems.',
    url: 'https://gdpr.eu/',
  },
  {
    name: 'NIS2 Directive',
    area: 'Cybersecurity',
    description: 'EU directive on cybersecurity risk management and reporting for essential and important entities.',
    url: 'https://www.nis-2-directive.com/',
  },
  {
    name: 'SOC 2 / audit evidence concepts',
    area: 'Audit & assurance',
    description: 'General concepts around trust-services criteria and evidence-based assurance (background only).',
    url: 'https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2',
  },
];

export function ResearchSourcesPage() {
  return (
    <>
      <PageHeader
        title="Research Sources"
        description="High-level sources used while learning AI governance, security, privacy, and audit concepts for this project."
      />

      <div className="mb-4 rounded-xl border border-warn/25 bg-warn/10 px-4 py-3 text-xs leading-relaxed text-warn">
        <Icon name="warning" size={14} className="mr-1 inline" />
        These are background learning references only, summarized in plain language. Always verify against
        the official sources and consult qualified legal, privacy, and security professionals. This project
        does not reproduce or interpret the official texts.
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {SOURCES.map((s) => (
          <Card key={s.name} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-[15px] font-semibold text-ink">{s.name}</h3>
                <div className="mt-0.5 text-xs font-medium text-brand">{s.area}</div>
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
        ))}
      </div>
    </>
  );
}
