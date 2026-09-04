import { useCallback, useEffect, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Camera,
  Upload,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Download,
  FileImage,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ScanLine,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface DocumentScannerProps {
  onBack: () => void;
}

type FilterId = "original" | "grayscale" | "bw" | "magic";

const FILTERS: { id: FilterId; label: string; description: string }[] = [
  { id: "original", label: "Original", description: "No enhancement" },
  { id: "grayscale", label: "Grayscale", description: "Clean grayscale" },
  { id: "bw", label: "Black & White", description: "High-contrast mono" },
  { id: "magic", label: "Magic Color", description: "Auto-enhance" },
];

// ── Canvas Filter Functions ──────────────────────────────────────────────────

function applyOriginal(
  src: ImageData,
  dest: ImageData,
): void {
  dest.data.set(src.data);
}

function applyGrayscale(src: ImageData, dest: ImageData): void {
  const s = src.data;
  const d = dest.data;
  for (let i = 0; i < s.length; i += 4) {
    const gray = 0.299 * s[i] + 0.587 * s[i + 1] + 0.114 * s[i + 2];
    d[i] = d[i + 1] = d[i + 2] = gray;
    d[i + 3] = s[i + 3];
  }
}

function applyBw(src: ImageData, dest: ImageData): void {
  const s = src.data;
  const d = dest.data;
  // Adaptive threshold via Otsu-inspired approach: compute average luminance
  let sum = 0;
  for (let i = 0; i < s.length; i += 4) {
    sum += 0.299 * s[i] + 0.587 * s[i + 1] + 0.114 * s[i + 2];
  }
  const threshold = sum / (s.length / 4) * 0.85; // slightly below average for document text
  for (let i = 0; i < s.length; i += 4) {
    const val = 0.299 * s[i] + 0.587 * s[i + 1] + 0.114 * s[i + 2];
    const bw = val > threshold ? 255 : 0;
    d[i] = d[i + 1] = d[i + 2] = bw;
    d[i + 3] = s[i + 3];
  }
}

function applyMagicColor(src: ImageData, dest: ImageData): void {
  const s = src.data;
  const d = dest.data;

  // Step 1: Find min/max luminance for auto-contrast
  let minLum = 255;
  let maxLum = 0;
  for (let i = 0; i < s.length; i += 4) {
    const lum = 0.299 * s[i] + 0.587 * s[i + 1] + 0.114 * s[i + 2];
    if (lum < minLum) minLum = lum;
    if (lum > maxLum) maxLum = lum;
  }
  const range = Math.max(maxLum - minLum, 1);

  // Step 2: Apply auto-contrast stretch + slight brightness boost + sharpen
  const contrastFactor = 255 / range;
  const brightnessBoost = 15; // whiten background

  for (let i = 0; i < s.length; i += 4) {
    // Auto-contrast stretch
    let r = (s[i] - minLum) * contrastFactor + brightnessBoost;
    let g = (s[i + 1] - minLum) * contrastFactor + brightnessBoost;
    let b = (s[i + 2] - minLum) * contrastFactor + brightnessBoost;

    // Slight saturation boost for color documents
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    const satFactor = 1.15;
    r = gray + (r - gray) * satFactor;
    g = gray + (g - gray) * satFactor;
    b = gray + (b - gray) * satFactor;

    d[i] = Math.max(0, Math.min(255, r));
    d[i + 1] = Math.max(0, Math.min(255, g));
    d[i + 2] = Math.max(0, Math.min(255, b));
    d[i + 3] = s[i + 3];
  }

  // Step 3: Simple unsharp mask (3x3 box blur subtracted)
  const w = src.width;
  const h = src.height;
  const tmp = new Uint8ClampedArray(d);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) {
        const blur =
          (tmp[((y - 1) * w + x - 1) * 4 + c] +
            tmp[((y - 1) * w + x) * 4 + c] +
            tmp[((y - 1) * w + x + 1) * 4 + c] +
            tmp[(y * w + x - 1) * 4 + c] +
            tmp[(y * w + x) * 4 + c] +
            tmp[(y * w + x + 1) * 4 + c] +
            tmp[((y + 1) * w + x - 1) * 4 + c] +
            tmp[((y + 1) * w + x) * 4 + c] +
            tmp[((y + 1) * w + x + 1) * 4 + c]) /
            9;
        const sharp = tmp[idx + c] + (tmp[idx + c] - blur) * 0.5;
        d[idx + c] = Math.max(0, Math.min(255, sharp));
      }
    }
  }
}

