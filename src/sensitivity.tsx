// Sensitivity physics engine + UI components — ALYAZOURI 2026
import { useLang } from "./LanguageContext";
import { t } from "./i18n";
import type { Device } from "./data";
import type { ProProfileId } from "./data";
import { PRO_PROFILES } from "./data";
import { getWeaponProfile } from "./weaponProfiles";

export type GyroMode = "off" | "scope" | "always";

export type SensParams = {
  deviceId: string;
  device: Device;
  brandId: string;
  fingers: number;
  styleId: string;
  gyroMode: GyroMode;
  weaponId: string;
  weaponName: string;
  weaponRecoil: number;
  weaponRange: number;
  weaponType: string;
  proProfile: string;
};

export type ScopeSens = {
  noScope: number;
  red: number;
  scope2: number;
  scope3: number;
  scope4: number;
  scope6: number;
  scope8: number;
  tpp: number;
  fpp: number;
};

export type Sens = {
  cam: ScopeSens;
  ads: ScopeSens;
  gyro: { cam: ScopeSens; ads: ScopeSens };
  freeLook: { cam: number; parashoot: number; vehicle: number };
  aiScore: number;
  factors: { deviceFactor: number; weaponFactor: number; fingerFactor: number; styleFactor: number };
};

// ==================== MAPPINGS ====================
const STYLE_MAP: Record<string, number> = {
  balanced: 1.0,
  aggressive: 1.05,
  headshot: 0.92,
  spray: 1.08,
  competitive: 0.97,
  close: 1.1,
};

const TYPE_MAP: Record<string, number> = {
  ar: 1.0,
  smg: 1.05,
  dmr: 0.92,
  sniper: 0.85,
  lmg: 1.02,
  shotgun: 1.1,
  pistol: 1.08,
};

const FINGER_MAP: Record<number, number> = {
  2: 1.06,
  3: 1.03,
  4: 1.0,
  5: 0.98,
  6: 0.96,
};

const SCOPE_DEFS: { key: keyof ScopeSens; mag: number }[] = [
  { key: "noScope", mag: 1 },
  { key: "red", mag: 1.2 },
  { key: "scope2", mag: 2 },
  { key: "scope3", mag: 3 },
  { key: "scope4", mag: 4 },
  { key: "scope6", mag: 6 },
  { key: "scope8", mag: 8 },
];

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

function computePPI(device: Device): number {
  const parts = device.resolution.split("×");
  if (parts.length !== 2) return 400;
  const w = parseInt(parts[0], 10);
  const h = parseInt(parts[1], 10);
  if (!w || !h || !device.screenSize) return 400;
  return Math.round(Math.sqrt(w * w + h * h) / device.screenSize);
}

/**
 * ============================================================================
 *  ALYAZOURI SENSITIVITY PHYSICS ENGINE — v2 (deep calibration)
 * ============================================================================
 *
 *  The engine layers 6 calibrated sub-systems into one output:
 *
 *  1) DEVICE FACTOR (D)
 *        D = fpsTier · touchTier · sizeTier · ppiTier · gyroTier
 *        Each tier is a stepped response curve to the device's raw specs.
 *
 *  2) BASE (no-scope camera reference, ~ PUBG 0–100 scale)
 *        Base = 140 · D · F_f · S_p · W_t · P_m
 *        where F_f=finger, S_p=style, W_t=weapon-type, P_m=pro multiplier.
 *
 *  3) WEAPON COMPENSATION (W_k) — recoil-aware
 *        W_k = recoilComp · recoveryBoost · rangeComp
 *        recoilComp   = 1 − κ·Rᵥ        (harder vertical recoil lowers sens)
 *        recoveryBoost= 0.92 + 0.16·(Rc) (fast recovery gives a little back)
 *        rangeComp    = f(weaponRange)   (long-range guns tighten further)
 *
 *  4) SCOPE CURVE σ(m) — pro-tuned per magnification
 *        A hand-fitted decay (not a single power law) so every scope feels
 *        distinct. Higher zoom = much lower sensitivity for pixel precision.
 *
 *  5) ADS  → A_d = R_s · 0.88
 *  6) GYRO → G_y = R_s · γ(m) · Gq      (γ is its own per-scope curve)
 *
 *  TPP / FPP are derived from the no-scope (mag 1) value so they stay
 *  independent of the scope curve:  TPP = Base·W_k ,  FPP = TPP·0.90
 * ============================================================================
 */
