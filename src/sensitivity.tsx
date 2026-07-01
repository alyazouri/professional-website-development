import { useEffect, useRef, useState } from "react";
import { useLang } from "./LanguageContext";
import { t } from "./i18n";
import { getWeaponProfile } from "./weaponProfiles";
import { PRO_PROFILES } from "./data";

type SensObj = {
  tpp: number; fpp: number; red: number;
  scope2: number; scope3: number; scope4: number; scope6: number; scope8: number;
};

const SENS_MAX = 300;
const GYRO_MAX = 400;
const SENS_MIN = 1;

export type Sens = {
  cam: SensObj; ads: SensObj; gyroCam: SensObj; gyroAds: SensObj;
  freeLook: { cam: number; parashoot: number; vehicle: number };
  aiScore: number;
  factors: { fps: number; touchRate: number; screenSize: number; gyroQuality: string; deviceFactor: number; fingerFactor: number; styleFactor: number; weaponFactor: number; };
};

export type GyroMode = "off" | "scope" | "always";

export type SensParams = {
  deviceId: string;
  device: { name: string; fps: number; touchRate: number; screenSize: number; resolution: string; gyroQuality: "excellent" | "good" | "average"; };
  brandId: string; fingers: number; styleId: string; gyroMode: GyroMode;
  weaponId: string; weaponName: string; weaponRecoil: number; weaponRange: number; weaponType: string;
  proProfile?: string;
  isSuperPower?: boolean; // New Super Power toggle
};

const cl = (n: number, min = SENS_MIN, max = SENS_MAX) => Math.max(min, Math.min(max, Math.round(n)));
const cg = (n: number) => Math.max(SENS_MIN, Math.min(GYRO_MAX, Math.round(n)));

// ════════════════════════════════════════════════════════════════
// PROFESSIONAL SENSITIVITY ENGINE — ALYAZOURI 2026
// ════════════════════════════════════════════════════════════════
//
// 1. Each of 48 weapons has a REAL calibrated profile (32 values)
// 2. Device adjustments are TINY (±2-6%) to preserve accuracy
// 3. Recoil-aware gyro: high-recoil → more gyro compensation on scopes
// 4. PPI-aware: higher pixel density → finer control → slightly lower sens
// 5. Headshot precision: competitive/conqueror → lower scope sens for head-level aim
// 6. Long-range stability: 3x-8x get extra stability for high-recoil weapons
// ════════════════════════════════════════════════════════════════

