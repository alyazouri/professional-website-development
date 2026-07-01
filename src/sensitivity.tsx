import { useState } from "react";
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
  factors: { fps: number; touchRate: number; screenSize: number; gyroQuality: string; deviceFactor: number; fingerFactor: number; styleFactor: number; weaponFactor: number };
};

export type GyroMode = "off" | "scope" | "always";

export type SensParams = {
  deviceId: string;
  device: { name: string; fps: number; touchRate: number; screenSize: number; resolution: string; gyroQuality: "excellent" | "good" | "average"; };
  brandId: string; fingers: number; styleId: string; gyroMode: GyroMode;
  weaponId: string; weaponName: string; weaponRecoil: number; weaponRange: number; weaponType: string;
  proProfile?: string;
  isSuperPower?: boolean;
};

const cl = (n: number, min = SENS_MIN, max = SENS_MAX) => Math.max(min, Math.min(max, Math.round(n)));
const cg = (n: number) => Math.max(SENS_MIN, Math.min(GYRO_MAX, Math.round(n)));

export function computeSensitivity(p: SensParams): Sens {
  const wp = getWeaponProfile(p.weaponName, p.weaponRecoil, p.weaponRange, p.weaponType);
  const { fps, touchRate: touch, screenSize: screen, gyroQuality: gyroQ, resolution } = p.device;

  // PPI calculation
  const rm = resolution.match(/(\d+)[×x](\d+)/);
  const resW = rm ? +rm[1] : 2400;
  const resH = rm ? +rm[2] : 1080;
  const ppi = Math.sqrt(resW * resW + resH * resH) / screen;

  // DEVICE FACTOR
  const fpsF = fps >= 165 ? 0.96 : fps >= 144 ? 0.98 : fps >= 120 ? 1.0 : fps >= 90 ? 1.03 : 1.05;
  const touchF = touch >= 960 ? 0.97 : touch >= 720 ? 0.98 : touch >= 480 ? 0.99 : touch >= 240 ? 1.0 : 1.02;
  const screenF = screen >= 13 ? 1.03 : screen >= 11 ? 1.0 : screen >= 8.3 ? 0.98 : screen >= 6.7 ? 0.96 : 0.95;
  const ppiF = ppi >= 500 ? 0.98 : ppi >= 400 ? 0.99 : ppi >= 300 ? 1.0 : 1.01;
  const gyroQF = gyroQ === "excellent" ? 1.0 : gyroQ === "good" ? 0.97 : 0.92;

  const dM = fpsF * touchF * screenF * ppiF;
  const dG = dM * gyroQF;

  // FINGER FACTOR
  const fM = ({ 2: 1.04, 3: 1.02, 4: 1.0, 5: 0.98, 6: 0.96 } as Record<number, number>)[p.fingers] ?? 1.0;

  // STYLE FACTOR
  const sC = ({ headshot: 0.97, spray: 1.02, competitive: 1.0, close: 1.03, reflex: 1.02, conqueror: 0.98 } as Record<string, number>)[p.styleId] ?? 1.0;
  const sS = ({ headshot: 0.96, spray: 1.01, competitive: 1.0, close: 1.01, reflex: 1.0, conqueror: 0.97 } as Record<string, number>)[p.styleId] ?? 1.0;
  const sG = ({ headshot: 1.02, spray: 1.01, competitive: 1.0, close: 1.01, reflex: 1.01, conqueror: 0.99 } as Record<string, number>)[p.styleId] ?? 1.0;

  // GYRO OFF BOOST
  const gOff = (p.gyroMode === "off" || p.gyroMode === "scope") ? 1.05 : 1.0;

  // PRO PROFILE MULTIPLIERS
  const prof = p.proProfile ? PRO_PROFILES.find(pr => pr.id === p.proProfile) : null;
  const profCQC = prof?.cqcMul ?? 1.0;
  const profNear = prof?.scopeNearMul ?? 1.0;
  const profFar = prof?.scopeFarMul ?? 1.0;
  const profGyro = prof?.gyroMul ?? 1.0;
  const profGyroFar = prof?.gyroFarMul ?? 1.0;

  // RECOIL-AWARE SCOPE STABILITY
  const vRecoil = wp.verticalRecoil;
  const scopeStab = vRecoil >= 80 ? 0.93 : vRecoil >= 65 ? 0.95 : vRecoil >= 50 ? 0.97 : 1.0;
  const horizStab = wp.horizontalRecoil >= 40 ? 0.95 : wp.horizontalRecoil >= 30 ? 0.97 : 1.0;

  // WEAPON TYPE BASE
  const typeMul = { ar: 1.0, smg: 1.12, dmr: 0.82, sniper: 0.65, lmg: 0.88, shotgun: 1.08, pistol: 1.15 }[wp.type] ?? 1.0;

  // BASE SENSITIVITY
  const baseSens = 135 * dM * fM * sC * typeMul * gOff * profCQC;
  const baseADS = baseSens * 0.92 * horizStab * profNear;
  const baseGyro = 220 * dG * fM * sG * typeMul * profGyro;
  const baseGyroADS = baseGyro * 0.9 * horizStab * profGyro;

  // SCOPE MULTIPLIERS — calibrated realistic values (decrease with magnification)
  // Camera (TPP=100%, Red=90%, 2x=75%, 3x=62%, 4x=52%, 6x=38%, 8x=30%)
  const scopeMulCam = (mag: number) => {
    if (mag <= 1) return 0.90;
    if (mag === 2) return 0.75;
    if (mag === 3) return 0.62;
    if (mag === 4) return 0.52;
    if (mag === 6) return 0.38;
    if (mag === 8) return 0.30;
    return 0.48;
  };
  const scopeMulAds = (mag: number, isStab: boolean) => {
    const base = scopeMulCam(mag) * 0.88;
    return isStab ? base * scopeStab : base;
  };

  const cam: SensObj = {
    tpp: cl(baseSens),
    fpp: cl(baseSens * 1.08),
    red: cl(baseSens * scopeMulCam(1)),
    scope2: cl(baseSens * scopeMulCam(2)),
    scope3: cl(baseSens * scopeMulCam(3)),
    scope4: cl(baseSens * scopeMulCam(4)),
    scope6: cl(baseSens * scopeMulCam(6) * profFar),
    scope8: cl(baseSens * scopeMulCam(8) * profFar),
  };
  const ads: SensObj = {
    tpp: cl(baseADS),
    fpp: cl(baseADS * 1.08),
    red: cl(baseADS * scopeMulAds(1, true)),
    scope2: cl(baseADS * scopeMulAds(2, true)),
    scope3: cl(baseADS * scopeMulAds(3, true)),
    scope4: cl(baseADS * scopeMulAds(4, true)),
    scope6: cl(baseADS * scopeMulAds(6, true) * profFar),
    scope8: cl(baseADS * scopeMulAds(8, true) * profFar),
  };
  const gyroMul = (mag: number) => {
    // Gyro (TPP=100%, Red=100%, 2x=82%, 3x=68%, 4x=58%, 6x=45%, 8x=35%)
    if (mag <= 1) return 1.00;
    if (mag === 2) return 0.82;
    if (mag === 3) return 0.68;
    if (mag === 4) return 0.58;
    if (mag === 6) return 0.45 * profGyroFar;
    if (mag === 8) return 0.35 * profGyroFar;
    return 0.52;
  };
  const gyroAdsMul = (mag: number) => gyroMul(mag) * 0.88 * horizStab;

  const gyroCam: SensObj = {
    tpp: cg(baseGyro),
    fpp: cg(baseGyro * 1.05),
    red: cg(baseGyro * gyroMul(1)),
    scope2: cg(baseGyro * gyroMul(2)),
    scope3: cg(baseGyro * gyroMul(3)),
    scope4: cg(baseGyro * gyroMul(4)),
    scope6: cg(baseGyro * gyroMul(6)),
    scope8: cg(baseGyro * gyroMul(8)),
  };
  const gyroAds: SensObj = {
    tpp: cg(baseGyroADS),
    fpp: cg(baseGyroADS * 1.05),
    red: cg(baseGyroADS * gyroAdsMul(1)),
    scope2: cg(baseGyroADS * gyroAdsMul(2)),
    scope3: cg(baseGyroADS * gyroAdsMul(3)),
    scope4: cg(baseGyroADS * gyroAdsMul(4)),
    scope6: cg(baseGyroADS * gyroAdsMul(6)),
    scope8: cg(baseGyroADS * gyroAdsMul(8)),
  };

  // FREE LOOK
  const freeLook = {
    cam: cl(baseSens * 1.2),
    parashoot: cl(baseSens * 0.85),
    vehicle: cl(baseSens * 0.9),
  };

  // AI SCORE (0-100) based on factor harmony
  const deviceFactor = Math.min(1, (fps / 120) * (touch / 240) * (1 / (ppi / 400)));
  const fingerFactor = p.fingers >= 4 ? 1 : p.fingers === 3 ? 0.85 : 0.7;
  const styleFactor = (sC + sS) / 2;
  const weaponFactor = Math.max(0.5, 1 - (vRecoil / 200));
  const aiScore = Math.round(
    (deviceFactor * 0.3 + fingerFactor * 0.2 + styleFactor * 0.2 + weaponFactor * 0.15 + (gyroQF) * 0.15) * 100
  );

  return {
    cam, ads, gyroCam, gyroAds, freeLook,
    aiScore: Math.max(45, Math.min(99, aiScore)),
    factors: {
      fps, touchRate: touch, screenSize: screen, gyroQuality: gyroQ,
      deviceFactor: dM, fingerFactor: fM, styleFactor: sC, weaponFactor: 1 - vRecoil / 200,
    },
  };
}

