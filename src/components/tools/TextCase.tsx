import { useState } from "react";
import {
  ArrowLeft,
  Type,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const CASES = [
  { id: "upper", label: "UPPERCASE", fn: (s: string) => s.toUpperCase() },
  { id: "lower", label: "lowercase", fn: (s: string) => s.toLowerCase() },
  { id: "title", label: "Title Case", fn: (s: string) => s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()) },
  { id: "sentence", label: "Sentence case", fn: (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() },
  { id: "start", label: "Start Case", fn: (s: string) => s.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") },
  { id: "reverse", label: "rEvErSe CaSe", fn: (s: string) => s.split("").map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join("") },
  { id: "inverse", label: "iNVERSE cASE", fn: (s: string) => s.split("").map((c) => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join("") },
];

export default function TextCase({ onBack }: { onBack: () => void }) {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 border-b border-border/60 px-6 py-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9 shrink-0 cursor-pointer">
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
            <Type className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Text Case Converter</h2>
            <p className="text-xs text-muted-foreground">Transform text into any case format</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-8 space-y-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Input Text</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type or paste your text here..."
              className="h-40 w-full rounded-xl border border-border/60 bg-card p-4 text-sm leading-relaxed placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            {CASES.map((c) => {
              const result = input ? c.fn(input) : "";
              return (
                <div key={c.id} className="flex items-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{c.label}</p>
                    <p className="truncate text-sm">{result || "—"}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={!input}
                    onClick={() => handleCopy(result)}
                    className="size-8 shrink-0 cursor-pointer"
                  >
                    {copied ? <CheckCircle2 className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