const filterFunctions: Record<FilterId, (src: ImageData, dest: ImageData) => void> = {
  original: applyOriginal,
  grayscale: applyGrayscale,
  bw: applyBw,
  magic: applyMagicColor,
};

// ── Component ────────────────────────────────────────────────────────────────

export default function DocumentScanner({ onBack }: DocumentScannerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null); // holds the unmodified source
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [hasImage, setHasImage] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterId>("magic");
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load image into the original canvas (unmodified source)
  const loadImage = useCallback((file: File) => {
    setError(null);
    setExportSuccess(false);

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError("Image exceeds 50 MB limit.");
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const origCanvas = originalCanvasRef.current;
      const displayCanvas = canvasRef.current;
      if (!origCanvas || !displayCanvas) return;

      origCanvas.width = img.naturalWidth;
      origCanvas.height = img.naturalHeight;
      const origCtx = origCanvas.getContext("2d")!;
      origCtx.drawImage(img, 0, 0);

      displayCanvas.width = img.naturalWidth;
      displayCanvas.height = img.naturalHeight;

      setHasImage(true);
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
      setActiveFilter("magic");
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      setError("Failed to load image.");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, []);

  // Re-render the display canvas whenever filter/rotation/flip changes
  useEffect(() => {
    if (!hasImage) return;
    const origCanvas = originalCanvasRef.current;
    const displayCanvas = canvasRef.current;
    if (!origCanvas || !displayCanvas) return;

    const origCtx = origCanvas.getContext("2d")!;
    const origData = origCtx.getImageData(0, 0, origCanvas.width, origCanvas.height);

    // Apply rotation and flip to a temp canvas first
    const tempCanvas = document.createElement("canvas");
    const rad = (rotation * Math.PI) / 180;
    const needsSwap = rotation === 90 || rotation === 270;
    tempCanvas.width = needsSwap ? origCanvas.height : origCanvas.width;
    tempCanvas.height = needsSwap ? origCanvas.width : origCanvas.height;
    const tempCtx = tempCanvas.getContext("2d")!;

    tempCtx.save();
    tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
    tempCtx.rotate(rad);
    tempCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    tempCtx.drawImage(origCanvas, -origCanvas.width / 2, -origCanvas.height / 2);
    tempCtx.restore();

    displayCanvas.width = tempCanvas.width;
    displayCanvas.height = tempCanvas.height;
    const displayCtx = displayCanvas.getContext("2d")!;
    displayCtx.drawImage(tempCanvas, 0, 0);

    // Get pixel data and apply filter
    const displayData = displayCtx.getImageData(
      0,
      0,
      displayCanvas.width,
      displayCanvas.height,
    );

    // For filters that work on the original data (before rotation/flip),
    // we'd need to apply them differently. For simplicity and performance,
    // we apply the filter to the already-transformed image.
    const filtered = new ImageData(
      new Uint8ClampedArray(displayData.data),
      displayCanvas.width,
      displayCanvas.height,
    );
    filterFunctions[activeFilter](displayData, filtered);
    displayCtx.putImageData(filtered, 0, 0);
  }, [hasImage, activeFilter, rotation, flipH, flipV]);

  // ── Export helpers ─────────────────────────────────────────────────

  const canvasToBlob = useCallback(
    (type: "image/jpeg" | "image/png", quality?: number): Promise<Blob> => {
      return new Promise((resolve, reject) => {
        const canvas = canvasRef.current;
        if (!canvas) return reject(new Error("No canvas"));
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("Export failed"))),
          type,
          quality,
        );
      });
    },
    [],
  );

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportJpg = async () => {
    setIsExporting(true);
    setExportSuccess(false);
    try {
      const blob = await canvasToBlob("image/jpeg", 0.95);
      downloadBlob(blob, "scanned-document.jpg");
      setExportSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPng = async () => {
    setIsExporting(true);
    setExportSuccess(false);
    try {
      const blob = await canvasToBlob("image/png");
      downloadBlob(blob, "scanned-document.png");
      setExportSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    setExportSuccess(false);
    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error("No canvas");

      const jpegBytes = await canvasToBlob("image/jpeg", 0.95).then(
        (b) => b.arrayBuffer() as Promise<ArrayBuffer>,
      );

      const pdfDoc = await PDFDocument.create();
      const img = await pdfDoc.embedJpg(new Uint8Array(jpegBytes));

      const page = pdfDoc.addPage([img.width, img.height]);
      page.drawImage(img, {
        x: 0,
        y: 0,
        width: img.width,
        height: img.height,
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      downloadBlob(blob, "scanned-document.pdf");
      setExportSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF export failed");
    } finally {
      setIsExporting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border/60 px-6 py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="size-9 shrink-0 cursor-pointer"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
            <ScanLine className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Document Scanner
            </h2>
            <p className="text-xs text-muted-foreground">
              Capture, enhance, and export document scans
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-4 flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {exportSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-4 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
              >
                <CheckCircle2 className="size-4 shrink-0" />
                <span>Document exported successfully!</span>
              </motion.div>
            )}
          </AnimatePresence>

          {!hasImage ? (
            /* ── Upload / Capture ─────────────────────────────── */
            <div className="grid gap-4 sm:grid-cols-2">
              {/* File upload */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border/80 px-6 py-12 text-center transition-all duration-200 hover:border-primary/50 hover:bg-accent/50 cursor-pointer"
              >
                <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                  <Upload className="size-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Upload Image
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    JPG, PNG, or WebP up to 50 MB
                  </p>
                </div>
              </button>

              {/* Camera capture */}
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border/80 px-6 py-12 text-center transition-all duration-200 hover:border-primary/50 hover:bg-accent/50 cursor-pointer"
              >
                <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                  <Camera className="size-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Take Photo
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Use your device camera
                  </p>
                </div>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) loadImage(e.target.files[0]);
                  e.target.value = "";
                }}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => {
                  if (e.target.files?.[0]) loadImage(e.target.files[0]);
                  e.target.value = "";
                }}
                className="hidden"
              />
            </div>
          ) : (
            /* ── Scanner Workspace ────────────────────────────── */
            <div className="space-y-4">
              {/* Hidden source canvas */}
              <canvas ref={originalCanvasRef} className="hidden" />

              {/* Canvas preview */}
              <div className="flex items-center justify-center rounded-xl border border-border/60 bg-muted/30 p-2">
                <canvas
                  ref={canvasRef}
                  className="max-h-[50vh] w-auto rounded-lg object-contain"
                />
              </div>

              {/* Controls row */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Transform controls */}
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="size-9 cursor-pointer"
                    title="Rotate right"
                  >
                    <RotateCw className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setRotation((r) => (r + 270) % 360)}
                    className="size-9 cursor-pointer"
                    title="Rotate left"
                  >
                    <RotateCcw className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setFlipH((f) => !f)}
                    className="size-9 cursor-pointer"
                    title="Flip horizontal"
                  >
                    <FlipHorizontal className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setFlipV((f) => !f)}
                    className="size-9 cursor-pointer"
                    title="Flip vertical"
                  >
                    <FlipVertical className="size-4" />
                  </Button>
                  <div className="mx-1 h-6 w-px bg-border/60" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setRotation(0);
                      setFlipH(false);
                      setFlipV(false);
                    }}
                    className="cursor-pointer gap-1.5 text-xs"
                  >
                    <RefreshCw className="size-3.5" />
                    Reset
                  </Button>
                </div>

                {/* New scan */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setHasImage(false);
                    setExportSuccess(false);
                    setError(null);
                  }}
                  className="cursor-pointer text-xs"
                >
                  New Scan
                </Button>
              </div>

              {/* Filter selector */}
              <div>
                <p className="mb-2 text-sm font-medium">Enhancement Filter</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {FILTERS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setActiveFilter(f.id)}
                      className={`rounded-xl border-2 p-3 text-left transition-all cursor-pointer ${
                        activeFilter === f.id
                          ? "border-primary bg-primary/5"
                          : "border-border/60 hover:border-primary/30"
                      }`}
                    >
                      <p className="text-sm font-medium">{f.label}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {f.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Export buttons */}
              <div>
                <p className="mb-2 text-sm font-medium">Export</p>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={handleExportJpg}
                    disabled={isExporting}
                    variant="outline"
                    className="cursor-pointer gap-2"
                  >
                    {isExporting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <FileImage className="size-4" />
                    )}
                    JPG
                  </Button>
                  <Button
                    onClick={handleExportPng}
                    disabled={isExporting}
                    variant="outline"
                    className="cursor-pointer gap-2"
                  >
                    {isExporting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <FileImage className="size-4" />
                    )}
                    PNG
                  </Button>
                  <Button
                    onClick={handleExportPdf}
                    disabled={isExporting}
                    className="cursor-pointer gap-2"
                  >
                    {isExporting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Download className="size-4" />
                    )}
                    Save PDF
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
