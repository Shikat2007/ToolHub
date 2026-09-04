import { useCallback, useRef, useState } from "react";
import {
  ArrowLeft,
  KeyRound,
  Copy,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PasswordGenerator({ onBack }: { onBack: () => void }) {
  const [length, setLength] = useState(20);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    let chars = "";
    if (useUpper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (useLower) chars += "abcdefghijklmnopqrstuvwxyz";
    if (useNumbers) chars += "0123456789";
    if (useSymbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
    if (!chars) chars = "abcdefghijklmnopqrstuvwxyz";

    const arr = new Uint32Array(length);
    crypto.getRandomValues(arr);
    setPassword(Array.from(arr, (v) => chars[v % chars.length]).join(""));
  }, [length, useUpper, useLower, useNumbers, useSymbols]);

  const copyPassword = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const strength = password.length >= 16 && useSymbols && useNumbers ? "Strong" : password.length >= 12 ? "Good" : "Weak";
  const strengthColor = strength === "Strong" ? "text-emerald-500" : strength === "Good" ? "text-amber-500" : "text-destructive";

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 border-b border-border/60 px-6 py-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9 shrink-0 cursor-pointer">
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
            <KeyRound className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Password Generator</h2>
            <p className="text-xs text-muted-foreground">Generate strong, customizable passwords</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-lg px-6 py-8 space-y-6">
          {/* Generated password */}
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <div className="flex items-center gap-2">
              <Input readOnly value={password} className="font-mono text-lg" placeholder="Click generate" />
              <Button variant="outline" size="icon" onClick={copyPassword} disabled={!password} className="cursor-pointer shrink-0">
                {copied ? <CheckCircle2 className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
              </Button>
            </div>
            {password && (
              <p className={`mt-2 text-xs font-medium ${strengthColor}`}>{strength} password</p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium">Length</label>
                <span className="text-sm font-mono text-muted-foreground">{length}</span>
              </div>
              <input
                type="range"
                min={4}
                max={64}
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            {[
              { label: "Uppercase (A-Z)", checked: useUpper, onChange: setUseUpper },
              { label: "Lowercase (a-z)", checked: useLower, onChange: setUseLower },
              { label: "Numbers (0-9)", checked: useNumbers, onChange: setUseNumbers },
              { label: "Symbols (!@#$...)", checked: useSymbols, onChange: setUseSymbols },
            ].map((opt) => (
              <label key={opt.label} className="flex items-center justify-between cursor-pointer">
                <span className="text-sm">{opt.label}</span>
                <input
                  type="checkbox"
                  checked={opt.checked}
                  onChange={(e) => opt.onChange(e.target.checked)}
                  className="size-4 accent-primary"
                />
              </label>
            ))}
          </div>

          <div className="flex gap-2">
            <Button onClick={generate} className="flex-1 cursor-pointer gap-2">
              <RefreshCw className="size-4" />
              Generate
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
