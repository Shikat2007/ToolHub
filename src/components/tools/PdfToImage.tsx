import { useCallback, useEffect, useRef, useState } from "react";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import type { PDFDocumentProxy, PDFDocumentLoadingTask } from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import {
  ArrowLeft, Image as ImageIcon, Download, Upload, Loader2, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

GlobalWorkerOptions.workerSrc = workerUrl;

interface Props { onBack: () => void; }

const RENDER_WIDTH = 1240; // ~150 DPI for A4 — crisp but memory-safe

async function renderPageToBlob(doc: PDFDocumentProxy, pageNumber: number, format: "png" | "jpeg"): Promise<Blob> {
  const page = await doc.getPage(pageNumber);
  const baseViewport = page.getViewport({ scale: 1 });
  const scale = RENDER_WIDTH / baseViewport.width;
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext("2d")!;
  // JPEG exports need a white background (transparent renders as black otherwise)
  if (format === "jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  await page.render({ canvas, canvasContext: ctx, viewport }).promise;
  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Canvas export failed"))), `image/${format}`, 0.92),
  );
}

export default function PdfToImage({ onBack }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exported, setExported] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [format, setFormat] = useState<"png" | "jpeg">("png");
  const inputRef = useRef<HTMLInputElement>(null);
  const taskRef = useRef<PDFDocumentLoadingTask | null>(null);

  const loadFile = useCallback(async (f: File) => {
    setError(null);
    setExported(0);
    try {
      const buf = await f.arrayBuffer();
      const task = getDocument({ data: buf });
      const loaded = await task.promise;
      taskRef.current?.destroy();
      taskRef.current = task;
      setDoc(loaded);
      setNumPages(loaded.numPages);
      setFile(f);
    } catch {
      setError("Failed to open this PDF. It may be corrupt or password-protected.");
    }
  }, []);

  // Release the pdf.js worker resources when the component unmounts.
  useEffect(() => () => { taskRef.current?.destroy(); }, []);

  const exportAll = async () => {
    if (!doc || !file || !numPages) return;
    setIsExporting(true);
    setExported(0);
    try {
      for (let i = 1; i <= numPages; i++) {
        const blob = await renderPageToBlob(doc, i, format);
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${file.name.replace(/\.pdf$/i, "")}_page_${i}.${format === "jpeg" ? "jpg" : "png"}`;
        a.click();
        URL.revokeObjectURL(a.href);
        setExported(i);
        // Yield so each download is triggered reliably by the browser.
        await new Promise((r) => setTimeout(r, 150));
      }
    } catch {
      setError("Export failed while rendering pages.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 border-b border-border/60 px-6 py-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9 shrink-0 cursor-pointer">
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
            <ImageIcon className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">PDF to Image</h2>
            <p className="text-xs text-muted-foreground">Render every page as a real PNG or JPG — fully offline</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-lg px-6 py-8">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" /><span>{error}</span>
            </div>
          )}

          {!file ? (
            <button onClick={() => inputRef.current?.click()}
              className="flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border/80 px-6 py-12 text-center hover:border-primary/50 hover:bg-accent/50 cursor-pointer transition-colors">
              <Upload className="size-6 text-muted-foreground" />
              <p className="text-sm font-medium">Upload PDF</p>
              <p className="text-xs text-muted-foreground">Rendered locally with pdf.js — nothing uploaded</p>
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card px-4 py-3">
                <p className="min-w-0 truncate text-sm font-medium">{file.name}</p>
                <span className="ml-3 shrink-0 text-xs text-muted-foreground">{numPages} page{numPages !== 1 ? "s" : ""}</span>
              </div>

              <div className="flex gap-2">
                {(["png", "jpeg"] as const).map((f) => (
                  <button key={f} onClick={() => setFormat(f)}
                    className={`flex-1 cursor-pointer rounded-xl border px-3 py-2 text-sm font-medium uppercase transition-colors ${format === f ? "border-primary bg-primary/10 text-primary" : "border-border/60 bg-card text-muted-foreground hover:border-primary/30"}`}>
                    {f === "jpeg" ? "JPG" : "PNG"}
                  </button>
                ))}
              </div>

              <Button onClick={exportAll} disabled={isExporting || !numPages} className="w-full cursor-pointer gap-2">
                {isExporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                {isExporting ? `Exporting ${exported}/${numPages}…` : `Export all as ${format === "jpeg" ? "JPG" : "PNG"}`}
              </Button>

              {isExporting && (
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all duration-200"
                    style={{ width: `${numPages ? (exported / numPages) * 100 : 0}%` }} />
                </div>
              )}

              <Button variant="ghost" size="sm"
                onClick={() => { taskRef.current?.destroy(); taskRef.current = null; setDoc(null); setFile(null); setNumPages(0); setExported(0); }}
                className="cursor-pointer">
                New file
              </Button>
            </div>
          )}
          <input ref={inputRef} type="file" accept=".pdf,application/pdf"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); e.target.value = ""; }}
            className="hidden" />
        </div>
      </div>
    </div>
  );
}
