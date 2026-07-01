import { useEffect, useMemo, useState } from "react";
import { BRANDS, WEAPONS, FINGERS, PRO_PROFILES, type ProProfileId } from "./data";
import { computeSensitivity, SensitivityTable, FactorsPanel, CopyButton, type Sens, type SensParams, type GyroMode } from "./sensitivity";
import { PingMonitor } from "./PingMonitor";
import { DnsMonitor } from "./DnsMonitor";
import { AICoach } from "./AICoach";
import { PacSection } from "./PacSection";
import { HudPreview } from "./HudPreview";
import { Hero } from "./Hero";
import { StatusBar } from "./StatusBar";
import { Particles } from "./Particles";
import { RevealSection, RatingSection, ShareButton, AIPredictions } from "./Features";
import { TouchTest } from "./TouchTest";
import { QuickSearch } from "./QuickSearch";
import { PWABanner } from "./PWABanner";
import { ScreenRecorder } from "./ScreenRecorder";
import { DPICalculator } from "./DPICalculator";
import { MusicPlayer } from "./MusicPlayer";
import { useLang } from "./LanguageContext";
import { t } from "./i18n";
import { SectionHeader } from "./sensitivity";

type SavedProfile = {
  id: string;
  name: string;
  params: SensParams;
  savedAt: number;
};

const LS_KEY = "alyazouri_profiles_v1";

function loadProfiles(): SavedProfile[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as SavedProfile[]) : [];
  } catch { return []; }
}

function saveProfiles(list: SavedProfile[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(list.slice(0, 5)));
}

const PRO_RECOMMENDATIONS: Record<ProProfileId, {
  gyro: "off" | "scope" | "always"; minFingers: 2 | 3 | 4 | 5 | 6;
  weaponFocus: string[]; weaponFocusAr: string[];
  preferredWeaponCat: string; preferredWeaponName: string;
  note: string; noteAr: string;
  warmup: string[]; warmupAr: string[];
  featureStack: string[]; featureStackAr: string[];
}> = {
  aggressive: {
    gyro: "always", minFingers: 4,
    weaponFocus: ["SMG", "AR", "TDM", "Rush"], weaponFocusAr: ["SMG", "AR", "TDM", "هجوم"],
    preferredWeaponCat: "smg", preferredWeaponName: "UMP45",
    note: "High speed and fast entry for building fights.",
    noteAr: "سرعة عالية ودخول سريع لمعارك المباني.",
    warmup: ["5 min TDM rush", "Red Dot tracking", "90° flicks"],
    warmupAr: ["5 دقائق TDM هجوم", "تتبع Red Dot", "فليك 90°"],
    featureStack: ["Touch Test", "Share", "Recorder"],
    featureStackAr: ["اختبار اللمس", "مشاركة", "مسجّل"],
  },
  balanced: {
    gyro: "scope", minFingers: 4,
    weaponFocus: ["AR", "DMR", "Ranked", "Classic"], weaponFocusAr: ["AR", "DMR", "ترتيب", "كلاسيكي"],
    preferredWeaponCat: "ar", preferredWeaponName: "M416",
    note: "Daily safe setup for ranked and stable muscle memory.",
    noteAr: "إعداد آمن يومي للترتيب والذاكرة العضلية الثابتة.",
    warmup: ["3 min burst control", "2 min 2x tracking", "1 classic match"],
    warmupAr: ["3 دقائق تحكم رش", "دقيقتان تتبع 2x", "مباراة كلاسيكية واحدة"],
    featureStack: ["DPI Calculator", "Touch Test", "Saved Profiles"],
    featureStackAr: ["حاسبة DPI", "اختبار اللمس", "البروفايلات المحفوظة"],
  },
  competitive: {
    gyro: "always", minFingers: 5,
    weaponFocus: ["AR", "DMR", "Snipers", "Conqueror"], weaponFocusAr: ["AR", "DMR", "قناصة", "فاتح"],
    preferredWeaponCat: "ar", preferredWeaponName: "AUG",
    note: "Tournament-grade stability with strict recoil discipline.",
    noteAr: "ثبات بمستوى البطولات مع انضباط صارم للارتداد.",
    warmup: ["10 min 4x spray", "3x tracking", "peek + drag drills"],
    warmupAr: ["10 دقائق رش 4x", "تتبع 3x", "تمارين peek + drag"],
    featureStack: ["DPI Calculator", "Quick Search", "Saved Profiles"],
    featureStackAr: ["حاسبة DPI", "بحث سريع", "البروفايلات المحفوظة"],
  },
  headshot_pro: {
    gyro: "always", minFingers: 5,
    weaponFocus: ["Sniper", "DMR", "Headshot", "Precision"], weaponFocusAr: ["قناص", "DMR", "رأس", "دقة"],
    preferredWeaponCat: "dmr", preferredWeaponName: "Mini14",
    note: "Built for head-level tracking and micro-corrections.",
    noteAr: "مبني لتتبع مستوى الرأس والتصحيحات الدقيقة.",
    warmup: ["Single-tap drills", "6x head tracking", "micro gyro practice"],
    warmupAr: ["تمارين نقرة واحدة", "تتبع رأس 6x", "تدريب جايرو دقيق"],
    featureStack: ["Touch Test", "DPI Calculator", "Screen Recorder"],
    featureStackAr: ["اختبار اللمس", "حاسبة DPI", "مسجّل الشاشة"],
  },
  sniper_elite: {
    gyro: "always", minFingers: 4,
    weaponFocus: ["AWM", "M24", "Kar98k", "6x/8x"], weaponFocusAr: ["AWM", "M24", "Kar98k", "6x/8x"],
    preferredWeaponCat: "sniper", preferredWeaponName: "AWM",
    note: "Ultra-stable sniper setup for disciplined long-range play.",
    noteAr: "إعداد قناص فائق الثبات للعب بعيد المدى المنضبط.",
    warmup: ["6x hold drill", "8x breath control", "one-shot rhythm"],
    warmupAr: ["تمرين تثبيت 6x", "تحكم تنفس 8x", "إيقاع طلقة واحدة"],
    featureStack: ["DPI Calculator", "Recorder", "Share"],
    featureStackAr: ["حاسبة DPI", "مسجّل", "مشاركة"],
  },
  spray_master: {
    gyro: "always", minFingers: 4,
    weaponFocus: ["M416", "SCAR-L", "AKM", "TDM"], weaponFocusAr: ["M416", "SCAR-L", "AKM", "TDM"],
    preferredWeaponCat: "ar", preferredWeaponName: "M416",
    note: "Laser-beam spray patterns for mid-range dominance.",
    noteAr: "أنماط رش ليزرية لهيمنة المدى المتوسط.",
    warmup: ["10 min 3x spray", "recoil reset", "move+fire sync"],
    warmupAr: ["10 دقائق رش 3x", "إعادة ضبط ارتداد", "مزامنة حركة+نار"],
    featureStack: ["Touch Test", "DPI Calculator", "Recorder"],
    featureStackAr: ["اختبار اللمس", "حاسبة DPI", "مسجّل"],
  },
};

