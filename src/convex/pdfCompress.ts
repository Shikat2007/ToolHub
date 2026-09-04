/**
 * PDF Compress action — reduce PDF file size by stripping redundant objects
 * and optimizing streams.
 */

"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { PDFDocument } from "pdf-lib";
import { MAX_FILE_SIZE } from "./lib/security";

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

export const compressPdf = action({
  args: {
    file: v.object({
      name: v.string(),
      data: v.string(),
    }),
    quality: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
    ),
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

    const pageCount = sourcePdf.getPageCount();

    const compressedPdf = await PDFDocument.create();

    const copiedPages = await compressedPdf.copyPages(
      sourcePdf,
      sourcePdf.getPageIndices(),
    );
    for (const page of copiedPages) {
      compressedPdf.addPage(page);
    }

    compressedPdf.setTitle("");
    compressedPdf.setAuthor("");
    compressedPdf.setSubject("");
    compressedPdf.setKeywords([]);
    compressedPdf.setProducer("");
    compressedPdf.setCreator("");

    const useObjectStreams =
      args.quality === "low" || args.quality === "medium";
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

    return {
      data: uint8ArrayToB64(compressedBytes),
      inputSize,
      outputSize,
      compressionRatio: `${ratio}%`,
      pageCount,
      fileName: args.file.name,
    };
  },
});
