export interface ToolDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: ToolCategory;
  routeKey?: string;
  comingSoon?: boolean;
}

export type ToolCategory =
  | "pdf" | "scan" | "image" | "text" | "utility"
  | "media" | "calculator" | "developer" | "creator"
  | "network";

export interface CategoryDef {
  id: ToolCategory;
  label: string;
  description: string;
  icon: string;
}

export const categories: CategoryDef[] = [
  { id: "pdf", label: "PDF & Documents", description: "Merge, split, compress and convert PDF files — all inside your browser.", icon: "FileText" },
  { id: "scan", label: "Scanner & OCR", description: "Turn your camera into a document scanner and extract text from images.", icon: "ScanLine" },
  { id: "image", label: "Image Tools", description: "Compress, resize and convert images with pixel-perfect control.", icon: "Image" },
  { id: "text", label: "Text & Productivity", description: "Count, analyze and transform text in real time.", icon: "Type" },
  { id: "utility", label: "Daily Utilities", description: "QR codes, strong passwords and other everyday essentials.", icon: "Wrench" },
  { id: "media", label: "Media Tools", description: "Resolve video links and extract audio from your files.", icon: "Download" },
  { id: "calculator", label: "Calculators", description: "Age, percentage, BMI and unit conversions — instant answers.", icon: "Calculator" },
  { id: "developer", label: "Developer Tools", description: "Format JSON, encode data, hash strings and preview Markdown.", icon: "Code" },
  { id: "creator", label: "Content Creator", description: "Compare texts and generate dummy content in one click.", icon: "FilePlus" },
  { id: "network", label: "Network & Security", description: "Speed tests, subnet math, MAC lookups and password analysis.", icon: "Shield" },
];

