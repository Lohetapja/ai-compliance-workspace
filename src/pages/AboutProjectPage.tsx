import { Link } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';

const workflow = [
  'Create AI System',
  'Classify possible risk',
  'Add risks',
  'Assign controls',
  'Attach evidence',
  'Record decisions',
  'Log incidents/issues',
  'Export audit pack',
  'Review again later',
];

export function AboutProjectPage() {
  return (
    <>
      <PageHeader
        title="About Project"
        description="Why this project exists, what it demonstrates, and where its safety boundaries are."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Why this project exists" />
          <div className="space-y-4 p-4 text-sm leading-relaxed text-muted">
            <p>
              AI compliance work is not only about knowing regulations. It is about creating structure:
              what systems exist, who owns them, what risks they create, what controls reduce those
              risks, what evidence exists, what decisions were made, and what needs review.
            </p>
            <p>
              This project is a practical learning and portfolio exercise around AI governance, AI
              security, GRC workflows, evidence tracking, and audit preparation. It does not provide
              legal advice or certify compliance.
            </p>
            <p>
              The app is intentionally local-first: no backend, no accounts, no API keys, no AI API
              calls, and no telemetry. Workspace data is stored in your browser localStorage and can
              be exported as JSON or Markdown.
            </p>
          </div>
        </Card>

        <Card>
          <CardHeader title="What this is not" />
          <ul className="space-y-2 p-4 text-xs leading-relaxed text-muted">
            <li>• Not a legal compliance engine.</li>
            <li>• Not a certification tool.</li>
            <li>• Not a live GRC/SIEM/ticketing integration.</li>
            <li>• Not a place for real confidential or sensitive data in the public demo.</li>
            <li>• Not an AI auto-assessment system.</li>
          </ul>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader title="Recommended workflow" subtitle="A simple governance loop for a fictional or sanitized AI system." />
        <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-3 lg:grid-cols-5">
          {workflow.map((step, i) => (
            <div key={step} className="rounded-lg border border-border bg-panel-2 p-3">
              <div className="text-[11px] font-semibold text-brand">Step {i + 1}</div>
              <div className="mt-1 text-sm font-medium text-ink">{step}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-4">
        <CardHeader title="Portfolio value" />
        <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-panel-2 p-3">
            <div className="text-sm font-semibold text-ink">AI governance structure</div>
            <p className="mt-1 text-xs leading-relaxed text-faint">
              Shows inventory, ownership, review dates, risk flags, framework tags, and decision records.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-panel-2 p-3">
            <div className="text-sm font-semibold text-ink">Evidence-backed workflow</div>
            <p className="mt-1 text-xs leading-relaxed text-faint">
              Connects risks, controls, evidence, incidents, gaps, and reports without claiming compliance.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-panel-2 p-3">
            <div className="text-sm font-semibold text-ink">Safe public demo</div>
            <p className="mt-1 text-xs leading-relaxed text-faint">
              Uses fictional data only and explains localStorage boundaries clearly for reviewers.
            </p>
          </div>
        </div>
      </Card>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link to="/dashboard"><Button variant="primary"><Icon name="dashboard" size={14} /> View dashboard</Button></Link>
        <Link to="/systems"><Button variant="secondary"><Icon name="systems" size={14} /> Open AI systems</Button></Link>
        <Link to="/reports"><Button variant="secondary"><Icon name="report" size={14} /> Open reports</Button></Link>
      </div>
    </>
  );
}