// ==================== UI COMPONENTS ====================

export function SensitivityTable({ label, data, color, showTppFpp = false }: {
  label: string; data: SensObj; color: "orange" | "sky"; showTppFpp?: boolean;
}) {
  const { lang } = useLang();
  const accent = color === "orange" ? "text-orange-300" : "text-sky-300";
  const border = color === "orange" ? "border-orange-400/20" : "border-sky-400/20";
  const bg = color === "orange" ? "from-orange-500/5 to-red-500/5" : "from-sky-500/5 to-cyan-500/5";
  const rows: { label: string; value: number; icon: string }[] = [
    { label: t("sens_no_scope", lang), value: data.tpp, icon: "🎯" },
    { label: "Red Dot", value: data.red, icon: "🔴" },
    { label: "2×", value: data.scope2, icon: "🔭" },
    { label: "3×", value: data.scope3, icon: "🎯" },
    { label: "4×", value: data.scope4, icon: "🔭" },
    { label: "6×", value: data.scope6, icon: "🎯" },
    { label: "8×", value: data.scope8, icon: "🔭" },
  ];

  return (
    <div className={`card rounded-2xl p-5 bg-gradient-to-br ${bg} border ${border}`}>
      <h4 className={`font-display text-sm font-bold tracking-widest ${accent} mb-3 flex items-center gap-2`}>
        <span>{color === "orange" ? "📷" : "🌀"}</span>
        {label}
      </h4>
      <div className="space-y-1.5">
        {rows.map((r) => (
          <div key={r.label} className="group flex items-center justify-between rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-xs transition-colors hover:border-white/15 hover:bg-black/30">
            <span className="flex items-center gap-2 text-white/70">
              <span>{r.icon}</span>
              <span>{r.label}</span>
            </span>
            <span className={`font-display font-bold ${accent} tabular-nums`}>{r.value}%</span>
          </div>
        ))}
      </div>
      {showTppFpp && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
          <div className="rounded-lg border border-white/5 bg-black/30 p-2 text-center">
            <div className="text-white/40">TPP</div>
            <div className={`font-display font-bold ${accent} tabular-nums`}>{data.tpp}%</div>
          </div>
          <div className="rounded-lg border border-white/5 bg-black/30 p-2 text-center">
            <div className="text-white/40">FPP</div>
            <div className={`font-display font-bold ${accent} tabular-nums`}>{data.fpp}%</div>
          </div>
        </div>
      )}
    </div>
  );
}

