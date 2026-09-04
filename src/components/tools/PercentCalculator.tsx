import { useState } from "react";
import { ArrowLeft, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Mode = "discount" | "markup" | "whatPercent" | "ratio";

export default function PercentCalculator({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState<Mode>("discount");
  const [val1, setVal1] = useState("");
  const [val2, setVal2] = useState("");

  const calc = () => {
    const a = parseFloat(val1);
    const b = parseFloat(val2);
    if (isNaN(a) || isNaN(b)) return null;
    switch (mode) {
      case "discount": return { result: a - (a * b) / 100, label: `Final Price: $${(a - (a * b) / 100).toFixed(2)}`, sub: `You save: $${((a * b) / 100).toFixed(2)}` };
      case "markup": return { result: a + (a * b) / 100, label: `Final Price: $${(a + (a * b) / 100).toFixed(2)}`, sub: `Added amount: $${((a * b) / 100).toFixed(2)}` };
      case "whatPercent": return { result: (b / a) * 100, label: `${b} is ${((b / a) * 100).toFixed(2)}% of ${a}`, sub: "" };
      case "ratio": return { result: (a / b) * 100, label: `${a} / ${b} = ${((a / b) * 100).toFixed(2)}%`, sub: "" };
    }
  };

  const res = calc();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 border-b border-border/60 px-6 py-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9 shrink-0 cursor-pointer"><ArrowLeft className="size-4" /></Button>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10"><Percent className="size-5 text-primary" /></div>
          <div><h2 className="text-lg font-semibold tracking-tight">Percentage Calculator</h2><p className="text-xs text-muted-foreground">Discounts, markups, and ratios</p></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-lg px-6 py-8 space-y-6">
          <div className="flex flex-wrap gap-1.5">
            {([["discount", "Discount"], ["markup", "Markup"], ["whatPercent", "What %?"], ["ratio", "Ratio %"]] as const).map(([id, label]) => (
              <Button key={id} variant={mode === id ? "default" : "outline"} size="sm" onClick={() => setMode(id)} className="cursor-pointer text-xs">{label}</Button>
            ))}
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                {mode === "discount" ? "Original Price" : mode === "markup" ? "Base Price" : mode === "whatPercent" ? "Total / Whole" : "Numerator"}
              </label>
              <Input type="number" value={val1} onChange={(e) => setVal1(e.target.value)} placeholder="0" className="text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                {mode === "discount" || mode === "markup" ? "Percentage (%)" : mode === "whatPercent" ? "Part" : "Denominator"}
              </label>
              <Input type="number" value={val2} onChange={(e) => setVal2(e.target.value)} placeholder="0" className="text-sm" />
            </div>
          </div>

          {res && (
            <div className="rounded-xl border border-border/60 bg-card p-5 text-center">
              <p className="text-xl font-bold tracking-tight text-primary">{res.label}</p>
              {res.sub && <p className="mt-1 text-sm text-muted-foreground">{res.sub}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
