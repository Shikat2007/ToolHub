import { useMemo, useState } from "react";
import { ArrowLeft, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function ipToInt(ip: string): number {
  return ip.split(".").reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
}

function intToIp(n: number): string {
  return `${(n >>> 24) & 255}.${(n >>> 16) & 255}.${(n >>> 8) & 255}.${n & 255}`;
}

function isValidIp(ip: string): boolean {
  const parts = ip.split(".");
  return parts.length === 4 && parts.every((p) => { const n = parseInt(p); return !isNaN(n) && n >= 0 && n <= 255 && String(n) === p; });
}

export default function SubnetCalculator({ onBack }: { onBack: () => void }) {
  const [input, setInput] = useState("192.168.1.0/24");

  const result = useMemo(() => {
    const parts = input.split("/");
    if (parts.length !== 2) return null;
    const [ipStr, cidrStr] = parts;
    const cidr = parseInt(cidrStr);
    if (!isValidIp(ipStr) || isNaN(cidr) || cidr < 0 || cidr > 32) return null;

    const ip = ipToInt(ipStr);
    const mask = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
    const network = (ip & mask) >>> 0;
    const broadcast = (network | ~mask) >>> 0;
    const firstHost = cidr >= 31 ? network + 1 : network + 1;
    const lastHost = cidr >= 31 ? broadcast - 1 : broadcast - 1;
    const totalHosts = Math.pow(2, 32 - cidr);
    const usableHosts = cidr >= 31 ? (cidr === 32 ? 1 : 2) : totalHosts - 2;

    return {
      networkAddr: intToIp(network),
      broadcastAddr: intToIp(broadcast),
      subnetMask: intToIp(mask),
      wildcardMask: intToIp(~mask >>> 0),
      firstHost: cidr === 32 ? intToIp(network) : intToIp(firstHost),
      lastHost: cidr === 32 ? intToIp(network) : intToIp(lastHost),
      totalHosts: totalHosts.toLocaleString(),
      usableHosts: usableHosts.toLocaleString(),
      cidr,
      binary: mask.toString(2).padEnd(32, "0").match(/.{8}/g)!.join("."),
    };
  }, [input]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 border-b border-border/60 px-6 py-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9 shrink-0 cursor-pointer"><ArrowLeft className="size-4" /></Button>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10"><Network className="size-5 text-primary" /></div>
          <div><h2 className="text-lg font-semibold tracking-tight">Subnet / CIDR Calculator</h2><p className="text-xs text-muted-foreground">Calculate network details from CIDR notation</p></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-lg px-6 py-8 space-y-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium">IP / CIDR</label>
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="192.168.1.0/24" className="font-mono text-sm" />
          </div>

          {result && (
            <div className="space-y-3">
              <div className="rounded-xl border border-border/60 bg-card p-5 space-y-2">
                {[
                  { label: "Network Address", value: result.networkAddr },
                  { label: "Broadcast Address", value: result.broadcastAddr },
                  { label: "Subnet Mask", value: result.subnetMask },
                  { label: "Wildcard Mask", value: result.wildcardMask },
                  { label: "First Usable Host", value: result.firstHost },
                  { label: "Last Usable Host", value: result.lastHost },
                ].map((r) => (
                  <div key={r.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className="font-mono font-medium">{r.value}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border/60 bg-card p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{result.totalHosts}</p>
                  <p className="text-[11px] text-muted-foreground">Total Addresses</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-card p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{result.usableHosts}</p>
                  <p className="text-[11px] text-muted-foreground">Usable Hosts</p>
                </div>
              </div>
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-[11px] text-muted-foreground mb-1">Mask Binary</p>
                <p className="font-mono text-xs break-all">{result.binary}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
