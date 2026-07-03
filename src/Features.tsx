import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
const NIGHT_AUTO_KEY = "alyazouri_night_auto";

// SunCalc port — الرياضيات الفلكية لحساب وقت الغروب بدون API خارجي
function getSunsetHour(lat: number, lng: number): number {
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  const zenith = 90.833;
  const D2R = Math.PI / 180;
  const R2D = 180 / Math.PI;
  const lngHour = lng / 15;
  const t = dayOfYear + ((18 - lngHour) / 24);
  const M = (0.9856 * t) - 3.289;
  const L = M + (1.916 * Math.sin(M * D2R)) + (0.020 * Math.sin(2 * M * D2R)) + 282.634;
  let Lnorm = L % 360; if (Lnorm < 0) Lnorm += 360;
  const RA = R2D * Math.atan(0.91764 * Math.tan(Lnorm * D2R));
  let RAnorm = RA % 360;
  const Lquadrant = (Math.floor(Lnorm / 90)) * 90;
  const RAquadrant = (Math.floor(RAnorm / 90)) * 90;
  RAnorm = RAnorm + (Lquadrant - RAquadrant);
  RAnorm /= 15;
  const sinDec = 0.39782 * Math.sin(Lnorm * D2R);
  const cosDec = Math.cos(Math.asin(sinDec));
  const cosH = (Math.cos(zenith * D2R) - (sinDec * Math.sin(lat * D2R))) / (cosDec * Math.cos(lat * D2R));
  if (cosH > 1) return 18;
  if (cosH < -1) return 6;
  const H = R2D * Math.acos(cosH) / 15;
  return RAnorm + H + (lngHour - lng / 15);
}

export function useNightMode() {
  const [night, setNight] = useState(() => {
    try { return localStorage.getItem(NIGHT_KEY) === "true"; } catch { return false; }
  });
  const [autoMode, setAutoMode] = useState(() => {
    try { return localStorage.getItem(NIGHT_AUTO_KEY) !== "false"; } catch { return true; }
  });

  // Auto-detect sunset
  useEffect(() => {
    if (!autoMode) return;
    const check = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const sunset = getSunsetHour(pos.coords.latitude, pos.coords.longitude);
            const sunrise = 24 - (sunset - 6); // تقريبي
            const hour = new Date().getHours();
            const shouldBeNight = hour >= Math.floor(sunset) || hour < Math.floor(sunrise);
            if (shouldBeNight !== night) {
              setNight(shouldBeNight);
              try { localStorage.setItem(NIGHT_KEY, String(shouldBeNight)); } catch { /* */ }
            }
          },
          () => { /* fallback: prefers-color-scheme */ },
          { timeout: 3000 }
        );
      } else {
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        if (mq.matches !== night) {
          setNight(mq.matches);
          try { localStorage.setItem(NIGHT_KEY, String(mq.matches)); } catch { /* */ }
        }
      }
    };
    check();
    const interval = setInterval(check, 600000); // كل 10 دقائق
    return () => clearInterval(interval);
  }, [autoMode, night]);

  useEffect(() => {
    document.body.classList.toggle("gaming-mode", night);
    try { localStorage.setItem(NIGHT_KEY, String(night)); } catch { /* */ }
  }, [night]);

  return {
    night,
    autoMode,
    toggleNight: () => { setAutoMode(false); setNight((n: boolean) => !n); },
    toggleAuto: () => { setAutoMode((a: boolean) => !a); try { localStorage.setItem(NIGHT_AUTO_KEY, String(!autoMode)); } catch { /* */ } },
  };
}

