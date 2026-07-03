/**
 * PUBG MOBILE REALISTIC SENSITIVITY ENGINE
 * Calibrated : Gamuters (April 2026) / 4-finger / M416 / mid-range Android
 * Reference: TPP Cam=135, ADS=130, Gyro=370, ADS Gyro=390
 */

import { useLang } from "./LanguageContext";
import { t } from "./i18n";
import { getWeaponProfile } from "./weaponProfiles";
import type { Device, ProProfileId } from "./data";
import { PRO_PROFILES } from "./data";
import { reactionTimeCompensation } from "./SensitivityOptimizer";

// =============== TYPES ===============
export type ScopeSens = {
  noScope: number; red: number; scope2: number;
  scope3: number; scope4: number; scope6: number; scope8: number;
  tpp: number; fpp: number;
};

export type GyroMode = "off" | "scope" | "always";

export type SensParams = {
  deviceId: string; device: Device; brandId: string;
  fingers: number; styleId: string; gyroMode: GyroMode;
  weaponId: string; weaponName: string;
  weaponRecoil: number; weaponRange: number; weaponType: string;
  proProfile: string;
};

export type Sens = {
  cam: ScopeSens; ads: ScopeSens;
  gyro: { cam: ScopeSens; ads: ScopeSens };
  freeLook: { cam: number; parashoot: number; vehicle: number };
  aiScore: number;
  factors: { deviceFactor: number; weaponFactor: number; fingerFactor: number; styleFactor: number };
};

export type SavedProfile = { id: string; name: string; savedAt: number; params: SensParams };

// =============== CALIBRATED BASE ===============
// Gamuters reference: 4-finger, balanced, M416 (recoil=52), mid-range Android

const REF_TPP_CAM = 135;
const REF_TPP_GYRO = 370;

// =============== SCOPE CASCADE ===============
// Gamuters Camera ratios: TPP=135, NoScope=135, Red=60, 2x=40, 3x=25, 4x=20, 6x=15, 8x=12
const CAM_SCOPE: Record<string, number> = {
  noScope: 1.00, red: 0.444, scope2: 0.296, scope3: 0.185,
  scope4: 0.148, scope6: 0.111, scope8: 0.089,
};

// Gamuters ADS ratios (vs Camera of same scope)
const ADS_SCOPE: Record<string, number> = {
  noScope: 0.963, red: 1.000, scope2: 1.100, scope3: 1.440,
  scope4: 1.500, scope6: 1.467, scope8: 1.667,
  tpp: 0.963, fpp: 0.962,
};

// Gamuters Gyro ratios (vs TPP Gyro=370)
const GYRO_SCOPE: Record<string, number> = {
  noScope: 1.000, red: 0.784, scope2: 0.595, scope3: 0.473,
  scope4: 0.405, scope6: 0.230, scope8: 0.162,
};

// Gamuters ADS Gyro boost (vs Gyro Cam of same scope)
const ADS_GYRO_SCOPE: Record<string, number> = {
  noScope: 1.054, red: 1.017, scope2: 1.036, scope3: 1.074,
  scope4: 1.107, scope6: 1.035, scope8: 1.100,
  tpp: 1.054, fpp: 0.987,
};

// =============== FINGER FACTORS ===============
// More fingers = more control → can handle LOWER sensitivity
const FINGER: Record<number, number> = {
  2: 1.06, 3: 1.03, 4: 1.00, 5: 0.98, 6: 0.96,
};

// =============== STYLE FACTORS ===============
type StyleMod = { cam: number; ads: number; gyro: number };
const STYLE: Record<string, StyleMod> = {
  balanced:    { cam: 1.00, ads: 1.00, gyro: 1.00 },
  aggressive:  { cam: 1.05, ads: 1.03, gyro: 1.08 },
  headshot:    { cam: 0.92, ads: 0.95, gyro: 0.94 },
  spray:       { cam: 0.97, ads: 1.06, gyro: 1.12 },
  competitive: { cam: 0.95, ads: 0.97, gyro: 0.93 },
  close:       { cam: 1.10, ads: 1.05, gyro: 1.15 },
  closespray:  { cam: 1.12, ads: 1.10, gyro: 1.20 },
  longspray:   { cam: 0.88, ads: 1.12, gyro: 1.05 },
};