export const tools: ToolDef[] = [
  { id: "merge-pdf", name: "Merge PDF", description: "Combine multiple PDF files into a single document.", icon: "Combine", category: "pdf", routeKey: "merge-pdf" },
  { id: "split-pdf", name: "Split PDF", description: "Extract pages from a PDF into separate files.", icon: "Scissors", category: "pdf", routeKey: "split-pdf" },
  { id: "compress-pdf", name: "Compress PDF", description: "Reduce PDF file size while maintaining quality.", icon: "Minimize2", category: "pdf", routeKey: "compress-pdf" },
  { id: "pdf-to-image", name: "PDF to Image", description: "Convert PDF pages to PNG or JPEG images.", icon: "Image", category: "pdf", routeKey: "pdf-to-image" },
  { id: "doc-scanner", name: "Document Scanner", description: "Scan documents with your camera, enhance with filters, export as JPG, PNG, or PDF.", icon: "ScanLine", category: "scan", routeKey: "doc-scanner" },
  { id: "ocr", name: "Image to Text", description: "Extract readable text from images using OCR.", icon: "ScanText", category: "scan", routeKey: "ocr" },
  { id: "image-compress", name: "Image Compressor", description: "Reduce image file size with quality control.", icon: "Shrink", category: "image", routeKey: "image-compress" },
  { id: "image-resize", name: "Image Resizer", description: "Resize and crop images with aspect ratio presets.", icon: "Crop", category: "image", routeKey: "image-resize" },
  { id: "image-convert", name: "Image Format Converter", description: "Convert between JPG, PNG, and WebP formats.", icon: "ArrowRightLeft", category: "image", routeKey: "image-convert" },
  { id: "text-counter", name: "Word Counter", description: "Count words, characters, sentences, and paragraphs.", icon: "Hash", category: "text", routeKey: "text-counter" },
  { id: "text-case", name: "Text Case Converter", description: "Convert text to UPPERCASE, lowercase, Title Case, and more.", icon: "CaseSensitive", category: "text", routeKey: "text-case" },
  { id: "qr-code", name: "QR Code Generator", description: "Generate and scan QR codes from text or images.", icon: "QrCode", category: "utility", routeKey: "qr-code" },
  { id: "password-gen", name: "Password Generator", description: "Generate strong, customizable passwords.", icon: "KeyRound", category: "utility", routeKey: "password-gen" },
  { id: "video-downloader", name: "Video Downloader", description: "Resolve video links, download direct media files, and open platform downloads.", icon: "Globe", category: "media", routeKey: "video-downloader" },
  { id: "audio-extractor", name: "Audio Extractor", description: "Extract audio tracks from video files.", icon: "Music", category: "media", routeKey: "audio-extractor" },
  { id: "age-calc", name: "Age Calculator", description: "Compute exact age in years, months, days, and hours.", icon: "Cake", category: "calculator", routeKey: "age-calc" },
  { id: "percent-calc", name: "Percentage Calculator", description: "Calculate discounts, markups, and ratio percentages.", icon: "Percent", category: "calculator", routeKey: "percent-calc" },
  { id: "unit-converter", name: "Unit Converter", description: "Convert length, weight, and temperature instantly.", icon: "Scale", category: "calculator", routeKey: "unit-converter" },
  { id: "bmi-calc", name: "BMI Calculator", description: "Calculate Body Mass Index with health category indicator.", icon: "HeartPulse", category: "calculator", routeKey: "bmi-calc" },
  { id: "json-formatter", name: "JSON Formatter", description: "Beautify, minify, and validate JSON in real time.", icon: "Braces", category: "developer", routeKey: "json-formatter" },
  { id: "base64-tool", name: "Base64 Encoder/Decoder", description: "Encode and decode Base64 text strings instantly.", icon: "Binary", category: "developer", routeKey: "base64-tool" },
  { id: "markdown-preview", name: "Markdown Previewer", description: "Live split-screen Markdown to HTML preview.", icon: "FileCode", category: "developer", routeKey: "markdown-preview" },
  { id: "hash-generator", name: "Hash Generator", description: "Generate SHA-256 and MD5 hashes from text.", icon: "Fingerprint", category: "developer", routeKey: "hash-generator" },
  { id: "text-diff", name: "Text Diff Checker", description: "Compare two text blocks side-by-side with highlights.", icon: "GitCompare", category: "creator", routeKey: "text-diff" },
  { id: "lorem-ipsum", name: "Lorem Ipsum Generator", description: "Generate dummy text paragraphs, sentences, or words.", icon: "AlignLeft", category: "creator", routeKey: "lorem-ipsum" },
  { id: "device-info", name: "Device & Browser Info", description: "Display screen, browser, viewport, and network details.", icon: "Monitor", category: "network", routeKey: "device-info" },
  { id: "mac-lookup", name: "MAC Address Lookup", description: "Validate MAC format and identify device vendor/OUI.", icon: "Fingerprint", category: "network", routeKey: "mac-lookup" },
  { id: "subnet-calc", name: "Subnet / CIDR Calculator", description: "Calculate network, broadcast, mask, and host range from CIDR.", icon: "Network", category: "network", routeKey: "subnet-calc" },
  { id: "uuid-gen", name: "UUID Generator", description: "Generate random v4 UUIDs with one-click copy.", icon: "Hash", category: "network", routeKey: "uuid-gen" },
  { id: "url-encoder", name: "URL Encoder / Decoder", description: "Encode and decode URLs and query strings.", icon: "Link", category: "network", routeKey: "url-encoder" },
  { id: "password-strength", name: "Password Strength Meter", description: "Analyze password entropy, complexity, and weaknesses.", icon: "ShieldCheck", category: "network", routeKey: "password-strength" },
  { id: "speed-test", name: "Internet Speed Test", description: "Measure live ping, jitter and download speed with real-time results.", icon: "Gauge", category: "network", routeKey: "speed-test" },
];

export function getToolsByCategory(category: ToolCategory): ToolDef[] {
  return tools.filter((t) => t.category === category);
}

export function getToolById(id: string): ToolDef | undefined {
  return tools.find((t) => t.id === id);
}
