import { useCallback, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  FileText,
  GripVertical,
  Plus,
  Trash2,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PdfFile {
  id: string;
  file: File;
  name: string;
  pageCount: number;
  size: string;
}

interface MergePdfProps {
  onBack: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

let fileCounter = 0;

export default function MergePdf({ onBack }: MergePdfProps) {
  const logUsage = useMutation(api.usage.logUsage);
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const processFiles = useCallback(async (fileList: FileList | File[]) => {
    setError(null);
    setSuccess(false);
    const newFiles: PdfFile[] = [];

    for (const file of Array.from(fileList)) {
      if (file.type !== "application/pdf") {
        setError(`"${file.name}" is not a PDF file. Only PDFs are supported.`);
        continue;
      }
      if (file.size > 100 * 1024 * 1024) {
        setError(`"${file.name}" exceeds the 100 MB size limit.`);
        continue;
      }

      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer, {
          ignoreEncryption: true,
        });
        const pageCount = pdfDoc.getPageCount();
        fileCounter++;
        newFiles.push({
          id: `file-${fileCounter}-${Date.now()}`,
          file,
          name: file.name,
          pageCount,
          size: formatFileSize(file.size),
        });
      } catch {
        setError(
          `"${file.name}" could not be read. It may be corrupted or encrypted.`,
        );
      }
    }

    if (newFiles.length > 0) {
      setFiles((prev) => [...prev, ...newFiles]);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (dropRef.current && !dropRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files);
        e.target.value = "";
      }
    },
    [processFiles],
  );

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setSuccess(false);
  };

  const moveFile = (index: number, direction: "up" | "down") => {
    setFiles((prev) => {
      const newFiles = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newFiles.length) return prev;
      [newFiles[index], newFiles[targetIndex]] = [
        newFiles[targetIndex],
        newFiles[index],
      ];
      return newFiles;
    });
  };

  const totalPages = files.reduce((sum, f) => sum + f.pageCount, 0);

  const handleMerge = async () => {
    if (files.length < 2) return;
    setIsProcessing(true);
    setError(null);
    setSuccess(false);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const pdfFile of files) {
        const arrayBuffer = await pdfFile.file.arrayBuffer();
        const sourcePdf = await PDFDocument.load(arrayBuffer, {
          ignoreEncryption: true,
        });
        const copiedPages = await mergedPdf.copyPages(
          sourcePdf,
          sourcePdf.getPageIndices(),
        );
        for (const page of copiedPages) {
          mergedPdf.addPage(page);
        }
      }

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes.buffer as ArrayBuffer], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "merged.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setSuccess(true);

      await logUsage({
        toolId: "merge-pdf",
        toolName: "Merge PDF",
        inputSize: files.reduce((sum, f) => sum + f.file.size, 0),
        outputSize: mergedBytes.length,
        metadata: JSON.stringify({ pageCount: mergedPdf.getPageCount(), fileCount: files.length }),
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? `Merge failed: ${err.message}`
          : "An unexpected error occurred during merging.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

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
            <FileText className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Merge PDF</h2>
            <p className="text-xs text-muted-foreground">
              Combine multiple PDF files into one
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-8">
          {/* Drop zone */}
          <div
            ref={dropRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`group relative flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-all duration-200 ${
              isDragging
                ? "border-primary bg-primary/5 scale-[1.01]"
                : "border-border/80 hover:border-primary/50 hover:bg-accent/50"
            }`}
          >
            <div
              className={`mb-4 flex size-14 items-center justify-center rounded-2xl transition-colors duration-200 ${
                isDragging
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
              }`}
            >
              <Upload className="size-6" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Drop PDF files here or{" "}
              <span className="text-primary underline underline-offset-2">
                browse
              </span>
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Supports PDF files up to 100 MB each
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              multiple
              onChange={handleFileInput}
              className="hidden"
            />
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-4 flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-4 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
              >
                <CheckCircle2 className="size-4 shrink-0" />
                <span>PDF merged successfully! Check your downloads.</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* File list */}
          {files.length > 0 && (
            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  {files.length} file{files.length !== 1 ? "s" : ""} selected
                </p>
                <p className="text-xs text-muted-foreground">
                  {totalPages} total page{totalPages !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {files.map((pdfFile, index) => (
                    <motion.div
                      key={pdfFile.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95, height: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Card className="group/card border-border/60 shadow-none transition-shadow hover:shadow-sm">
                        <CardContent className="flex items-center gap-3 px-4 py-3">
                          <GripVertical className="size-4 shrink-0 text-muted-foreground/40" />

                          {/* Page indicator */}
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-xs font-semibold text-primary">
                            {pdfFile.pageCount}p
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">
                              {pdfFile.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {pdfFile.size}
                            </p>
                          </div>

                          {/* Order controls */}
                          <div className="flex shrink-0 items-center gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={index === 0}
                              onClick={() => moveFile(index, "up")}
                              className="size-7 cursor-pointer"
                            >
                              <ArrowUp className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={index === files.length - 1}
                              onClick={() => moveFile(index, "down")}
                              className="size-7 cursor-pointer"
                            >
                              <ArrowDown className="size-3.5" />
                            </Button>
                          </div>

                          {/* Remove */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFile(pdfFile.id)}
                            className="size-7 shrink-0 cursor-pointer text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Add more */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary cursor-pointer"
              >
                <Plus className="size-3.5" />
                Add more PDFs
              </button>

              {/* Merge button */}
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={handleMerge}
                  disabled={files.length < 2 || isProcessing}
                  size="lg"
                  className="cursor-pointer gap-2 px-8 text-sm font-medium shadow-md"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Merging...
                    </>
                  ) : (
                    <>
                      <Download className="size-4" />
                      Merge & Download
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Empty state hint */}
          {files.length === 0 && (
            <div className="mt-10 text-center">
              <p className="text-xs text-muted-foreground">
                Select 2 or more PDF files to merge them into one document.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