// =============== WEAPON FACTORS ===============
// Higher recoil → need HIGHER ADS + Gyro to pull down
// Weapon TYPE also matters (SMG faster, Sniper slower)
const TYPE_MOD: Record<string, StyleMod> = {
  ar:      { cam: 1.00, ads: 1.00, gyro: 1.00 },
  smg:     { cam: 1.05, ads: 1.02, gyro: 1.08 },
  dmr:     { cam: 0.95, ads: 0.93, gyro: 0.94 },
  sniper:  { cam: 0.92, ads: 0.90, gyro: 0.90 },
  lmg:     { cam: 1.00, ads: 1.03, gyro: 1.05 },
  shotgun: { cam: 1.05, ads: 1.00, gyro: 1.05 },
  pistol:  { cam: 1.08, ads: 1.00, gyro: 1.10 },
};

// Per-weapon recoil factor (modifies ADS + Gyro based on weapon's vertical recoil)
// M416 (52 recoil) = 1.00 baseline
function weaponRecoilFactor(recoil: number, fireRate: number): StyleMod {
  const baseRecoil = 52; // M416 reference
  const recoilEffect = 1.0 + (recoil - baseRecoil) / 350;

  // Fire rate also matters — faster guns need more gyro control
  const baseRate = 700; // M416 RPM
  const rateEffect = 1.0 + (fireRate - baseRate) / 3500;

  // Combine: higher recoil + higher fire rate = more ADS/gyro needed
  const ads = clamp(recoilEffect * rateEffect, 0.85, 1.15);
  const gyro = clamp(recoilEffect * rateEffect * 1.05, 0.80, 1.20);

  return { cam: 1.00, ads, gyro };
}

// =============== DEVICE FACTORS ===============
function calcDeviceFactor(device: Device): number {
  const fps   = device.fps >= 165 ? 0.96 : device.fps >= 120 ? 1.00 : device.fps >= 90 ? 1.04 : 1.09;
  const touch = device.touchRate >= 720 ? 0.95 : device.touchRate >= 480 ? 0.98 : device.touchRate >= 240 ? 1.00 : 1.04;
  const size  = device.screenSize >= 12 ? 1.04 : device.screenSize >= 10 ? 1.01 : device.screenSize >= 6.5 ? 0.99 : 0.96;
  const ppi = computePPI(device);
  const ppif  = ppi >= 560 ? 0.96 : ppi >= 450 ? 0.98 : ppi >= 350 ? 1.00 : 1.04;
  const gyro  = device.gyroQuality === "excellent" ? 1.00 : device.gyroQuality === "good" ? 0.96 : 0.90;
  return fps * touch * size * ppif * gyro;
}

// =============== HELPERS ===============
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export function computePPI(device: Device): number {
  const p = device.resolution.split("×");
  if (p.length !== 2) return 400;
  const w = parseInt(p[0], 10), h = parseInt(p[1], 10);
  if (!w || !h || !device.screenSize) return 400;
  return Math.round(Math.sqrt(w * w + h * h) / device.screenSize);
}

// =============== SCOPE KEYS ===============
type ScopeKey = keyof ScopeSens;
const SCOPE_KEYS: ScopeKey[] = ["noScope","red","scope2","scope3","scope4","scope6","scope8"];

export const SCOPE_DEFS: { key: ScopeKey; icon: string; labelKey: string }[] = [
  { key: "noScope", icon: "⚪", labelKey: "sens_no_scope" },
  { key: "red",     icon: "🔴", labelKey: "sens_red_dot" },
  { key: "scope2",  icon: "🎯", labelKey: "sens_2x" },
  { key: "scope3",  icon: "🎯", labelKey: "sens_3x" },
  { key: "scope4",  icon: "🔭", labelKey: "sens_4x" },
  { key: "scope6",  icon: "🔭", labelKey: "sens_6x" },
  { key: "scope8",  icon: "🔭", labelKey: "sens_8x" },
];

