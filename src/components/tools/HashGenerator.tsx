import { useState } from "react";
import { ArrowLeft, Fingerprint, Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Simple MD5 implementation (RFC 1321)
function md5(string: string): string {
  function rotateLeft(val: number, shift: number) { return (val << shift) | (val >>> (32 - shift)); }
  function addUnsigned(a: number, b: number) { const a8 = (a & 0x80000000); const b8 = (b & 0x80000000); const a4 = (a & 0x40000000); const b4 = (b & 0x40000000); const result = (a & 0x3FFFFFFF) + (b & 0x3FFFFFFF); if (a4 & b4) return (result ^ 0x80000000 ^ a8 ^ b8); if (a4 | b4) { if (result & 0x40000000) return (result ^ 0xC0000000 ^ a8 ^ b8); else return (result ^ 0x40000000 ^ a8 ^ b8); } return (result ^ a8 ^ b8); }
  function f(x: number, y: number, z: number) { return (x & y) | ((~x) & z); }
  function g(x: number, y: number, z: number) { return (x & z) | (y & (~z)); }
  function h(x: number, y: number, z: number) { return (x ^ y ^ z); }
  function ii(x: number, y: number, z: number) { return (y ^ (x | (~z))); }
  function transform(fn: (x: number, y: number, z: number) => number, a: number, b: number, c: number, d: number, x: number, s: number, ac: number) { a = addUnsigned(a, addUnsigned(addUnsigned(fn(b, c, d), x), ac)); return addUnsigned(rotateLeft(a, s), b); }
  function utf8Encode(s: string) { return unescape(encodeURIComponent(s)); }
  function wordToHex(val: number) { let result = "", v; for (let i = 0; i <= 3; i++) { v = (val >>> (i * 8)) & 255; result += ("0" + v.toString(16)).slice(-2); } return result; }

  const x = utf8Encode(string);
  const len = x.length;
  let a = 0x67452301, b = 0xEFCDAB89, c = 0x98BADCFE, d = 0x10325476;
  let i: number;
  for (i = 0; i + 64 <= len; i += 64) {
    const words: number[] = [];
    for (let j = 0; j < 64; j++) words[j] = x.charCodeAt(i + j);
    const [sa, sb, sc, sd] = [a, b, c, d];
    a = transform(f, a, b, c, d, words[0], 7, 0xD76AA478); d = transform(f, d, a, b, c, words[1], 12, 0xE8C7B756); c = transform(f, c, d, a, b, words[2], 17, 0x242070DB); b = transform(f, b, c, d, a, words[3], 22, 0xC1BDCEEE);
    a = transform(f, a, b, c, d, words[4], 7, 0xF57C0FAF); d = transform(f, d, a, b, c, words[5], 12, 0x4787C62A); c = transform(f, c, d, a, b, words[6], 17, 0xA8304613); b = transform(f, b, c, d, a, words[7], 22, 0xFD469501);
    a = transform(f, a, b, c, d, words[8], 7, 0x698098D8); d = transform(f, d, a, b, c, words[9], 12, 0x8B44F7AF); c = transform(f, c, d, a, b, words[10], 17, 0xFFFF5BB1); b = transform(f, b, c, d, a, words[11], 22, 0x895CD7BE);
    a = transform(f, a, b, c, d, words[12], 7, 0x6B901122); d = transform(f, d, a, b, c, words[13], 12, 0xFD987193); c = transform(f, c, d, a, b, words[14], 17, 0xA679438E); b = transform(f, b, c, d, a, words[15], 22, 0x49B40821);
    a = transform(g, a, b, c, d, words[1], 5, 0xF61E2562); d = transform(g, d, a, b, c, words[6], 9, 0xC040B340); c = transform(g, c, d, a, b, words[11], 14, 0x265E5A51); b = transform(g, b, c, d, a, words[0], 20, 0xE9B6C7AA);
    a = transform(g, a, b, c, d, words[5], 5, 0xD62F105D); d = transform(g, d, a, b, c, words[10], 9, 0x02441453); c = transform(g, c, d, a, b, words[15], 14, 0xD8A1E681); b = transform(g, b, c, d, a, words[4], 20, 0xE7D3FBC8);
    a = transform(g, a, b, c, d, words[9], 5, 0x21E1CDE6); d = transform(g, d, a, b, c, words[14], 9, 0xC33707D6); c = transform(g, c, d, a, b, words[3], 14, 0xF4D50D87); b = transform(g, b, c, d, a, words[8], 20, 0x455A14ED);
    a = transform(g, a, b, c, d, words[13], 5, 0xA9E3E905); d = transform(g, d, a, b, c, words[2], 9, 0xFCEFA3F8); c = transform(g, c, d, a, b, words[7], 14, 0x676F02D9); b = transform(g, b, c, d, a, words[12], 20, 0x8D2A4C8A);
    a = transform(h, a, b, c, d, words[5], 4, 0xFFFA3942); d = transform(h, d, a, b, c, words[8], 11, 0x8771F681); c = transform(h, c, d, a, b, words[11], 16, 0x6D9D6122); b = transform(h, b, c, d, a, words[14], 23, 0xFDE5380C);
    a = transform(h, a, b, c, d, words[1], 4, 0xA4BEEA44); d = transform(h, d, a, b, c, words[4], 11, 0x4BDECFA9); c = transform(h, c, d, a, b, words[7], 16, 0xF6BB4B60); b = transform(h, b, c, d, a, words[10], 23, 0xBEBFBC70);
    a = transform(h, a, b, c, d, words[13], 4, 0x289B7EC6); d = transform(h, d, a, b, c, words[0], 11, 0xEAA127FA); c = transform(h, c, d, a, b, words[3], 16, 0xD4EF3085); b = transform(h, b, c, d, a, words[6], 23, 0x04881D05);
    a = transform(h, a, b, c, d, words[9], 4, 0xD9D4D039); d = transform(h, d, a, b, c, words[12], 11, 0xE6DB99E5); c = transform(h, c, d, a, b, words[15], 16, 0x1FA27CF8); b = transform(h, b, c, d, a, words[2], 23, 0xC4AC5665);
    a = transform(ii, a, b, c, d, words[0], 6, 0xF4292244); d = transform(ii, d, a, b, c, words[7], 10, 0x432AFF97); c = transform(ii, c, d, a, b, words[14], 15, 0xAB9423A7); b = transform(ii, b, c, d, a, words[5], 21, 0xFC93A039);
    a = transform(ii, a, b, c, d, words[12], 6, 0x655B59C3); d = transform(ii, d, a, b, c, words[3], 10, 0x8F0CCC92); c = transform(ii, c, d, a, b, words[10], 15, 0xFFEFF47D); b = transform(ii, b, c, d, a, words[1], 21, 0x85845DD1);
    a = transform(ii, a, b, c, d, words[8], 6, 0x6FA87E4F); d = transform(ii, d, a, b, c, words[15], 10, 0xFE2CE6E0); c = transform(ii, c, d, a, b, words[6], 15, 0xA3014314); b = transform(ii, b, c, d, a, words[13], 21, 0x4E0811A1);
    a = transform(ii, a, b, c, d, words[4], 6, 0xF7537E82); d = transform(ii, d, a, b, c, words[11], 10, 0xBD3AF235); c = transform(ii, c, d, a, b, words[2], 15, 0x2AD7D2BB); b = transform(ii, b, c, d, a, words[9], 21, 0xEB86D391);
    a = addUnsigned(a, sa); b = addUnsigned(b, sb); c = addUnsigned(c, sc); d = addUnsigned(d, sd);
  }
  return wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
}

export default function HashGenerator({ onBack }: { onBack: () => void }) {
  const [input, setInput] = useState("");
  const [sha256, setSha256] = useState("");
  const [md5Hash, setMd5Hash] = useState("");
  const [copied, setCopied] = useState("");

  const generate = async () => {
    if (!input) return;
    // SHA-256 via Web Crypto
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    setSha256(hashArray.map((b) => b.toString(16).padStart(2, "0")).join(""));
    // MD5
    setMd5Hash(md5(input));
  };

  const copy = (val: string, label: string) => { navigator.clipboard.writeText(val); setCopied(label); setTimeout(() => setCopied(""), 2000); };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 border-b border-border/60 px-6 py-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9 shrink-0 cursor-pointer"><ArrowLeft className="size-4" /></Button>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10"><Fingerprint className="size-5 text-primary" /></div>
          <div><h2 className="text-lg font-semibold tracking-tight">Hash Generator</h2><p className="text-xs text-muted-foreground">SHA-256 and MD5 from text</p></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-lg px-6 py-8 space-y-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Input Text</label>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter text to hash..."
              className="h-32 w-full rounded-xl border border-border/60 bg-card p-4 font-mono text-xs leading-relaxed focus:border-primary/50 focus:outline-none resize-none" />
          </div>
          <Button onClick={generate} disabled={!input} className="w-full cursor-pointer">Generate Hashes</Button>

          {(sha256 || md5Hash) && (
            <div className="space-y-3">
              {[
                { label: "SHA-256", value: sha256 },
                { label: "MD5", value: md5Hash },
              ].map((h) => (
                <div key={h.label} className="rounded-xl border border-border/60 bg-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-muted-foreground">{h.label}</p>
                    <Button variant="ghost" size="sm" onClick={() => copy(h.value, h.label)} className="cursor-pointer gap-1 text-xs">
                      {copied === h.label ? <CheckCircle2 className="size-3 text-emerald-500" /> : <Copy className="size-3" />} Copy
                    </Button>
                  </div>
                  <p className="break-all font-mono text-xs">{h.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
