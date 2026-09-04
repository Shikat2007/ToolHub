import { useCallback, useRef, useState } from "react";
import { createWorker } from "tesseract.js";
import {
  ArrowLeft,
  ScanText,
  Upload,
  Loader2,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OCR({ onBack }: { onBack: () => void }) {
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadImage = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
    setText("");
  }, []);

  const runOCR = useCallback(async () => {
    if (!image) return;
    setIsProcessing(true);
    setProgress(0);
    try {
      const worker = await createWorker("eng", 1, {
        logger: (m: { status: string; progress: number }) => {
          if (m.progress) setProgress(Math.round(m.progress * 100));
        },
      });
      const { data } = await worker.recognize(image);
      setText(data.text);
      await worker.terminate();
    } catch {
      setText("OCR failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [image]);

  const copyText = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 border-b border-border/60 px-6 py-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9 shrink-0 cursor-pointer"><ArrowLeft className="size-4" /></Button>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10"><ScanText className="size-5 text-primary" /></div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Image to Text</h2>
            <p className="text-xs text-muted-foreground">Extract text from images using OCR</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-lg px-6 py-8 space-y-6">
          {!image ? (
            <button onClick={() => inputRef.current?.click()} className="flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border/80 px-6 py-12 text-center hover:border-primary/50 hover:bg-accent/50 cursor-pointer">
              <Upload className="size-6 text-muted-foreground" />
              <p className="text-sm font-medium">Upload Image</p>
              <p className="text-xs text-muted-foreground">JPG, PNG, or WebP containing text</p>
            </button>
          ) : (
            <div className="space-y-4">
              <img src={image} alt="Source" className="w-full max-h-64 rounded-xl border border-border/60 object-contain" />
              <Button onClick={runOCR} disabled={isProcessing} className="w-full cursor-pointer gap-2">
                {isProcessing ? (
                  <><Loader2 className="size-4 animate-spin" /> Extracting... {progress}%</>
                ) : (
                  <><ScanText className="size-4" /> Extract Text</>
                )}
              </Button>
              {text && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Extracted Text</p>
                    <Button variant="ghost" size="sm" onClick={copyText} className="cursor-pointer gap-1.5 text-xs">
                      {copied ? <CheckCircle2 className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                  <textarea readOnly value={text} className="h-48 w-full rounded-xl border border-border/60 bg-card p-4 text-sm leading-relaxed" />
                </div>
              )}
              <Button variant="ghost" size="sm" onClick={() => { setImage(null); setText(""); }} className="cursor-pointer">New Image</Button>
            </div>
          )}
          <input ref={inputRef} type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) loadImage(e.target.files[0]); e.target.value = ""; }} className="hidden" />
        </div>
      </div>
    </div>
  );
}
