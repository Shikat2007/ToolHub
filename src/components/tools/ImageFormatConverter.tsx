import { useCallback, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRightLeft,
  Download,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Fmt = "image/png" | "image/jpeg" | "image/webp";
const FORMATS: { id: Fmt; label: string; ext: string }[] = [
  { id: "image/png", label: "PNG", ext: "png" },
  { id: "image/jpeg", label: "JPG", ext: "jpg" },
  { id: "image/webp", label: "WebP", ext: "webp" },
];

export default function ImageFormatConverter({ onBack }: { onBack: () => void }) {
  const [original, setOriginal] = useState<{ dataUrl: string; name: string } | null>(null);
  const [target, setTarget] = useState<Fmt>("image/png");
  const inputRef = useRef<HTMLInputElement>(null);

  const loadImage = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setOriginal({ dataUrl: reader.result as string, name: file.name });
    reader.readAsDataURL(file);
  }, []);

  const convert = () => {
    if (!original) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      if (target === "image/jpeg") {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const ext = FORMATS.find((f) => f.id === target)?.ext ?? "png";
        const baseName = original.name.replace(/\.[^.]+$/, "");
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${baseName}.${ext}`;
        a.click();
      }, target, 0.92);
    };
    img.src = original.dataUrl;
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 border-b border-border/60 px-6 py-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9 shrink-0 cursor-pointer"><ArrowLeft className="size-4" /></Button>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10"><ArrowRightLeft className="size-5 text-primary" /></div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Image Format Converter</h2>
            <p className="text-xs text-muted-foreground">Convert between JPG, PNG, and WebP</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-lg px-6 py-8 space-y-6">
          {!original ? (
            <button onClick={() => inputRef.current?.click()} className="flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border/80 px-6 py-12 text-center hover:border-primary/50 hover:bg-accent/50 cursor-pointer">
              <Upload className="size-6 text-muted-foreground" />
              <p className="text-sm font-medium">Upload Image</p>
            </button>
          ) : (
            <div className="space-y-4">
              <img src={original.dataUrl} alt="Source" className="w-full rounded-xl border border-border/60" />
              <div>
                <label className="mb-2 block text-sm font-medium">Convert to</label>
                <div className="flex gap-2">
                  {FORMATS.map((f) => (
                    <Button key={f.id} variant={target === f.id ? "default" : "outline"} size="sm" onClick={() => setTarget(f.id)} className="cursor-pointer">{f.label}</Button>
                  ))}
                </div>
              </div>
              <Button onClick={convert} className="w-full cursor-pointer gap-2"><Download className="size-4" /> Convert & Download</Button>
              <Button variant="ghost" size="sm" onClick={() => setOriginal(null)} className="cursor-pointer">New Image</Button>
            </div>
          )}
          <input ref={inputRef} type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) loadImage(e.target.files[0]); e.target.value = ""; }} className="hidden" />
        </div>
      </div>
    </div>
  );
}
