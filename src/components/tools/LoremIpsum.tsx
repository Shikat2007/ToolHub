import { useCallback, useState } from "react";
import { ArrowLeft, AlignLeft, Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const WORDS = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum".split(" ");

function generateText(count: number, unit: "paragraphs" | "sentences" | "words"): string {
  const pick = (n: number) => Array.from({ length: n }, () => WORDS[Math.floor(Math.random() * WORDS.length)]).join(" ");
  const sentence = () => { const len = 8 + Math.floor(Math.random() * 12); const s = pick(len); return s.charAt(0).toUpperCase() + s.slice(1) + "."; };
  const paragraph = () => { const sents = 4 + Math.floor(Math.random() * 4); return Array.from({ length: sents }, sentence).join(" "); };

  if (unit === "paragraphs") return Array.from({ length: count }, paragraph).join("\n\n");
  if (unit === "sentences") return Array.from({ length: count }, sentence).join(" ");
  return pick(count);
}

export default function LoremIpsum({ onBack }: { onBack: () => void }) {
  const [count, setCount] = useState(3);
  const [unit, setUnit] = useState<"paragraphs" | "sentences" | "words">("paragraphs");
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => setText(generateText(count, unit)), [count, unit]);

  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 border-b border-border/60 px-6 py-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9 shrink-0 cursor-pointer"><ArrowLeft className="size-4" /></Button>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10"><AlignLeft className="size-5 text-primary" /></div>
          <div><h2 className="text-lg font-semibold tracking-tight">Lorem Ipsum Generator</h2><p className="text-xs text-muted-foreground">Generate dummy text</p></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-lg px-6 py-8 space-y-6">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="mb-1 block text-xs text-muted-foreground">Count</label>
              <Input type="number" min={1} max={100} value={count} onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value))))} className="text-sm" />
            </div>
            <div className="flex gap-1.5">
              {(["paragraphs", "sentences", "words"] as const).map((u) => (
                <Button key={u} variant={unit === u ? "default" : "outline"} size="sm" onClick={() => setUnit(u)} className="cursor-pointer text-xs capitalize">{u}</Button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={generate} className="flex-1 cursor-pointer">Generate</Button>
            {text && (
              <Button onClick={copy} variant="outline" className="cursor-pointer gap-1.5">
                {copied ? <CheckCircle2 className="size-4 text-emerald-500" /> : <Copy className="size-4" />} Copy
              </Button>
            )}
          </div>

          {text && (
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">{text}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