export function FactorsPanel({ sens }: { sens: Sens }) {
  const { lang } = useLang();
  const items = [
    { label: "FPS", value: sens.factors.fps, icon: "🎮" },
    { label: lang === "ar" ? "معدل اللمس" : "Touch Rate", value: `${sens.factors.touchRate} Hz`, icon: "👆" },
    { label: lang === "ar" ? "حجم الشاشة" : "Screen", value: `${sens.factors.screenSize}"`, icon: "📱" },
    { label: "PPI", value: "auto", icon: "🎯" },
    { label: lang === "ar" ? "الجايرو" : "Gyro", value: sens.factors.gyroQuality, icon: "🌀" },
  ];
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {items.map((it) => (
        <div key={it.label} className="rounded-xl border border-white/5 bg-black/30 p-3 text-center">
          <div className="text-xl">{it.icon}</div>
          <div className="mt-1 text-[10px] uppercase tracking-widest text-white/40">{it.label}</div>
          <div className="font-display text-xs font-bold text-white tabular-nums">{it.value}</div>
        </div>
      ))}
    </div>
  );
}

export function CopyButton({ sens, lang }: { sens: Sens; lang: "ar" | "en" | "tr" | "ru" | "es" }) {
  const [copied, setCopied] = useState(false);
  const isAr = lang === "ar";
  const handleCopy = async () => {
    const text = [
      isAr ? "🎯 حساسيتي من ALYAZOURI 2026" : "🎯 My Sensitivity from ALYAZOURI 2026",
      `📷 TPP: ${sens.cam.tpp}% | FPP: ${sens.cam.fpp}%`,
      `🎯 ADS TPP: ${sens.ads.tpp}% | FPP: ${sens.ads.fpp}%`,
      `🔴 Red: ${sens.cam.red}% | 🔵 4x: ${sens.cam.scope4}%`,
      `🏆 AI Score: ${sens.aiScore}/100`,
      `🔗 alyazouri.com`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* ignore */ }
  };
  return (
    <button onClick={handleCopy} className={`btn-primary w-full rounded-xl px-5 py-3 text-sm ${copied ? "!bg-emerald-500" : ""}`}>
      {copied ? `✅ ${isAr ? "تم النسخ!" : "Copied!"}` : `📋 ${isAr ? "نسخ الحساسية" : "Copy Sensitivity"}`}
    </button>
  );
}

export function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="mx-auto mb-8 max-w-3xl text-center">
      <div className="font-display text-[11px] tracking-[0.3em] text-orange-400">{eyebrow}</div>
      <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">{title}</h2>
      <p className="mt-2 text-sm text-white/60">{subtitle}</p>
    </div>
  );
}
