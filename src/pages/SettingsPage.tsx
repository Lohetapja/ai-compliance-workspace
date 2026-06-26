import { useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { Field, Input } from '../components/ui/Field';
import { downloadJSON } from '../lib/download';
import type { WorkspaceExport } from '../types';

export function SettingsPage() {
  const data = useStore((s) => s.data);
  const exportData = useStore((s) => s.exportData);
  const importData = useStore((s) => s.importData);
  const loadSampleData = useStore((s) => s.loadSampleData);
  const resetSampleData = useStore((s) => s.resetSampleData);
  const clearAll = useStore((s) => s.clearAll);
  const setOrganizationName = useStore((s) => s.setOrganizationName);
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  function flash(kind: 'ok' | 'err', text: string) {
    setMsg({ kind, text });
    setTimeout(() => setMsg(null), 3500);
  }

  function onExport() {
    const stamp = new Date().toISOString().slice(0, 10);
    downloadJSON(`ai-compliance-workspace-${stamp}.json`, exportData());
    flash('ok', 'Exported JSON backup.');
  }

  function onImportFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as WorkspaceExport;
        if (!parsed || typeof parsed !== 'object') throw new Error('Not an object');
        importData(parsed);
        flash('ok', 'Imported workspace from backup.');
      } catch {
        flash('err', 'Could not import — the file is not a valid workspace JSON backup.');
      }
    };
    reader.readAsText(file);
  }

  const counts = [
    ['AI systems', data.systems.length],
    ['Risks', data.risks.length],
    ['Controls', data.controls.length],
    ['Evidence', data.evidence.length],
    ['Decisions', data.decisions.length],
    ['Incidents', data.incidents.length],
  ] as const;

  return (
    <>
      <PageHeader
        title="Settings / Data"
        description="Manage the fictional demo data. Everything is stored only in this browser (localStorage) — nothing is sent anywhere."
      />

      {msg && (
        <div className={`mb-4 rounded-lg px-4 py-2.5 text-sm ${msg.kind === 'ok' ? 'bg-ok/15 text-ok' : 'bg-danger/15 text-danger'}`}>
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Workspace" />
          <div className="space-y-4 p-4">
            <Field label="Organization name (demo)">
              <Input value={data.organizationName} onChange={(e) => setOrganizationName(e.target.value)} />
            </Field>
            <div>
              <div className="label">Current contents</div>
              <div className="grid grid-cols-3 gap-2">
                {counts.map(([label, n]) => (
                  <div key={label} className="rounded-lg border border-border bg-panel-2 p-2 text-center">
                    <div className="text-lg font-semibold text-ink">{n}</div>
                    <div className="text-[11px] text-faint">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Backup & restore" subtitle="JSON import / export — keep your own backups" />
          <div className="space-y-3 p-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" onClick={onExport}><Icon name="download" size={14} /> Export JSON backup</Button>
              <Button variant="secondary" onClick={() => fileRef.current?.click()}><Icon name="upload" size={14} /> Import JSON backup</Button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onImportFile(f);
                  e.target.value = '';
                }}
              />
            </div>
            <p className="text-xs leading-snug text-faint">
              Import replaces the current workspace with the contents of the file. Export first if you
              want to keep what you have.
            </p>
          </div>
        </Card>

        <Card>
          <CardHeader title="Sample data" subtitle="Fictional Northstar AI Cloud dataset" />
          <div className="space-y-3 p-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => { loadSampleData(); flash('ok', 'Loaded sample data.'); }}>
                <Icon name="copy" size={14} /> Load sample data
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  if (confirm('Reset to the fictional sample dataset? This replaces the current workspace.')) {
                    resetSampleData();
                    flash('ok', 'Reset to sample data.');
                  }
                }}
              >
                <Icon name="report" size={14} /> Reset demo data
              </Button>
            </div>
            <p className="text-xs leading-snug text-faint">
              The sample data demonstrates a realistic AI infrastructure provider with linked systems,
              risks, controls, evidence, decisions and incidents.
            </p>
          </div>
        </Card>

        <Card>
          <CardHeader title="Danger zone" subtitle="Clear all local data" />
          <div className="space-y-3 p-4">
            <Button
              variant="danger"
              onClick={() => {
                if (confirm('Clear ALL local data? This cannot be undone (export a backup first).')) {
                  clearAll();
                  flash('ok', 'Cleared all local data.');
                }
              }}
            >
              <Icon name="trash" size={14} /> Clear local data
            </Button>
            <p className="text-xs leading-snug text-faint">
              Removes everything from this browser. The app will start empty until you add a system or
              load the sample data again.
            </p>
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader title="Privacy & safety notes" />
        <div className="space-y-2 p-4 text-xs leading-relaxed text-muted">
          <p>
            <strong className="text-ink">Demo workspace only.</strong> Do not enter real confidential,
            personal, customer, regulated, or sensitive company data.
          </p>
          <p>
            All data is stored only in your browser via <code className="text-brand">localStorage</code>.
            There is no backend, no account, and no network transmission of your entries. Clearing your
            browser storage (or this app’s data) removes it permanently.
          </p>
          <p>
            This tool helps structure AI governance work. It is <strong className="text-ink">not legal
            advice</strong>, does not determine EU AI Act risk tiers, and does not certify compliance
            with ISO/IEC 42001 or any other framework.
          </p>
        </div>
      </Card>
    </>
  );
}
