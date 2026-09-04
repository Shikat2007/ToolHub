import { useState } from "react";
import { ArrowLeft, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function getBMICategory(bmi: number) {
  if (bmi < 18.5) return { label: "Underweight", color: "text-blue-500", bg: "bg-blue-500", pct: Math.min((bmi / 18.5) * 25, 25) };
  if (bmi < 25) return { label: "Normal", color: "text-emerald-500", bg: "bg-emerald-500", pct: 25 + ((bmi - 18.5) / 6.5) * 25 };
  if (bmi < 30) return { label: "Overweight", color: "text-amber-500", bg: "bg-amber-500", pct: 50 + ((bmi - 25) / 5) * 25 };
  return { label: "Obese", color: "text-destructive", bg: "bg-destructive", pct: Math.min(75 + ((bmi - 30) / 20) * 25, 100) };
}

export default function BMICalculator({ onBack }: { onBack: () => void }) {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");

  const calc = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) return null;
    let bmi: number;
    if (unit === "metric") {
      bmi = w / (h / 100) ** 2;
    } else {
      bmi = (w / (h * h)) * 703;
    }
    return { bmi, category: getBMICategory(bmi) };
  };

  const res = calc();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 border-b border-border/60 px-6 py-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9 shrink-0 cursor-pointer"><ArrowLeft className="size-4" /></Button>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10"><HeartPulse className="size-5 text-primary" /></div>
          <div><h2 className="text-lg font-semibold tracking-tight">BMI Calculator</h2><p className="text-xs text-muted-foreground">Body Mass Index with health indicator</p></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-lg px-6 py-8 space-y-6">
          <div className="flex gap-1.5">
            <Button variant={unit === "metric" ? "default" : "outline"} size="sm" onClick={() => setUnit("metric")} className="cursor-pointer text-xs">Metric (kg/cm)</Button>
            <Button variant={unit === "imperial" ? "default" : "outline"} size="sm" onClick={() => setUnit("imperial")} className="cursor-pointer text-xs">Imperial (lb/in)</Button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">{unit === "metric" ? "Height (cm)" : "Height (inches)"}</label>
              <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder={unit === "metric" ? "170" : "67"} className="text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">{unit === "metric" ? "Weight (kg)" : "Weight (lbs)"}</label>
              <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder={unit === "metric" ? "70" : "154"} className="text-sm" />
            </div>
          </div>

          {res && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-5xl font-bold tracking-tight text-primary">{res.bmi.toFixed(1)}</p>
                <p className={`mt-2 text-lg font-semibold ${res.category.color}`}>{res.category.label}</p>
              </div>

              {/* Visual bar */}
              <div className="relative h-4 overflow-hidden rounded-full bg-muted">
                <div className="absolute inset-0 flex">
                  <div className="h-full flex-1 bg-blue-400" />
                  <div className="h-full flex-1 bg-emerald-400" />
                  <div className="h-full flex-1 bg-amber-400" />
                  <div className="h-full flex-1 bg-red-400" />
                </div>
                <div className="absolute top-0 h-full w-1 bg-foreground rounded-full transition-all duration-500" style={{ left: `${Math.min(res.category.pct, 98)}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Underweight</span><span>Normal</span><span>Overweight</span><span>Obese</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
                <div className="rounded-lg bg-muted/50 p-2"><p className="font-medium text-foreground">{"<"}18.5</p><p>Underweight</p></div>
                <div className="rounded-lg bg-muted/50 p-2"><p className="font-medium text-foreground">18.5–24.9</p><p>Normal</p></div>
                <div className="rounded-lg bg-muted/50 p-2"><p className="font-medium text-foreground">{"≥"}25</p><p>Overweight+</p></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
