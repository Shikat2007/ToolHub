import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categories, tools, type ToolDef } from "@/lib/tool-registry";

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (tool: ToolDef) => void;
}

function fuzzyMatch(query: string, text: string): boolean {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.includes(q)) return true;
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

export function SearchDialog({ isOpen, onClose, onSelect }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) { setQuery(""); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [isOpen]);

  const results = useMemo(() => {
    if (!query.trim()) return tools.slice(0, 8);
    return tools.filter((t) => fuzzyMatch(query, t.name) || fuzzyMatch(query, t.description) || fuzzyMatch(query, t.category));
  }, [query]);

  const handleSelect = useCallback((tool: ToolDef) => { onSelect(tool); onClose(); }, [onSelect, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border/60 bg-card shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
          <Search className="size-4 text-muted-foreground" />
          <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
            placeholder="Search tools... (esc to close)" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50" />
          <kbd className="rounded-md border border-border/60 bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">ESC</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No tools found</p>
          ) : (
            results.map((tool) => {
              const cat = categories.find((c) => c.id === tool.category);
              return (
                <button key={tool.id} onClick={() => handleSelect(tool)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-accent cursor-pointer group">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold shrink-0">
                    {tool.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{tool.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{cat?.label} — {tool.description}</p>
                  </div>
                  <ArrowRight className="size-3.5 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors shrink-0" />
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export function useSearchShortcut(onOpen: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); onOpen(); }
      else if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) { e.preventDefault(); onOpen(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onOpen]);
}
