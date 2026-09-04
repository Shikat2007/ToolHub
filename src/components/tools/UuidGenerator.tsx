import { useCallback, useState } from "react";
import { ArrowLeft, Hash, Copy, CheckCircle2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UuidGenerator({ onBack }: { onBack: () => void }) {
  const [uuids, setUuids] = useState<string[]>([]);
  const [copied, setCopied] = useState("");

  const generate = useCallback(() => {
    const id = crypto.randomUUID();
    setUuids((prev) => [id, ...prev]);
  }, []);

  const generateBatch = (count: number) => {
    const newIds = Array.from({ length: count }, () => crypto.randomUUID());
    setUuids((prev) => [...newIds, ...prev]);
  };

  const copyUuid = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(id);
    setTimeout(() => setCopied(""), 2000);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(uuids.join("\n"));
    setCopied("all");
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 border-b border-border/60 px-6 py-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9 shrink-0 cursor-pointer"><ArrowLeft className="size-4" /></Button>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10"><Hash className="size-5 text-primary" /></div>
          <div><h2 className="text-lg font-semibold tracking-tight">UUID Generator</h2><p className="text-xs text-muted-foreground">Generate random v4 UUIDs</p></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-lg px-6 py-8 space-y-6">
          <div className="flex gap-2">
            <Button onClick={generate} className="flex-1 cursor-pointer gap-2"><Plus className="size-4" /> Generate</Button>
            <Button onClick={() => generateBatch(5)} variant="outline" className="cursor-pointer">+5</Button>
            <Button onClick={() => generateBatch(10)} variant="outline" className="cursor-pointer">+10</Button>
          </div>

          {uuids.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{uuids.length} UUID{uuids.length !== 1 ? "s" : ""}</p>
                <Button variant="ghost" size="sm" onClick={copyAll} className="cursor-pointer text-xs">
                  {copied === "all" ? <CheckCircle2 className="size-3 text-emerald-500" /> : <Copy className="size-3" />} Copy All
                </Button>
              </div>
              {uuids.map((id, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-2.5 group hover:border-primary/30 transition-colors">
                  <code className="flex-1 font-mono text-xs">{id}</code>
                  <Button variant="ghost" size="icon" onClick={() => copyUuid(id)} className="size-7 shrink-0 cursor-pointer opacity-60 group-hover:opacity-100">
                    {copied === id ? <CheckCircle2 className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
