import { useCallback, useRef, useState } from "react";
import {
  ArrowLeft,
  Crop,
  Download,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PRESETS = [
  { label: "Free", w: 0, h: 0 },
  { label: "Square 1:1", w: 1, h: 1 },
  { label: "Passport", w: 300, h: 300 },
  { label: "HD 1920×1080", w: 1920, h: 1080 },
  { label: "Thumbnail 150", w: 150, h: 150 },
  { label: "Instagram 1080", w: 1080, h: 1080 },
  { label: "4:3", w: 4, h: 3 },
  { label: "16:9", w: 16, h: 9 },
];

export default function ImageResizer({ onBack }: { onBack: () => void }) {
  const [original, setOriginal] = useState<{ file: File; dataUrl: string; w: number; h: number } | null>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(0); // 0 = free
  const inputRef = useRef<HTMLInputElement>(null);

  const loadImage = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        setOriginal({ file, dataUrl: reader.result as string, w: img.naturalWidth, h: img.naturalHeight });
        setWidth(img.naturalWidth);
        setHeight(img.naturalHeight);
        setAspectRatio(0);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (aspectRatio > 0) setHeight(Math.round(val / aspectRatio));
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (aspectRatio > 0) setWidth(Math.round(val * aspectRatio));
  };

  const applyPreset = (p: typeof PRESETS[0]) => {
    if (!original) return;
    if (p.w === 0 && p.h === 0) {
      setWidth(original.w);
      setHeight(original.h);
      setAspectRatio(0);
    } else if (p.w > 0 && p.h > 0 && p.w < 500) {
      // Ratio preset
      setAspectRatio(p.w / p.h);
      setWidth(p.w);
      setHeight(p.h);
    } else {
      // Absolute size
      setWidth(p.w);
      setHeight(p.h);
      setAspectRatio(0);
    }
  };

  const exportImage = () => {
    if (!original) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `resized_${width}x${height}.png`;
        a.click();
      }, "image/png");
    };
    img.src = original.dataUrl;
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 border-b border-border/60 px-6 py-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9 shrink-0 cursor-pointer"><ArrowLeft className="size-4" /></Button>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10"><Crop className="size-5 text-primary" /></div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Image Resizer</h2>
            <p className="text-xs text-muted-foreground">Resize with presets or custom dimensions</p>
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
              <img src={original.dataUrl} alt="Original" className="w-full rounded-xl border border-border/60" />
              <p className="text-xs text-muted-foreground text-center">Original: {original.w}×{original.h}</p>

              {/* Presets */}
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((p) => (
                  <Button key={p.label} variant="outline" size="sm" onClick={() => applyPreset(p)} className="cursor-pointer text-[11px]">{p.label}</Button>
                ))}
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Width (px)</label>
                  <Input type="number" value={width} onChange={(e) => handleWidthChange(Number(e.target.value))} className="text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Height (px)</label>
                  <Input type="number" value={height} onChange={(e) => handleHeightChange(Number(e.target.value))} className="text-sm" />
                </div>
              </div>

              <Button onClick={exportImage} className="w-full cursor-pointer gap-2"><Download className="size-4" /> Export PNG</Button>
              <Button variant="ghost" size="sm" onClick={() => { setOriginal(null); }} className="cursor-pointer">New Image</Button>
            </div>
          )}
          <input ref={inputRef} type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) loadImage(e.target.files[0]); e.target.value = ""; }} className="hidden" />
        </div>
      </div>
    </div>
  );
}
