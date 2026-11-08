"use client";
import { useState } from "react";

export type Cmd = { label: string; run: () => void };

export function CommandPalette({ open, onClose, commands }: { open: boolean; onClose: () => void; commands: Cmd[] }) {
  // Mounting only while open resets query/selection without an effect.
  return open ? <Palette onClose={onClose} commands={commands} /> : null;
}

function Palette({ onClose, commands }: { onClose: () => void; commands: Cmd[] }) {
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const list = commands.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()));
  const run = (c?: Cmd) => { if (c) { onClose(); c.run(); } };
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[15vh]" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Command palette" className="w-full max-w-lg overflow-hidden rounded-xl border border-line bg-surface shadow-2xl" onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => { if (e.key === "Escape") onClose(); if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(i + 1, list.length - 1)); } if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); } if (e.key === "Enter") run(list[idx]); }}>
        <input autoFocus value={q} onChange={(e) => { setQ(e.target.value); setIdx(0); }} placeholder="Type a command…" aria-label="Command" role="combobox" aria-expanded="true" aria-controls="cmd-list" className="w-full border-b border-line bg-transparent px-4 py-3 text-sm outline-none" />
        <ul id="cmd-list" role="listbox" className="max-h-72 overflow-y-auto p-1">
          {list.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted">No results</li>}
          {list.map((c, i) => <li key={c.label} role="option" aria-selected={i === idx} onMouseEnter={() => setIdx(i)} onClick={() => run(c)} className={`cursor-pointer rounded-lg px-3 py-2 text-sm ${i === idx ? "bg-elevated text-fg" : "text-fg2"}`}>{c.label}</li>)}
        </ul>
      </div>
    </div>
  );
}