export function computeSensitivity(p: SensParams): Sens {
  const wp = getWeaponProfile(p.weaponName, p.weaponRecoil, p.weaponRange, p.weaponType);
  const { fps, touchRate: touch, screenSize: screen, gyroQuality: gyroQ, resolution } = p.device;

  // PPI calculation
  const rm = resolution.match(/(\d+)[×x](\d+)/);
  const resW = rm ? +rm[1] : 2400;
  const resH = rm ? +rm[2] : 1080;
  const ppi = Math.sqrt(resW * resW + resH * resH) / screen;

  // ──── DEVICE FACTOR (tiny adjustments ±2-6%) ────
  const fpsF = fps >= 165 ? 0.96 : fps >= 144 ? 0.98 : fps >= 120 ? 1.0 : fps >= 90 ? 1.03 : 1.05;
  const touchF = touch >= 960 ? 0.97 : touch >= 720 ? 0.98 : touch >= 480 ? 0.99 : touch >= 240 ? 1.0 : 1.02;
  const screenF = screen >= 13 ? 1.03 : screen >= 11 ? 1.0 : screen >= 8.3 ? 0.98 : screen >= 6.7 ? 0.96 : 0.95;
  const ppiF = ppi >= 500 ? 0.98 : ppi >= 400 ? 0.99 : ppi >= 300 ? 1.0 : 1.01;
  const gyroQF = gyroQ === "excellent" ? 1.0 : gyroQ === "good" ? 0.97 : 0.92;

  const dM = fpsF * touchF * screenF * ppiF;
  const dG = dM * gyroQF;

  // ──── FINGER FACTOR (±4%) ────
  const fM = ({ 2: 1.04, 3: 1.02, 4: 1.0, 5: 0.98, 6: 0.96 } as Record<number, number>)[p.fingers] ?? 1.0;

  // ──── STYLE FACTOR (±3%) ────
  // CQC: close/spray higher, headshot/conqueror lower
  const sC = ({ headshot: 0.97, spray: 1.02, competitive: 1.0, close: 1.03, reflex: 1.02, conqueror: 0.98 } as Record<string, number>)[p.styleId] ?? 1.0;
  // Scopes: headshot/conqueror lower for precision
  const sS = ({ headshot: 0.96, spray: 1.01, competitive: 1.0, close: 1.01, reflex: 1.0, conqueror: 0.97 } as Record<string, number>)[p.styleId] ?? 1.0;
  // Gyro: headshot slightly higher for micro-adjustments
  const sG = ({ headshot: 1.02, spray: 1.01, competitive: 1.0, close: 1.01, reflex: 1.01, conqueror: 0.99 } as Record<string, number>)[p.styleId] ?? 1.0;

  // ──── GYRO OFF BOOST ────
  const gOff = (p.gyroMode === "off" || p.gyroMode === "scope") ? 1.05 : 1.0;

  // ──── PRO PROFILE MULTIPLIERS ────
  const prof = p.proProfile ? PRO_PROFILES.find(pr => pr.id === p.proProfile) : null;
  const profCQC = prof?.cqcMul ?? 1.0;
  const profNear = prof?.scopeNearMul ?? 1.0;
  const profFar = prof?.scopeFarMul ?? 1.0;
  const profGyro = prof?.gyroMul ?? 1.0;
  const profGyroFar = prof?.gyroFarMul ?? 1.0;

  // ──── RECOIL-AWARE SCOPE STABILITY ────
  // High vertical recoil weapons → lower 3x/4x/6x/8x for stability
  const vRecoil = wp.verticalRecoil;
  const hRecoil = wp.horizontalRecoil;
  // Stability factor: 0.92 for heavy recoil, 1.0 for light
  const scopeStab = vRecoil >= 80 ? 0.93 : vRecoil >= 65 ? 0.95 : vRecoil >= 50 ? 0.97 : 1.0;
  // Horizontal shake compensation for gyro
  const gyroHComp = hRecoil >= 45 ? 1.04 : hRecoil >= 30 ? 1.02 : 1.0;
  // ADS speed: faster ADS → can be slightly more responsive
  const adsF = wp.adsSpeed >= 90 ? 1.02 : wp.adsSpeed >= 80 ? 1.01 : 1.0;

  // ──── COMPUTE MULTIPLIERS ────
  // ──── SUPER POWER BOOST (Based on Image Reference) ────
  const superBoost = p.isSuperPower ? 1.35 : 1.0;

  const cqcMul = dM * fM * sC * gOff * profCQC * superBoost;
  const scopeNear = dM * fM * sS * adsF * profNear * superBoost;
  const scopeFar = dM * fM * sS * scopeStab * profFar * superBoost;
  const gBase = dG * fM * sG * profGyro * superBoost;
  const gScopeFar = gBase * scopeStab * gyroHComp * profGyroFar * superBoost;

  const useAll = p.gyroMode === "always";
  const useAny = p.gyroMode !== "off";

  // ════════ CAMERA ════════
  const cam: SensObj = {
    tpp: cl(wp.cam[0] * cqcMul), fpp: cl(wp.cam[1] * cqcMul),
    red: cl(wp.cam[2] * scopeNear), scope2: cl(wp.cam[3] * scopeNear),
    scope3: cl(wp.cam[4] * scopeFar), scope4: cl(wp.cam[5] * scopeFar),
    scope6: cl(wp.cam[6] * scopeFar), scope8: cl(wp.cam[7] * scopeFar),
  };

  // ════════ ADS ════════
  const ads: SensObj = {
    tpp: cl(wp.ads[0] * cqcMul), fpp: cl(wp.ads[1] * cqcMul),
    red: cl(wp.ads[2] * scopeNear), scope2: cl(wp.ads[3] * scopeNear),
    scope3: cl(wp.ads[4] * scopeFar), scope4: cl(wp.ads[5] * scopeFar),
    scope6: cl(wp.ads[6] * scopeFar), scope8: cl(wp.ads[7] * scopeFar),
  };

  // ════════ GYRO CAMERA ════════
  const gyroCam: SensObj = {
    tpp: useAll ? cg(wp.gyro[0] * gBase) : 0,
    fpp: useAll ? cg(wp.gyro[1] * gBase) : 0,
    red: useAll ? cg(wp.gyro[2] * gBase) : 0,
    scope2: useAny ? cg(wp.gyro[3] * gBase) : 0,
    scope3: useAny ? cg(wp.gyro[4] * gScopeFar) : 0,
    scope4: useAny ? cg(wp.gyro[5] * gScopeFar) : 0,
    scope6: useAny ? cg(wp.gyro[6] * gScopeFar) : 0,
    scope8: useAny ? cg(wp.gyro[7] * gScopeFar) : 0,
  };

  // ════════ GYRO ADS ════════
  const gyroAds: SensObj = {
    tpp: useAll ? cg(wp.gyroAds[0] * gBase) : 0,
    fpp: useAll ? cg(wp.gyroAds[1] * gBase) : 0,
    red: useAll ? cg(wp.gyroAds[2] * gBase) : 0,
    scope2: useAny ? cg(wp.gyroAds[3] * gBase) : 0,
    scope3: useAny ? cg(wp.gyroAds[4] * gScopeFar) : 0,
    scope4: useAny ? cg(wp.gyroAds[5] * gScopeFar) : 0,
    scope6: useAny ? cg(wp.gyroAds[6] * gScopeFar) : 0,
    scope8: useAny ? cg(wp.gyroAds[7] * gScopeFar) : 0,
  };

  const freeLook = {
    cam: cl(115 * dM * fM, 60, 200),
    parashoot: cl(85 * dM * fM, 50, 160),
    vehicle: cl(130 * dM * fM, 80, 220),
  };

  // ════════ AI SCORE ════════
  const aiScore = Math.min(100, Math.max(30,
    20
    + (fps >= 120 ? 20 : fps >= 90 ? 12 : 6)
    + (touch >= 480 ? 15 : touch >= 240 ? 10 : 5)
    + (gyroQ === "excellent" ? 12 : gyroQ === "good" ? 8 : 4)
    + (p.fingers >= 4 ? 12 : p.fingers >= 3 ? 8 : 4)
    + (p.styleId === "conqueror" ? 12 : p.styleId === "competitive" ? 10 : 6)
    + (vRecoil <= 40 ? 10 : vRecoil <= 60 ? 7 : 4)
  ));

  return {
    cam, ads, gyroCam, gyroAds, freeLook, aiScore,
    factors: {
      fps, touchRate: touch, screenSize: screen, gyroQuality: gyroQ,
      deviceFactor: Math.round(dM * 100) / 100,
      fingerFactor: Math.round(fM * 100) / 100,
      styleFactor: Math.round(sC * 100) / 100,
      weaponFactor: Math.round(((100 - vRecoil * 0.35) / 100) * 100) / 100,
    },
  };
}

