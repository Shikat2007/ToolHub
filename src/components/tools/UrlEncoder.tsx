import { useState } from "react";
import { ArrowLeft, Link, Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UrlEncoder({ onBack }: { onBack: () => void }) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const process = () => {
    setError(null);
    try {
      if (mode === "encode") {
        setOutput(encodeURIComponent(input));
      } else {
        setOutput(decodeURIComponent(input));
      }
    } catch {
      setError(mode === "decode" ? "Invalid encoded string" : "Encoding failed");
      setOutput("");
    }
  };

  const copy = () => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 border-b border-border/60 px-6 py-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9 shrink-0 cursor-pointer"><ArrowLeft className="size-4" /></Button>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10"><Link className="size-5 text-primary" /></div>
          <div><h2 className="text-lg font-semibold tracking-tight">URL Encoder / Decoder</h2><p className="text-xs text-muted-foreground">Encode and decode URLs and query strings</p></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-lg px-6 py-8 space-y-4">
          <div className="flex gap-1.5">
            <Button variant={mode === "encode" ? "default" : "outline"} size="sm" onClick={() => setMode("encode")} className="cursor-pointer text-xs">Encode</Button>
            <Button variant={mode === "decode" ? "default" : "outline"} size="sm" onClick={() => setMode("decode")} className="cursor-pointer text-xs">Decode</Button>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">{mode === "encode" ? "Plain Text / URL" : "Encoded String"}</label>
            <textarea value={input} onChange={(e) => setInput(e.target.value)}
              placeholder={mode === "encode" ? "https://example.com/path?q=hello world&lang=en" : "https%3A%2F%2Fexample.com%2Fpath%3Fq%3Dhello%20world%26lang%3Den"}
              className="h-28 w-full rounded-xl border border-border/60 bg-card p-4 font-mono text-xs leading-relaxed focus:border-primary/50 focus:outline-none resize-none" />
          </div>

          <Button onClick={process} disabled={!input} className="w-full cursor-pointer">{mode === "encode" ? "Encode" : "Decode"}</Button>

          {(output || error) && (
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-medium">Result</label>
                {output && <Button variant="ghost" size="sm" onClick={copy} className="cursor-pointer gap-1 text-xs">{copied ? <CheckCircle2 className="size-3 text-emerald-500" /> : <Copy className="size-3" />} Copy</Button>}
              </div>
              <textarea readOnly value={output || error || ""} placeholder="Result..."
                className={`h-28 w-full rounded-xl border p-4 font-mono text-xs leading-relaxed resize-none ${error ? "border-destructive/40 text-destructive" : "border-border/60 bg-card"}`} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
