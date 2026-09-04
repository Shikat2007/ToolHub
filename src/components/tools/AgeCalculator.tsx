import { useState } from "react";
import { ArrowLeft, Cake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AgeCalculator({ onBack }: { onBack: () => void }) {
  const [birthDate, setBirthDate] = useState("");
  const [result, setResult] = useState<{
    years: number; months: number; days: number;
    totalDays: number; totalHours: number; totalMinutes: number;
  } | null>(null);

  const calculate = () => {
    if (!birthDate) return;
    const birth = new Date(birthDate);
    const now = new Date();
    if (birth > now) return;

    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();

    if (days < 0) { months--; const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0); days += prevMonth.getDate(); }
    if (months < 0) { years--; months += 12; }

    const diffMs = now.getTime() - birth.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const totalMinutes = Math.floor(diffMs / (1000 * 60));

    setResult({ years, months, days, totalDays, totalHours, totalMinutes });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 border-b border-border/60 px-6 py-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9 shrink-0 cursor-pointer"><ArrowLeft className="size-4" /></Button>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10"><Cake className="size-5 text-primary" /></div>
          <div><h2 className="text-lg font-semibold tracking-tight">Age Calculator</h2><p className="text-xs text-muted-foreground">Compute exact age from birth date</p></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-lg px-6 py-8 space-y-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Date of Birth</label>
            <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="text-sm" />
          </div>
          <Button onClick={calculate} disabled={!birthDate} className="w-full cursor-pointer">Calculate Age</Button>
          {result && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: "Years", value: result.years },
                  { label: "Months", value: result.months },
                  { label: "Days", value: result.days },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-border/60 bg-card p-4">
                    <p className="text-3xl font-bold tracking-tight text-primary">{s.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: "Total Days", value: result.totalDays.toLocaleString() },
                  { label: "Total Hours", value: result.totalHours.toLocaleString() },
                  { label: "Total Minutes", value: result.totalMinutes.toLocaleString() },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl bg-muted/50 p-3">
                    <p className="text-lg font-bold tracking-tight">{s.value}</p>
                    <p className="text-[11px] text-muted-foreground">{s.label}</p>
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