// ════════ UI Components ════════

export function CopyButton({ sens, lang }: { sens: Sens; lang: string }) {
  const [copied, setCopied] = useState(false);
  const text = () => [
    `═══ ALYAZOURI SENSITIVITY 2026 ═══`, ``,
    `📷 Camera:`, `  TPP: ${sens.cam.tpp}%  |  FPP: ${sens.cam.fpp}%`,
    `  Red Dot: ${sens.cam.red}%`, `  ×2: ${sens.cam.scope2}%  |  ×3: ${sens.cam.scope3}%`,
    `  ×4: ${sens.cam.scope4}%  |  ×6: ${sens.cam.scope6}%  |  ×8: ${sens.cam.scope8}%`, ``,
    `🎯 ADS:`, `  TPP: ${sens.ads.tpp}%  |  FPP: ${sens.ads.fpp}%`,
    `  Red Dot: ${sens.ads.red}%`, `  ×2: ${sens.ads.scope2}%  |  ×3: ${sens.ads.scope3}%`,
    `  ×4: ${sens.ads.scope4}%  |  ×6: ${sens.ads.scope6}%  |  ×8: ${sens.ads.scope8}%`, ``,
    `🔄 Gyro: TPP ${sens.gyroCam.tpp}% | FPP ${sens.gyroCam.fpp}%`,
    `🔄 Gyro ADS: TPP ${sens.gyroAds.tpp}% | FPP ${sens.gyroAds.fpp}%`, ``,
    `👁️ Free Look: ${sens.freeLook.cam}% | ${sens.freeLook.parashoot}% | ${sens.freeLook.vehicle}%`, ``,
    `🏆 AI Score: ${sens.aiScore}/100`, ``, `Generated by ALYAZOURI 2026`,
  ].join("\n");
  return (
    <button onClick={async () => { try { await navigator.clipboard.writeText(text()); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch {} }}
      className={`btn-primary w-full rounded-xl px-5 py-3 text-sm transition-all ${copied ? "copied-flash !bg-emerald-600" : ""}`}>
      {copied ? `✅ ${lang === "ar" ? "تم النسخ!" : "Copied!"}` : `📋 ${lang === "ar" ? "نسخ جميع الحساسيات" : "Copy All Sensitivity"}`}
    </button>
  );
}

export function SensitivityTable({ label, data, color = "orange", showTppFpp = true }: { label: string; data: SensObj; color?: "orange" | "sky"; showTppFpp?: boolean; }) {
  const { lang } = useLang();
  const rows: [string, number][] = [[t("sens_red_dot", lang), data.red], ["×2", data.scope2], ["×3", data.scope3], ["×4", data.scope4], ["×6", data.scope6], ["×8", data.scope8]];
  const bar = color === "orange" ? "bg-gradient-to-r from-orange-500 to-amber-300" : "bg-gradient-to-r from-sky-400 to-indigo-400";
  return (
    <div className="card rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${bar}`} />
        <h4 className="font-display text-sm font-bold tracking-wider text-white/90">{label}</h4>
      </div>
      {showTppFpp && data.tpp > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-2">
          <div className="relative overflow-hidden rounded-xl border border-orange-400/30 bg-gradient-to-br from-orange-500/15 to-red-500/10 p-3">
            <div className="absolute top-0 right-0 rounded-bl-lg bg-orange-500/20 px-2 py-0.5 font-display text-[9px] font-bold tracking-widest text-orange-300">{t("sens_cqc", lang)}</div>
            <div className="text-[10px] uppercase tracking-widest text-white/60">{t("sens_tpp", lang)}</div>
            <div className="mt-1 flex items-baseline gap-1"><span className="font-display text-2xl font-black text-orange-300 tabular-nums">{data.tpp}</span><span className="text-xs text-white/40">%</span></div>
            <div className="text-[9px] text-white/40">{t("sens_tpp_desc", lang)}</div>
          </div>
          <div className="relative overflow-hidden rounded-xl border border-amber-400/30 bg-gradient-to-br from-amber-500/15 to-orange-500/10 p-3">
            <div className="absolute top-0 right-0 rounded-bl-lg bg-amber-500/20 px-2 py-0.5 font-display text-[9px] font-bold tracking-widest text-amber-300">{t("sens_cqc", lang)}</div>
            <div className="text-[10px] uppercase tracking-widest text-white/60">{t("sens_fpp", lang)}</div>
            <div className="mt-1 flex items-baseline gap-1"><span className="font-display text-2xl font-black text-amber-300 tabular-nums">{data.fpp}</span><span className="text-xs text-white/40">%</span></div>
            <div className="text-[9px] text-white/40">{t("sens_fpp_desc", lang)}</div>
          </div>
        </div>
      )}
      <div className="space-y-2.5">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-xs text-white/60">{k}</span>
            <div className="stat-bar flex-1 h-2"><span className={bar} style={{ width: `${Math.min(100, (v / 400) * 100)}%` }} /></div>
            <span className="font-display w-12 text-right text-sm font-bold text-white tabular-nums">{v}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RecoilSimulator({ sens, weapon }: { sens: Sens; weapon: { name: string; recoil: number; type: string } }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [running, setRunning] = useState(false);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!running && tick === 0) return;
    const cvs = canvasRef.current; if (!cvs) return;
    const ctx = cvs.getContext("2d"); if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = cvs.clientWidth, h = cvs.clientHeight;
    cvs.width = w * dpr; cvs.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(255,122,0,0.08)"; ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 24) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += 24) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    ctx.strokeStyle = "rgba(255,122,0,0.9)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(w/2-10, h/2); ctx.lineTo(w/2+10, h/2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w/2, h/2-10); ctx.lineTo(w/2, h/2+10); ctx.stroke();
    const rK = weapon.recoil / 100, pull = (sens.ads.scope3 / 100) * 1.3;
    let x = w/2, y = h-20; const pts: [number,number][] = [];
    for (let i = 0; i < 30; i++) { x += (Math.random()-0.5)*10*rK; y -= 6*(1-pull*(1+i*0.04)*0.6)-2; pts.push([x,y]); }
    ctx.strokeStyle = "rgba(255,180,80,0.9)"; ctx.lineWidth = 2; ctx.beginPath();
    pts.forEach(([px,py],i) => i===0?ctx.moveTo(px,py):ctx.lineTo(px,py)); ctx.stroke();
    pts.forEach(([px,py],i) => { ctx.fillStyle=i===0?"#ffd166":`rgba(255,122,0,${0.3+0.7*(i/30)})`; ctx.beginPath(); ctx.arc(px,py,3.5,0,Math.PI*2); ctx.fill(); });
    setRunning(false);
  }, [running, tick, sens, weapon]);
  return (
    <div className="relative h-56 overflow-hidden rounded-xl border border-white/10 bg-[#07090f]">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute top-2 right-2 rounded bg-black/60 px-2 py-0.5 font-display text-[10px] tracking-widest text-orange-300">{weapon.name} · RECOIL</div>
      <button onClick={() => { setRunning(true); setTick(t => t+1); }} className="absolute bottom-2 left-2 rounded-md bg-orange-500/90 px-3 py-1 text-xs font-bold text-white hover:bg-orange-400">▶ Run</button>
    </div>
  );
}

