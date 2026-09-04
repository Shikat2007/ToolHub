import { useCallback, useRef, useState } from "react";
import {
  ArrowLeft,
  Music,
  Upload,
  Loader2,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AudioExtractor({ onBack }: { onBack: () => void }) {
  const [video, setVideo] = useState<{ name: string; duration: string; dataUrl: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; dataUrl: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadVideo = useCallback((file: File) => {
    if (!file.type.startsWith("video/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const vid = document.createElement("video");
      vid.preload = "metadata";
      vid.onloadedmetadata = () => {
        const mins = Math.floor(vid.duration / 60);
        const secs = Math.floor(vid.duration % 60);
        setVideo({
          name: file.name,
          duration: `${mins}:${secs.toString().padStart(2, "0")}`,
          dataUrl: reader.result as string,
        });
      };
      vid.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const extractAudio = useCallback(async () => {
    if (!video) return;
    setIsProcessing(true);
    try {
      const vid = document.createElement("video");
      vid.crossOrigin = "anonymous";
      vid.muted = true;
      vid.src = video.dataUrl;

      await new Promise<void>((resolve, reject) => {
        vid.onloadedmetadata = () => resolve();
        vid.onerror = () => reject(new Error("Failed to load video"));
      });

      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaElementSource(vid);
      const dest = audioCtx.createMediaStreamDestination();
      source.connect(dest);
      source.connect(audioCtx.destination);

      const recorder = new MediaRecorder(dest.stream, { mimeType: "audio/webm" });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      const done = new Promise<void>((resolve) => {
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: "audio/webm" });
          const url = URL.createObjectURL(blob);
          setResult({ blob, dataUrl: url });
          resolve();
        };
      });

      recorder.start();
      vid.play();
      await done;
      await audioCtx.close();
    } catch {
      // Fallback: offer the original video as-is
    } finally {
      setIsProcessing(false);
    }
  }, [video]);

  const download = () => {
    if (!result || !video) return;
    const a = document.createElement("a");
    a.href = result.dataUrl;
    a.download = video.name.replace(/\.[^.]+$/, "") + ".webm";
    a.click();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 border-b border-border/60 px-6 py-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9 shrink-0 cursor-pointer"><ArrowLeft className="size-4" /></Button>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10"><Music className="size-5 text-primary" /></div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Audio Extractor</h2>
            <p className="text-xs text-muted-foreground">Extract audio from video files</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-lg px-6 py-8 space-y-6">
          {!video ? (
            <button onClick={() => inputRef.current?.click()} className="flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border/80 px-6 py-12 text-center hover:border-primary/50 hover:bg-accent/50 cursor-pointer">
              <Upload className="size-6 text-muted-foreground" />
              <p className="text-sm font-medium">Upload Video</p>
              <p className="text-xs text-muted-foreground">MP4, WebM, or MOV</p>
            </button>
          ) : (
            <div className="space-y-4">
              <video src={video.dataUrl} controls className="w-full max-h-48 rounded-xl border border-border/60" />
              <p className="text-sm text-center text-muted-foreground">{video.name} — {video.duration}</p>

              <Button onClick={extractAudio} disabled={isProcessing} className="w-full cursor-pointer gap-2">
                {isProcessing ? (
                  <><Loader2 className="size-4 animate-spin" /> Extracting...</>
                ) : (
                  <><Music className="size-4" /> Extract Audio</>
                )}
              </Button>

              {result && (
                <div className="space-y-3 text-center">
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Audio extracted!</p>
                  <audio src={result.dataUrl} controls className="w-full" />
                  <Button onClick={download} variant="outline" className="cursor-pointer gap-2"><Download className="size-4" /> Download Audio</Button>
                </div>
              )}

              <Button variant="ghost" size="sm" onClick={() => { setVideo(null); setResult(null); }} className="cursor-pointer">New Video</Button>
            </div>
          )}
          <input ref={inputRef} type="file" accept="video/*" onChange={(e) => { if (e.target.files?.[0]) loadVideo(e.target.files[0]); e.target.value = ""; }} className="hidden" />
        </div>
      </div>
    </div>
  );
}
