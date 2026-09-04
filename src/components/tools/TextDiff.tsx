import { useMemo, useState } from "react";
import { ArrowLeft, GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DiffLine { type: "same" | "added" | "removed"; text: string; }

function computeDiff(original: string, modified: string): DiffLine[] {
  const origLines = original.split("\n");
  const modLines = modified.split("\n");
  const result: DiffLine[] = [];
  const maxLen = Math.max(origLines.length, modLines.length);

  for (let i = 0; i < maxLen; i++) {
    const o = i < origLines.length ? origLines[i] : undefined;
    const m = i < modLines.length ? modLines[i] : undefined;

    if (o === undefined) {
      result.push({ type: "added", text: m! });
    } else if (m === undefined) {
      result.push({ type: "removed", text: o });
    } else if (o === m) {
      result.push({ type: "same", text: o });
    } else {
      result.push({ type: "removed", text: o });
      result.push({ type: "added", text: m });
    }
  }
  return result;
}

export default function TextDiff({ onBack }: { onBack: () => void }) {
  const [original, setOriginal] = useState("");
  const [modified, setModified] = useState("");

  const diff = useMemo(() => {
    if (!original && !modified) return [];
    return computeDiff(original, modified);
  }, [original, modified]);

  const added = diff.filter((d) => d.type === "added").length;
  const removed = diff.filter((d) => d.type === "removed").length;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 border-b border-border/60 px-6 py-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9 shrink-0 cursor-pointer"><ArrowLeft className="size-4" /></Button>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10"><GitCompare className="size-5 text-primary" /></div>
          <div><h2 className="text-lg font-semibold tracking-tight">Text Diff Checker</h2><p className="text-xs text-muted-foreground">Compare two text blocks side-by-side</p></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-8 space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Original Text</label>
              <textarea value={original} onChange={(e) => setOriginal(e.target.value)} placeholder="Paste original text here..."
                className="h-48 w-full rounded-xl border border-border/60 bg-card p-4 text-xs leading-relaxed focus:border-primary/50 focus:outline-none resize-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Modified Text</label>
              <textarea value={modified} onChange={(e) => setModified(e.target.value)} placeholder="Paste modified text here..."
                className="h-48 w-full rounded-xl border border-border/60 bg-card p-4 text-xs leading-relaxed focus:border-primary/50 focus:outline-none resize-none" />
            </div>
          </div>

          {diff.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">+{added} added</span>
                <span className="text-destructive font-medium">-{removed} removed</span>
              </div>
              <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
                {diff.map((line, i) => (
                  <div key={i} className={`flex border-b border-border/30 last:border-0 ${
                    line.type === "added" ? "bg-emerald-500/10" : line.type === "removed" ? "bg-destructive/10" : ""
                  }`}>
                    <span className="w-12 shrink-0 px-2 py-1 text-right text-[10px] text-muted-foreground/50 border-r border-border/30">
                      {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
                    </span>
                    <pre className="flex-1 overflow-x-auto px-3 py-1 text-xs font-mono whitespace-pre-wrap">{line.text || "\u00A0"}</pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