export function FactorsPanel({ sens }: { sens: Sens }) {
  const { lang } = useLang();
  const f = [
    { k: t("factors_device", lang), v: sens.factors.deviceFactor.toFixed(2), sub: `${sens.factors.fps} FPS · ${sens.factors.touchRate} Hz`, icon: "📱" },
    { k: t("factors_fingers", lang), v: sens.factors.fingerFactor.toFixed(2), sub: "Claw grip", icon: "🖐️" },
    { k: t("factors_style", lang), v: sens.factors.styleFactor.toFixed(2), sub: "Play style", icon: "🎮" },
    { k: t("factors_weapon", lang), v: sens.factors.weaponFactor.toFixed(2), sub: "Recoil + range", icon: "🔫" },
  ];
  return (
    <div className="card rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500" />
        <h4 className="font-display text-sm font-bold tracking-widest text-white/90">{t("factors_title", lang)}</h4>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {f.map(i => (
          <div key={i.k} className="rounded-xl border border-white/5 bg-black/30 p-3">
            <div className="flex items-center justify-between"><span className="text-lg">{i.icon}</span><span className="font-display text-lg font-black text-orange-300 tabular-nums">×{i.v}</span></div>
            <div className="mt-1 text-[10px] uppercase tracking-widest text-white/50">{i.k}</div>
            <div className="text-[10px] text-white/40">{i.sub}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-lg border border-white/5 bg-black/20 p-3 text-[11px] leading-relaxed text-white/60">
        <span className="text-orange-300">{t("factors_equation", lang)}</span> <span dir="ltr" className="font-mono">Profile × Device × Fingers × Style × RecoilComp</span>
        <br /><span className="text-white/40">{t("factors_desc", lang)}</span>
      </div>
    </div>
  );
}
