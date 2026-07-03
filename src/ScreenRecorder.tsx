import { useState, useRef } from "react";
import { useLang } from "./LanguageContext";

export function ScreenRecorder() {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [url, setUrl] = useState<string | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const u = URL.createObjectURL(blob);
        setUrl(u);
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch {
      /* user cancelled or not supported */
    }
  };

  const stop = () => {
    mediaRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${m}:${ss}`;
  };

  return (
    <div className="card rounded-2xl p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xl">🎥</span>
        <h3 className="font-display text-sm font-bold tracking-widest text-white">
          {isAr ? "مسجّل الشاشة" : "Screen Recorder"}
        </h3>
      </div>
      <div className="flex items-center justify-between rounded-xl border border-white/5 bg-black/30 p-3">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${recording ? "animate-pulse bg-red-500" : "bg-white/20"}`} />
          <div>
            <div className="font-display text-lg font-bold text-white tabular-nums">{fmt(duration)}</div>
            <div className="text-[10px] uppercase tracking-widest text-white/40">
              {recording ? (isAr ? "جارٍ التسجيل..." : "Recording...") : isAr ? "جاهز" : "Ready"}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {!recording ? (
            <button onClick={start} className="btn-primary rounded-lg px-4 py-2 text-xs">
              {isAr ? "▶ ابدأ" : "▶ Start"}
            </button>
          ) : (
            <button onClick={stop} className="btn-ghost rounded-lg border-red-400/30 bg-red-500/10 px-4 py-2 text-xs text-red-300">
              {isAr ? "⏸ إيقاف" : "⏸ Stop"}
            </button>
          )}
        </div>
      </div>
      {url && (
        <div className="mt-3">
          <video src={url} controls className="w-full rounded-lg border border-white/10" />
          <a
            href={url}
            download={`alyazouri-${Date.now()}.webm`}
            className="btn-ghost mt-2 block w-full rounded-lg px-4 py-2 text-center text-xs"
          >
            {isAr ? "📥 تحميل الفيديو" : "📥 Download Video"}
          </a>
        </div>
      )}
    </div>
  );
}
