import { useCallback, useRef, useState } from "react";
import {
  ArrowLeft,
  Shrink,
  Download,
  Upload,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImageCompressor({ onBack }: { onBack: () => void }) {
  const [original, setOriginal] = useState<{ file: File; dataUrl: string; width: number; height: number } | null>(null);
  const [quality, setQuality] = useState(0.7);
  const [format, setFormat] = useState<"image/jpeg" | "image/webp">("image/jpeg");
  const [result, setResult] = useState<{ blob: Blob; dataUrl: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadImage = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => setOriginal({ file, dataUrl: reader.result as string, width: img.naturalWidth, height: img.naturalHeight });
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const compress = useCallback(() => {
    if (!original) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          setResult({ blob, dataUrl: url });
        },
        format,
        quality,
      );
    };
    img.src = original.dataUrl;
  }, [original, quality, format]);

  const download = () => {
    if (!result) return;
    const ext = format === "image/webp" ? "webp" : "jpg";
    const a = document.createElement("a");
    a.href = result.dataUrl;
    a.download = `compressed.${ext}`;
    a.click();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 border-b border-border/60 px-6 py-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9 shrink-0 cursor-pointer"><ArrowLeft className="size-4" /></Button>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10"><Shrink className="size-5 text-primary" /></div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Image Compressor</h2>
            <p className="text-xs text-muted-foreground">Reduce image file size with quality control</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-lg px-6 py-8 space-y-6">
          {!original ? (
            <button onClick={() => inputRef.current?.click()} className="flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border/80 px-6 py-12 text-center hover:border-primary/50 hover:bg-accent/50 cursor-pointer">
              <Upload className="size-6 text-muted-foreground" />
              <p className="text-sm font-medium">Upload Image</p>
              <p className="text-xs text-muted-foreground">JPG, PNG, or WebP</p>
            </button>
          ) : (
            <div className="space-y-4">
              <img src={original.dataUrl} alt="Original" className="w-full rounded-xl border border-border/60" />
              <p className="text-xs text-muted-foreground text-center">{original.width}×{original.height} · {formatSize(original.file.size)}</p>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium">Quality</label>
                  <span className="text-sm font-mono text-muted-foreground">{Math.round(quality * 100)}%</span>
                </div>
                <input type="range" min={0.05} max={1} step={0.05} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-primary" />
              </div>

              <div className="flex gap-2">
                <Button variant={format === "image/jpeg" ? "default" : "outline"} size="sm" onClick={() => setFormat("image/jpeg")} className="cursor-pointer">JPG</Button>
                <Button variant={format === "image/webp" ? "default" : "outline"} size="sm" onClick={() => setFormat("image/webp")} className="cursor-pointer">WebP</Button>
              </div>

              <Button onClick={compress} className="w-full cursor-pointer gap-2"><Shrink className="size-4" /> Compress</Button>

              {result && (
                <div className="space-y-3 text-center">
                  <CheckCircle2 className="mx-auto size-6 text-emerald-500" />
                  <p className="text-sm">{formatSize(original.file.size)} → {formatSize(result.blob.size)}</p>
                  <p className="text-xs text-emerald-500 font-medium">{Math.round((1 - result.blob.size / original.file.size) * 100)}% smaller</p>
                  <Button onClick={download} variant="outline" className="cursor-pointer gap-2"><Download className="size-4" /> Download</Button>
                </div>
              )}

              <Button variant="ghost" size="sm" onClick={() => { setOriginal(null); setResult(null); }} className="cursor-pointer">New Image</Button>
            </div>
          )}
          <input ref={inputRef} type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) loadImage(e.target.files[0]); e.target.value = ""; }} className="hidden" />
        </div>
      </div>
    </div>
  );
}
