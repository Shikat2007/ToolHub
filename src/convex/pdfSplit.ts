/**
 * PDF Split action — extract pages from a PDF into separate files.
 */

"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { PDFDocument } from "pdf-lib";
import { MAX_FILE_SIZE, parsePageRange } from "./lib/security";

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

interface SplitResult {
  name: string;
  data: string;
  pageCount: number;
}

export const splitPdf = action({
  args: {
    file: v.object({
      name: v.string(),
      data: v.string(),
    }),
    pageRange: v.string(),
    splitMode: v.union(
      v.literal("range"),
      v.literal("individual"),
      v.literal("every-n"),
    ),
    chunkSize: v.optional(v.number()),
  },
  handler: async (_ctx, args) => {
    const bytes = b64ToUint8Array(args.file.data);

    if (bytes.length > MAX_FILE_SIZE) {
      throw new Error(
        `File exceeds the ${MAX_FILE_SIZE / (1024 * 1024)} MB size limit.`,
      );
    }

    if (!isPdfBytes(bytes)) {
      throw new Error(`"${args.file.name}" is not a valid PDF file.`);
    }

    let sourcePdf: Awaited<ReturnType<typeof PDFDocument.load>>;
    try {
      sourcePdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
    } catch {
      throw new Error(
        `"${args.file.name}" could not be parsed. It may be corrupted or encrypted.`,
      );
    }

    const totalPages = sourcePdf.getPageCount();
    if (totalPages === 0) {
      throw new Error("The PDF has no pages.");
    }

    const requestedPages = parsePageRange(args.pageRange, totalPages);
    const results: SplitResult[] = [];
    const baseName = args.file.name.replace(/\.pdf$/i, "");

    if (args.splitMode === "range") {
      const newPdf = await PDFDocument.create();
      const indices = requestedPages.map((p) => p - 1);
      const copiedPages = await newPdf.copyPages(sourcePdf, indices);
      for (const page of copiedPages) {
        newPdf.addPage(page);
      }
      const newBytes = await newPdf.save();
      results.push({
        name: `${baseName}_pages_${requestedPages[0]}-${requestedPages[requestedPages.length - 1]}.pdf`,
        data: uint8ArrayToB64(newBytes),
        pageCount: newPdf.getPageCount(),
      });
    } else if (args.splitMode === "individual") {
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
    } else if (args.splitMode === "every-n") {
      const chunkSize = args.chunkSize ?? 1;
      if (chunkSize < 1 || chunkSize > totalPages) {
        throw new Error(`Chunk size must be between 1 and ${totalPages}.`);
      }
      for (let i = 0; i < requestedPages.length; i += chunkSize) {
        const chunk = requestedPages.slice(i, i + chunkSize);
        const newPdf = await PDFDocument.create();
        const indices = chunk.map((p: number) => p - 1);
        const copiedPages = await newPdf.copyPages(sourcePdf, indices);
        for (const page of copiedPages) {
          newPdf.addPage(page);
        }
        const newBytes = await newPdf.save();
        results.push({
          name: `${baseName}_part_${Math.floor(i / chunkSize) + 1}.pdf`,
          data: uint8ArrayToB64(newBytes),
          pageCount: newPdf.getPageCount(),
        });
      }
    }

    return {
      files: results,
      totalPages,
      sourceFile: args.file.name,
    };
  },
});
