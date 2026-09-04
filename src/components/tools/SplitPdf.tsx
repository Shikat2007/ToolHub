import { useCallback, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  Upload,
  Scissors,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Download,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SplitPdfProps {
  onBack: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function SplitPdf({ onBack }: SplitPdfProps) {
  const [file, setFile] = useState<{
    file: File;
    name: string;
    pageCount: number;
    size: string;
  } | null>(null);
  const [pageRange, setPageRange] = useState("");
  const [splitMode, setSplitMode] = useState<"range" | "individual" | "every-n">("range");
  const [chunkSize, setChunkSize] = useState("2");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resultFiles, setResultFiles] = useState<Array<{ name: string; pageCount: number }>>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (fileList: FileList | File[]) => {
    setError(null);
    setSuccess(false);
    setResultFiles([]);
    const firstFile = Array.from(fileList)[0];
    if (!firstFile) return;

    if (firstFile.type !== "application/pdf") {
      setError(`"${firstFile.name}" is not a PDF file.`);
      return;
    }
    if (firstFile.size > 100 * 1024 * 1024) {
      setError(`"${firstFile.name}" exceeds the 100 MB size limit.`);
      return;
    }

    try {
      const arrayBuffer = await firstFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pageCount = pdfDoc.getPageCount();
      setFile({
        file: firstFile,
        name: firstFile.name,
        pageCount,
        size: formatFileSize(firstFile.size),
      });
      setPageRange(`1-${pageCount}`);
    } catch {
      setError(`"${firstFile.name}" could not be read.`);
    }
  }, []);

  const handleSplit = async () => {
    if (!file || !pageRange.trim()) return;
    setIsProcessing(true);
    setError(null);
    setSuccess(false);

    try {
      const arrayBuffer = await file.file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const totalPages = sourcePdf.getPageCount();

      const pages = new Set<number>();
      const parts = pageRange.split(",").map((s) => s.trim());
      for (const part of parts) {
        if (/^\d+-\d+$/.test(part)) {
          const [start, end] = part.split("-").map(Number);
          if (start < 1 || end > totalPages || start > end) {
            throw new Error(`Range "${part}" is out of bounds (1–${totalPages}).`);
          }
          for (let i = start; i <= end; i++) pages.add(i);
        } else if (/^\d+$/.test(part)) {
          const n = Number(part);
          if (n < 1 || n > totalPages) throw new Error(`Page ${n} is out of range.`);
          pages.add(n);
        } else {
          throw new Error(`Invalid page specification "${part}".`);
        }
      }

      if (pages.size === 0) throw new Error("No valid pages specified.");

      const requestedPages = Array.from(pages).sort((a, b) => a - b);
      const baseName = file.name.replace(/\.pdf$/i, "");
      const newFiles: Array<{ name: string; pageCount: number }> = [];

      if (splitMode === "range") {
        const newPdf = await PDFDocument.create();
        const copiedPages = await newPdf.copyPages(sourcePdf, requestedPages.map((p) => p - 1));
        for (const page of copiedPages) newPdf.addPage(page);
        newFiles.push({
          name: `${baseName}_pages_${requestedPages[0]}-${requestedPages[requestedPages.length - 1]}.pdf`,
          pageCount: newPdf.getPageCount(),
        });
      } else if (splitMode === "individual") {
        for (const pageNum of requestedPages) {
          const newPdf = await PDFDocument.create();
          const copiedPages = await newPdf.copyPages(sourcePdf, [pageNum - 1]);
          newPdf.addPage(copiedPages[0]);
          newFiles.push({ name: `${baseName}_page_${pageNum}.pdf`, pageCount: 1 });
        }
      } else {
        const cs = Number(chunkSize) || 2;
        for (let i = 0; i < requestedPages.length; i += cs) {
          const chunk = requestedPages.slice(i, i + cs);
          const newPdf = await PDFDocument.create();
          const copiedPages = await newPdf.copyPages(sourcePdf, chunk.map((p) => p - 1));
          for (const page of copiedPages) newPdf.addPage(page);
          newFiles.push({
            name: `${baseName}_part_${Math.floor(i / cs) + 1}.pdf`,
            pageCount: newPdf.getPageCount(),
          });
        }
      }

      setResultFiles(newFiles);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? `Split failed: ${err.message}` : "An unexpected error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border/60 px-6 py-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9 shrink-0 cursor-pointer">
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
            <Scissors className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Split PDF</h2>
            <p className="text-xs text-muted-foreground">Extract specific pages from a PDF</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-8">
          {/* Drop zone */}
          <div
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files.length) processFile(e.dataTransfer.files); }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`group relative flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-all duration-200 ${
              isDragging
                ? "border-primary bg-primary/5 scale-[1.01]"
                : "border-border/80 hover:border-primary/50 hover:bg-accent/50"
            }`}
          >
            <div className={`mb-4 flex size-14 items-center justify-center rounded-2xl transition-colors duration-200 ${
              isDragging ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
            }`}>
              <Upload className="size-6" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Drop a PDF file here or <span className="text-primary underline underline-offset-2">browse</span>
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">Supports PDF files up to 100 MB</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => { if (e.target.files) processFile(e.target.files); e.target.value = ""; }}
              className="hidden"
            />
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="mt-4 flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success */}
          <AnimatePresence>
            {success && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="mt-4 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>{resultFiles.length} file{resultFiles.length !== 1 ? "s" : ""} extracted successfully!</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* File loaded */}
          {file && (
            <div className="mt-6 space-y-5">
              <Card className="border-border/60 shadow-none">
                <CardContent className="flex items-center gap-3 px-4 py-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-xs font-semibold text-primary">
                    {file.pageCount}p
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{file.size}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => { setFile(null); setSuccess(false); setResultFiles([]); }}
                    className="size-7 shrink-0 cursor-pointer text-muted-foreground hover:text-destructive">
                    ✕
                  </Button>
                </CardContent>
              </Card>

              {/* Options */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Split Mode</Label>
                  <div className="mt-2 flex gap-2">
                    {[
                      { id: "range" as const, label: "Extract Range" },
                      { id: "individual" as const, label: "Each Page" },
                      { id: "every-n" as const, label: "Every N Pages" },
                    ].map((mode) => (
                      <Button
                        key={mode.id}
                        variant={splitMode === mode.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSplitMode(mode.id)}
                        className="cursor-pointer text-xs"
                      >
                        {mode.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {splitMode === "range" || splitMode === "individual" ? (
                  <div>
                    <Label htmlFor="pageRange" className="text-sm font-medium">Page Range</Label>
                    <Input
                      id="pageRange"
                      value={pageRange}
                      onChange={(e) => setPageRange(e.target.value)}
                      placeholder={`e.g. 1-3,5,8-${file.pageCount}`}
                      className="mt-1.5 text-sm"
                    />
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Info className="size-3" />
                      Use commas for ranges: 1-3,5,8-10
                    </p>
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="chunkSize" className="text-sm font-medium">Pages per Chunk</Label>
                    <Input
                      id="chunkSize"
                      type="number"
                      min={1}
                      max={file.pageCount}
                      value={chunkSize}
                      onChange={(e) => setChunkSize(e.target.value)}
                      className="mt-1.5 w-24 text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Split button */}
              <div className="flex justify-center">
                <Button
                  onClick={handleSplit}
                  disabled={!pageRange.trim() || isProcessing}
                  size="lg"
                  className="cursor-pointer gap-2 px-8 text-sm font-medium shadow-md"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Splitting...
                    </>
                  ) : (
                    <>
                      <Scissors className="size-4" />
                      Split PDF
                    </>
                  )}
                </Button>
              </div>

              {/* Result files */}
              {resultFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Extracted Files</p>
                  {resultFiles.map((rf, i) => (
                    <Card key={i} className="border-border/60 shadow-none">
                      <CardContent className="flex items-center gap-3 px-4 py-3">
                        <FileText className="size-4 shrink-0 text-primary" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{rf.name}</p>
                          <p className="text-xs text-muted-foreground">{rf.pageCount} page{rf.pageCount !== 1 ? "s" : ""}</p>
                        </div>
                        <Button variant="ghost" size="sm" disabled className="gap-1.5 text-xs">
                          <Download className="size-3.5" />
                          Saved
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
