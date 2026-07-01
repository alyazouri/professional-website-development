import { useState, useEffect, useMemo } from "react";
import { BRANDS, WEAPONS, FINGERS, PRO_PROFILES, PRO_RECOMMENDATIONS } from "./data";
import type { ProProfileId } from "./data";
import {
  computeSensitivity,
  SensTable,
  FactorsCard,
  loadProfiles,
  saveProfiles,
} from "./sensitivity";
import type { SensParams, Sens, SavedProfile, GyroMode } from "./sensitivity";
import { useLang } from "./LanguageContext";
import { t } from "./i18n";
import { StatusBar } from "./StatusBar";
import { Particles } from "./Particles";
import { Hero } from "./Hero";
import { QuickSearch } from "./QuickSearch";
import { PingMonitor } from "./PingMonitor";
import { DnsMonitor } from "./DnsMonitor";
import { PacSection } from "./PacSection";
import { MusicPlayer } from "./MusicPlayer";
import { PWABanner } from "./PWABanner";
import { AIPredictions, AiCoach, ShareButton, RatingSection } from "./Features";
import { useCountUp, useScrollProgress } from "./hooks";

type SearchResult = { type: "device" | "weapon"; id: string };

export default function App() {
  const { lang } = useLang();
  const isAr = lang === "ar";

  const [brandId, setBrandId] = useState("apple");
  const [deviceId, setDeviceId] = useState("iPhone 16 Pro Max");
  const [fingers, setFingers] = useState(4);
  const [styleId, setStyleId] = useState("balanced");
  const [gyroMode, setGyroMode] = useState<GyroMode>("scope");
  const [weaponId, setWeaponId] = useState("ar");
  const [weaponName, setWeaponName] = useState("M416");
  const [proProfile, setProProfile] = useState<ProProfileId>("balanced");
  const [profiles, setProfiles] = useState<SavedProfile[]>(() => loadProfiles());
  const [ping, setPing] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const brand = BRANDS.find((b) => b.id === brandId) ?? BRANDS[0];
  const device = brand.devices.find((dv) => dv.name === deviceId) ?? brand.devices[0];
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
  const aiScore = useCountUp(sens.aiScore);
  const scrollP = useScrollProgress();

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
    setFingers(p.params.fingers);
    setStyleId(p.params.styleId);
    setGyroMode(p.params.gyroMode);
    setWeaponId(p.params.weaponId);
    setWeaponName(p.params.weaponName);
    if (p.params.proProfile) setProProfile(p.params.proProfile as ProProfileId);
  };

  // Smart preset — picks the best combo based on device gyro + weapon type
  const autoTune = () => {
    const g = device.gyroQuality;
    const wt = weapon.type;
    setGyroMode(g === "excellent" ? "always" : "scope");
    setFingers((f) => (f < 4 ? 4 : f));
    if (wt === "sniper") setProProfile("sniper");
    else if (wt === "smg" || wt === "shotgun") setProProfile("aggressive");
    else if (wt === "dmr") setProProfile("headshot");
    else setProProfile("spray");
    setStyleId("balanced");
  };

  const onSearch = (r: SearchResult) => {
    if (r.type === "device") {
      const [bid, dname] = r.id.split("|");
      setBrandId(bid); setDeviceId(dname);
    } else {
      const cat = WEAPONS.find((c) => c.weapons.some((w) => w.name === r.id));
      if (cat) { setWeaponId(cat.id); setWeaponName(r.id); }
    }
  };

  const copyAll = () => {
    const lines = [
      `📱 ${device.name} · 🔫 ${weapon.name} · ${fingers}F`,
      `📷 Camera: ${sens.cam.noScope}/${sens.cam.red}/${sens.cam.scope4} (NoScope/Red/4x) | TPP ${sens.cam.tpp} FPP ${sens.cam.fpp}`,
      `🎯 ADS: TPP ${sens.ads.tpp} FPP ${sens.ads.fpp}`,
      `🏆 AI Score: ${sens.aiScore}/100`,
    ].join("\n");
    try { navigator.clipboard?.writeText(lines); } catch { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const gyroLabel = device.gyroQuality === "excellent" ? t("device_gyro_excellent", lang)
    : device.gyroQuality === "good" ? t("device_gyro_good", lang) : t("device_gyro_average", lang);

  const gyroModes = [
    { id: "off" as GyroMode, icon: "⭕", label: t("gyro_off", lang), desc: t("gyro_off_desc", lang) },
    { id: "scope" as GyroMode, icon: "🎯", label: t("gyro_scope", lang), desc: t("gyro_scope_desc", lang) },
    { id: "always" as GyroMode, icon: "🔄", label: t("gyro_always", lang), desc: t("gyro_always_desc", lang) },
  ];

  const playStyles = [
    { id: "balanced", label: isAr ? "متوازن" : "Balanced", icon: "⚖️" },
    { id: "aggressive", label: isAr ? "عدواني" : "Aggressive", icon: "⚡" },
    { id: "headshot", label: isAr ? "رأس" : "Headshot", icon: "🎯" },
    { id: "spray", label: isAr ? "رش" : "Spray", icon: "💧" },
    { id: "competitive", label: isAr ? "بطولة" : "Compete", icon: "🏆" },
    { id: "close", label: isAr ? "قريب" : "Close", icon: "🔥" },
  ];

  const equations = [
    { k: "R_s", label: t("eq_rs", lang), eq: "S = 140·D·F·S·W·P·σ(m)·Wₖ" },
    { k: "A_d", label: isAr ? "التصويب ADS" : "ADS", eq: "A_d = R_s × 0.88" },
    { k: "G_y", label: t("eq_gy", lang), eq: "G = R_s · γ(m) · Gq" },
    { k: "H_d", label: t("eq_hd", lang), eq: "H = Acc · Rc / Rᵥ" },
  ];

  return (
    <div id="top" className="relative min-h-screen bg-radial-spot">
      {/* scroll progress */}
      <div className="fixed inset-x-0 top-0 z-[60] h-0.5">
        <div
          className="h-full bg-gradient-to-r from-orange-500 via-orange-300 to-yellow-300 transition-[width] duration-150 ease-out"
          style={{ width: `${scrollP}%`, boxShadow: "0 0 8px rgba(255,122,0,0.6)" }}
        />
      </div>
      <Particles />
      <StatusBar ping={ping} />

      <main className="container-section pt-14">
        {/* ==================== HERO ==================== */}
        <Hero ping={ping} />

        {/* ==================== GENERATOR ==================== */}
        <section id="generator" className="py-12">
          <div className="mb-6 text-center">
            <div className="text-[10px] font-bold uppercase tracking-widest text-orange-300/70">{t("sec_generator_eyebrow", lang)}</div>
            <h2 className="font-display text-2xl font-black text-white sm:text-3xl">{t("sec_generator_title", lang)}</h2>
            <p className="mt-1 text-xs text-white/50">{t("sec_generator_sub", lang)}</p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            {/* ---------- CONTROLS ---------- */}
            <div className="space-y-4">
              <button onClick={autoTune} className="btn-primary w-full rounded-xl px-5 py-3 text-sm">
                {t("ai_autotune", lang)}
              </button>
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
                      className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
                        brandId === b.id ? "border-orange-400/50 bg-orange-500/15 text-orange-300" : "border-white/10 bg-white/[0.02] text-white/60 hover:bg-white/5"
                      }`}
                    >
                      <span>{b.icon}</span>
                      <span className="hidden sm:inline">{b.name}</span>
                    </button>
                  ))}
                </div>
                <select
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white focus:border-orange-400/50 focus:outline-none"
                >
                  {brand.devices.map((dv) => (
                    <option key={dv.name} value={dv.name} className="bg-[#0a0a14]">{dv.name}</option>
                  ))}
                </select>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/50">
                  <span className="font-semibold text-white/70">{t("device_selected", lang)}{device.name}</span>
                  <span>⚡ {device.fps} FPS</span>
                  <span>👆 {device.touchRate} Hz</span>
                  <span>📐 {device.screenSize}"</span>
                  <span className={`rounded-full bg-white/5 px-2 py-0.5 font-semibold ${device.gyroQuality === "excellent" ? "text-emerald-300" : device.gyroQuality === "good" ? "text-amber-300" : "text-orange-300"}`}>
                    🌀 {gyroLabel}
                  </span>
                </div>
              </div>

              {/* Gyro Mode */}
              <div className="card rounded-2xl p-4">
                <div className="mb-3 flex items-center justify-between">
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
                      className={`rounded-xl border p-2.5 text-center transition-all ${
                        gyroMode === m.id ? "border-orange-400/50 bg-orange-500/15" : "border-white/10 bg-white/[0.02] hover:bg-white/5"
                      }`}
                    >
                      <div className="text-lg">{m.icon}</div>
                      <div className="text-[11px] font-bold text-white">{m.label}</div>
                      <div className="mt-0.5 text-[9px] leading-tight text-white/40">{m.desc}</div>
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-[11px] text-white/50">
                  {gyroMode === "off" && t("gyro_msg_off", lang)}
                  {gyroMode === "scope" && t("gyro_msg_scope", lang)}
                  {gyroMode === "always" && t("gyro_msg_always", lang)}
                </div>
              </div>

              {/* Pro Profile */}
              <div className="card rounded-2xl p-4">
                <div className="mb-3 flex items-center justify-between">
                  <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-white/50">
                    🏆 {isAr ? "البروفايل الاحترافي" : "Pro Profile"}
                  </label>
                  <span className="rounded-full bg-gradient-to-r from-orange-500 to-red-600 px-2 py-0.5 text-[9px] font-black tracking-widest text-white">PRO</span>
                </div>
                <div className="mb-3 grid grid-cols-3 gap-1.5 sm:grid-cols-6">
                  {PRO_PROFILES.map((pr) => (
                    <button
                      key={pr.id}
                      onClick={() => setProProfile(pr.id)}
                      className={`flex flex-col items-center rounded-lg border px-1 py-2 transition-all ${
                        proProfile === pr.id ? "border-orange-400/50 bg-orange-500/15" : "border-white/10 bg-white/[0.02] hover:bg-white/5"
                      }`}
                    >
                      <span className="text-lg">{pr.icon}</span>
                      <span className="mt-0.5 text-[9px] font-bold text-white">{isAr ? pr.nameAr : pr.name}</span>
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
                    <div className="space-y-3">
                      <p className="text-xs leading-relaxed text-white/60">{isAr ? pr.descriptionAr : pr.description}</p>
                      <div className="grid grid-cols-1 gap-2">
                        {stats.map((s) => (
                          <div key={s.k}>
                            <div className="mb-1 flex items-center justify-between text-[10px]">
                              <span className="text-white/50">{s.k}</span>
                              <span className="font-bold text-white tabular-nums">{s.v}</span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                              <div className={`h-full rounded-full ${s.c} stat-bar`} style={{ width: `${s.v}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="grid gap-2 sm:grid-cols-3">
                        <div className="rounded-xl border border-emerald-400/15 bg-emerald-500/5 p-2.5">
                          <div className="mb-1 text-[9px] font-bold uppercase tracking-widest text-emerald-300/80">✅ {isAr ? "القوة" : "Strengths"}</div>
                          {(isAr ? pr.strengthsAr : pr.strengths).map((s, i) => (
                            <div key={i} className="text-[10px] text-white/60">• {s}</div>
                          ))}
                        </div>
                        <div className="rounded-xl border border-red-400/15 bg-red-500/5 p-2.5">
                          <div className="mb-1 text-[9px] font-bold uppercase tracking-widest text-red-300/80">⚠️ {isAr ? "الضعف" : "Weak"}</div>
                          {(isAr ? pr.weaknessesAr : pr.weaknesses).map((s, i) => (
                            <div key={i} className="text-[10px] text-white/60">• {s}</div>
                          ))}
                        </div>
                        <div className="rounded-xl border border-sky-400/15 bg-sky-500/5 p-2.5">
                          <div className="mb-1 text-[9px] font-bold uppercase tracking-widest text-sky-300/80">🎯 {isAr ? "الأفضل لـ" : "Best for"}</div>
                          <div className="flex flex-wrap gap-1">
                            {(isAr ? pr.bestForAr : pr.bestFor).map((s, i) => (
                              <span key={i} className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] text-white/60">{s}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="rounded-xl border border-orange-400/20 bg-gradient-to-br from-orange-500/10 to-red-500/5 p-3">
                          <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-orange-500/20 px-2 py-0.5 text-[9px] font-black tracking-widest text-orange-300">PRO MAX</div>
                          <div className="space-y-1 text-[10px] text-white/60">
                            <div className="flex justify-between"><span className="text-white/40">{isAr ? "وضع الجايرو الموصى" : "Recommended Gyro"}</span><span className="font-bold text-white">{rec.gyro}</span></div>
                            <div className="flex justify-between"><span className="text-white/40">{isAr ? "أقل أصابع مناسب" : "Recommended Fingers"}</span><span className="font-bold text-white">{rec.minFingers}F</span></div>
                            <div className="flex justify-between"><span className="text-white/40">{isAr ? "السلاح المقترح" : "Suggested Weapon"}</span><span className="font-bold text-white">{rec.preferredWeaponName}</span></div>
                            <div className="flex justify-between gap-2"><span className="shrink-0 text-white/40">{isAr ? "أنسب فئة أسلحة" : "Best Weapon Focus"}</span><span className="text-right font-bold text-white">{(isAr ? rec.weaponFocusAr : rec.weaponFocus).join(" · ")}</span></div>
                          </div>
                        </div>
                        <div className="rounded-xl border border-purple-400/20 bg-purple-500/5 p-3">
                          <div className="mb-1 text-[9px] font-black uppercase tracking-widest text-purple-300/80">INSIGHT</div>
                          <p className="text-[10px] leading-relaxed text-white/60">{isAr ? rec.noteAr : rec.note}</p>
                        </div>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="rounded-xl border border-white/8 bg-black/20 p-3">
                          <div className="mb-1 text-[9px] font-black uppercase tracking-widest text-white/40">TOOL STACK</div>
                          <div className="flex flex-wrap gap-1">
                            {(isAr ? rec.featureStackAr : rec.featureStack).map((s, i) => (
                              <span key={i} className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] text-white/60">{s}</span>
                            ))}
                          </div>
                        </div>
                        <div className="rounded-xl border border-white/8 bg-black/20 p-3">
                          <div className="mb-1 text-[9px] font-black uppercase tracking-widest text-white/40">WARM-UP</div>
                          <div className="space-y-0.5">
                            {(isAr ? rec.warmupAr : rec.warmup).map((s, i) => (
                              <div key={i} className="text-[10px] text-white/60">• {s}</div>
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
                  <div className="grid grid-cols-5 gap-1.5">
                    {FINGERS.map((f) => (
                      <button
                        key={f}
                        onClick={() => setFingers(f)}
                        className={`rounded-lg border py-2 text-sm font-bold transition-all ${
                          fingers === f ? "border-orange-400/50 bg-orange-500/15 text-orange-300" : "border-white/10 bg-white/[0.02] text-white/60 hover:bg-white/5"
                        }`}
                      >
                        {f}F
                      </button>
                    ))}
                  </div>
                </div>
                <div className="card rounded-2xl p-4">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/50">{isAr ? "أسلوب اللعب" : "Play Style"}</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {playStyles.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setStyleId(s.id)}
                        className={`flex flex-col items-center rounded-lg border py-1.5 transition-all ${
                          styleId === s.id ? "border-orange-400/50 bg-orange-500/15 text-orange-300" : "border-white/10 bg-white/[0.02] text-white/60 hover:bg-white/5"
                        }`}
                      >
                        <span>{s.icon}</span>
                        <span className="text-[9px] font-bold">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Weapon */}
              <div className="card rounded-2xl p-4">
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/50">{t("weapon_title", lang)}</label>
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {WEAPONS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setWeaponId(c.id)}
                      className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
                        weaponId === c.id ? "border-orange-400/50 bg-orange-500/15 text-orange-300" : "border-white/10 bg-white/[0.02] text-white/60 hover:bg-white/5"
                      }`}
                    >
                      <span>{c.icon}</span>
                      <span className="hidden sm:inline">{c.name}</span>
                    </button>
                  ))}
                </div>
                <select
                  value={weaponName}
                  onChange={(e) => setWeaponName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white focus:border-orange-400/50 focus:outline-none"
                >
                  {weaponCat.weapons.map((w) => (
                    <option key={w.name} value={w.name} className="bg-[#0a0a14]">{w.name}</option>
                  ))}
                </select>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-white/5 bg-black/30 p-2.5 text-center">
                    <div className="text-[10px] text-white/40">{t("weapon_recoil", lang)}</div>
                    <div className="font-display text-lg font-bold text-red-300 tabular-nums">🔥 {weapon.recoil}</div>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/30 p-2.5 text-center">
                    <div className="text-[10px] text-white/40">{t("weapon_range", lang)}</div>
                    <div className="font-display text-lg font-bold text-emerald-300 tabular-nums">🎯 {weapon.range}</div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2">
                <button onClick={saveProfile} className="btn-primary w-full rounded-xl px-5 py-3 text-sm">
                  💾 {isAr ? "حفظ البروفايل" : "Save Profile"}
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <ShareButton sens={sens} deviceName={device.name} weaponName={weapon.name} />
                  <button onClick={copyAll} className="btn-ghost rounded-xl px-5 py-3 text-sm">
                    {copied ? `✅ ${isAr ? "تم النسخ!" : "Copied!"}` : `📋 ${isAr ? "نسخ القيم" : "Copy Values"}`}
                  </button>
                </div>
              </div>
            </div>

            {/* ---------- OUTPUT ---------- */}
            <div className="space-y-4">
              {/* AI Score */}
              <div className="card neon-box rounded-2xl p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-orange-300/80">{t("ai_score_label", lang)}</div>
                    <div className="font-display text-lg font-bold text-white">{t("ai_score_title", lang)}</div>
                    <div className="mt-1 text-[11px] text-white/40">{device.name} · {weapon.name} · {fingers} {t("ai_suffix", lang)}</div>
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
                    <div className="absolute inset-[6px] flex flex-col items-center justify-center rounded-full bg-[#0a0a14]">
                      <span className="font-display text-3xl font-black text-orange-300 tabular-nums">{aiScore}</span>
                      <span className="text-[8px] uppercase tracking-widest text-white/40">AI SCORE</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Factors */}
              <FactorsCard factors={sens.factors} />

              {/* Sensitivity tables */}
              <div className="grid gap-3 sm:grid-cols-2">
                <SensTable label={t("sens_camera", lang)} data={sens.cam} />
                <SensTable label={t("sens_ads", lang)} data={sens.ads} />
              </div>
              {gyroMode === "off" ? (
                <div className="card flex items-center gap-3 rounded-2xl p-4">
                  <span className="text-2xl">⭕</span>
                  <div>
                    <div className="text-sm font-bold text-white">{t("gyro_disabled_title", lang)}</div>
                    <div className="text-[11px] text-white/50">{t("gyro_disabled_msg", lang)}</div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-2 flex items-center gap-2 rounded-xl border border-purple-400/20 bg-purple-500/5 px-3 py-2">
                    <span className="text-base">{gyroMode === "scope" ? "🎯" : "🔄"}</span>
                    <div className="flex-1">
                      <div className="text-[11px] font-bold text-purple-200">
                        {gyroMode === "scope" ? t("gyro_status_scope", lang) : t("gyro_status_always", lang)}
                      </div>
                      <div className="text-[9px] text-white/45">
                        {gyroMode === "scope"
                          ? (isAr ? "الجايرو يعمل فقط عند فتح السكوب — القيم بدون سكوب مطفأة" : "Gyro fires only while scoping — hip-fire entries are off")
                          : (isAr ? "الجايرو فعّال دائمًا بما فيها النار من الفخذ" : "Gyro active at all times incl. hip-fire")}
                      </div>
                    </div>
                    <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[9px] font-black tracking-widest text-purple-300">GYRO</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <SensTable label={t("sens_gyro_cam", lang)} data={sens.gyro.cam} color="purple" />
                    <SensTable label={t("sens_gyro_ads", lang)} data={sens.gyro.ads} color="purple" />
                  </div>
                </div>
              )}

              {/* Free Look */}
              <div className="card rounded-2xl p-4">
                <div className="mb-2 text-xs font-bold uppercase tracking-widest text-white/50">{t("sens_freelook", lang)}</div>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(sens.freeLook).map(([k, v]) => {
                    const labelKey = k === "cam" ? "sens_freelook_cam" : k === "parashoot" ? "sens_freelook_para" : "sens_freelook_vehicle";
                    return (
                      <div key={k} className="rounded-xl border border-white/5 bg-black/30 p-2.5 text-center">
                        <div className="text-[10px] text-white/40">{t(labelKey as Parameters<typeof t>[0], lang)}</div>
                        <div className="font-display text-base font-bold text-orange-300 tabular-nums">{v}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI Predictions */}
              <AIPredictions deviceName={device.name} fingers={fingers} styleId={styleId} weaponName={weapon.name} />

              {/* AI Coach */}
              <AiCoach sens={sens} deviceName={device.name} weaponName={weapon.name} fingers={fingers} styleId={styleId} />

              {/* Stability Analysis (full width) */}
              <div className="card rounded-2xl p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-widest text-white/50">{t("stability_title", lang)}</div>
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
                      <div className="mb-1 flex items-center justify-between text-[11px]">
                        <span className="text-white/60">{item.label}</span>
                        <span className="font-bold text-white tabular-nums">{item.value}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                        <div className={`h-full rounded-full bg-gradient-to-r ${item.color} stat-bar`} style={{ width: `${Math.min(100, Number(item.value))}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 rounded-lg border border-white/5 bg-black/30 p-2.5">
                  <div className="font-display text-[11px] font-bold text-orange-300">{t("stability_equation", lang)}</div>
                  <div className="mt-0.5 text-[10px] text-white/50">{t("stability_desc", lang)}</div>
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

        {/* ==================== MATH ENGINE ==================== */}
        <section className="py-12">
          <div className="mb-6 text-center">
            <div className="text-[10px] font-bold uppercase tracking-widest text-orange-300/70">{t("eq_eyebrow", lang)}</div>
            <h2 className="font-display text-2xl font-black text-white sm:text-3xl">{t("eq_title", lang)}</h2>
            <p className="mt-1 text-xs text-white/50">{t("eq_sub", lang)}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {equations.map((e) => (
              <div key={e.k} className="card neon-box rounded-2xl p-4 text-center">
                <div className="font-display text-2xl font-black text-orange-300">{e.k}</div>
                <div className="mt-1 text-[11px] font-semibold text-white">{e.label}</div>
                <div className="mt-3 rounded-lg border border-white/5 bg-black/30 px-2 py-2.5">
                  <code className="font-display text-[10px] leading-relaxed text-orange-200 break-all">{e.eq}</code>
                </div>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-4 grid max-w-4xl gap-2 text-[10px] text-white/45 sm:grid-cols-2">
            <div className="rounded-lg border border-white/5 bg-black/20 px-3 py-2"><span className="font-bold text-orange-300">D</span> = fps·touch·size·ppi·gyro tiers · <span className="font-bold text-orange-300">Wₖ</span> = recoilComp·recovery·range</div>
            <div className="rounded-lg border border-white/5 bg-black/20 px-3 py-2"><span className="font-bold text-orange-300">σ(m)</span> = per-scope curve · <span className="font-bold text-orange-300">γ(m)</span> = gyro curve · <span className="font-bold text-orange-300">Gq</span> = gyro quality</div>
          </div>
        </section>

        {/* ==================== SAVED ==================== */}
        <section className="py-12">
          <div className="mb-6 text-center">
            <div className="text-[10px] font-bold uppercase tracking-widest text-orange-300/70">{t("saved_eyebrow", lang)}</div>
            <h2 className="font-display text-2xl font-black text-white sm:text-3xl">{t("saved_title", lang)}</h2>
            <p className="mt-1 text-xs text-white/50">{t("saved_sub", lang)}</p>
          </div>
          {profiles.length === 0 ? (
            <div className="card rounded-2xl p-10 text-center">
              <div className="mb-2 text-4xl">🗂️</div>
              <div className="text-sm text-white/50">{t("saved_empty", lang)}</div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {profiles.map((p) => (
                <div key={p.id} className="card rounded-2xl p-4">
                  <div className="mb-1 text-sm font-bold text-white">{p.name}</div>
                  <div className="text-[10px] text-white/40">{new Date(p.savedAt).toLocaleString()}</div>
                  <div className="mt-1 text-[11px] text-orange-300">AI Score: {computeSensitivity(p.params).aiScore}/100</div>
                  <button onClick={() => loadProfile(p)} className="btn-ghost mt-3 w-full rounded-lg px-3 py-2 text-xs">
                    ↩️ {isAr ? "تحميل" : "Load"}
                  </button>
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
          <RatingSection />
        </section>

        {/* ==================== ABOUT / FOOTER ==================== */}
        <footer id="about" className="border-t border-white/8 pt-10">
          <div className="grid gap-8 md:grid-cols-[1.5fr_1fr_1fr]">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600 font-display text-2xl font-black text-white shadow-lg">A</span>
                <div>
                  <div className="font-display text-lg font-black text-white">ALYAZOURI</div>
                  <div className="text-[11px] text-white/40">Jordan Gaming Optimizer 2026</div>
                </div>
              </div>
              <p className="max-w-md text-xs leading-relaxed text-white/50">{t("footer_about", lang)}</p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/50">
                <span>{t("hero_tiktok", lang)} <span className="font-semibold text-white/80">@sceedalyazouri0</span></span>
                <span>{t("hero_instagram", lang)} <span className="font-semibold text-white/80">@sceedjor11</span></span>
                <span>{t("hero_pubg_id", lang)} <span className="font-semibold text-white/80">5744469523</span></span>
              </div>
            </div>
            <div>
              <div className="mb-3 text-xs font-bold uppercase tracking-widest text-white/50">{t("footer_features", lang)}</div>
              <ul className="space-y-1.5 text-[11px] text-white/50">
                <li>{t("footer_f1", lang)}</li>
                <li>{t("footer_f2", lang)}</li>
                <li>{t("footer_f3", lang)}</li>
                <li>{t("footer_f4", lang)}</li>
                <li>{t("footer_f5", lang)}</li>
              </ul>
            </div>
            <div>
              <div className="mb-3 text-xs font-bold uppercase tracking-widest text-white/50">🇯🇴 Jordan</div>
              <p className="text-[11px] leading-relaxed text-white/50">
                {isAr ? "فريق أردني محترف يطوّر أدوات تحسين الأداء للاعبي PUBG Mobile في الشرق الأوسط." : "A professional Jordanian team building performance tools for PUBG Mobile players across MENA."}
              </p>
            </div>
          </div>
          <div className="divider my-6" />
          <div className="flex flex-col items-center justify-between gap-2 pb-8 text-center sm:flex-row sm:text-left">
            <div className="text-[11px] text-white/40">{t("footer_rights", lang)}</div>
            <div className="font-display text-[11px] font-bold tracking-widest text-orange-300/80">{t("footer_tagline", lang)}</div>
          </div>
        </footer>
      </main>

      <MusicPlayer />
      <PWABanner />
    </div>
  );
}
