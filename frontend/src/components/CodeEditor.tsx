import type { KeyboardEvent } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

/** Lightweight Python editor: textarea + line numbers, Tab inserts four spaces. */
export default function CodeEditor({ value, onChange }: Props) {
  const lineCount = Math.max(value.split("\n").length, 8);

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Tab") return;
    e.preventDefault();
    const el = e.currentTarget;
    const { selectionStart: s, selectionEnd: end } = el;
    const next = value.slice(0, s) + "    " + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = s + 4;
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-editor-line bg-editor shadow-[0_8px_24px_rgba(27,42,74,0.12)]">
      <div className="flex items-center justify-between border-b border-editor-line px-4 py-2.5">
        <div className="flex items-center gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-[#33415F]" />
          <span className="size-2.5 rounded-full bg-[#33415F]" />
          <span className="size-2.5 rounded-full bg-[#33415F]" />
        </div>
        <span className="font-mono text-xs text-slate-400">session.py</span>
      </div>
      <div className="flex font-mono text-sm leading-6">
        <div aria-hidden className="select-none py-4 pl-4 pr-3 text-right text-slate-500">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <textarea
          data-testid="code-editor-textarea"
          aria-label="Python code editor"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          rows={lineCount}
          className="w-full resize-none bg-transparent py-4 pr-4 text-slate-100 caret-coral outline-none placeholder:text-slate-500"
          style={{ tabSize: 4 }}
        />
      </div>
    </div>
  );
}
