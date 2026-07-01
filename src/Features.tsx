import { useState, useEffect, useRef, useCallback } from "react";
import { useLang } from "./LanguageContext";
import type { Sens } from "./sensitivity";

// ============ SCROLL REVEAL HOOK ============
export function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add("visible"); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

export function RevealSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useReveal();
  return (
    <div ref={ref} className={`reveal ${delay === 1 ? "reveal-delay-1" : delay === 2 ? "reveal-delay-2" : delay === 3 ? "reveal-delay-3" : ""} ${className}`}>
      {children}
    </div>
  );
}

// ============ GAMING NIGHT MODE ============
const NIGHT_KEY = "alyazouri_night_mode";

export function useNightMode() {
  const [night, setNight] = useState(() => {
    try { return localStorage.getItem(NIGHT_KEY) === "true"; } catch { return false; }
  });
  useEffect(() => {
    document.body.classList.toggle("gaming-mode", night);
    try { localStorage.setItem(NIGHT_KEY, String(night)); } catch { /* */ }
  }, [night]);
  return { night, toggleNight: () => setNight((n) => !n) };
}

export function NightModeToggle() {
  const { lang } = useLang();
  const { night, toggleNight } = useNightMode();
  const isAr = lang === "ar";
  return (
    <button
      onClick={toggleNight}
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
        night ? "bg-indigo-500/20 text-indigo-300 border border-indigo-400/30" : "btn-ghost"
      }`}
      title={isAr ? "وضع الألعاب الليلي" : "Gaming Night Mode"}
    >
      <span className="text-lg">{night ? "🌙" : "☀️"}</span>
    </button>
  );
}

// ============ RATING SYSTEM ============
const RATING_KEY = "alyazouri_rating_v1";

interface RatingData { rating: number; comment: string; savedAt: number; }

export function RatingSection() {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState<RatingData | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RATING_KEY);
      if (raw) {
        const data = JSON.parse(raw) as RatingData;
        setSaved(data); setRating(data.rating); setComment(data.comment); setSubmitted(true);
      }
    } catch { /* */ }
  }, []);

  const handleSubmit = () => {
    if (rating === 0) return;
    const data: RatingData = { rating, comment, savedAt: Date.now() };
    try { localStorage.setItem(RATING_KEY, JSON.stringify(data)); } catch { /* */ }
    setSaved(data); setSubmitted(true);
  };

  const stars = [1, 2, 3, 4, 5];
  const activeRating = hoverRating || rating;

  return (
    <div className="card neon-box rounded-2xl p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-2xl">💬</span>
        <h3 className="font-display text-lg font-bold text-white">
          {isAr ? "قيّم تجربتك" : "Rate Your Experience"}
        </h3>
      </div>

      {submitted && saved ? (
        <div className="py-4 text-center">
          <div className="mb-3 text-4xl">🎉</div>
          <div className="mb-1 text-lg font-bold text-white">
            {isAr ? "شكراً لتقييمك!" : "Thanks for your rating!"}
          </div>
          <div className="mb-3 flex justify-center gap-1">
            {stars.map((s) => (
              <span key={s} className={`text-2xl ${s <= saved.rating ? "opacity-100" : "opacity-20"}`}>⭐</span>
            ))}
          </div>
          {saved.comment && (
            <div className="mx-auto max-w-sm rounded-xl border border-white/5 bg-black/30 p-3 text-sm text-white/70">
              &ldquo;{saved.comment}&rdquo;
            </div>
          )}
          <button onClick={() => { setSubmitted(false); setSaved(null); }} className="mt-4 text-xs text-orange-300 hover:text-orange-200">
            {isAr ? "تعديل التقييم" : "Edit rating"}
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4 flex justify-center gap-2">
            {stars.map((s) => (
              <button
                key={s}
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(s)}
                className={`text-3xl transition-transform hover:scale-125 ${s <= activeRating ? "scale-110 opacity-100" : "opacity-30"}`}
              >
                ⭐
              </button>
            ))}
          </div>
          <div className="mb-4 text-center text-xs text-white/50">
            {activeRating === 1 && (isAr ? "ضعيف" : "Poor")}
            {activeRating === 2 && (isAr ? "مقبول" : "Fair")}
            {activeRating === 3 && (isAr ? "جيد" : "Good")}
            {activeRating === 4 && (isAr ? "ممتاز" : "Excellent")}
            {activeRating === 5 && (isAr ? "🏆 أسطوري!" : "🏆 Legendary!")}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={isAr ? "اكتب تعليقك هنا... (اختياري)" : "Write your comment... (optional)"}
            className="h-20 w-full resize-none rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white placeholder-white/30 focus:border-orange-400/50 focus:outline-none"
          />
          <button onClick={handleSubmit} disabled={rating === 0} className="btn-primary mt-3 w-full rounded-xl px-5 py-3 text-sm disabled:opacity-40">
            {isAr ? "إرسال التقييم" : "Submit Rating"}
          </button>
        </>
      )}
    </div>
  );
}

// ============ SHARE BUTTON ============
export function ShareButton({ sens, deviceName, weaponName }: { sens: Sens; deviceName: string; weaponName: string }) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const [shared, setShared] = useState(false);

  const buildShareText = useCallback(() => {
    return [
      isAr ? "🎯 حساسيتي من ALYAZOURI 2026" : "🎯 My Sensitivity from ALYAZOURI 2026",
      `📱 ${deviceName} · 🔫 ${weaponName}`,
      `📷 Camera: TPP ${sens.cam.tpp}% | FPP ${sens.cam.fpp}%`,
      `🎯 ADS: TPP ${sens.ads.tpp}% | FPP ${sens.ads.fpp}%`,
      `Red Dot: ${sens.cam.red}% | ×4: ${sens.cam.scope4}%`,
      `🏆 AI Score: ${sens.aiScore}/100`,
      `🔗 alyazouri.com`,
    ].join("\n");
  }, [sens, deviceName, weaponName, isAr]);

  const handleShare = async () => {
    const text = buildShareText();
    try {
      if (navigator.share) {
        await navigator.share({ title: "ALYAZOURI Sensitivity", text });
        setShared(true);
      } else {
        await navigator.clipboard.writeText(text);
        setShared(true);
      }
      setTimeout(() => setShared(false), 3000);
    } catch { /* cancelled */ }
  };

  return (
    <button
      onClick={handleShare}
      className={`btn-ghost w-full rounded-xl px-5 py-3 text-sm transition-all ${shared ? "!border-emerald-400/50 !text-emerald-300" : ""}`}
    >
      {shared ? `✅ ${isAr ? "تمت المشاركة!" : "Shared!"}` : `📤 ${isAr ? "مشاركة الحساسية" : "Share Sensitivity"}`}
    </button>
  );
}

// ============ AI PREDICTIONS ============
export function AIPredictions({ deviceName, fingers, styleId, weaponName }: {
  deviceName: string; fingers: number; styleId: string; weaponName: string;
}) {
  const { lang } = useLang();
  const isAr = lang === "ar";

  const sniper = /sniper|AWM|Kar98|M24|Lynx/i.test(weaponName);
  const predictions = [
    {
      icon: "🎯",
      title: isAr ? "دقة الرأس" : "Headshot Accuracy",
      value: Math.min(95, 58 + fingers * 3 + (styleId === "headshot" ? 16 : styleId === "competitive" ? 8 : 0) + (sniper ? 6 : 0)),
      color: "from-orange-500 to-red-500",
    },
    {
      icon: "🌀",
      title: isAr ? "استقرار التتبع" : "Tracking Stability",
      value: Math.min(96, 55 + fingers * 4 + (styleId === "spray" ? 18 : styleId === "aggressive" ? 10 : 4)),
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: "⚡",
      title: isAr ? "سرعة الفليك" : "Flick Speed",
      value: Math.min(94, 60 + (styleId === "headshot" ? 20 : styleId === "aggressive" ? 14 : 6) + fingers),
      color: "from-sky-500 to-indigo-500",
    },
    {
      icon: "💪",
      title: isAr ? "تحكم الارتداد" : "Recoil Control",
      value: Math.min(97, 50 + fingers * 5 + (styleId === "spray" ? 22 : styleId === "competitive" ? 12 : 4)),
      color: "from-purple-500 to-fuchsia-500",
    },
  ];

  return (
    <div className="card rounded-2xl p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xl">🤖</span>
        <h3 className="font-display text-sm font-bold tracking-widest text-white">
          {isAr ? "توقعات الذكاء الاصطناعي" : "AI Predictions"}
        </h3>
        <span className="ml-auto text-[9px] uppercase tracking-widest text-white/30">{deviceName.split(" ")[0]}</span>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {predictions.map((p) => (
          <div key={p.title} className="rounded-xl border border-white/5 bg-black/30 p-3">
            <div className="mb-1.5 flex items-center gap-1.5">
              <span>{p.icon}</span>
              <span className="text-[11px] font-semibold text-white/70">{p.title}</span>
            </div>
            <div className="mb-1.5 font-display text-lg font-black text-white tabular-nums">{p.value}%</div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <div className={`h-full rounded-full bg-gradient-to-r ${p.color} stat-bar`} style={{ width: `${p.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ AI COACH — FULL ANALYSIS ============
export function AiCoach({ sens, deviceName, weaponName, fingers, styleId }: {
  sens: Sens; deviceName: string; weaponName: string; fingers: number; styleId: string;
}) {
  const { lang } = useLang();
  const isAr = lang === "ar";

  const score = sens.aiScore;
  const verdict =
    score >= 90 ? { label: isAr ? "أداء نخبة 🏆" : "Elite Tier 🏆", color: "text-orange-300" } :
    score >= 75 ? { label: isAr ? "أداء احترافي ⚡" : "Pro Tier ⚡", color: "text-emerald-300" } :
    score >= 60 ? { label: isAr ? "أداء جيد ✅" : "Solid Tier ✅", color: "text-sky-300" } :
    { label: isAr ? "يحتاج تحسين 💪" : "Needs Work 💪", color: "text-amber-300" };

  const strengths: string[] = [];
  const tips: string[] = [];
  const f = sens.factors;

  if (f.deviceFactor >= 0.98) strengths.push(isAr ? "جهاز عالي الأداء" : "High-performance device");
  if (f.weaponFactor >= 0.7) strengths.push(isAr ? "سلاح منضبط الارتداد" : "Controllable recoil weapon");
  if (fingers >= 4) strengths.push(isAr ? "تحكم متعدد الأصابع" : "Multi-finger control");
  if (f.styleFactor <= 1.0) strengths.push(isAr ? "حساسية دقيقة ومستقرة" : "Precise, stable sens");

  if (f.deviceFactor < 0.93) tips.push(isAr ? "فعّل أعلى إطار (FPS) المتاح بجهازك" : "Enable the highest available FPS");
  if (f.weaponFactor < 0.6) tips.push(isAr ? "تمرّن على أنماط الارتداد لهذا السلاح" : "Practice this weapon's recoil patterns");
  if (fingers < 4) tips.push(isAr ? "انتقل إلى 4 أصابع لمزيد من التحكم" : "Move to 4 fingers for more control");
  if (f.styleFactor > 1.05) tips.push(isAr ? "قلّل الحساسية قليلاً لتحسين الدقة" : "Lower sens slightly for better precision");
  if (tips.length === 0) tips.push(isAr ? "أداؤك متوازن — ركّز على التمرين فقط" : "Your setup is balanced — focus on practice");

  return (
    <div className="card neon-box rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xl">🧠</span>
        <h3 className="font-display text-sm font-bold tracking-widest text-white">
          {isAr ? "المدرب الذكي — تحليل كامل" : "AI Coach — Full Analysis"}
        </h3>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/8 bg-black/30 p-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-white/40">
            {deviceName} · {weaponName} · {fingers}F · {styleId}
          </div>
          <div className={`font-display text-lg font-black ${verdict.color}`}>{verdict.label}</div>
        </div>
        <div className="text-right">
          <div className="font-display text-3xl font-black text-orange-300 tabular-nums">{score}</div>
          <div className="text-[9px] uppercase tracking-widest text-white/40">AI / 100</div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-3">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-emerald-300/80">
            ✅ {isAr ? "نقاط القوة" : "Strengths"}
          </div>
          <ul className="space-y-1">
            {strengths.map((s, i) => (
              <li key={i} className="text-xs text-white/70">• {s}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-amber-400/20 bg-amber-500/5 p-3">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-amber-300/80">
            💡 {isAr ? "نصائح للتحسين" : "Improvement Tips"}
          </div>
          <ul className="space-y-1">
            {tips.map((s, i) => (
              <li key={i} className="text-xs text-white/70">• {s}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