export function computeSensitivity(p: SensParams): Sens {
  const { device, fingers, styleId, gyroMode, weaponName, weaponRecoil, weaponRange, weaponType, proProfile } = p;

  // ---- (1) DEVICE FACTOR (D): stepped response curves ----
  const fpsTier = device.fps >= 165 ? 0.96 : device.fps >= 120 ? 1.0 : device.fps >= 90 ? 1.04 : 1.09;
  const touchTier = device.touchRate >= 720 ? 0.95 : device.touchRate >= 480 ? 0.98 : device.touchRate >= 240 ? 1.0 : 1.04;
  const sizeTier = device.screenSize >= 12 ? 1.04 : device.screenSize >= 10 ? 1.01 : device.screenSize >= 6.5 ? 0.99 : 0.96;
  const ppi = computePPI(device);
  const ppiTier = ppi >= 560 ? 0.96 : ppi >= 450 ? 0.98 : ppi >= 350 ? 1.0 : 1.04;
  const gyroTier = device.gyroQuality === "excellent" ? 1.0 : device.gyroQuality === "good" ? 0.96 : 0.9;
  const deviceFactor = fpsTier * touchTier * sizeTier * ppiTier * gyroTier;

  // ---- (2) multipliers & BASE ----
  const fingerFactor = FINGER_MAP[fingers] ?? 1.0;
  const styleFactor = STYLE_MAP[styleId] ?? 1.0;
  const typeFactor = TYPE_MAP[weaponType] ?? 1.0;
  const pro = PRO_PROFILES.find((x) => x.id === (proProfile as ProProfileId));
  const proMultiplier = pro ? pro.sensMultiplier : 1.0;

  // stability-analysis weapon factor: lower recoil = more stable
  const weaponFactor = clamp((100 - weaponRecoil * 0.5) / 100, 0.4, 1);

  const base = 140 * deviceFactor * fingerFactor * styleFactor * typeFactor * proMultiplier;

  // ---- (3) WEAPON COMPENSATION W_k ----
  const profile = getWeaponProfile(weaponName, weaponRecoil, weaponRange, weaponType);
  const KAPPA = 0.20; // recoil stiffness coefficient
  const recoilComp = 1 - (profile.verticalRecoil / 100) * KAPPA;
  const recoveryBoost = 0.92 + (profile.recovery / 100) * 0.16;
  const rangeComp = weaponRange > 400 ? 0.85 : weaponRange > 200 ? 0.92 : weaponRange > 80 ? 0.98 : 1.0;
  const Wk = recoilComp * recoveryBoost * rangeComp;

  // ---- (4) SCOPE CURVES (pro-tuned per magnification) ----
  // σ(m): camera sensitivity ratio vs base. mag 1 = 1.0 (no scope).
  const SIGMA: Record<number, number> = {
    1: 1.0, 1.2: 0.70, 2: 0.42, 3: 0.29, 4: 0.23, 6: 0.15, 8: 0.10,
  };
  // γ(m): gyro sensitivity ratio vs base (gyro runs much higher at low zoom,
  // then decays faster than camera at high magnification).
  const GAMMA: Record<number, number> = {
    1: 2.30, 1.2: 1.85, 2: 1.50, 3: 1.20, 4: 0.95, 6: 0.70, 8: 0.50,
  };

  const buildTable = (ratioMap: Record<number, number>, extra: number): ScopeSens => {
    const out = {} as ScopeSens;
    const ns = ratioMap[1] ?? 1; // no-scope ratio → drives TPP/FPP
    for (const s of SCOPE_DEFS) {
      out[s.key] = Math.round(clamp(base * (ratioMap[s.mag] ?? ns) * Wk * extra, 1, 400));
    }
    // TPP / FPP derived from no-scope, independent of the scope curve
    out.tpp = Math.round(clamp(base * ns * Wk * extra, 1, 400));
    out.fpp = Math.round(clamp(base * ns * Wk * extra * 0.9, 1, 400));
    return out;
  };

  // ---- (5)(6) camera / ADS / gyro tables ----
  const cam = buildTable(SIGMA, 1.0);      // R_s
  const ads = buildTable(SIGMA, 0.88);      // A_d = R_s · 0.88
  // GYRO MODE — physically distinct profiles (PUBG-accurate):
  //   • off    → no gyro at all (tables hidden in UI)
  //   • scope  → gyro ONLY while aiming down a scope.
  //              Hip-fire (no-scope / TPP / FPP) gyro = 0 (touch only),
  //              scoped entries (Red Dot → 8×) get tuned gyro values.
  //   • always → gyro active at ALL times incl. hip-fire → every entry is live,
  //              slightly more responsive than scope-only for tracking.
  const Gq = device.gyroQuality === "excellent" ? 1.0 : device.gyroQuality === "good" ? 0.94 : 0.86;
  const gyroResponsive = gyroMode === "always" ? 1.12 : 0.9; // always = a touch hotter
  const buildGyro = (adsMul: number): ScopeSens => {
    const out = {} as ScopeSens;
    // hip-fire gyro value: 0 for scope-only (gyro doesn't fire un-scoped)
    const hip = gyroMode === "scope"
      ? 0
      : Math.round(clamp(base * (GAMMA[1] ?? 1) * Wk * Gq * gyroResponsive, 1, 400));
    for (const s of SCOPE_DEFS) {
      out[s.key] = s.mag <= 1
        ? hip
        : Math.round(clamp(base * (GAMMA[s.mag] ?? 1) * Wk * Gq * gyroResponsive * adsMul, 1, 400));
    }
    out.tpp = hip;
    out.fpp = Math.round(hip * 0.9);
    return out;
  };
  const gyro = gyroMode === "off"
    ? { cam: { ...cam }, ads: { ...ads } }                       // hidden when off
    : { cam: buildGyro(1.0), ads: buildGyro(0.92) };            // G_y = R_s · γ(m) · Wₖ · Gq · responsive

  // ---- Free look (derived from base·Wk) ----
  const freeLook = {
    cam: Math.round(clamp(base * Wk * 0.9, 1, 400)),
    parashoot: Math.round(clamp(base * Wk * 1.05, 1, 400)),
    vehicle: Math.round(clamp(base * Wk * 0.8, 1, 400)),
  };

  // ---- AI SCORE (weighted compatibility model) ----
  const deviceCap =
    (device.fps >= 120 ? 100 : device.fps >= 90 ? 85 : 70) * 0.3 +
    (device.touchRate >= 480 ? 95 : device.touchRate >= 240 ? 80 : 60) * 0.2 +
    (device.gyroQuality === "excellent" ? 100 : device.gyroQuality === "good" ? 85 : 70) * 0.2;
  const fingerMatch = fingers >= 4 ? 95 : fingers === 3 ? 85 : 75;
  const styleMatch = clamp(Math.round(styleFactor * 95), 0, 100);
  const weaponCompat = profile.firstShotAccuracy * 0.5 + profile.recovery * 0.5;
  const gyroScore = device.gyroQuality === "excellent" ? 95 : device.gyroQuality === "good" ? 85 : 70;
  // Gyro mode aligns the score with the chosen sensitivity profile:
  // using gyro raises aim potential (always > scope > off).
  const gyroModeBonus = gyroMode === "off" ? -3 : gyroMode === "scope" ? 2 : 4;
  const aiScore = clamp(
    Math.round(deviceCap * 0.3 + fingerMatch * 0.2 + styleMatch * 0.15 + weaponCompat * 0.2 + gyroScore * 0.15 + gyroModeBonus),
    1,
    99
  );

  return {
    cam,
    ads,
    gyro,
    freeLook,
    aiScore,
    factors: { deviceFactor, weaponFactor, fingerFactor, styleFactor },
  };
}