// =============== MAIN ENGINE ===============
export function computeSensitivity(p: SensParams): Sens {
  const { device, fingers, styleId, gyroMode, weaponName, weaponRecoil, weaponRange, weaponType, proProfile } = p;

  // ---- DEVICE + REACTION TIME ----
  const devF = calcDeviceFactor(device) * reactionTimeCompensation(device);
  const Gq = device.gyroQuality === "excellent" ? 1.00 : device.gyroQuality === "good" ? 0.96 : 0.90;

  // ---- FINGER ----
  const fingF = FINGER[fingers] ?? 1.00;

  // ---- STYLE ----
  const sty = STYLE[styleId] ?? STYLE.balanced;

  // ---- PRO PROFILE ----
  const pro = PRO_PROFILES.find(x => x.id === (proProfile as ProProfileId));
  const proM = pro?.sensMultiplier ?? 1.00;

  // ---- WEAPON PROFILE ----
  const wp = getWeaponProfile(weaponName, weaponRecoil, weaponRange, weaponType);
  const wRecoil = wp.verticalRecoil;
  const wFireRate = wp.fireRate;
  const wType = wp.type;

  // Weapon modifiers: type + specific recoil
  const wt = TYPE_MOD[wType] ?? TYPE_MOD.ar;
  const wr = weaponRecoilFactor(wRecoil, wFireRate);

  // ===== CAMERA = REF_TPP_CAM × devF × fingF × sty.cam × wt.cam × proM =====
  const tppCam = clamp(Math.round(REF_TPP_CAM * devF * fingF * sty.cam * wt.cam * proM), 1, 300);
  const fppCam = clamp(Math.round(tppCam * 0.963), 1, 300);
  const cam: Record<string, number> = { tpp: tppCam, fpp: fppCam };
  for (const k of SCOPE_KEYS) cam[k] = clamp(Math.round(tppCam * (CAM_SCOPE[k] ?? 0.15)), 1, 300);

  // ===== ADS = Camera of same scope × ADS_SCOPE × wr.ads × sty.ads × wt.ads =====
  const ads: Record<string, number> = {};
  for (const k of [...SCOPE_KEYS, "tpp" as const, "fpp" as const]) {
    const camVal = cam[k];
    const ratio = ADS_SCOPE[k] ?? 1.0;
    ads[k] = clamp(Math.round(camVal * ratio * wr.ads * sty.ads * wt.ads), 1, 300);
  }

  // ===== GYRO CAM = REF_TPP_GYRO × devF × fingF × sty.gyro × wt.gyro × wr.gyro × Gq =====
  const gyroMultiplier = REF_TPP_GYRO * devF * fingF * sty.gyro * wt.gyro * wr.gyro * Gq;

  const buildGyro = (mode: GyroMode): Record<string, number> => {
    if (mode === "off") {
      const z: Record<string, number> = {};
      for (const k of [...SCOPE_KEYS, "tpp", "fpp"]) z[k] = 0;
      return z;
    }
    const out: Record<string, number> = {};
    for (const k of SCOPE_KEYS) {
      const ratio = GYRO_SCOPE[k] ?? 0.2;
      if (mode === "scope" && (k === "noScope" || k === "red")) { out[k] = 0; continue; }
      out[k] = clamp(Math.round(REF_TPP_GYRO * ratio * devF * fingF * sty.gyro * wt.gyro * wr.gyro * Gq), 1, 400);
    }
    out.tpp = mode === "scope" ? 0 : clamp(Math.round(gyroMultiplier), 1, 400);
    out.fpp = mode === "scope" ? 0 : clamp(Math.round(gyroMultiplier * 1.04), 1, 400);
    return out;
  };
  const gyroCam = buildGyro(gyroMode);

  // ===== ADS GYRO = Gyro Cam × ADS_GYRO_SCOPE × wr.ads × sty.ads =====
  const gyroAds: Record<string, number> = {};
  for (const k of [...SCOPE_KEYS, "tpp" as const, "fpp" as const]) {
    const boost = ADS_GYRO_SCOPE[k] ?? 1.05;
    gyroAds[k] = clamp(Math.round(gyroCam[k] * boost * wr.ads * sty.ads), gyroCam[k] > 0 ? 1 : 0, 400);
  }

  // ===== FREE LOOK =====
  const freeLook = {
    cam:       clamp(Math.round(tppCam * 1.04), 1, 300),
    parashoot: clamp(Math.round(tppCam * 1.19), 1, 300),
    vehicle:   clamp(Math.round(tppCam * 1.04), 1, 300),
  };

  // ===== FACTORS (display) =====
  const deviceFactor = devF;
  const weaponFactor = clamp((100 - wRecoil * 0.5) / 100, 0.4, 1);
  const fingerFactor = 1 / fingF;
  const styleFactor = sty.cam;

  // ===== AI SCORE =====
  const gyroScore = gyroMode === "off" ? 0.5 : device.gyroQuality === "excellent" ? 1.0 : device.gyroQuality === "good" ? 0.8 : 0.6;
  const aiScore = Math.round(clamp((deviceFactor*0.3+weaponFactor*0.2+fingerFactor*0.2+styleFactor*0.15+gyroScore*0.15)*100, 1, 100));

  return {
    cam: cam as ScopeSens, ads: ads as ScopeSens,
    gyro: { cam: gyroCam as ScopeSens, ads: gyroAds as ScopeSens },
    freeLook, aiScore,
    factors: { deviceFactor, weaponFactor, fingerFactor, styleFactor },
  };
}

