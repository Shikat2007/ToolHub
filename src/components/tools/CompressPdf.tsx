import { useCallback, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  Upload,
  Minimize2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CompressPdfProps {
  onBack: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CompressPdf({ onBack }: CompressPdfProps) {
  const logUsage = useMutation(api.usage.logUsage);
  const [file, setFile] = useState<{
    file: File;
    name: string;
    pageCount: number;
    size: string;
    data: string;
  } | null>(null);
  const [quality, setQuality] = useState<"low" | "medium" | "high">("medium");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    data: string;
    inputSize: number;
    outputSize: number;
    ratio: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (fileList: FileList | File[]) => {
    setError(null);
    setResult(null);
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
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ""),
      );
      setFile({
        file: firstFile,
        name: firstFile.name,
        pageCount,
        size: formatFileSize(firstFile.size),
        data: base64,
      });
    } catch {
      setError(`"${firstFile.name}" could not be read.`);
    }
  }, []);

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const arrayBuffer = await file.file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

      const compressedPdf = await PDFDocument.create();
      const copiedPages = await compressedPdf.copyPages(
        sourcePdf,
        sourcePdf.getPageIndices(),
      );
      for (const page of copiedPages) {
        compressedPdf.addPage(page);
      }

      // Strip metadata
      compressedPdf.setTitle("");
      compressedPdf.setAuthor("");
      compressedPdf.setSubject("");
      compressedPdf.setKeywords([]);
      compressedPdf.setProducer("");
      compressedPdf.setCreator("");

      const useObjectStreams = quality === "low" || quality === "medium";
      const compressedBytes = await compressedPdf.save({
        useObjectStreams,
        addDefaultPage: false,
      });

      const inputSize = arrayBuffer.byteLength;
      const outputSize = compressedBytes.length;
      const ratio =
        inputSize > 0 ? ((1 - outputSize / inputSize) * 100).toFixed(1) : "0";

      const b64 = btoa(
        new Uint8Array(compressedBytes).reduce(
          (d, b) => d + String.fromCharCode(b),
          "",
        ),
      );

      setResult({
        data: b64,
        inputSize,
        outputSize,
        ratio: `${ratio}%`,
      });

      await logUsage({
        toolId: "compress-pdf",
        toolName: "Compress PDF",
        inputSize,
        outputSize,
        metadata: JSON.stringify({ quality }),
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? `Compression failed: ${err.message}`
          : "An unexpected error occurred.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!result || !file) return;
    const binary = atob(result.data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name.replace(/\.pdf$/i, "_compressed.pdf");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
            <Minimize2 className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Compress PDF</h2>
            <p className="text-xs text-muted-foreground">Reduce PDF file size while maintaining quality</p>
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
                  <Button variant="ghost" size="icon" onClick={() => { setFile(null); setResult(null); }}
                    className="size-7 shrink-0 cursor-pointer text-muted-foreground hover:text-destructive">
                    ✕
                  </Button>
                </CardContent>
              </Card>

              {/* Quality selector */}
              <div>
                <p className="mb-2 text-sm font-medium">Compression Level</p>
                <div className="flex gap-3">
                  {[
                    { id: "low" as const, label: "Maximum", desc: "Smallest file size" },
                    { id: "medium" as const, label: "Balanced", desc: "Good balance" },
                    { id: "high" as const, label: "Minimal", desc: "Best quality" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setQuality(opt.id)}
                      className={`flex-1 rounded-xl border-2 p-3 text-left transition-all cursor-pointer ${
                        quality === opt.id
                          ? "border-primary bg-primary/5"
                          : "border-border/60 hover:border-primary/30"
                      }`}
                    >
                      <p className="text-sm font-medium">{opt.label}</p>
                      <p className="text-[11px] text-muted-foreground">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Compress button */}
              <div className="flex justify-center">
                <Button
                  onClick={handleCompress}
                  disabled={isProcessing}
                  size="lg"
                  className="cursor-pointer gap-2 px-8 text-sm font-medium shadow-md"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Compressing...
                    </>
                  ) : (
                    <>
                      <Minimize2 className="size-4" />
                      Compress PDF
                    </>
                  )}
                </Button>
              </div>

              {/* Result */}
              <AnimatePresence>
                {result && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
                    <Card className="border-border/60 shadow-none">
                      <CardContent className="space-y-4 p-5">
                        <div className="flex items-center gap-2.5 text-sm text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="size-4" />
                          <span className="font-medium">Compression complete!</span>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="rounded-xl bg-muted/50 p-3 text-center">
                            <p className="text-[11px] text-muted-foreground">Original</p>
                            <p className="text-sm font-semibold">{formatFileSize(result.inputSize)}</p>
                          </div>
                          <div className="rounded-xl bg-muted/50 p-3 text-center">
                            <p className="text-[11px] text-muted-foreground">Compressed</p>
                            <p className="text-sm font-semibold">{formatFileSize(result.outputSize)}</p>
                          </div>
                          <div className="rounded-xl bg-primary/10 p-3 text-center">
                            <p className="text-[11px] text-primary">Saved</p>
                            <p className="text-sm font-semibold text-primary">{result.ratio}</p>
                          </div>
                        </div>

                        <Button onClick={downloadResult} className="w-full cursor-pointer gap-2" size="lg">
                          <Download className="size-4" />
                          Download Compressed PDF
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
