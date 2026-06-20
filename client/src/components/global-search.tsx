import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useCriteriaStore } from "@/stores/criteriaStore";
import { useCandidateStore } from "@/stores/candidateStore";
import { usePSIStore } from "@/stores/psiStore";

interface SearchResult {
  type: "criteria" | "candidate" | "session";
  id: number;
  label: string;
  subtitle: string;
}

const typeIcon = {
  criteria: (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  candidate: (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  session: (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 8 6 9.5 8.5" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 16 6 14.5 8.5" />
      <path d="M4 22h16" /><path d="M10 22 8 13h8l-2 9" />
    </svg>
  ),
};

const typeLabel = { criteria: "Kriteria", candidate: "Kandidat", session: "Sesi" };

export default function GlobalSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { criteria } = useCriteriaStore();
  const { candidates } = useCandidateStore();
  const { sessions } = usePSIStore();

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const items: SearchResult[] = [];

    for (const c of criteria) {
      if (c.code?.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)) {
        items.push({ type: "criteria", id: c.id, label: `${c.code ?? ""} — ${c.name}`, subtitle: c.type });
      }
    }

    for (const c of candidates) {
      if (c.name.toLowerCase().includes(q) || c.expertise?.toLowerCase().includes(q) || c.education?.toLowerCase().includes(q)) {
        items.push({ type: "candidate", id: c.id, label: c.name, subtitle: c.expertise ?? c.education ?? "" });
      }
    }

    for (const s of sessions) {
      if (s.sessionName.toLowerCase().includes(q)) {
        items.push({ type: "session", id: s.sessionId, label: s.sessionName, subtitle: "" });
      }
    }

    return items;
  }, [query, criteria, candidates, sessions]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [open]);

  const handleSelect = (r: SearchResult) => {
    onOpenChange(false);
    switch (r.type) {
      case "criteria": navigate("/criteria"); break;
      case "candidate": navigate("/candidates"); break;
      case "session": navigate(`/results/${r.id}`); break;
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 pt-[15vh] backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onOpenChange(false);
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="w-full max-w-lg overflow-hidden rounded-xl border bg-background shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b px-4">
          <svg className="h-4 w-4 shrink-0 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Cari kriteria, kandidat, sesi..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="inline-flex items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            Esc
          </kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {results.length > 0 ? (
            results.map((r, i) => (
              <button
                key={`${r.type}-${r.id}-${i}`}
                onClick={() => handleSelect(r)}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center text-muted-foreground">
                  {typeIcon[r.type]}
                </span>
                <span className="flex-1 truncate font-medium">{r.label}</span>
                {r.subtitle && (
                  <span className="hidden truncate text-xs text-muted-foreground sm:inline">{r.subtitle}</span>
                )}
                <span className="shrink-0 text-[10px] uppercase text-muted-foreground">{typeLabel[r.type]}</span>
              </button>
            ))
          ) : query.trim() ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Tidak ada hasil untuk "{query}"
            </p>
          ) : (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Ketik untuk mencari kriteria, kandidat, atau sesi
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