// =============== UI ===============

export function SensTable({
  title, icon, data, max, accent = "text-orange-300",
  barClass = "from-orange-500 to-amber-400", showTppFpp = true,
}: {
  title: string; icon: string; data: ScopeSens; max: number;
  accent?: string; barClass?: string; showTppFpp?: boolean;
}) {
  const { lang } = useLang();
  const rows = SCOPE_DEFS.map(s => ({ icon: s.icon, label: t(s.labelKey as never, lang), value: data[s.key] }));
  return (
    <div className="card rounded-2xl p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <span className="text-xs font-bold uppercase tracking-widest text-white/70">{title}</span>
      </div>
      <div className="space-y-1.5">
        {rows.map(r => {
          const off = r.value <= 0;
          const pct = off ? 0 : Math.round((r.value / max) * 100);
          return (
            <div key={r.label} className={`rounded-lg bg-white/[0.02] px-2.5 py-1.5 ${off ? "opacity-40" : ""}`}>
              <div className="mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-white/70"><span>{r.icon}</span><span>{r.label}</span></span>
                <span className={`font-display text-sm font-bold tabular-nums ${off ? "text-white/30" : accent}`}>{off ? "—" : `${r.value}%`}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                <div className={`h-full rounded-full bg-gradient-to-r ${barClass}`} style={{ width: `${pct}%`, transition: "width 0.4s ease-out" }} />
              </div>
            </div>
          );
        })}
      </div>
      {showTppFpp && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-white/5 bg-black/30 px-2.5 py-1.5 text-center">
            <div className="text-[10px] text-white/40">{t("sens_tpp", lang)}</div>
            <div className="font-display text-sm font-bold text-white tabular-nums">{data.tpp}%</div>
          </div>
          <div className="rounded-lg border border-white/5 bg-black/30 px-2.5 py-1.5 text-center">
            <div className="text-[10px] text-white/40">{t("sens_fpp", lang)}</div>
            <div className="font-display text-sm font-bold text-white tabular-nums">{data.fpp}%</div>
          </div>
        </div>
      )}
    </div>
  );
}

export function FactorsCard({ factors }: { factors: Sens["factors"] }) {
  const { lang } = useLang();
  const items = [
    { k: "D", label: t("stability_device", lang), v: factors.deviceFactor },
    { k: "W", label: t("stability_weapon", lang), v: factors.weaponFactor },
    { k: "F", label: t("stability_fingers", lang), v: factors.fingerFactor },
    { k: "S", label: t("stability_style", lang), v: factors.styleFactor },
  ];
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map(it => (
        <div key={it.k} className="card rounded-xl p-3 text-center">
          <div className="font-display text-lg font-black text-orange-300">{it.k}</div>
          <div className="text-[10px] text-white/50">{it.label}</div>
          <div className="font-display text-sm font-bold text-white tabular-nums">{(it.v * 100).toFixed(0)}%</div>
        </div>
      ))}
    </div>
  );
}
