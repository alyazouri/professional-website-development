import { useState, useEffect, useMemo } from "react";
import { useLang } from "./LanguageContext";
import { t } from "./i18n";
import { BRANDS, WEAPONS, FINGERS, PRO_PROFILES, PRO_RECOMMENDATIONS, SERVERS, type Device, type Weapon } from "./data";
import { computeSensitivity, SensTable, FactorsCard, type SavedProfile } from "./sensitivity";
import { Hero } from "./Hero";
import { StatusBar } from "./StatusBar";
import { Particles } from "./Particles";
import { QuickSearch } from "./QuickSearch";
import { PingMonitor, DnsMonitor } from "./PingMonitor";
import { PacSection } from "./PacSection";
import { MusicPlayer } from "./MusicPlayer";
import { PWABanner } from "./PWABanner";
import { AIPredictions, AICoach, RatingSection, CodeExportButton, ShareCard } from "./Features";
import { PatchMonitor } from "./PatchMonitor";
import { NetworkHeatmap } from "./NetworkHeatmap";
import { findClosestPros } from "./SensitivityOptimizer";

const PROFILES_KEY = "alyazouri_profiles";

const gyroModes = [
  { id: "off" as const, icon: "⭕" },
  { id: "scope" as const, icon: "🎯" },
  { id: "always" as const, icon: "🔄" },
];

const playStyles = [
  { id: "balanced", icon: "⚖️", ar: "متوازن", en: "Balanced" },
  { id: "aggressive", icon: "⚡", ar: "عدواني", en: "Aggressive" },
  { id: "headshot", icon: "🎯", ar: "هيدشوت", en: "Headshot" },
  { id: "sniper", icon: "🔭", ar: "قنّاص", en: "Sniper" },
  { id: "spray", icon: "💧", ar: "رش", en: "Spray" },
  { id: "close", icon: "💢", ar: "قريب", en: "Close" },
  { id: "closespray", icon: "🔥", ar: "رش قريب", en: "Close Spray" },
  { id: "longspray", icon: "🎯", ar: "ثبات بعيد", en: "Long Spray" },
];

