import { useState, useMemo } from "react";
import { ArrowLeft, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Category = "length" | "weight" | "temperature";

const UNITS: Record<Category, { id: string; label: string; toBase: (v: number) => number; fromBase: (v: number) => number }[]> = {
  length: [
    { id: "km", label: "Kilometers", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { id: "m", label: "Meters", toBase: (v) => v, fromBase: (v) => v },
    { id: "cm", label: "Centimeters", toBase: (v) => v / 100, fromBase: (v) => v * 100 },
    { id: "mm", label: "Millimeters", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { id: "mi", label: "Miles", toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
    { id: "yd", label: "Yards", toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
    { id: "ft", label: "Feet", toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
    { id: "in", label: "Inches", toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
  ],
  weight: [
    { id: "kg", label: "Kilograms", toBase: (v) => v, fromBase: (v) => v },
    { id: "g", label: "Grams", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { id: "mg", label: "Milligrams", toBase: (v) => v / 1e6, fromBase: (v) => v * 1e6 },
    { id: "lb", label: "Pounds", toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592 },
    { id: "oz", label: "Ounces", toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },
    { id: "t", label: "Metric Tons", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
  ],
  temperature: [
    { id: "c", label: "Celsius", toBase: (v) => v, fromBase: (v) => v },
    { id: "f", label: "Fahrenheit", toBase: (v) => (v - 32) * 5 / 9, fromBase: (v) => v * 9 / 5 + 32 },
    { id: "k", label: "Kelvin", toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
  ],
};

export default function UnitConverter({ onBack }: { onBack: () => void }) {
  const [category, setCategory] = useState<Category>("length");
  const [fromUnit, setFromUnit] = useState("km");
  const [toUnit, setToUnit] = useState("m");
  const [value, setValue] = useState("1");

  const units = UNITS[category];

  const result = useMemo(() => {
    const v = parseFloat(value);
    if (isNaN(v)) return "";
    const fromDef = units.find((u) => u.id === fromUnit);
    const toDef = units.find((u) => u.id === toUnit);
    if (!fromDef || !toDef) return "";
    return toDef.fromBase(fromDef.toBase(v)).toPrecision(8).replace(/\.?0+$/, "");
  }, [value, fromUnit, toUnit, units]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 border-b border-border/60 px-6 py-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9 shrink-0 cursor-pointer"><ArrowLeft className="size-4" /></Button>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10"><Scale className="size-5 text-primary" /></div>
          <div><h2 className="text-lg font-semibold tracking-tight">Unit Converter</h2><p className="text-xs text-muted-foreground">Length, weight, and temperature</p></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-lg px-6 py-8 space-y-6">
          <div className="flex gap-1.5">
            {(["length", "weight", "temperature"] as const).map((c) => (
              <Button key={c} variant={category === c ? "default" : "outline"} size="sm" onClick={() => { setCategory(c); setFromUnit(UNITS[c][0].id); setToUnit(UNITS[c][1]?.id ?? UNITS[c][0].id); }} className="cursor-pointer text-xs capitalize">{c}</Button>
            ))}
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">From</label>
              <div className="flex gap-2">
                <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} className="flex-1 rounded-lg border border-border/60 bg-card px-3 py-2 text-sm">
                  {units.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
                </select>
                <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} className="flex-1 text-sm" />
              </div>
            </div>

            <div className="flex justify-center">
              <Button variant="ghost" size="icon" onClick={() => { const t = fromUnit; setFromUnit(toUnit); setToUnit(t); }} className="size-8 cursor-pointer">⇅</Button>
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted-foreground">To</label>
              <div className="flex gap-2">
                <select value={toUnit} onChange={(e) => setToUnit(e.target.value)} className="flex-1 rounded-lg border border-border/60 bg-card px-3 py-2 text-sm">
                  {units.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
                </select>
                <div className="flex-1 rounded-lg border border-border/60 bg-muted/50 px-3 py-2 text-sm font-medium">{result || "—"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
