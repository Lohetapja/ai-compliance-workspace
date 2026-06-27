import { useMemo, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { Field, Input, Checkbox, Select } from '../components/ui/Field';
import { downloadJSON } from '../lib/download';
import { useAppearance, type DefaultLens, type EvidenceWindow, type ReviewWindow } from '../store/useAppearance';
import { useDashboardPrefs } from '../store/useDashboardPrefs';
import { FRAMEWORK_LENSES } from '../lib/lenses';
import { cn } from '../components/ui/cn';
import type { WorkspaceExport } from '../types';

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex overflow-hidden rounded-lg border border-border">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'px-3 py-1.5 text-xs font-medium transition-colors',
            value === o.value ? 'bg-brand/20 text-brand' : 'text-muted hover:bg-elevated'
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

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

  // Approximate local storage used by this app's keys (KB), recomputed when data changes.
  const storageKb = useMemo(() => {
    let bytes = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('ai-compliance-workspace')) bytes += (localStorage.getItem(k)?.length ?? 0) + k.length;
      }
    } catch {
      /* ignore */
    }
    return Math.max(1, Math.round(bytes / 1024));
  }, [data]);

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

      <AppearanceCard />
      <WorkflowCard />

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
            <p className="rounded-lg bg-warn/10 px-3 py-2 text-xs leading-snug text-warn ring-1 ring-inset ring-warn/20">
              This app stores data locally in this browser. Export a JSON backup if you want to keep your workspace.
            </p>
            <p className="text-xs text-faint">Local storage in use: {storageKb} KB</p>
          </div>
        </Card>

        <Card>
          <CardHeader title="Sample data" subtitle="Fictional AI Test Company dataset" />
          <div className="space-y-3 p-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => { loadSampleData(); flash('ok', 'Loaded sample data.'); }}>
                <Icon name="copy" size={14} /> Load sample data
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  if (confirm('Replace current local workspace data with fictional sample data? This cannot be undone.')) {
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
                if (confirm('Clear all local workspace data from this browser? Export a JSON backup first if you want to keep it. This cannot be undone.')) {
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
            <strong className="text-ink">Fictional sample data.</strong> All organizations, systems, people,
            risks, incidents, and evidence records in the sample dataset are fictional and created only for
            demonstration purposes. Any resemblance to real companies, products, people, or incidents is
            unintentional.
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

function AppearanceCard() {
  const { theme, density, textSize, highContrast, setTheme, setDensity, setTextSize, setHighContrast, reset } =
    useAppearance();
  const { workspaceWidth, density: dashDensity, setWorkspaceWidth, setDensity: setDashDensity } = useDashboardPrefs();
  return (
    <Card className="mb-4">
      <CardHeader
        title="Appearance"
        subtitle="Display preferences for this browser only (not part of workspace data or exports)."
        actions={<Button size="sm" variant="ghost" onClick={reset}>Reset</Button>}
      />
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
        <Field label="Theme">
          <Segmented
            value={theme}
            onChange={setTheme}
            options={[
              { value: 'dark', label: 'Dark' },
              { value: 'light', label: 'Light' },
              { value: 'system', label: 'System' },
            ]}
          />
        </Field>
        <Field label="Density">
          <Segmented
            value={density}
            onChange={setDensity}
            options={[
              { value: 'comfortable', label: 'Comfortable' },
              { value: 'compact', label: 'Compact' },
            ]}
          />
        </Field>
        <Field label="Text size">
          <Segmented
            value={textSize}
            onChange={setTextSize}
            options={[
              { value: 'normal', label: 'Normal' },
              { value: 'large', label: 'Large' },
            ]}
          />
        </Field>
        <div className="flex items-end pb-1">
          <Checkbox checked={highContrast} onChange={setHighContrast} label="High contrast mode" />
        </div>
        <Field label="Workspace width" hint="Affects dashboard and table pages. Reading pages stay readable.">
          <Segmented
            value={workspaceWidth}
            onChange={setWorkspaceWidth}
            options={[
              { value: 'comfortable', label: 'Comfortable' },
              { value: 'wide', label: 'Wide' },
              { value: 'full', label: 'Full' },
            ]}
          />
        </Field>
        <Field label="Dashboard density">
          <Segmented
            value={dashDensity}
            onChange={setDashDensity}
            options={[
              { value: 'comfortable', label: 'Comfortable' },
              { value: 'compact', label: 'Compact' },
            ]}
          />
        </Field>
      </div>
    </Card>
  );
}

function WorkflowCard() {
  const { defaultLens, reviewWindow, evidenceWindow, showAdvanced, setDefaultLens, setReviewWindow, setEvidenceWindow, setShowAdvanced } =
    useAppearance();
  return (
    <Card className="mb-4">
      <CardHeader title="Workflow" subtitle="Preferences for governance views and review windows (stored in this browser)." />
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
        <Field label="Default framework lens">
          <Select value={defaultLens} onChange={(e) => setDefaultLens(e.target.value as DefaultLens)}>
            {FRAMEWORK_LENSES.map((l) => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Review due-soon window">
          <Segmented
            value={String(reviewWindow)}
            onChange={(v) => setReviewWindow(Number(v) as ReviewWindow)}
            options={[
              { value: '7', label: '7 days' },
              { value: '14', label: '14 days' },
              { value: '30', label: '30 days' },
            ]}
          />
        </Field>
        <Field label="Evidence due-soon window">
          <Segmented
            value={String(evidenceWindow)}
            onChange={(v) => setEvidenceWindow(Number(v) as EvidenceWindow)}
            options={[
              { value: '30', label: '30 days' },
              { value: '60', label: '60 days' },
              { value: '90', label: '90 days' },
            ]}
          />
        </Field>
        <div className="flex items-end pb-1">
          <Checkbox checked={showAdvanced} onChange={setShowAdvanced} label="Show advanced modules" />
        </div>
      </div>
      <p className="px-4 pb-3 text-[11px] leading-snug text-faint">
        The default lens opens first on Framework Lenses. Review/evidence windows are stored for upcoming
        tuning of due-soon calculations.
      </p>
    </Card>
  );
}