export function App() {
  const { lang } = useLang();
  const [brandId, setBrandId] = useState(BRANDS[0].id);
  const [deviceId, setDeviceId] = useState(BRANDS[0].devices[0].name);
  const [weaponId, setWeaponId] = useState(WEAPONS[0].id);
  const [weaponName, setWeaponName] = useState(WEAPONS[0].weapons[0].name);
  const [fingers, setFingers] = useState<2 | 3 | 4 | 5 | 6>(4);
  const [styleId, setStyleId] = useState("balanced");
  const [gyroMode, setGyroMode] = useState<GyroMode>("scope");
  const [proProfile, setProProfile] = useState<ProProfileId>("balanced");
  const [profiles, setProfiles] = useState<SavedProfile[]>(() => loadProfiles());
  const [ping, setPing] = useState<number | null>(null);

  const brand = BRANDS.find((b) => b.id === brandId) ?? BRANDS[0];
  const device = brand.devices.find((d) => d.name === deviceId) ?? brand.devices[0];
  const weaponCat = WEAPONS.find((c) => c.id === weaponId) ?? WEAPONS[0];
  const weapon = weaponCat.weapons.find((w) => w.name === weaponName) ?? weaponCat.weapons[0];

  // Auto-switch device when brand changes
  useEffect(() => {
    const b = BRANDS.find((br) => br.id === brandId);
    if (b && b.devices[0]) setDeviceId(b.devices[0].name);
  }, [brandId]);

  // Auto-switch weapon when category changes
  useEffect(() => {
    const c = WEAPONS.find((cat) => cat.id === weaponId);
    if (c && c.weapons[0]) setWeaponName(c.weapons[0].name);
  }, [weaponId]);

  // Simulate ping
  useEffect(() => {
    const interval = setInterval(() => {
      const base = 15;
      const variance = (Math.random() - 0.5) * 10;
      setPing(Math.max(8, Math.round(base + variance)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const params: SensParams = useMemo(() => ({
    deviceId: `${brandId}|${deviceId}`,
    device, brandId, fingers, styleId, gyroMode,
    weaponId, weaponName, weaponRecoil: weapon.recoil,
    weaponRange: weapon.range, weaponType: weapon.type,
    proProfile,
  }), [brandId, deviceId, device, fingers, styleId, gyroMode, weaponId, weaponName, weapon, proProfile]);

  const sens: Sens = useMemo(() => computeSensitivity(params), [params]);

  const saveProfile = () => {
    const name = `${device.name} · ${weapon.name} · ${fingers}F`;
    const p: SavedProfile = { id: `${Date.now()}`, name, params, savedAt: Date.now() };
    const next = [p, ...profiles].slice(0, 5);
    setProfiles(next);
    saveProfiles(next);
  };

  const loadProfile = (p: SavedProfile) => {
    setBrandId(p.params.brandId);
    setDeviceId(p.params.device.name);
    setFingers(p.params.fingers as 2 | 3 | 4 | 5 | 6);
    setStyleId(p.params.styleId);
    setGyroMode(p.params.gyroMode);
    setWeaponId(p.params.weaponId);
    setWeaponName(p.params.weaponName);
    if (p.params.proProfile) setProProfile(p.params.proProfile as ProProfileId);
  };

  return (
    <div className="relative min-h-screen">
      <Particles />
      <StatusBar ping={ping} />
      <Hero ping={ping} />

      <div className="mx-auto max-w-7xl px-5 pb-24 relative z-10">
        {/* Generator */}
        <section id="generator" className="mt-12 scroll-mt-20">
          <SectionHeader
            eyebrow={t("sec_generator_eyebrow", lang)}
            title={t("sec_generator_title", lang)}
            subtitle={t("sec_generator_sub", lang)}
          />

          <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
            {/* Controls */}
            <div className="space-y-5">
              {/* Quick Search */}
              <QuickSearch
                onSelect={(r) => {
                  if (r.type === "device") {
                    const [bid, dname] = r.id.split("|");
                    setBrandId(bid); setDeviceId(dname);
                  } else {
                    const cat = WEAPONS.find((c) => c.weapons.some((w) => w.name === r.id));
                    if (cat) { setWeaponId(cat.id); setWeaponName(r.id); }
                  }
                }}
              />

              {/* Device */}
              <div className="card rounded-2xl p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-lg">📱</span>
                  <h3 className="font-display text-sm font-bold tracking-widest text-white">{t("device_select", lang)}</h3>
                </div>
                <div className="space-y-2">
                  <select value={brandId} onChange={(e) => setBrandId(e.target.value)} className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white transition-colors focus:border-orange-400/50 focus:outline-none">
                    {BRANDS.map((b) => (<option key={b.id} value={b.id}>{b.icon} {b.name}</option>))}
                  </select>
                  <select value={deviceId} onChange={(e) => setDeviceId(e.target.value)} className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white transition-colors focus:border-orange-400/50 focus:outline-none">
                    {brand.devices.map((d) => (<option key={d.name} value={d.name}>{d.name}</option>))}
                  </select>
                </div>
                <div className="mt-3 rounded-lg border border-white/5 bg-black/30 p-3 text-sm">
                  <span className="text-white/50">{t("device_selected", lang)}</span> <b className="text-orange-300">{device.name}</b>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="rounded bg-black/40 px-2 py-0.5 font-display">{device.fps} FPS</span>
                    <span className="rounded bg-black/40 px-2 py-0.5 font-display">{device.touchRate} Hz</span>
                    <span className="rounded bg-black/40 px-2 py-0.5 font-display">{device.screenSize}"</span>
                    <span className={`rounded px-2 py-0.5 font-display ${device.gyroQuality === "excellent" ? "bg-emerald-500 text-emerald-300" : device.gyroQuality === "good" ? "bg-amber-500 text-amber-300" : "bg-red-500 text-red-300"}`}>
                      {device.gyroQuality === "excellent" ? t("device_gyro_excellent", lang) : device.gyroQuality === "good" ? t("device_gyro_good", lang) : t("device_gyro_average", lang)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Gyro Mode */}
              <div className="card rounded-2xl p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-display text-sm font-bold tracking-widest text-white">{t("gyro_title", lang)}</h3>
                  <span className="rounded-full bg-orange-500/15 px-2.5 py-0.5 text-[10px] font-bold text-orange-300">
                    {gyroMode === "off" ? t("gyro_status_off", lang) : gyroMode === "scope" ? t("gyro_status_scope", lang) : t("gyro_status_always", lang)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { id: "off", icon: "⭕", label: t("gyro_off", lang), desc: t("gyro_off_desc", lang) },
                    { id: "scope", icon: "🎯", label: t("gyro_scope", lang), desc: t("gyro_scope_desc", lang) },
                    { id: "always", icon: "🔄", label: t("gyro_always", lang), desc: t("gyro_always_desc", lang) },
                  ] as const).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setGyroMode(m.id)}
                      className={`rounded-xl border p-3 text-center transition-all ${
                        gyroMode === m.id ? "border-orange-400/50 bg-orange-500/10" : "border-white/5 bg-black/20 hover:border-white/20"
                      }`}
                    >
                      <div className="text-2xl">{m.icon}</div>
                      <div className="mt-1 text-xs font-bold text-white">{m.label}</div>
                      <div className="mt-0.5 text-[9px] text-white/50">{m.desc}</div>
                    </button>
                  ))}
                </div>
                <div className="mt-3 rounded-lg bg-black/20 px-3 py-2 text-xs text-white/60">
                  {gyroMode === "off" && t("gyro_msg_off", lang)}
                  {gyroMode === "scope" && t("gyro_msg_scope", lang)}
                  {gyroMode === "always" && t("gyro_msg_always", lang)}
                </div>
              </div>

              {/* Pro Profile */}
              <div className="card neon-box rounded-2xl p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-display text-sm font-bold tracking-widest text-white">
                    🏆 {lang === "ar" ? "البروفايل الاحترافي" : "Pro Profile"}
                  </h3>
                  <span className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-2.5 py-0.5 text-[9px] font-bold text-white">PRO</span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {PRO_PROFILES.map((pr) => (
                    <button
                      key={pr.id}
                      onClick={() => setProProfile(pr.id)}
                      className={`rounded-xl border p-2.5 text-center transition-all ${
                        proProfile === pr.id ? "border-purple-400/50 bg-purple-500/10" : "border-white/5 bg-black/20 hover:border-white/20"
                      }`}
                    >
                      <div className="text-2xl">{pr.emoji}</div>
                      <div className="mt-1 text-[10px] font-bold text-white">{pr.name}</div>
                    </button>
                  ))}
                </div>
                {(() => {
                  const pr = PRO_PROFILES.find(p => p.id === proProfile);
                  const rec = PRO_RECOMMENDATIONS[proProfile];
                  if (!pr) return null;
                  const stats = [
                    { k: lang === "ar" ? "تحكم ارتداد" : "Recoil", v: pr.recoilControl, c: "bg-red-500" },
                    { k: lang === "ar" ? "تتبع" : "Tracking", v: pr.tracking, c: "bg-emerald-500" },
                    { k: lang === "ar" ? "فليك" : "Flicking", v: pr.flicking, c: "bg-sky-500" },
                    { k: lang === "ar" ? "بعيد" : "Long Range", v: pr.longRange, c: "bg-purple-500" },
                    { k: lang === "ar" ? "قريب" : "CQC", v: pr.cqcPower, c: "bg-orange-500" },
                  ];
                  return (
                    <div className="mt-3 space-y-3">
                      <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                        <p className="text-xs text-white/70">{lang === "ar" ? pr.descriptionAr : pr.description}</p>
                      </div>
                      <div className="space-y-2">
                        {stats.map((s) => (
                          <div key={s.k} className="flex items-center gap-2">
                            <span className="w-20 shrink-0 text-[10px] text-white/60">{s.k}</span>
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                              <div className={`h-full ${s.c}`} style={{ width: `${s.v}%` }} />
                            </div>
                            <span className="font-display text-[10px] font-bold text-white/80 w-5 text-right">{s.v}</span>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <div className="rounded-lg border border-emerald-400/10 bg-emerald-500/5 p-2.5">
                          <div className="text-[10px] font-bold text-emerald-300">✅ {lang === "ar" ? "القوة" : "Strengths"}</div>
                          {(lang === "ar" ? pr.strengthsAr : pr.strengths).map((s, i) => (
                            <div key={i} className="mt-1 flex items-start gap-1 text-[10px] text-white/70">
                              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />{s}
                            </div>
                          ))}
                        </div>
                        <div className="rounded-lg border border-amber-400/10 bg-amber-500/5 p-2.5">
                          <div className="text-[10px] font-bold text-amber-300">⚠️ {lang === "ar" ? "الضعف" : "Weak"}</div>
                          {(lang === "ar" ? pr.weaknessesAr : pr.weaknesses).map((s, i) => (
                            <div key={i} className="mt-1 flex items-start gap-1 text-[10px] text-white/70">
                              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-amber-400" />{s}
                            </div>
                          ))}
                        </div>
                        <div className="rounded-lg border border-sky-400/10 bg-sky-500/5 p-2.5">
                          <div className="text-[10px] font-bold text-sky-300">🎯 {lang === "ar" ? "الأفضل لـ" : "Best for"}</div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {(lang === "ar" ? pr.bestForAr : pr.bestFor).map((s, i) => (
                              <span key={i} className="rounded bg-sky-500/10 px-1.5 py-0.5 text-[8px] font-semibold text-sky-300">{s}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <div className="rounded-lg border border-purple-400/10 bg-purple-500/5 p-3">
                          <div className="text-[10px] font-bold text-purple-300">PRO MAX</div>
                          <div className="space-y-1.5 text-[10px] text-white/65">
                            <div className="flex justify-between"><span>{lang === "ar" ? "وضع الجايرو الموصى" : "Recommended Gyro"}</span><span className="rounded bg-purple-500/10 px-2 py-0.5 font-bold text-purple-300">{rec.gyro}</span></div>
                            <div className="flex justify-between"><span>{lang === "ar" ? "أقل أصابع مناسب" : "Recommended Fingers"}</span><span className="rounded bg-purple-500/10 px-2 py-0.5 font-bold text-purple-300">{rec.minFingers}F</span></div>
                            <div className="flex justify-between"><span>{lang === "ar" ? "السلاح المقترح" : "Suggested Weapon"}</span><span className="rounded bg-purple-500/10 px-2 py-0.5 font-bold text-purple-300">{rec.preferredWeaponName}</span></div>
                            <div className="flex justify-between"><span>{lang === "ar" ? "أنسب فئة أسلحة" : "Best Weapon Focus"}</span><span className="text-right text-purple-300 font-semibold">{(lang === "ar" ? rec.weaponFocusAr : rec.weaponFocus).join(" · ")}</span></div>
                          </div>
                        </div>
                        <div className="rounded-lg border border-fuchsia-400/10 bg-fuchsia-500/5 p-3">
                          <div className="text-[10px] font-bold text-fuchsia-300">INSIGHT</div>
                          <p className="mt-1 text-[10px] text-white/65">{lang === "ar" ? rec.noteAr : rec.note}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <div className="rounded-lg border border-cyan-400/10 bg-cyan-500/5 p-3">
                          <div className="text-[10px] font-bold text-cyan-300">TOOL STACK</div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {(lang === "ar" ? rec.featureStackAr : rec.featureStack).map((s, i) => (
                              <span key={i} className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[8px] font-semibold text-cyan-300">{s}</span>
                            ))}
                          </div>
                        </div>
                        <div className="rounded-lg border border-lime-400/10 bg-lime-500/5 p-3">
                          <div className="text-[10px] font-bold text-lime-300">WARM-UP</div>
                          <div className="space-y-1">
                            {(lang === "ar" ? rec.warmupAr : rec.warmup).map((s, i) => (
                              <div key={i} className="mt-1 flex items-start gap-1 text-[10px] text-white/70">
                                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-lime-400" />{s}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Fingers + Style */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="card rounded-2xl p-5">
                  <h3 className="mb-3 font-display text-sm font-bold tracking-widest text-white">{t("fingers_title", lang)}</h3>
                  <div className="grid grid-cols-5 gap-1.5">
                    {FINGERS.map((f) => (
                      <button
                        key={f}
                        onClick={() => setFingers(f)}
                        className={`rounded-lg border py-2 text-sm font-bold transition-all ${
                          fingers === f ? "border-orange-400 bg-orange-500/15 text-orange-300" : "border-white/5 bg-black/20 text-white/70 hover:border-white/20"
                        }`}
                      >
                        {f}F
                      </button>
                    ))}
                  </div>
                </div>
                <div className="card rounded-2xl p-5">
                  <h3 className="mb-3 font-display text-sm font-bold tracking-widest text-white">{lang === "ar" ? "أسلوب اللعب" : "Play Style"}</h3>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "balanced", label: lang === "ar" ? "متوازن" : "Balanced", icon: "⚖️" },
                      { id: "aggressive", label: lang === "ar" ? "عدواني" : "Aggressive", icon: "⚡" },
                      { id: "headshot", label: lang === "ar" ? "رأس" : "Headshot", icon: "🎯" },
                      { id: "spray", label: lang === "ar" ? "رش" : "Spray", icon: "💧" },
                      { id: "competitive", label: lang === "ar" ? "بطولة" : "Compete", icon: "🏆" },
                      { id: "close", label: lang === "ar" ? "قريب" : "Close", icon: "🔥" },
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setStyleId(s.id)}
                        className={`rounded-lg border py-2 text-[10px] font-bold transition-all ${
                          styleId === s.id ? "border-orange-400 bg-orange-500/15 text-orange-300" : "border-white/5 bg-black/20 text-white/70 hover:border-white/20"
                        }`}
                      >
                        <div className="text-lg">{s.icon}</div>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Weapon */}
              <div className="card rounded-2xl p-5">
                <h3 className="mb-3 font-display text-sm font-bold tracking-widest text-white">{t("weapon_title", lang)}</h3>
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {WEAPONS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setWeaponId(c.id)}
                      className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all ${
                        weaponId === c.id ? "border-orange-400/50 bg-orange-500/15 text-orange-300" : "border-white/5 bg-black/20 text-white/70 hover:border-white/20"
                      }`}
                    >
                      {c.icon} {c.name}
                    </button>
                  ))}
                </div>
                <select value={weaponName} onChange={(e) => setWeaponName(e.target.value)} className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-orange-400/50 focus:outline-none">
                  {weaponCat.weapons.map((w) => (<option key={w.name} value={w.name}>{w.name}</option>))}
                </select>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg border border-white/5 bg-black/30 p-2.5">
                    <div className="text-[10px] text-white/40">{t("weapon_recoil", lang)}</div>
                    <div className="font-display text-lg font-bold text-red-300 tabular-nums">🔥 {weapon.recoil}</div>
                  </div>
                  <div className="rounded-lg border border-white/5 bg-black/30 p-2.5">
                    <div className="text-[10px] text-white/40">{t("weapon_range", lang)}</div>
                    <div className="font-display text-lg font-bold text-emerald-300 tabular-nums">🎯 {weapon.range}</div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2">
                <CopyButton sens={sens} lang={lang} />
                <ShareButton sens={sens} deviceName={device.name} weaponName={weapon.name} />
                <button onClick={saveProfile} className="btn-ghost w-full rounded-xl px-5 py-3 text-sm">
                  💾 {lang === "ar" ? "حفظ البروفايل" : "Save Profile"}
                </button>
              </div>
            </div>

            {/* Output */}
            <div className="space-y-5">
              {/* AI Score */}
              <div className="card relative overflow-hidden rounded-2xl p-5">
                <div className="absolute inset-0 bg-grid opacity-20" />
                <div className="relative flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-white/50">{t("ai_score_label", lang)}</div>
                    <div className="mt-1 text-lg font-bold text-white">{t("ai_score_title", lang)}</div>
                    <div className="mt-1 text-xs text-white/50">
                      {device.name} · {weapon.name} · {fingers} {t("ai_suffix", lang)}
                    </div>
                  </div>
                  <div className="relative h-28 w-28">
                    <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                      <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" />
                      <circle cx="50" cy="50" r="42" stroke="url(#grad)" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={`${(sens.aiScore / 100) * 264} 264`} />
                      <defs>
                        <linearGradient id="grad" x1="0" x2="1">
                          <stop offset="0%" stopColor="#ff7a00" />
                          <stop offset="100%" stopColor="#ffd166" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="font-display text-3xl font-black text-white tabular-nums">{sens.aiScore}</div>
                      <div className="text-[9px] uppercase tracking-widest text-orange-300">AI SCORE</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Factors */}
              <FactorsPanel sens={sens} />

              {/* Sensitivity tables */}
              <div className="space-y-4">
                {/* Camera + ADS side-by-side on desktop, stacked on mobile */}
                <div className="grid gap-4 lg:grid-cols-2">
                  <SensitivityTable label={t("sens_camera", lang)} data={sens.cam} color="orange" />
                  <SensitivityTable label={t("sens_ads", lang)} data={sens.ads} color="orange" />
                </div>
                {gyroMode === "off" ? (
                  <div className="card flex flex-col items-center justify-center rounded-2xl p-8 text-center">
                    <div className="text-4xl">⭕</div>
                    <div className="mt-2 text-lg font-bold text-white">{t("gyro_disabled_title", lang)}</div>
                    <div className="mt-1 text-sm text-white/60">{t("gyro_disabled_msg", lang)}</div>
                  </div>
                ) : (
                  <div className="grid gap-4 lg:grid-cols-2">
                    <SensitivityTable label={t("sens_gyro_cam", lang)} data={sens.gyroCam} color="sky" showTppFpp={gyroMode === "always"} />
                    <SensitivityTable label={t("sens_gyro_ads", lang)} data={sens.gyroAds} color="sky" showTppFpp={gyroMode === "always"} />
                  </div>
                )}
              </div>

              {/* Free Look */}
              <div className="card rounded-2xl p-5">
                <h4 className="mb-3 font-display text-sm font-bold tracking-widest text-white/90">{t("sens_freelook", lang)}</h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {Object.entries(sens.freeLook).map(([k, v]) => {
                    const labelKey = k === "cam" ? "sens_freelook_cam" : k === "parashoot" ? "sens_freelook_para" : "sens_freelook_vehicle";
                    return (
                      <div key={k} className="rounded-xl border border-white/5 bg-black/30 p-3">
                        <div className="text-[10px] uppercase tracking-widest text-white/40">{t(labelKey as Parameters<typeof t>[0], lang)}</div>
                        <div className="mt-1 font-display text-lg font-bold text-white tabular-nums">{v}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI Predictions */}
              <AIPredictions deviceName={device.name} fingers={fingers} styleId={styleId} weaponName={weapon.name} />

              {/* AI Coach - Full Analysis */}
              <AICoach sens={sens} params={params} />

              {/* Touch Speed Test */}
              <TouchTest />

              {/* DPI Calculator */}
              <DPICalculator />

              {/* Screen Recorder */}
              <ScreenRecorder />

              {/* HUD + Stability Analysis */}
              <div className="grid gap-4 lg:grid-cols-2">
                <HudPreview fingers={fingers} />
                <div className="card rounded-2xl p-5">
                  <h4 className="mb-3 font-display text-sm font-bold tracking-widest text-white/90">
                    {t("stability_title", lang)}
                  </h4>
                  <div className="space-y-3">
                    {[
                      { label: t("stability_device", lang), value: (sens.factors.deviceFactor * 100).toFixed(0), color: "from-orange-500 to-red-500" },
                      { label: t("stability_weapon", lang), value: (sens.factors.weaponFactor * 100).toFixed(0), color: "from-amber-500 to-orange-500" },
                      { label: t("stability_fingers", lang), value: (sens.factors.fingerFactor * 100).toFixed(0), color: "from-emerald-500 to-teal-500" },
                      { label: t("stability_style", lang), value: (sens.factors.styleFactor * 100).toFixed(0), color: "from-sky-500 to-indigo-500" },
                    ].map((item) => (
                      <div key={item.label} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-white/70">{item.label}</span>
                          <span className="font-display font-bold text-white tabular-nums">{item.value}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                          <div className={`h-full bg-gradient-to-r ${item.color} stat-bar`} style={{ width: `${item.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-lg bg-black/20 p-3 text-[10px] text-white/60">
                    {t("stability_equation", lang)}<br />
                    {t("stability_desc", lang)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ping */}
        <section id="ping" className="mt-20 scroll-mt-20">
          <SectionHeader eyebrow={t("ping_eyebrow", lang)} title={t("ping_title", lang)} subtitle={t("ping_sub", lang)} />
          <PingMonitor />
        </section>

        {/* DNS Jordan */}
        <section id="dns" className="mt-20 scroll-mt-20">
          <SectionHeader
            eyebrow="DNS JORDAN · LIVE"
            title={lang === "ar" ? "🛡️ أسرع DNS أردني" : "🛡️ Fastest Jordan DNS"}
            subtitle={lang === "ar" ? "اختبار مباشر لـ 9 خوادم DNS محلية لأفضل بينغ ممكن" : "Live test of 9 local DNS servers for the lowest possible ping"}
          />
          <DnsMonitor />
        </section>

        {/* Weapons database */}
        <section id="weapons" className="mt-20 scroll-mt-20">
          <SectionHeader eyebrow={t("weapons_eyebrow", lang)} title={t("weapons_title", lang)} subtitle={t("weapons_sub", lang)} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WEAPONS.map((c) => (
              <div key={c.id} className="card rounded-2xl p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{c.icon}</span>
                    <h4 className="font-display text-sm font-bold tracking-widest text-white">{c.name}</h4>
                  </div>
                  <span className="rounded-full bg-orange-500/15 px-2.5 py-0.5 text-[10px] font-bold text-orange-300">
                    {c.weapons.length}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {c.weapons.map((w) => (
                    <div key={w.name} className="flex items-center justify-between rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-xs">
                      <span className="font-semibold text-white">{w.name}</span>
                      <span className="flex gap-2 text-white/60">
                        <span>🔥 {w.recoil}</span>
                        <span>🎯 {w.range}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Equations */}
        <section className="mt-20">
          <SectionHeader eyebrow={t("eq_eyebrow", lang)} title={t("eq_title", lang)} subtitle={t("eq_sub", lang)} />
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { k: "R_s", label: t("eq_rs", lang), eq: "(FPS × TSR × G_s) / (H_d × R_c)" },
              { k: "G_y", label: t("eq_gy", lang), eq: "(T_s × FPS) / (L_d + H_t)" },
              { k: "H_d", label: t("eq_hd", lang), eq: "(T_r × FPS) / D_l" },
            ].map((e) => (
              <div key={e.k} className="card rounded-2xl p-5">
                <div className="font-display text-xs text-orange-300">{e.k}</div>
                <div className="mt-1 text-sm font-bold text-white">{e.label}</div>
                <div className="mt-3 rounded-lg bg-black/40 p-3 font-mono text-xs text-emerald-300">
                  {e.eq}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Saved */}
        <section className="mt-20">
          <SectionHeader eyebrow={t("saved_eyebrow", lang)} title={t("saved_title", lang)} subtitle={t("saved_sub", lang)} />
          <div className="card rounded-2xl p-5">
            {profiles.length === 0 ? (
              <div className="py-10 text-center text-white/50">
                <div className="text-4xl">🗂️</div>
                <div className="mt-3 text-sm">{t("saved_empty", lang)}</div>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => loadProfile(p)}
                    className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-right transition-all hover:border-orange-400/30 hover:bg-white/[0.04]"
                  >
                    <div className="font-bold text-white">{p.name}</div>
                    <div className="mt-1 text-[10px] text-white/50">
                      {new Date(p.savedAt).toLocaleString("ar-JO")}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* PAC */}
        <section id="pac" className="mt-20 scroll-mt-20">
          <SectionHeader eyebrow={t("pac_eyebrow", lang)} title={t("pac_title", lang)} subtitle={t("pac_sub", lang)} />
          <PacSection />
        </section>

        {/* Rating */}
        <RevealSection className="mt-20">
          <RatingSection />
        </RevealSection>

        {/* About / Footer */}
        <div className="card mt-20 scroll-mt-20 rounded-3xl p-6 sm:p-8" id="about">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-[0_0_20px_rgba(255,122,0,0.4)]">
                  <span className="font-display text-xl font-black text-white">A</span>
                </div>
                <div>
                  <div className="font-display text-xl font-black text-white">ALYAZOURI</div>
                  <div className="text-[10px] uppercase tracking-widest text-orange-300/70">Jordan Gaming Optimizer 2026</div>
                </div>
              </div>
              <p className="mt-4 text-sm text-white/60">
                {t("footer_about", lang)}
              </p>
            </div>
            <div>
              <h4 className="font-display text-sm font-bold tracking-widest text-orange-300">{t("footer_features", lang)}</h4>
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                <li>{t("footer_f1", lang)}</li>
                <li>{t("footer_f2", lang)}</li>
                <li>{t("footer_f3", lang)}</li>
                <li>{t("footer_f4", lang)}</li>
                <li>{t("footer_f5", lang)}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-display text-sm font-bold tracking-widest text-orange-300">{lang === "ar" ? "تواصل" : "Connect"}</h4>
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                <li><a href="https://tiktok.com/@sceedalyazouri0" target="_blank" rel="noreferrer" className="hover:text-orange-300">🎵 TikTok @sceedalyazouri0</a></li>
                <li><a href="https://instagram.com/sceedjor11" target="_blank" rel="noreferrer" className="hover:text-orange-300">📷 Instagram @sceedjor11</a></li>
                <li>
                  <a href="mailto:saeedjor11@gmail.com" className="inline-flex items-center gap-2 rounded-lg border border-orange-400/30 bg-orange-500/10 px-3 py-1.5 text-xs font-bold text-orange-300 transition-all hover:bg-orange-500/20">
                    📧 saeedjor11@gmail.com
                  </a>
                </li>
                <li className="text-xs text-white/50">{lang === "ar" ? "للمساعدة والدعم الفني" : "For help & technical support"}</li>
                <li>🎮 PUBG ID: <b className="font-display text-white">5744469523</b></li>
                <li>🇯🇴 Jordan</li>
              </ul>
            </div>
          </div>
          <div className="divider my-6" />
          <div className="flex flex-col items-center justify-between gap-2 text-xs text-white/40 sm:flex-row">
            <span>{t("footer_rights", lang)}</span>
            <span className="font-display tracking-widest">{t("footer_tagline", lang)}</span>
          </div>
        </div>
      </div>

      <PWABanner />
      <MusicPlayer />
    </div>
  );
}

export default App;
