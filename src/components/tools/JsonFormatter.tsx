import { useState } from "react";
import { ArrowLeft, Braces, Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function JsonFormatter({ onBack }: { onBack: () => void }) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const format = (indent: boolean) => {
    setError(null);
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indent ? 2 : undefined));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      setOutput("");
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 border-b border-border/60 px-6 py-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9 shrink-0 cursor-pointer"><ArrowLeft className="size-4" /></Button>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10"><Braces className="size-5 text-primary" /></div>
          <div><h2 className="text-lg font-semibold tracking-tight">JSON Formatter</h2><p className="text-xs text-muted-foreground">Beautify, minify, and validate JSON</p></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-6 py-8 space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Input</label>
              <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder='{"key": "value"}'
                className="h-64 w-full rounded-xl border border-border/60 bg-card p-4 font-mono text-xs leading-relaxed placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none resize-none" />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-medium">Output</label>
                {output && (
                  <Button variant="ghost" size="sm" onClick={copy} className="cursor-pointer gap-1 text-xs">
                    {copied ? <CheckCircle2 className="size-3 text-emerald-500" /> : <Copy className="size-3" />} Copy
                  </Button>
                )}
              </div>
              <textarea readOnly value={output || error || ""} placeholder="Formatted output appears here..."
                className={`h-64 w-full rounded-xl border p-4 font-mono text-xs leading-relaxed resize-none ${error ? "border-destructive/40 text-destructive" : "border-border/60 bg-card"}`} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => format(true)} disabled={!input} className="cursor-pointer">Beautify</Button>
            <Button onClick={() => format(false)} disabled={!input} variant="outline" className="cursor-pointer">Minify</Button>
            <Button onClick={() => { setError(null); try { JSON.parse(input); setError(null); setOutput("✓ Valid JSON"); } catch (e) { setError(e instanceof Error ? e.message : "Invalid JSON"); setOutput(""); } }} disabled={!input} variant="outline" className="cursor-pointer">Validate</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
