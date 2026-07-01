import { useEffect, useRef, useState } from "react";
import { useLang } from "./LanguageContext";

export function TouchTest() {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const [taps, setTaps] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => {
    setTaps(0); setTimeLeft(10); setFinished(false); setRunning(true);
  };

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setRunning(false); setFinished(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const tap = () => { if (running) setTaps((t) => t + 1); };

  const cps = finished ? (taps / 10).toFixed(1) : "—";
  const rating =
    !finished ? null :
    taps >= 80 ? { label: isAr ? "🏆 أسطوري!" : "🏆 Legendary!", color: "text-orange-300" } :
    taps >= 60 ? { label: isAr ? "⚡ محترف" : "⚡ Pro", color: "text-emerald-300" } :
    taps >= 40 ? { label: isAr ? "✅ جيد" : "✅ Good", color: "text-sky-300" } :
    { label: isAr ? "💪 تدرب أكثر" : "💪 Keep practicing", color: "text-amber-300" };

  return (
    <div className="card rounded-2xl p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xl">👆</span>
        <h3 className="font-display text-sm font-bold tracking-widest text-white">
          {isAr ? "اختبار سرعة اللمس" : "Touch Speed Test"}
        </h3>
      </div>
      <div className="mb-3 flex items-center justify-between rounded-xl border border-white/5 bg-black/30 p-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-white/40">CPS</div>
          <div className="font-display text-2xl font-black text-orange-300 tabular-nums">{cps}</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-widest text-white/40">{isAr ? "نقرات" : "Taps"}</div>
          <div className="font-display text-2xl font-black text-white tabular-nums">{taps}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-widest text-white/40">{isAr ? "الوقت" : "Time"}</div>
          <div className="font-display text-2xl font-black text-white tabular-nums">{timeLeft}s</div>
        </div>
      </div>
      <button
        onClick={running ? tap : start}
        disabled={finished && timeLeft === 0}
        className={`w-full rounded-xl border-2 py-6 text-sm font-bold transition-all active:scale-95 ${
          finished
            ? "border-orange-400/50 bg-orange-500/10 text-orange-300"
            : running
            ? "border-orange-400 bg-gradient-to-br from-orange-500 to-red-600 text-white pulse-glow"
            : "border-white/10 bg-white/[0.02] text-white/70 hover:border-orange-400/50"
        }`}
      >
        {finished ? (
          <span className={rating?.color}>{rating?.label} — {taps} taps / 10s</span>
        ) : running ? (
          isAr ? "اضغط بسرعة!" : "TAP QUICKLY!"
        ) : (
          isAr ? "🚀 ابدأ الاختبار (10 ثواني)" : "🚀 Start Test (10 seconds)"
        )}
      </button>
    </div>
  );
}
