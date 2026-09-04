import { useCallback, useRef, useState } from "react";
import QRCodeLib from "qrcode";
import jsQR from "jsqr";
import {
  ArrowLeft,
  QrCode,
  Download,
  Camera,
  Upload,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function QRCodeTool({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<"generate" | "scan">("generate");
  const [text, setText] = useState("https://");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);

  const generateQR = useCallback(async () => {
    if (!text.trim()) return;
    try {
      const url = await QRCodeLib.toDataURL(text, {
        width: 512,
        margin: 2,
        color: { dark: "#1a1a2e", light: "#ffffff" },
      });
      setQrDataUrl(url);
    } catch {
      setError("Failed to generate QR code.");
    }
  }, [text]);

  const downloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = "qrcode.png";
    a.click();
  };

  const handleScanImage = useCallback((file: File) => {
    setError(null);
    setScanResult(null);
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(data.data, data.width, data.height);
      setScanResult(code ? code.data : "No QR code found in image.");
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      setError("Failed to load image.");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 border-b border-border/60 px-6 py-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9 shrink-0 cursor-pointer">
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
            <QrCode className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">QR Code</h2>
            <p className="text-xs text-muted-foreground">Generate and scan QR codes</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-lg px-6 py-8 space-y-6">
          {/* Tabs */}
          <div className="flex gap-1 rounded-xl bg-muted/50 p-1">
            {(["generate", "scan"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                {t === "generate" ? "Generate" : "Scan"}
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {tab === "generate" ? (
            <div className="space-y-4">
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter URL or text"
                className="text-sm"
              />
              <Button onClick={generateQR} disabled={!text.trim()} className="w-full cursor-pointer">
                Generate QR Code
              </Button>
              {qrDataUrl && (
                <div className="space-y-3 text-center">
                  <img src={qrDataUrl} alt="QR Code" className="mx-auto rounded-xl border border-border/60" />
                  <Button onClick={downloadQR} variant="outline" className="cursor-pointer gap-2">
                    <Download className="size-4" />
                    Download PNG
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">Upload an image containing a QR code to decode it.</p>
              <button
                onClick={() => scanInputRef.current?.click()}
                className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border/80 px-6 py-10 text-center transition-all hover:border-primary/50 hover:bg-accent/50 cursor-pointer"
              >
                <Upload className="size-6 text-muted-foreground" />
                <p className="text-sm font-medium">Upload QR Image</p>
              </button>
              <input
                ref={scanInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => { if (e.target.files?.[0]) handleScanImage(e.target.files[0]); e.target.value = ""; }}
                className="hidden"
              />
              {scanResult && (
                <div className="rounded-xl border border-border/60 bg-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="size-4 text-primary" />
                    <p className="text-sm font-medium">Scan Result</p>
                  </div>
                  <p className="break-all text-sm text-muted-foreground">{scanResult}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