export default function App() {
  const { lang } = useLang();
  const isAr = lang === "ar";

  const [ping, setPing] = useState<number | null>(null);
  const [brandId, setBrandId] = useState(BRANDS[0].id);
  const [device, setDevice] = useState<Device>(BRANDS[0].devices[0]);
  const [gyroMode, setGyroMode] = useState<"off" | "scope" | "always">("scope");
  const [proProfile, setProProfile] = useState(PRO_PROFILES[0].id);
  const [fingers, setFingers] = useState(4);
  const [styleId, setStyleId] = useState("balanced");
  const [weaponCatId, setWeaponCatId] = useState(WEAPONS[0].id);
  const [weapon, setWeapon] = useState<Weapon>(WEAPONS[0].weapons[0]);
  const [copied, setCopied] = useState(false);

  const [profiles, setProfiles] = useState<SavedProfile[]>(() => {
    try { return JSON.parse(localStorage.getItem(PROFILES_KEY) || "[]"); } catch { return []; }
  });

  // ---- live ping to nearest (ME) server on mount ----
  useEffect(() => {
    let done = false;
    const start = performance.now();
    const img = new Image();
    const finish = (v: number) => { if (!done) { done = true; setPing(v); } };
    const timer = setTimeout(() => finish(50), 3000);
    img.onload = () => { clearTimeout(timer); finish(Math.max(8, Math.round(performance.now() - start))); };
    img.onerror = () => {
      clearTimeout(timer);
      const ms = performance.now() - start;
      finish(ms < 2800 ? Math.max(8, Math.round(ms)) : 50);
    };
    img.src = `${SERVERS[0].probe}?_=${Date.now()}`;
  }, []);

  const sens = useMemo(() => computeSensitivity({
    deviceId: `${brandId}|${device.name}`,
    device, brandId,
    fingers, styleId, gyroMode,
    weaponId: weapon.name,
    weaponName: weapon.name,
    weaponRecoil: weapon.recoil,
    weaponRange: weapon.range,
    weaponType: weapon.type,
    proProfile,
  }), [device, fingers, styleId, gyroMode, weapon, proProfile, brandId]);
  const aiScore = sens.aiScore;

  const gyroLabel = device.gyroQuality === "excellent" ? t("device_gyro_excellent", lang)
    : device.gyroQuality === "good" ? t("device_gyro_good", lang) : t("device_gyro_average", lang);

  const currentBrand = BRANDS.find((b) => b.id === brandId) ?? BRANDS[0];
  const currentWeaponCat = WEAPONS.find((c) => c.id === weaponCatId) ?? WEAPONS[0];

  const onSearch = (r: { type: "device" | "weapon"; id: string; name: string }) => {
    if (r.type === "device") {
      const [bid, devName] = r.id.split("|");
      const b = BRANDS.find((x) => x.id === bid);
      const dev = b?.devices.find((d) => d.name === devName);
      if (b && dev) { setBrandId(b.id); setDevice(dev); }
    } else {
      for (const c of WEAPONS) {
        const w = c.weapons.find((x) => x.name === r.name);
        if (w) { setWeaponCatId(c.id); setWeapon(w); break; }
      }
    }
  };

  const handleSave = () => {
    const profile: SavedProfile = {
      id: (crypto as Crypto & { randomUUID?: () => string }).randomUUID?.() ?? String(Date.now()),
      name: `${device.name} · ${weapon.name}`,
      savedAt: Date.now(),
      params: {
        deviceId: `${brandId}|${device.name}`,
        device, brandId,
        fingers, styleId, gyroMode,
        weaponId: weapon.name,
        weaponName: weapon.name,
        weaponRecoil: weapon.recoil,
        weaponRange: weapon.range,
        weaponType: weapon.type,
        proProfile,
      },
    };
    const next = [profile, ...profiles].slice(0, 5);
    setProfiles(next);
    try { localStorage.setItem(PROFILES_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };

  const handleCopy = () => {
    const text = [
      `🎯 ALYAZOURI 2026 — ${device.name} · ${weapon.name}`,
      `📷 Camera No-Scope: ${sens.cam.noScope}% | Red Dot: ${sens.cam.red}% | 4×: ${sens.cam.scope4}%`,
      `🎯 ADS No-Scope: ${sens.ads.noScope}% | Red Dot: ${sens.ads.red}%`,
      `🏆 AI Score: ${aiScore}/100`,
    ].join("\n");
    try { navigator.clipboard?.writeText(text); } catch { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleAutoTune = () => {
    const ids = PRO_PROFILES.map((p) => p.id);
    const pick = ids[Math.floor(Math.random() * ids.length)];
    const rec = PRO_RECOMMENDATIONS[pick];
    setProProfile(pick);
    setGyroMode(rec.gyro);
    setFingers(Math.max(FINGERS[0], Math.min(6, rec.minFingers)));
    setStyleId(pick);
  };

  const equations = [
    { k: "σ", label: t("eq_rs", lang), eq: "σ(m) = 135 · D · F · S · μ · m⁻⁰·⁵⁵ · recoilAdj" },
    { k: "γ", label: t("eq_gy", lang), eq: "γ(m) = σ(m) · 2.2 · Gq · gyroBoost" },
    { k: "Wₖ", label: t("eq_hd", lang), eq: "Wₖ = recoilComp · recovery · range" },
    { k: "AI", label: t("ai_score_title", lang), eq: "AI = .3D + .2W + .2F + .15S + .15Gq" },
  ];

  return (
    <div id="top" className="relative min-h-screen">
      <Particles />
      <StatusBar ping={ping} />
      <MusicPlayer />
      <PWABanner />

      <main className="container-section pt-14">
        {/* ==================== HERO ==================== */}
        <Hero ping={ping} />

        {/* ==================== GENERATOR ==================== */}
        <section id="generator" className="py-12">
          <div className="mb-6 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-orange-300/70">{t("sec_generator_eyebrow", lang)}</p>
            <h2 className="font-display text-2xl font-black text-white sm:text-3xl">{t("sec_generator_title", lang)}</h2>
            <p className="mt-1 text-xs text-white/50">{t("sec_generator_sub", lang)}</p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            {/* ---------- CONTROLS ---------- */}
            <div className="space-y-4">
              <QuickSearch onSelect={onSearch} />

              {/* Device */}
              <div className="card rounded-2xl p-4">
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/50">
                  📱 {t("device_select", lang)}
                </label>
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {BRANDS.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setBrandId(b.id)}
                      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition-colors ${
                        brandId === b.id ? "border-orange-400/50 bg-orange-500/15 text-orange-300" : "border-white/10 bg-white/[0.02] text-white/60 hover:bg-white/5"
                      }`}
                    >
                      <span>{b.icon}</span>
                      <span className="hidden sm:inline">{b.name}</span>
                    </button>
                  ))}
                </div>
                <div className="grid max-h-44 grid-cols-2 gap-1.5 overflow-y-auto pr-1">
                  {currentBrand.devices.map((dev) => (
                    <button
                      key={dev.name}
                      onClick={() => setDevice(dev)}
                      className={`rounded-lg border px-2.5 py-2 text-left text-[11px] font-semibold transition-colors ${
                        device.name === dev.name ? "border-orange-400/50 bg-orange-500/10 text-white" : "border-white/8 bg-black/20 text-white/70 hover:bg-white/5"
                      }`}
                    >
                      {dev.name}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px]">
                  <span className="font-semibold text-white/70">{t("device_selected", lang)}{device.name}</span>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 font-semibold text-white/60">⚡ {device.fps} FPS</span>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 font-semibold text-white/60">👆 {device.touchRate} Hz</span>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 font-semibold text-white/60">📐 {device.screenSize}"</span>
                  <span className={`rounded-full bg-white/5 px-2 py-0.5 font-semibold ${device.gyroQuality === "excellent" ? "text-emerald-300" : device.gyroQuality === "good" ? "text-amber-300" : "text-orange-300"}`}>
                    🌀 {gyroLabel}
                  </span>
                </div>
              </div>

              {/* Gyro Mode */}
              <div className="card rounded-2xl p-4">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/50">{t("gyro_title", lang)}</label>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold text-orange-300">
                    {gyroMode === "off" ? t("gyro_status_off", lang) : gyroMode === "scope" ? t("gyro_status_scope", lang) : t("gyro_status_always", lang)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {gyroModes.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setGyroMode(m.id)}
                      className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-[11px] font-bold transition-colors ${
                        gyroMode === m.id ? "border-orange-400/50 bg-orange-500/15 text-orange-300" : "border-white/8 bg-black/20 text-white/60 hover:bg-white/5"
                      }`}
                    >
                      <span className="text-lg">{m.icon}</span>
                      {m.id === "off" ? t("gyro_off", lang) : m.id === "scope" ? t("gyro_scope", lang) : t("gyro_always", lang)}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-white/45">
                  {gyroMode === "off" && t("gyro_msg_off", lang)}
                  {gyroMode === "scope" && t("gyro_msg_scope", lang)}
                  {gyroMode === "always" && t("gyro_msg_always", lang)}
                </p>
              </div>

              {/* Pro Profile */}
              <div className="card rounded-2xl p-4">
                <div className="mb-2 flex items-center justify-between">
                  <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-white/50">
                    🏆 {isAr ? "البروفايل الاحترافي" : "Pro Profile"}
                  </label>
                  <span className="rounded-full bg-gradient-to-r from-orange-500 to-red-600 px-2 py-0.5 text-[9px] font-black tracking-widest text-white">PRO</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {PRO_PROFILES.map((pr) => (
                    <button
                      key={pr.id}
                      onClick={() => setProProfile(pr.id)}
                      className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-[10px] font-bold transition-colors ${
                        proProfile === pr.id ? "border-orange-400/50 bg-orange-500/15 text-orange-300" : "border-white/8 bg-black/20 text-white/60 hover:bg-white/5"
                      }`}
                    >
                      <span className="text-lg">{pr.icon}</span>
                      {isAr ? pr.nameAr : pr.name}
                    </button>
                  ))}
                </div>

                {(() => {
                  const pr = PRO_PROFILES.find((p) => p.id === proProfile)!;
                  const rec = PRO_RECOMMENDATIONS[proProfile];
                  const stats = [
                    { k: isAr ? "تحكم ارتداد" : "Recoil", v: pr.recoilControl, c: "bg-red-500" },
                    { k: isAr ? "تتبع" : "Tracking", v: pr.tracking, c: "bg-emerald-500" },
                    { k: isAr ? "فليك" : "Flicking", v: pr.flicking, c: "bg-sky-500" },
                    { k: isAr ? "بعيد" : "Long Range", v: pr.longRange, c: "bg-purple-500" },
                    { k: isAr ? "قريب" : "CQC", v: pr.cqcPower, c: "bg-orange-500" },
                  ];
                  return (
                    <div className="mt-3 space-y-3">
                      <p className="text-xs leading-relaxed text-white/60">{isAr ? pr.descriptionAr : pr.description}</p>
                      <div className="grid grid-cols-1 gap-2">
                        {stats.map((s) => (
                          <div key={s.k}>
                            <div className="mb-1 flex items-center justify-between text-[11px]">
                              <span className="text-white/50">{s.k}</span>
                              <span className="font-bold text-white tabular-nums">{s.v}</span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                              <div className={`stat-bar h-full rounded-full ${s.c}`} style={{ width: `${s.v}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="grid gap-2 sm:grid-cols-3">
                        <div className="rounded-xl border border-emerald-400/15 bg-emerald-500/5 p-2.5">
                          <div className="mb-1 text-[10px] font-bold text-emerald-300">✅ {isAr ? "القوة" : "Strengths"}</div>
                          {(isAr ? pr.strengthsAr : pr.strengths).map((s) => (
                            <div key={s} className="text-[10px] text-white/60">• {s}</div>
                          ))}
                        </div>
                        <div className="rounded-xl border border-red-400/15 bg-red-500/5 p-2.5">
                          <div className="mb-1 text-[10px] font-bold text-red-300">⚠️ {isAr ? "الضعف" : "Weak"}</div>
                          {(isAr ? pr.weaknessesAr : pr.weaknesses).map((s) => (
                            <div key={s} className="text-[10px] text-white/60">• {s}</div>
                          ))}
                        </div>
                        <div className="rounded-xl border border-sky-400/15 bg-sky-500/5 p-2.5">
                          <div className="mb-1 text-[10px] font-bold text-sky-300">🎯 {isAr ? "الأفضل لـ" : "Best for"}</div>
                          <div className="flex flex-wrap gap-1">
                            {(isAr ? pr.bestForAr : pr.bestFor).map((s) => (
                              <span key={s} className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] text-white/60">{s}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="rounded-xl border border-orange-400/20 bg-gradient-to-br from-orange-500/10 to-red-500/5 p-3">
                          <div className="mb-2 font-display text-[10px] font-black tracking-widest text-orange-300">PRO MAX</div>
                          <div className="space-y-1 text-[10px] text-white/60">
                            <div className="flex justify-between gap-2"><span className="text-white/40">{isAr ? "وضع الجايرو الموصى" : "Recommended Gyro"}</span><span className="font-bold text-white">{rec.gyro}</span></div>
                            <div className="flex justify-between gap-2"><span className="text-white/40">{isAr ? "أقل أصابع مناسب" : "Recommended Fingers"}</span><span className="font-bold text-white">{rec.minFingers}F</span></div>
                            <div className="flex justify-between gap-2"><span className="text-white/40">{isAr ? "السلاح المقترح" : "Suggested Weapon"}</span><span className="font-bold text-white">{rec.preferredWeaponName}</span></div>
                            <div className="flex justify-between gap-2"><span className="shrink-0 text-white/40">{isAr ? "أنسب فئة أسلحة" : "Best Weapon Focus"}</span><span className="text-right font-bold text-white">{(isAr ? rec.weaponFocusAr : rec.weaponFocus).join(" · ")}</span></div>
                          </div>
                        </div>
                        <div className="rounded-xl border border-purple-400/20 bg-purple-500/5 p-3">
                          <div className="mb-2 font-display text-[10px] font-black tracking-widest text-purple-300">INSIGHT</div>
                          <p className="text-[10px] leading-relaxed text-white/60">{isAr ? rec.noteAr : rec.note}</p>
                        </div>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="rounded-xl border border-white/8 bg-black/20 p-3">
                          <div className="mb-2 font-display text-[10px] font-black tracking-widest text-white/60">TOOL STACK</div>
                          <div className="flex flex-wrap gap-1">
                            {(isAr ? rec.featureStackAr : rec.featureStack).map((s) => (
                              <span key={s} className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] text-white/60">{s}</span>
                            ))}
                          </div>
                        </div>
                        <div className="rounded-xl border border-white/8 bg-black/20 p-3">
                          <div className="mb-2 font-display text-[10px] font-black tracking-widest text-white/60">WARM-UP</div>
                          <div className="space-y-0.5">
                            {(isAr ? rec.warmupAr : rec.warmup).map((s) => (
                              <div key={s} className="text-[10px] text-white/60">• {s}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Fingers + Style */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="card rounded-2xl p-4">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/50">{t("fingers_title", lang)}</label>
                  <div className="flex gap-1.5">
                    {FINGERS.map((f) => (
                      <button
                        key={f}
                        onClick={() => setFingers(f)}
                        className={`flex-1 rounded-xl border py-2.5 text-xs font-bold transition-colors ${
                          fingers === f ? "border-orange-400/50 bg-orange-500/15 text-orange-300" : "border-white/8 bg-black/20 text-white/60 hover:bg-white/5"
                        }`}
                      >
                        {f}F
                      </button>
                    ))}
                  </div>
                </div>
                <div className="card rounded-2xl p-4">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/50">{isAr ? "أسلوب اللعب" : "Play Style"}</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {playStyles.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setStyleId(s.id)}
                        className={`flex flex-col items-center gap-0.5 rounded-xl border px-1 py-2 text-[9px] font-bold transition-colors ${
                          styleId === s.id ? "border-orange-400/50 bg-orange-500/15 text-orange-300" : "border-white/8 bg-black/20 text-white/60 hover:bg-white/5"
                        }`}
                      >
                        <span className="text-base">{s.icon}</span>
                        {isAr ? s.ar : s.en}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Weapon */}
              <div className="card rounded-2xl p-4">
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/50">{t("weapon_title", lang)}</label>
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {WEAPONS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setWeaponCatId(c.id)}
                      className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-bold transition-colors ${
                        weaponCatId === c.id ? "border-orange-400/50 bg-orange-500/15 text-orange-300" : "border-white/10 bg-white/[0.02] text-white/60 hover:bg-white/5"
                      }`}
                    >
                      <span>{c.icon}</span>
                      {c.name}
                    </button>
                  ))}
                </div>
                <div className="grid max-h-36 grid-cols-2 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-3">
                  {currentWeaponCat.weapons.map((w) => (
                    <button
                      key={w.name}
                      onClick={() => setWeapon(w)}
                      className={`rounded-lg border px-2 py-1.5 text-left text-[11px] font-semibold transition-colors ${
                        weapon.name === w.name ? "border-orange-400/50 bg-orange-500/10 text-white" : "border-white/8 bg-black/20 text-white/70 hover:bg-white/5"
                      }`}
                    >
                      {w.name}
                    </button>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-white/5 bg-black/30 p-2.5 text-center">
                    <div className="text-[10px] text-white/40">{t("weapon_recoil", lang)}</div>
                    <div className="font-display text-sm font-bold text-white tabular-nums">🔥 {weapon.recoil}</div>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/30 p-2.5 text-center">
                    <div className="text-[10px] text-white/40">{t("weapon_range", lang)}</div>
                    <div className="font-display text-sm font-bold text-white tabular-nums">🎯 {weapon.range}</div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                <button onClick={handleAutoTune} className="btn-primary col-span-2 rounded-xl px-4 py-3 text-sm sm:col-span-1">
                  {t("ai_autotune", lang)}
                </button>
                <button onClick={handleCopy} className={`btn-ghost rounded-xl px-4 py-3 text-sm ${copied ? "!border-emerald-400/50 !text-emerald-300" : ""}`}>
                  {copied ? `✅ ${isAr ? "تم النسخ!" : "Copied!"}` : `📋 ${isAr ? "نسخ" : "Copy"}`}
                </button>
                <button onClick={handleSave} className="btn-ghost rounded-xl px-4 py-3 text-sm">
                  💾 {isAr ? "حفظ" : "Save"}
                </button>
                <CodeExportButton sens={sens} />
                <ShareCard sens={sens} deviceName={device.name} weaponName={weapon.name} />
              </div>
            </div>

            {/* ---------- OUTPUT ---------- */}
            <div className="space-y-4">
              {/* AI Score */}
              <div className="card neon-box flex items-center justify-between gap-4 rounded-2xl p-5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-orange-300/70">{t("ai_score_label", lang)}</span>
                  <h3 className="font-display text-lg font-black text-white">{t("ai_score_title", lang)}</h3>
                  <p className="mt-1 text-[11px] text-white/50">{device.name} · {weapon.name} · {fingers} {t("ai_suffix", lang)}</p>
                </div>
                <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
                  <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="42" fill="none" stroke="url(#aiGrad)" strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 42}
                      strokeDashoffset={2 * Math.PI * 42 * (1 - aiScore / 100)}
                      style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(0.22,1,0.36,1)" }}
                    />
                    <defs>
                      <linearGradient id="aiGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#ff7a00" />
                        <stop offset="100%" stopColor="#ffd166" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="flex flex-col items-center">
                    <span className="font-display text-3xl font-black text-orange-300 tabular-nums">{aiScore}</span>
                    <span className="text-[8px] uppercase tracking-widest text-white/40">AI SCORE</span>
                  </div>
                </div>
              </div>

              {/* Pro Player Match (#36) */}
              {(() => {
                const pros = findClosestPros(device, styleId, fingers);
                const top = pros[0];
                if (!top) return null;
                return (
                  <div className="card rounded-2xl p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-base">👑</span>
                      <span className="text-xs font-bold uppercase tracking-widest text-white/70">
                        {isAr ? "أقرب لاعب محترف" : "Closest Pro Player"}
                      </span>
                      <span className="ml-auto rounded-full bg-purple-500/15 px-2 py-0.5 text-[9px] font-bold text-purple-300">
                        {Math.round(top.similarity * 100)}% {isAr ? "تطابق" : "match"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-purple-400/20 bg-purple-500/5 p-3">
                      <span className="text-3xl">{top.player.flag}</span>
                      <div className="flex-1">
                        <div className="font-display text-sm font-bold text-white">{top.player.name}</div>
                        <div className="text-[10px] text-white/50">
                          {top.player.fingers}F · {top.player.gyro} · {top.player.weapon} · {top.player.device}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1 text-[9px]">
                          {pros.slice(1).map(p => (
                            <span key={p.player.name} className="rounded bg-white/5 px-1.5 py-0.5 text-white/40">
                              {p.player.flag} {p.player.name} ({Math.round(p.similarity*100)}%)
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Factors */}
              <FactorsCard factors={sens.factors} />

              {/* Sensitivity tables */}
              <SensTable title={t("sens_camera", lang)} icon="📷" data={sens.cam} max={300} />
              <SensTable title={t("sens_ads", lang)} icon="🎯" data={sens.ads} max={300} accent="text-amber-300" barClass="from-amber-500 to-orange-500" /> 

              {gyroMode === "off" ? (
                <div className="card flex items-center gap-3 rounded-2xl p-4">
                  <span className="text-2xl">⭕</span>
                  <div>
                    <div className="text-sm font-bold text-white">{t("gyro_disabled_title", lang)}</div>
                    <div className="text-xs text-white/50">{t("gyro_disabled_msg", lang)}</div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-1 flex items-center gap-2 rounded-xl border border-purple-400/20 bg-purple-500/5 px-3 py-2">
                    <span className="text-base">{gyroMode === "scope" ? "🎯" : "🔄"}</span>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-white">
                        {gyroMode === "scope" ? t("gyro_status_scope", lang) : t("gyro_status_always", lang)}
                      </div>
                      <div className="text-[10px] text-white/50">
                        {gyroMode === "scope"
                          ? (isAr ? "الجايرو يعمل فقط عند فتح السكوب — القيم بدون سكوب مطفأة" : "Gyro fires only while scoping — hip-fire entries are off")
                          : (isAr ? "الجايرو فعّال دائمًا بما فيها النار من الفخذ" : "Gyro active at all times incl. hip-fire")}
                      </div>
                    </div>
                    <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[9px] font-black tracking-widest text-purple-300">GYRO</span>
                  </div>
                  <SensTable title={t("sens_gyro_cam", lang)} icon="🌀" data={sens.gyro.cam} max={400} accent="text-purple-300" barClass="from-purple-500 to-fuchsia-500" />
                  <SensTable title={t("sens_gyro_ads", lang)} icon="🎯" data={sens.gyro.ads} max={400} accent="text-fuchsia-300" barClass="from-fuchsia-500 to-pink-500" />
                </>
              )}

              {/* Free Look */}
              <div className="card rounded-2xl p-4">
                <div className="mb-2 text-xs font-bold uppercase tracking-widest text-white/70">{t("sens_freelook", lang)}</div>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(sens.freeLook).map(([k, v]) => {
                    const labelKey = k === "cam" ? "sens_freelook_cam" : k === "parashoot" ? "sens_freelook_para" : "sens_freelook_vehicle";
                    return (
                      <div key={k} className="rounded-xl border border-white/5 bg-black/30 p-2.5 text-center">
                        <div className="text-[10px] text-white/40">{t(labelKey, lang)}</div>
                        <div className="font-display text-base font-bold text-white tabular-nums">{v}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI Predictions */}
              <AIPredictions deviceName={device.name} fingers={fingers} styleId={styleId} weaponName={weapon.name} />

              {/* AI Coach */}
              <AICoach sens={sens} deviceName={device.name} weaponName={weapon.name} fingers={fingers} styleId={styleId} />

              {/* Stability Analysis */}
              <div className="card rounded-2xl p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/70">{t("stability_title", lang)}</h3>
                  <span className="font-display text-[11px] font-bold text-orange-300">R = D × W × F × S</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { label: t("stability_device", lang), value: (sens.factors.deviceFactor * 100).toFixed(0), color: "from-orange-500 to-red-500" },
                    { label: t("stability_weapon", lang), value: (sens.factors.weaponFactor * 100).toFixed(0), color: "from-amber-500 to-orange-500" },
                    { label: t("stability_fingers", lang), value: (sens.factors.fingerFactor * 100).toFixed(0), color: "from-emerald-500 to-teal-500" },
                    { label: t("stability_style", lang), value: (sens.factors.styleFactor * 100).toFixed(0), color: "from-sky-500 to-indigo-500" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-white/60">{item.label}</span>
                        <span className="font-bold text-white tabular-nums">{item.value}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/5">
                        <div className={`stat-bar h-full rounded-full bg-gradient-to-r ${item.color}`} style={{ width: `${item.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 rounded-lg border border-white/5 bg-black/30 p-2.5">
                  <div className="text-[11px] font-bold text-orange-300">{t("stability_equation", lang)}</div>
                  <div className="text-[10px] text-white/45">{t("stability_desc", lang)}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== PING ==================== */}
        <section id="ping" className="py-12">
          <PingMonitor />
        </section>

        {/* ==================== DNS JORDAN ==================== */}
        <section id="dns" className="py-12">
          <DnsMonitor />
        </section>

        {/* ==================== NETWORK HEATMAP (#6) ==================== */}
        <section className="py-12">
          <NetworkHeatmap />
        </section>

        {/* ==================== PATCH ALERTS (#10) ==================== */}
        <PatchMonitor currentWeapon={weapon.name} />

        {/* ==================== MATH ENGINE ==================== */}
        <section className="py-12">
          <div className="mb-6 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-orange-300/70">{t("eq_eyebrow", lang)}</p>
            <h2 className="font-display text-2xl font-black text-white sm:text-3xl">{t("eq_title", lang)}</h2>
            <p className="mt-1 text-xs text-white/50">{t("eq_sub", lang)}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {equations.map((e) => (
              <div key={e.k} className="card neon-box rounded-2xl p-4 text-center">
                <div className="font-display text-2xl font-black text-orange-300">{e.k}</div>
                <div className="mt-1 text-[11px] font-bold text-white">{e.label}</div>
                <div className="mt-2">
                  <code className="font-display text-[10px] leading-relaxed text-orange-200 break-all">{e.eq}</code>
                </div>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-4 grid max-w-4xl gap-2 text-[10px] text-white/45 sm:grid-cols-2">
            <p><span className="font-bold text-orange-300">D</span> = fps·touch·size·ppi·gyro tiers · <span className="font-bold text-orange-300">Wₖ</span> = recoilComp·recovery·range</p>
            <p><span className="font-bold text-orange-300">σ(m)</span> = per-scope curve · <span className="font-bold text-orange-300">γ(m)</span> = gyro curve · <span className="font-bold text-orange-300">Gq</span> = gyro quality</p>
          </div>
        </section>

        {/* ==================== SAVED ==================== */}
        <section className="py-12">
          <div className="mb-6 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-orange-300/70">{t("saved_eyebrow", lang)}</p>
            <h2 className="font-display text-2xl font-black text-white sm:text-3xl">{t("saved_title", lang)}</h2>
            <p className="mt-1 text-xs text-white/50">{t("saved_sub", lang)}</p>
          </div>
          {profiles.length === 0 ? (
            <div className="card rounded-2xl p-10 text-center">
              <div className="mb-2 text-4xl">🗂️</div>
              <p className="text-sm text-white/50">{t("saved_empty", lang)}</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {profiles.map((p) => (
                <div key={p.id} className="card rounded-2xl p-4">
                  <div className="text-sm font-bold text-white">{p.name}</div>
                  <div className="text-[10px] text-white/40">{new Date(p.savedAt).toLocaleString()}</div>
                  <div className="mt-2 text-xs text-orange-300">AI Score: {computeSensitivity(p.params).aiScore}/100</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ==================== PAC ==================== */}
        <section id="pac" className="py-12">
          <PacSection />
        </section>

        {/* ==================== RATING ==================== */}
        <section className="py-12">
          <div className="mx-auto max-w-xl">
            <RatingSection />
          </div>
        </section>

        {/* ==================== ABOUT / FOOTER ==================== */}
        <footer id="about" className="border-t border-white/8 py-12">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600 font-display text-base font-black text-white">A</span>
                <span className="font-display text-sm font-black text-white">ALYAZOURI <span className="text-orange-400">2026</span></span>
              </div>
              <p className="text-xs leading-relaxed text-white/50">{t("footer_about", lang)}</p>
            </div>
            <div>
              <h4 className="mb-3 font-display text-xs font-bold uppercase tracking-widest text-white/70">{t("footer_features", lang)}</h4>
              <ul className="space-y-1.5 text-xs text-white/50">
                <li>{t("footer_f1", lang)}</li>
                <li>{t("footer_f2", lang)}</li>
                <li>{t("footer_f3", lang)}</li>
                <li>{t("footer_f4", lang)}</li>
                <li>{t("footer_f5", lang)}</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-display text-xs font-bold uppercase tracking-widest text-white/70">{isAr ? "تواصل" : "Connect"}</h4>
              <ul className="space-y-1.5 text-xs text-white/50">
                <li>{t("hero_tiktok", lang)} <span className="font-semibold text-white/80">@Saeedalyazouri0</span></li>
                <li>{t("hero_instagram", lang)} <span className="font-semibold text-white/80">@Saeedjor11</span></li>
                <li>{t("hero_pubg_id", lang)} <span className="font-semibold text-white/80">5744469523</span></li>
              </ul>
            </div>
          </div>
          <div className="divider my-8" />
          <div className="text-center">
            <p className="font-display text-[11px] font-black tracking-widest text-orange-300">{t("footer_tagline", lang)}</p>
            <p className="mt-2 text-[11px] text-white/40">{t("footer_rights", lang)}</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