// ==================== SAVED PROFILES ====================
const PROFILES_KEY = "alyazouri_profiles";

export type SavedProfile = { id: string; name: string; params: SensParams; savedAt: number };

export function loadProfiles(): SavedProfile[] {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    return raw ? (JSON.parse(raw) as SavedProfile[]) : [];
  } catch {
    return [];
  }
}

export function saveProfiles(profiles: SavedProfile[]) {
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch { /* ignore */ }
}

// ==================== UI: SENSITIVITY TABLE ====================
const ROW_ICONS: Record<string, string> = {
  noScope: "⭕",
  red: "🔴",
  scope2: "2️⃣",
  scope3: "3️⃣",
  scope4: "4️⃣",
  scope6: "6️⃣",
  scope8: "8️⃣",
};

export function SensTable({
  label,
  data,
  color = "orange",
  showTppFpp = true,
}: {
  label: string;
  data: ScopeSens;
  color?: "orange" | "purple";
  showTppFpp?: boolean;
}) {
  const { lang } = useLang();
  const rows: { icon: string; label: string; value: number }[] = [
    { icon: ROW_ICONS.noScope, label: t("sens_no_scope", lang), value: data.noScope },
    { icon: ROW_ICONS.red, label: t("sens_red_dot", lang), value: data.red },
    { icon: ROW_ICONS.scope2, label: t("sens_2x", lang), value: data.scope2 },
    { icon: ROW_ICONS.scope3, label: t("sens_3x", lang), value: data.scope3 },
    { icon: ROW_ICONS.scope4, label: t("sens_4x", lang), value: data.scope4 },
    { icon: ROW_ICONS.scope6, label: t("sens_6x", lang), value: data.scope6 },
    { icon: ROW_ICONS.scope8, label: t("sens_8x", lang), value: data.scope8 },
  ];

  const accent = color === "purple" ? "text-purple-300" : "text-orange-300";
  const dotBg = color === "purple" ? "bg-purple-500" : "bg-orange-500";
  const barGrad = color === "purple" ? "from-purple-600 to-purple-300" : "from-orange-600 to-orange-300";
  const glow = color === "purple" ? "rgba(168,85,247,0.55)" : "rgba(255,122,0,0.55)";
  // normalize each row to the table's own peak so the magnification decay reads visually
  // ignore zero entries (e.g. scope-only hip-fire gyro) when finding the peak
  const liveRows = rows.filter((r) => r.value > 0);
  const max = Math.max(...liveRows.map((r) => r.value), 1);

  return (
    <div className="card rounded-2xl p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">{color === "orange" ? "📷" : "🌀"}</span>
        <h4 className={`font-display text-sm font-bold tracking-wide ${accent}`}>{label}</h4>
      </div>
      <div className="space-y-1.5">
        {rows.map((r) => {
          const off = r.value <= 0;
          const pct = off ? 0 : Math.round((r.value / max) * 100);
          return (
            <div key={r.label} className={`rounded-lg bg-white/[0.02] px-2.5 py-1.5 ${off ? "opacity-40" : ""}`}>
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-white/70">
                  <span>{r.icon}</span>
                  <span>{r.label}</span>
                </div>
                <span className={`font-display text-sm font-bold tabular-nums ${off ? "text-white/30" : accent}`}>
                  {off ? "—" : `${r.value}%`}
                </span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${barGrad} transition-all duration-500`}
                  style={{ width: `${pct}%`, boxShadow: off ? "none" : `0 0 6px ${glow}` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {showTppFpp && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-white/5 bg-black/30 px-2.5 py-1.5 text-center">
            <div className="text-[9px] uppercase tracking-widest text-white/40">{t("sens_tpp", lang)}</div>
            <div className={`font-display text-sm font-bold tabular-nums ${accent}`}>{data.tpp}%</div>
          </div>
          <div className="rounded-lg border border-white/5 bg-black/30 px-2.5 py-1.5 text-center">
            <div className="text-[9px] uppercase tracking-widest text-white/40">{t("sens_fpp", lang)}</div>
            <div className={`font-display text-sm font-bold tabular-nums ${accent}`}>{data.fpp}%</div>
          </div>
        </div>
      )}
      <div className={`mt-2 h-0.5 w-full rounded ${dotBg} opacity-40`} />
    </div>
  );
}

// ==================== UI: FACTORS CARD ====================
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
      {items.map((it) => (
        <div key={it.k} className="card rounded-xl p-3 text-center">
          <div className="font-display text-lg font-black text-orange-300">{it.k}</div>
          <div className="text-[10px] text-white/50">{it.label}</div>
          <div className="mt-1 font-display text-sm font-bold text-white tabular-nums">
            {(it.v * 100).toFixed(0)}%
          </div>
        </div>
      ))}
    </div>
  );
}
