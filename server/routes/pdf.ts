/**
 * PDF Routes — Merge, Split, Compress
 *
 * All operations are stateless: read input → process in memory → stream response → clean up.
 * No database. No file persistence. No history.
 */

import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { PDFDocument } from "pdf-lib";
import {
  MAX_FILE_SIZE,
  MAX_MERGE_FILES,
  MAX_OUTPUT_SIZE,
  parsePageRange,
} from "../middleware/security";

export const pdfRoutes = Router();

// Per-route rate limiter: 30 requests per minute for PDF operations
const pdfLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "PDF rate limit exceeded. Try again in a minute." },
});

pdfRoutes.use(pdfLimiter);

// ── Helpers ──────────────────────────────────────────────────────────────────

function b64ToUint8Array(b64: string): Uint8Array {
  return new Uint8Array(Buffer.from(b64, "base64"));
}

function uint8ArrayToB64(arr: Uint8Array): string {
  return Buffer.from(arr).toString("base64");
}

function isPdfBytes(bytes: Uint8Array): boolean {
  if (bytes.length < 5) return false;
  return String.fromCharCode(...bytes.slice(0, 5)) === "%PDF-";
}

// ── POST /api/pdf/merge ─────────────────────────────────────────────────────

pdfRoutes.post("/merge", async (req: Request, res: Response) => {
  try {
    const { files } = req.body as {
      files: Array<{ name: string; data: string }>;
    };

    if (!Array.isArray(files) || files.length < 2) {
      res.status(400).json({ error: "At least 2 PDF files are required." });
      return;
    }
    if (files.length > MAX_MERGE_FILES) {
      res
        .status(400)
        .json({ error: `Maximum ${MAX_MERGE_FILES} files per merge.` });
      return;
    }

    const pdfDocs: Awaited<ReturnType<typeof PDFDocument.load>>[] = [];
    let totalInputSize = 0;

    for (const file of files) {
      const bytes = b64ToUint8Array(file.data);
      totalInputSize += bytes.length;

      if (bytes.length > MAX_FILE_SIZE) {
        res.status(400).json({
          error: `"${file.name}" exceeds the 100 MB size limit.`,
        });
        return;
      }
      if (!isPdfBytes(bytes)) {
        res
          .status(400)
          .json({ error: `"${file.name}" is not a valid PDF.` });
        return;
      }

      try {
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        pdfDocs.push(doc);
      } catch {
        res.status(400).json({
          error: `"${file.name}" could not be parsed (corrupted or encrypted).`,
        });
        return;
      }
    }

    const mergedPdf = await PDFDocument.create();
    for (const doc of pdfDocs) {
      const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());
      for (const page of copiedPages) mergedPdf.addPage(page);
    }

    const mergedBytes = await mergedPdf.save();

    if (mergedBytes.length > MAX_OUTPUT_SIZE) {
      res.status(400).json({
        error: `Merged output exceeds the ${(MAX_OUTPUT_SIZE / (1024 * 1024)).toFixed(0)} MB limit.`,
      });
      return;
    }

    res.json({
      data: uint8ArrayToB64(mergedBytes),
      pageCount: mergedPdf.getPageCount(),
      inputFiles: files.length,
      totalInputSize,
      outputSize: mergedBytes.length,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    res.status(500).json({ error: message });
  }
});

// ── POST /api/pdf/split ─────────────────────────────────────────────────────

pdfRoutes.post("/split", async (req: Request, res: Response) => {
  try {
    const { file, pageRange, splitMode, chunkSize } = req.body as {
      file: { name: string; data: string };
      pageRange: string;
      splitMode: "range" | "individual" | "every-n";
      chunkSize?: number;
    };

    if (!file?.data) {
      res.status(400).json({ error: "No PDF file provided." });
      return;
    }

    const bytes = b64ToUint8Array(file.data);

    if (bytes.length > MAX_FILE_SIZE) {
      res.status(400).json({ error: "File exceeds the 100 MB size limit." });
      return;
    }
    if (!isPdfBytes(bytes)) {
      res.status(400).json({ error: "Not a valid PDF file." });
      return;
    }

    let sourcePdf: Awaited<ReturnType<typeof PDFDocument.load>>;
    try {
      sourcePdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
    } catch {
      res
        .status(400)
        .json({ error: "PDF could not be parsed (corrupted or encrypted)." });
      return;
    }

    const totalPages = sourcePdf.getPageCount();
    if (totalPages === 0) {
      res.status(400).json({ error: "The PDF has no pages." });
      return;
    }

    const requestedPages = parsePageRange(pageRange, totalPages);
    const results: Array<{
      name: string;
      data: string;
      pageCount: number;
    }> = [];
    const baseName = file.name.replace(/\.pdf$/i, "");

    if (splitMode === "range") {
      const newPdf = await PDFDocument.create();
      const indices = requestedPages.map((p) => p - 1);
      const copiedPages = await newPdf.copyPages(sourcePdf, indices);
      for (const page of copiedPages) newPdf.addPage(page);
      const newBytes = await newPdf.save();
      results.push({
        name: `${baseName}_pages_${requestedPages[0]}-${requestedPages[requestedPages.length - 1]}.pdf`,
        data: uint8ArrayToB64(newBytes),
        pageCount: newPdf.getPageCount(),
      });
    } else if (splitMode === "individual") {
      for (const pageNum of requestedPages) {
        const newPdf = await PDFDocument.create();
        const copiedPages = await newPdf.copyPages(sourcePdf, [pageNum - 1]);
        newPdf.addPage(copiedPages[0]);
        const newBytes = await newPdf.save();
        results.push({
          name: `${baseName}_page_${pageNum}.pdf`,
          data: uint8ArrayToB64(newBytes),
          pageCount: 1,
        });
      }
    } else if (splitMode === "every-n") {
      const cs = chunkSize ?? 2;
      if (cs < 1 || cs > totalPages) {
        res.status(400).json({
          error: `Chunk size must be between 1 and ${totalPages}.`,
        });
        return;
      }
      for (let i = 0; i < requestedPages.length; i += cs) {
        const chunk = requestedPages.slice(i, i + cs);
        const newPdf = await PDFDocument.create();
        const indices = chunk.map((p: number) => p - 1);
        const copiedPages = await newPdf.copyPages(sourcePdf, indices);
        for (const page of copiedPages) newPdf.addPage(page);
        const newBytes = await newPdf.save();
        results.push({
          name: `${baseName}_part_${Math.floor(i / cs) + 1}.pdf`,
          data: uint8ArrayToB64(newBytes),
          pageCount: newPdf.getPageCount(),
        });
      }
    }

    res.json({ files: results, totalPages, sourceFile: file.name });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    res.status(500).json({ error: message });
  }
});

// ── POST /api/pdf/compress ──────────────────────────────────────────────────

pdfRoutes.post("/compress", async (req: Request, res: Response) => {
  try {
    const { file, quality } = req.body as {
      file: { name: string; data: string };
      quality: "low" | "medium" | "high";
    };

    if (!file?.data) {
      res.status(400).json({ error: "No PDF file provided." });
      return;
    }

    const bytes = b64ToUint8Array(file.data);

    if (bytes.length > MAX_FILE_SIZE) {
      res.status(400).json({ error: "File exceeds the 100 MB size limit." });
      return;
    }
    if (!isPdfBytes(bytes)) {
      res.status(400).json({ error: "Not a valid PDF file." });
      return;
    }

    let sourcePdf: Awaited<ReturnType<typeof PDFDocument.load>>;
    try {
      sourcePdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
    } catch {
      res
        .status(400)
        .json({ error: "PDF could not be parsed (corrupted or encrypted)." });
      return;
    }

    const pageCount = sourcePdf.getPageCount();
    const compressedPdf = await PDFDocument.create();

    const copiedPages = await compressedPdf.copyPages(
      sourcePdf,
      sourcePdf.getPageIndices(),
    );
    for (const page of copiedPages) compressedPdf.addPage(page);

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

    const inputSize = bytes.length;
    const outputSize = compressedBytes.length;
    const ratio =
      inputSize > 0
        ? ((1 - outputSize / inputSize) * 100).toFixed(1)
        : "0";

    res.json({
      data: uint8ArrayToB64(compressedBytes),
      inputSize,
      outputSize,
      compressionRatio: `${ratio}%`,
      pageCount,
      fileName: file.name,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    res.status(500).json({ error: message });
  }
});
