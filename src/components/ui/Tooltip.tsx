import { useState } from 'react';

/** Plain-language glossary used by info tooltips across the app. */
export const GLOSSARY: Record<string, string> = {
  'human oversight owner':
    'The named person who can review, override, or stop the AI system before it causes harm.',
  evidence:
    'A document or record that shows a control is real — e.g. a risk assessment, logging config, or test results.',
  'residual risk':
    'The risk that remains after mitigations have been applied.',
  'risk treatment':
    'How a risk is handled: accepted, mitigated, transferred, avoided, or deferred.',
  'framework mapping':
    'A high-level link between your work and a framework area (e.g. EU AI Act, ISO 42001). Indicative only — not a legal interpretation.',
  'audit trail':
    'A record of inputs, outputs and actions that lets you reconstruct what the system did and when.',
  'data provenance':
    'Where data came from, how it was obtained, and what licensing or consent applies.',
  'evidence coverage':
    'How much of the recommended evidence checklist has been documented. NOT a compliance score.',
  autonomy:
    'How independently the system acts: advisory (suggests only), semi-autonomous (acts with a human in the loop), or autonomous (acts on its own).',
};

export function InfoTip({ term, text }: { term?: string; text?: string }) {
  const [open, setOpen] = useState(false);
  const body = text ?? (term ? GLOSSARY[term.toLowerCase()] : '') ?? '';
  if (!body) return null;
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={`Help: ${term ?? ''}`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(e) => {
          e.preventDefault();
          setOpen((v) => !v);
        }}
        className="ml-1 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-faint text-[9px] font-bold text-faint hover:border-brand hover:text-brand"
      >
        i
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-50 mb-1.5 w-56 -translate-x-1/2 rounded-lg border border-border bg-elevated px-2.5 py-2 text-xs leading-snug font-normal text-ink shadow-xl"
        >
          {body}
        </span>
      )}
    </span>
  );
}
