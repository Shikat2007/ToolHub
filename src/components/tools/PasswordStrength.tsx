import { useMemo, useState } from "react";
import { ArrowLeft, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function analyzePassword(pw: string) {
  if (!pw) return null;
  const checks = {
    length: pw.length,
    hasLower: /[a-z]/.test(pw),
    hasUpper: /[A-Z]/.test(pw),
    hasNumbers: /\d/.test(pw),
    hasSymbols: /[^a-zA-Z0-9]/.test(pw),
    noRepeats: !/(.)\1{2,}/.test(pw),
    noSequential: !/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(pw),
    noCommon: !["password", "123456", "qwerty", "letmein", "admin", "welcome", "monkey", "dragon", "master", "login", "abc123", "password1", "12345678", "iloveyou"].includes(pw.toLowerCase()),
  };

  let poolSize = 0;
  if (checks.hasLower) poolSize += 26;
  if (checks.hasUpper) poolSize += 26;
  if (checks.hasNumbers) poolSize += 10;
  if (checks.hasSymbols) poolSize += 32;
  if (poolSize === 0) poolSize = 26;

  const entropy = Math.log2(Math.pow(poolSize, pw.length));
  const crackTime = Math.pow(2, entropy) / 1e10; // assuming 10 billion guesses/sec

  let weaknesses: string[] = [];
  if (pw.length < 8) weaknesses.push("Too short (under 8 characters)");
  if (!checks.hasUpper) weaknesses.push("No uppercase letters");
  if (!checks.hasLower) weaknesses.push("No lowercase letters");
  if (!checks.hasNumbers) weaknesses.push("No numbers");
  if (!checks.hasSymbols) weaknesses.push("No special characters");
  if (!checks.noRepeats) weaknesses.push("Contains repeating characters");
  if (!checks.noSequential) weaknesses.push("Contains sequential patterns");
  if (!checks.noCommon) weaknesses.push("Commonly used password");

  let strength: string;
  let score: number;
  let color: string;
  if (entropy < 28) { strength = "Very Weak"; score = 1; color = "bg-red-500"; }
  else if (entropy < 36) { strength = "Weak"; score = 2; color = "bg-orange-500"; }
  else if (entropy < 60) { strength = "Fair"; score = 3; color = "bg-amber-500"; }
  else if (entropy < 80) { strength = "Strong"; score = 4; color = "bg-emerald-500"; }
  else { strength = "Very Strong"; score = 5; color = "bg-emerald-400"; }

  const fmtTime = (secs: number) => {
    if (secs < 0.001) return "Instant";
    if (secs < 1) return "Less than a second";
    if (secs < 60) return `${Math.floor(secs)} seconds`;
    if (secs < 3600) return `${Math.floor(secs / 60)} minutes`;
    if (secs < 86400) return `${Math.floor(secs / 3600)} hours`;
    if (secs < 31536000) return `${Math.floor(secs / 86400)} days`;
    if (secs < 31536000 * 1000) return `${Math.floor(secs / 31536000)} years`;
    if (secs < 31536000 * 1e6) return `${Math.floor(secs / 31536000 / 1000)}k years`;
    return "Centuries+";
  };

  return { checks, entropy, crackTime: fmtTime(crackTime), weaknesses, strength, score, color, poolSize };
}

export default function PasswordStrength({ onBack }: { onBack: () => void }) {
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);

  const result = useMemo(() => analyzePassword(pw), [pw]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 border-b border-border/60 px-6 py-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9 shrink-0 cursor-pointer"><ArrowLeft className="size-4" /></Button>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10"><ShieldCheck className="size-5 text-primary" /></div>
          <div><h2 className="text-lg font-semibold tracking-tight">Password Strength Meter</h2><p className="text-xs text-muted-foreground">Analyze entropy, complexity, and weaknesses</p></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-lg px-6 py-8 space-y-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Enter Password</label>
            <div className="relative">
              <Input value={pw} onChange={(e) => setPw(e.target.value)} type={showPw ? "text" : "password"} placeholder="Type or paste a password..." className="font-mono text-sm pr-10" />
              <Button variant="ghost" size="icon" onClick={() => setShowPw(!showPw)} className="absolute right-1 top-1/2 -translate-y-1/2 size-8 cursor-pointer">
                {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
            </div>
          </div>

          {result && (
            <div className="space-y-5">
              {/* Strength bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">{result.strength}</p>
                  <p className="text-xs text-muted-foreground">{result.entropy.toFixed(1)} bits entropy</p>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={`h-2 flex-1 rounded-full transition-colors duration-300 ${i < result.score ? result.color : "bg-muted"}`} />
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-lg font-bold">{pw.length}</p>
                  <p className="text-[11px] text-muted-foreground">Characters</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-lg font-bold">{result.poolSize}</p>
                  <p className="text-[11px] text-muted-foreground">Pool Size</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-lg font-bold text-xs leading-tight">{result.crackTime}</p>
                  <p className="text-[11px] text-muted-foreground">Crack Time</p>
                </div>
              </div>

              {/* Checks */}
              <div className="rounded-xl border border-border/60 bg-card p-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground mb-2">Composition</p>
                {[
                  { label: "Lowercase", ok: result.checks.hasLower },
                  { label: "Uppercase", ok: result.checks.hasUpper },
                  { label: "Numbers", ok: result.checks.hasNumbers },
                  { label: "Symbols", ok: result.checks.hasSymbols },
                  { label: "No Repeats", ok: result.checks.noRepeats },
                  { label: "No Sequences", ok: result.checks.noSequential },
                  { label: "Not Common", ok: result.checks.noCommon },
                ].map((c) => (
                  <div key={c.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{c.label}</span>
                    <span className={c.ok ? "text-emerald-500" : "text-destructive"}>{c.ok ? "✓" : "✗"}</span>
                  </div>
                ))}
              </div>

              {/* Weaknesses */}
              {result.weaknesses.length > 0 && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-1">
                  <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1">Weaknesses</p>
                  {result.weaknesses.map((w, i) => (
                    <p key={i} className="text-xs text-muted-foreground">• {w}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
