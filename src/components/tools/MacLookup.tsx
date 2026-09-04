import { useState } from "react";
import { ArrowLeft, Fingerprint, CheckCircle2, XCircle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const OUI_DB: Record<string, string> = {
  "00:50:56": "VMware", "00:0C:29": "VMware", "00:1C:42": "Parallels",
  "08:00:27": "Oracle VirtualBox", "52:54:00": "QEMU/KVM",
  "00:1A:11": "Google", "3C:5A:B4": "Google", "F4:F5:D8": "Google",
  "00:1B:63": "Apple", "00:25:00": "Apple", "3C:15:C2": "Apple",
  "A4:83:E7": "Apple", "F0:18:98": "Apple", "AC:BC:32": "Apple",
  "DC:A6:32": "Raspberry Pi", "B8:27:EB": "Raspberry Pi",
  "00:1E:58": "D-Link", "1C:5F:2B": "D-Link", "C8:BE:19": "D-Link",
  "00:1D:D8": "Cisco", "00:26:0B": "Cisco", "64:F6:9D": "Cisco",
  "B0:BE:76": "TP-Link", "14:CC:20": "TP-Link", "50:C7:BF": "TP-Link",
  "EC:08:6B": "TP-Link", "94:D9:B3": "TP-Link",
  "00:0E:8F": "Samsung", "00:12:47": "Samsung", "30:CD:A7": "Samsung",
  "40:4E:36": "Samsung", "8C:71:F8": "Samsung", "F8:04:2E": "Samsung",
  "00:1F:3B": "Intel", "3C:97:0E": "Intel", "68:05:CA": "Intel",
  "A4:34:D9": "Intel", "F8:63:3F": "Intel",
  "00:1A:A0": "Dell", "18:03:73": "Dell", "34:17:EB": "Dell",
  "B0:83:FE": "Dell", "D4:AE:52": "Dell", "F8:DB:88": "Dell",
  "00:1C:B3": "Aruba", "00:24:6C": "Aruba", "9C:1C:12": "Aruba",
  "00:26:AB": "Netgear", "20:E5:2A": "Netgear", "6C:B0:CE": "Netgear",
  "44:94:FC": "Netgear", "CC:40:D0": "Netgear",
  "00:24:D7": "Huawei", "48:46:FB": "Huawei", "70:72:3C": "Huawei",
  "88:CF:98": "Huawei", "C8:51:95": "Huawei", "E0:24:7F": "Huawei",
  "00:23:CD": "Xiaomi", "28:6C:07": "Xiaomi", "64:09:80": "Xiaomi",
  "78:11:DC": "Xiaomi", "AC:F7:F3": "Xiaomi",
  "00:1B:A4": "Belkin", "08:36:C9": "Belkin", "94:10:3E": "Belkin",
};

function normalizeMac(mac: string): string {
  return mac.replace(/[\-\.:\s]/g, "").toUpperCase();
}

function isValidMac(mac: string): boolean {
  const hex = normalizeMac(mac);
  return hex.length === 12 && /^[0-9A-F]{12}$/.test(hex);
}

function formatMac(mac: string): string {
  const hex = normalizeMac(mac);
  return hex.match(/.{2}/g)!.join(":");
}

function detectFormat(mac: string): string {
  if (/^([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$/.test(mac)) return mac.includes(":") ? "Colon (xx:xx:xx:xx:xx:xx)" : "Hyphen (xx-xx-xx-xx-xx-xx)";
  if (/^([0-9A-Fa-f]{4}\.){2}[0-9A-Fa-f]{4}$/.test(mac)) return "Dot (xxxx.xxxx.xxxx)";
  return "Unknown";
}

function lookupOui(mac: string): string {
  const prefix = formatMac(mac).substring(0, 8).toUpperCase();
  return OUI_DB[prefix] ?? "Unknown Vendor";
}

function isUnicast(mac: string): boolean {
  const firstByte = parseInt(normalizeMac(mac).substring(0, 2), 16);
  return (firstByte & 1) === 0;
}

function isLocallyAdministered(mac: string): boolean {
  const firstByte = parseInt(normalizeMac(mac).substring(0, 2), 16);
  return (firstByte & 2) !== 0;
}

export default function MacLookup({ onBack }: { onBack: () => void }) {
  const [mac, setMac] = useState("");
  const [copied, setCopied] = useState(false);

  const valid = isValidMac(mac);
  const result = valid ? {
    formatted: formatMac(mac),
    vendor: lookupOui(mac),
    type: isUnicast(mac) ? "Unicast" : "Multicast",
    admin: isLocallyAdministered(mac) ? "Locally Administered" : "Globally Unique (Burned-In)",
    format: detectFormat(mac),
  } : null;

  const copy = () => { navigator.clipboard.writeText(result?.formatted ?? ""); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 border-b border-border/60 px-6 py-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9 shrink-0 cursor-pointer"><ArrowLeft className="size-4" /></Button>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10"><Fingerprint className="size-5 text-primary" /></div>
          <div><h2 className="text-lg font-semibold tracking-tight">MAC Address Lookup</h2><p className="text-xs text-muted-foreground">Validate format and identify device vendor</p></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-lg px-6 py-8 space-y-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium">MAC Address</label>
            <Input value={mac} onChange={(e) => setMac(e.target.value)} placeholder="AA:BB:CC:DD:EE:FF" className="font-mono text-sm" />
            <p className="mt-1 text-[11px] text-muted-foreground">Supports colon, hyphen, and dot notation</p>
          </div>

          {mac && (
            <div className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium ${valid ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-destructive/10 text-destructive"}`}>
              {valid ? <CheckCircle2 className="size-4 shrink-0" /> : <XCircle className="size-4 shrink-0" />}
              {valid ? "Valid MAC Address" : "Invalid MAC Address Format"}
            </div>
          )}

          {result && (
            <div className="space-y-3">
              <div className="rounded-xl border border-border/60 bg-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-mono text-lg font-bold tracking-wider">{result.formatted}</p>
                  <Button variant="ghost" size="icon" onClick={copy} className="size-8 cursor-pointer">
                    {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                  </Button>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Vendor", value: result.vendor },
                    { label: "Format", value: result.format },
                    { label: "Type", value: result.type },
                    { label: "Address Scope", value: result.admin },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{r.label}</span>
                      <span className="font-medium">{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
