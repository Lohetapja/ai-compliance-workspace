import { useState } from 'react';
import { useStore } from '../store/useStore';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Field';
import { REPORTS, singleSystemAuditPack } from '../lib/reports';
import { downloadText, slugify } from '../lib/download';

export function ReportsPage() {
  const data = useStore((s) => s.data);
  const [preview, setPreview] = useState<{ title: string; file: string; content: string } | null>(null);
  const [auditSystemId, setAuditSystemId] = useState(data.systems[0]?.id ?? '');

  function open(title: string, file: string, content: string) {
    setPreview({ title, file, content });
  }

  const auditSystem = data.systems.find((s) => s.id === auditSystemId);
  const auditPack = auditSystem ? singleSystemAuditPack(data, auditSystem) : '';

  return (
    <>
      <PageHeader
        title="Reports"
        description="Export working governance reports as Markdown. Every report carries a disclaimer; these are working artifacts, not compliance certifications."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((r) => (
          <Card key={r.id} className="flex flex-col p-4">
            <div className="flex items-start gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-brand">
                <Icon name="report" size={16} />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-ink">{r.title}</h3>
                <p className="mt-0.5 text-xs leading-snug text-faint">{r.description}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => open(r.title, `${r.id}.md`, r.generate(data))}>
                Preview
              </Button>
              <Button size="sm" variant="primary" onClick={() => downloadText(`${r.id}.md`, r.generate(data))}>
                <Icon name="download" size={13} /> .md
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-6 p-5">
        <div className="flex items-start gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet/15 text-violet">
            <Icon name="shield" size={16} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink">Single-System Audit Pack</h3>
            <p className="mt-0.5 text-xs text-faint">
              Professional Markdown pack for one system: overview, purpose, ownership, risk helper output,
              linked risks, controls, evidence, missing evidence, gap actions, decisions, incidents, framework summary, and next actions.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="sm:w-72">
            <Select value={auditSystemId} onChange={(e) => setAuditSystemId(e.target.value)}>
              {data.systems.length === 0 && <option value="">No systems available</option>}
              {data.systems.map((s) => (
                <option key={s.id} value={s.id}>{s.systemName}</option>
              ))}
            </Select>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              disabled={!auditSystem}
              onClick={() => auditSystem && open(`Audit Pack - ${auditSystem.systemName}`, `audit-pack-${slugify(auditSystem.systemName)}.md`, auditPack)}
            >
              Preview
            </Button>
            <Button
              variant="secondary"
              disabled={!auditSystem}
              onClick={() => navigator.clipboard?.writeText(auditPack)}
            >
              Copy Markdown
            </Button>
            <Button
              variant="primary"
              disabled={!auditSystem}
              onClick={() => auditSystem && downloadText(`audit-pack-${slugify(auditSystem.systemName)}.md`, auditPack)}
            >
              <Icon name="download" size={13} /> Download pack
            </Button>
          </div>
        </div>
      </Card>

      {preview && (
        <Modal
          open
          onClose={() => setPreview(null)}
          title={preview.title}
          subtitle="Markdown preview"
          size="xl"
          footer={
            <>
              <Button variant="ghost" onClick={() => navigator.clipboard?.writeText(preview.content)}>
                Copy Markdown
              </Button>
              <Button variant="primary" onClick={() => downloadText(preview.file, preview.content)}>
                <Icon name="download" size={14} /> Download .md
              </Button>
            </>
          }
        >
          <pre className="max-h-[60vh] overflow-auto rounded-lg border border-border bg-bg p-4 text-xs leading-relaxed text-muted whitespace-pre-wrap">
            {preview.content}
          </pre>
        </Modal>
      )}
    </>
  );
}