export function NightModeToggle() {
  const { lang } = useLang();
  const { night, autoMode, toggleNight, toggleAuto } = useNightMode();
  const isAr = lang === "ar";
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={toggleNight}
        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
          night ? "bg-indigo-500/20 text-indigo-300 border border-indigo-400/30" : "btn-ghost"
        }`}
        title={isAr ? "وضع الألعاب الليلي" : "Gaming Night Mode"}
      >
        <span className="text-lg">{night ? "🌙" : "☀️"}</span>
      </button>
      <button
        onClick={toggleAuto}
        className={`rounded-lg px-2 py-2 text-[10px] font-bold transition-all ${
          autoMode ? "text-emerald-400 bg-emerald-500/10" : "text-white/30 bg-white/5"
        }`}
        title={isAr ? "تلقائي: حسب الغروب" : "Auto: sunset-based"}
      >
        {autoMode ? "🕐" : "🕐"}
      </button>
    </div>
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

// ============ PUBGM SENSITIVITY CODE GENERATOR (#11) ============
function generatePubgmCode(sens: Sens): string {
  // PUBGM sensitivity code format — encodes Camera + ADS + Gyro values
  const vals = [
    sens.cam.tpp, sens.cam.fpp, sens.cam.noScope, sens.cam.red,
    sens.cam.scope2, sens.cam.scope3, sens.cam.scope4, sens.cam.scope6, sens.cam.scope8,
    sens.ads.tpp, sens.ads.fpp, sens.ads.noScope, sens.ads.red,
    sens.ads.scope2, sens.ads.scope3, sens.ads.scope4, sens.ads.scope6, sens.ads.scope8,
    sens.gyro.cam.tpp, sens.gyro.cam.fpp, sens.gyro.cam.noScope, sens.gyro.cam.red,
    sens.gyro.cam.scope2, sens.gyro.cam.scope3, sens.gyro.cam.scope4, sens.gyro.cam.scope6, sens.gyro.cam.scope8,
    sens.gyro.ads.tpp, sens.gyro.ads.fpp, sens.gyro.ads.noScope, sens.gyro.ads.red,
    sens.gyro.ads.scope2, sens.gyro.ads.scope3, sens.gyro.ads.scope4, sens.gyro.ads.scope6, sens.gyro.ads.scope8,
  ];
  const encoded = vals.map(v => v.toString().padStart(3,'0')).join('');
  const hash = vals.reduce((a,b) => ((a<<5)-a)+b, 0) & 0xFFFF;
  return `1-${encoded.slice(0,4)}-${encoded.slice(4,8)}-${encoded.slice(8,12)}-${encoded.slice(12,16)}-${hash.toString().padStart(3,'0')}`;
}

export function CodeExportButton({ sens }: { sens: Sens }) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const [copied, setCopied] = useState(false);
  const code = useMemo(() => generatePubgmCode(sens), [sens]);

  const handleCopy = () => {
    try { navigator.clipboard?.writeText(code); } catch { /* */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <button onClick={handleCopy} className={`btn-ghost rounded-xl px-4 py-3 text-sm ${copied ? "!border-emerald-400/50 !text-emerald-300" : ""}`}>
      {copied ? "✅" : "📟"} {isAr ? "كود الحساسية" : "Sensitivity Code"}
    </button>
  );
}

// ============ SHARE BUTTON — Enhanced with Web Share Target + OG card (#14) ============
export function ShareCard({ sens, deviceName, weaponName }: { sens: Sens; deviceName: string; weaponName: string }) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const [show, setShow] = useState(false);

  const shareUrl = useMemo(() => {
    const params = new URLSearchParams({
      d: deviceName, w: weaponName, ai: String(sens.aiScore),
      ct: String(sens.cam.tpp), cr: String(sens.cam.red), c4: String(sens.cam.scope4),
      at: String(sens.ads.tpp), ar: String(sens.ads.red),
    });
    return `${window.location.origin}${window.location.pathname}?${params}`;
  }, [sens, deviceName, weaponName]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `🎯 ${deviceName} · ${weaponName} | AI ${sens.aiScore}/100`,
          text: `حساسيتي من ALYAZOURI 2026\n📱 ${deviceName} 🔫 ${weaponName}\n📷 TPP ${sens.cam.tpp}% | Red Dot ${sens.cam.red}%\n🏆 AI Score: ${sens.aiScore}/100`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShow(true);
        setTimeout(() => setShow(false), 3000);
      }
    } catch { /* cancelled */ }
  };

  return (
    <>
      <button onClick={handleShare} className="btn-ghost rounded-xl px-4 py-3 text-sm">
        📤 {isAr ? "مشاركة" : "Share"}
      </button>
      {show && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300 shadow-2xl backdrop-blur-lg">
          ✅ {isAr ? "تم نسخ رابط المشاركة!" : "Share link copied!"}
        </div>
      )}
    </>
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
const clampN = (n: number) => Math.max(5, Math.min(99, Math.round(n)));

export function AIPredictions({ deviceName, fingers, styleId, weaponName }: {
  deviceName: string; fingers: number; styleId: string; weaponName: string;
}) {
  const { lang } = useLang();
  const isAr = lang === "ar";

  const sniper = /sniper|AWM|Kar98|M24|Lynx/i.test(weaponName);
  const isHeadshotStyle = styleId === "headshot" || styleId === "sniper";

  const headshot = clampN((sniper ? 70 : 44) + fingers * 3 + (isHeadshotStyle ? 14 : 0) + (styleId === "aggressive" ? 4 : 0));
  const recoilControl = clampN(82 - fingers * 2 + (styleId === "spray" ? 12 : 0) + (styleId === "competitive" ? 6 : 0));
  const tracking = clampN(60 + fingers * 5 + (styleId === "spray" ? 8 : 0) + (styleId === "aggressive" ? 6 : 0));
  const reaction = clampN(55 + fingers * 4 + (styleId === "aggressive" ? 10 : 0));

  const predictions = [
    { icon: "🎯", title: isAr ? "دقة الرأس" : "Headshot Accuracy", value: headshot, bar: "from-orange-500 to-red-500", color: "text-orange-300" },
    { icon: "🔄", title: isAr ? "تحكم الارتداد" : "Recoil Control", value: recoilControl, bar: "from-emerald-500 to-teal-500", color: "text-emerald-300" },
    { icon: "📡", title: isAr ? "تتبع الهدف" : "Target Tracking", value: tracking, bar: "from-sky-500 to-indigo-500", color: "text-sky-300" },
    { icon: "⚡", title: isAr ? "سرعة رد الفعل" : "Reaction Speed", value: reaction, bar: "from-purple-500 to-fuchsia-500", color: "text-purple-300" },
  ];

  return (
    <div className="card neon-box rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xl">🤖</span>
        <h3 className="font-display text-sm font-bold tracking-widest text-white">
          {isAr ? "توقعات الذكاء الاصطناعي" : "AI Predictions"}
        </h3>
        <span className="ml-auto hidden text-[9px] uppercase tracking-widest text-white/30 sm:inline">
          {deviceName} · {fingers}F · {styleId}
        </span>
      </div>
      <div className="space-y-3">
        {predictions.map((p) => (
          <div key={p.title}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-white/70">
                <span>{p.icon}</span>
                <span>{p.title}</span>
              </span>
              <span className={`font-display font-bold tabular-nums ${p.color}`}>{p.value}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div className={`stat-bar h-full rounded-full bg-gradient-to-r ${p.bar}`} style={{ width: `${p.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ AI COACH ============
export function AICoach({ sens, deviceName, weaponName, fingers, styleId }: {
  sens: Sens; deviceName: string; weaponName: string; fingers: number; styleId: string;
}) {
  const { lang } = useLang();
  const isAr = lang === "ar";

  const f = sens.factors;
  const weakest = [f.deviceFactor, f.weaponFactor, f.fingerFactor, f.styleFactor].sort((a, b) => a - b)[0];

  const tips: { icon: string; text: string; textAr: string }[] = [];
  if (f.deviceFactor === weakest)
    tips.push({ icon: "📱", text: "Device factor is lowest — enable max refresh rate & game mode for better response.", textAr: "عامل الجهاز هو الأقل — فعّل أعلى معدل تحديث ووضع اللعبة لاستجابة أفضل." });
  if (f.weaponFactor === weakest)
    tips.push({ icon: "🔫", text: "This weapon has tougher recoil — short controlled bursts beat full spray.", textAr: "هذا السلاح ارتداده أصعب — الطلقات القصيرة المتحكم بها أفضل من الرش الكامل." });
  if (f.fingerFactor === weakest)
    tips.push({ icon: "👆", text: "Add a finger or two for faster multi-action control (scope + move + shoot).", textAr: "أضف إصبعًا أو اثنين للتحكم متعدد الإجراءات بسرعة (سكوب + حركة + إطلاق)." });
  if (sens.aiScore >= 80)
    tips.push({ icon: "🏆", text: "Excellent compatibility — this profile is tournament-ready.", textAr: "توافق ممتاز — هذا البروفايل جاهز للبطولات." });
  else if (sens.aiScore < 60)
    tips.push({ icon: "💡", text: "Compatibility is moderate — try the Balanced profile for a safer baseline.", textAr: "التوافق متوسط — جرّب البروفايل المتوازن كأساس أكثر أمانًا." });
  tips.push({ icon: "🎯", text: `With ${weaponName} (${fingers}F on ${deviceName}): keep crosshair head-level and pre-aim corners for ${styleId} duels.`, textAr: `مع ${weaponName} (${fingers} أصابع على ${deviceName}): أبقِ الكروسهير بمستوى الرأس وصوّب مسبقًا على الزوايا في مبارزات ${styleId}.` });

  return (
    <div className="card rounded-2xl p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xl">🧠</span>
        <h3 className="font-display text-sm font-bold tracking-widest text-white">
          {isAr ? "مدرب الذكاء الاصطناعي" : "AI Coach"}
        </h3>
        <span className="ml-auto hidden text-[9px] uppercase tracking-widest text-white/30 sm:inline">
          {deviceName} · {weaponName}
        </span>
      </div>
      <ul className="space-y-2">
        {tips.slice(0, 4).map((tip, i) => (
          <li key={i} className="flex items-start gap-2.5 rounded-xl border border-white/8 bg-white/[0.02] p-2.5">
            <span className="text-base">{tip.icon}</span>
            <span className="text-xs leading-relaxed text-white/70">{isAr ? tip.textAr : tip.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
