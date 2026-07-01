// Weapon recoil profiles - calibrated data for sensitivity tuning
export type WeaponProfile = {
  verticalRecoil: number;   // 0-100
  horizontalRecoil: number; // 0-100
  recovery: number;         // 0-100 (higher = faster recovery)
  firstShotAccuracy: number;// 0-100
  fireRate: number;         // RPM
  type: "ar" | "smg" | "dmr" | "sniper" | "lmg" | "shotgun" | "pistol";
};

const PROFILES: Record<string, WeaponProfile> = {
  M416:      { verticalRecoil: 52, horizontalRecoil: 30, recovery: 78, firstShotAccuracy: 88, fireRate: 750, type: "ar" },
  AKM:       { verticalRecoil: 78, horizontalRecoil: 45, recovery: 62, firstShotAccuracy: 76, fireRate: 600, type: "ar" },
  "SCAR-L":  { verticalRecoil: 48, horizontalRecoil: 28, recovery: 82, firstShotAccuracy: 90, fireRate: 700, type: "ar" },
  M762:      { verticalRecoil: 72, horizontalRecoil: 40, recovery: 65, firstShotAccuracy: 80, fireRate: 700, type: "ar" },
  AUG:       { verticalRecoil: 45, horizontalRecoil: 26, recovery: 85, firstShotAccuracy: 92, fireRate: 680, type: "ar" },
  M16A4:     { verticalRecoil: 58, horizontalRecoil: 32, recovery: 75, firstShotAccuracy: 94, fireRate: 800, type: "ar" },
  G36C:      { verticalRecoil: 50, horizontalRecoil: 28, recovery: 80, firstShotAccuracy: 88, fireRate: 700, type: "ar" },
  QBZ:       { verticalRecoil: 46, horizontalRecoil: 27, recovery: 84, firstShotAccuracy: 90, fireRate: 720, type: "ar" },
  ACE32:     { verticalRecoil: 54, horizontalRecoil: 31, recovery: 76, firstShotAccuracy: 86, fireRate: 740, type: "ar" },
  FAMAS:     { verticalRecoil: 55, horizontalRecoil: 32, recovery: 74, firstShotAccuracy: 85, fireRate: 900, type: "ar" },
  Groza:     { verticalRecoil: 68, horizontalRecoil: 38, recovery: 68, firstShotAccuracy: 82, fireRate: 750, type: "ar" },
  "Mk47 Mutant": { verticalRecoil: 70, horizontalRecoil: 36, recovery: 70, firstShotAccuracy: 84, fireRate: 600, type: "ar" },
  UMP45:     { verticalRecoil: 32, horizontalRecoil: 22, recovery: 88, firstShotAccuracy: 84, fireRate: 650, type: "smg" },
  Vector:    { verticalRecoil: 28, horizontalRecoil: 24, recovery: 86, firstShotAccuracy: 80, fireRate: 1100, type: "smg" },
  "Tommy Gun": { verticalRecoil: 40, horizontalRecoil: 28, recovery: 72, firstShotAccuracy: 78, fireRate: 700, type: "smg" },
  MP5K:      { verticalRecoil: 30, horizontalRecoil: 22, recovery: 90, firstShotAccuracy: 86, fireRate: 850, type: "smg" },
  "PP-19 Bizon": { verticalRecoil: 26, horizontalRecoil: 20, recovery: 92, firstShotAccuracy: 82, fireRate: 680, type: "smg" },
  P90:       { verticalRecoil: 34, horizontalRecoil: 25, recovery: 84, firstShotAccuracy: 82, fireRate: 950, type: "smg" },
  UMP9:      { verticalRecoil: 33, horizontalRecoil: 23, recovery: 87, firstShotAccuracy: 83, fireRate: 650, type: "smg" },
  Mini14:    { verticalRecoil: 38, horizontalRecoil: 24, recovery: 80, firstShotAccuracy: 94, fireRate: 400, type: "dmr" },
  SKS:       { verticalRecoil: 48, horizontalRecoil: 28, recovery: 75, firstShotAccuracy: 90, fireRate: 350, type: "dmr" },
  SLR:       { verticalRecoil: 62, horizontalRecoil: 32, recovery: 68, firstShotAccuracy: 88, fireRate: 380, type: "dmr" },
  Mk14:      { verticalRecoil: 72, horizontalRecoil: 38, recovery: 60, firstShotAccuracy: 86, fireRate: 450, type: "dmr" },
  DMR:       { verticalRecoil: 58, horizontalRecoil: 30, recovery: 72, firstShotAccuracy: 88, fireRate: 360, type: "dmr" },
  VSS:       { verticalRecoil: 22, horizontalRecoil: 18, recovery: 82, firstShotAccuracy: 85, fireRate: 300, type: "dmr" },
  QBU:       { verticalRecoil: 42, horizontalRecoil: 26, recovery: 78, firstShotAccuracy: 92, fireRate: 380, type: "dmr" },
  AWM:       { verticalRecoil: 92, horizontalRecoil: 42, recovery: 55, firstShotAccuracy: 98, fireRate: 55, type: "sniper" },
  Kar98k:    { verticalRecoil: 80, horizontalRecoil: 38, recovery: 60, firstShotAccuracy: 96, fireRate: 52, type: "sniper" },
  M24:       { verticalRecoil: 78, horizontalRecoil: 36, recovery: 62, firstShotAccuracy: 97, fireRate: 54, type: "sniper" },
  Win94:     { verticalRecoil: 55, horizontalRecoil: 30, recovery: 70, firstShotAccuracy: 90, fireRate: 60, type: "sniper" },
  "Lynx AMR": { verticalRecoil: 95, horizontalRecoil: 45, recovery: 50, firstShotAccuracy: 96, fireRate: 65, type: "sniper" },
  M249:      { verticalRecoil: 68, horizontalRecoil: 40, recovery: 58, firstShotAccuracy: 75, fireRate: 850, type: "lmg" },
  "DP-28":   { verticalRecoil: 72, horizontalRecoil: 42, recovery: 55, firstShotAccuracy: 72, fireRate: 650, type: "lmg" },
  S12K:      { verticalRecoil: 65, horizontalRecoil: 45, recovery: 60, firstShotAccuracy: 68, fireRate: 350, type: "shotgun" },
  S1897:     { verticalRecoil: 85, horizontalRecoil: 50, recovery: 45, firstShotAccuracy: 72, fireRate: 80, type: "shotgun" },
  S686:      { verticalRecoil: 90, horizontalRecoil: 48, recovery: 48, firstShotAccuracy: 74, fireRate: 200, type: "shotgun" },
  DBS:       { verticalRecoil: 78, horizontalRecoil: 44, recovery: 52, firstShotAccuracy: 76, fireRate: 220, type: "shotgun" },
  P92:       { verticalRecoil: 25, horizontalRecoil: 20, recovery: 85, firstShotAccuracy: 82, fireRate: 450, type: "pistol" },
  P1911:     { verticalRecoil: 22, horizontalRecoil: 18, recovery: 88, firstShotAccuracy: 84, fireRate: 500, type: "pistol" },
  R1895:     { verticalRecoil: 40, horizontalRecoil: 28, recovery: 70, firstShotAccuracy: 80, fireRate: 180, type: "pistol" },
  "Desert Eagle": { verticalRecoil: 55, horizontalRecoil: 32, recovery: 65, firstShotAccuracy: 85, fireRate: 150, type: "pistol" },
  P18C:      { verticalRecoil: 32, horizontalRecoil: 22, recovery: 80, firstShotAccuracy: 80, fireRate: 900, type: "pistol" },
  Scorpion:  { verticalRecoil: 28, horizontalRecoil: 22, recovery: 82, firstShotAccuracy: 78, fireRate: 850, type: "pistol" },
};

// Default weapon profile used as fallback reference
export const DEFAULT_PROFILE: WeaponProfile = {
  verticalRecoil: 50, horizontalRecoil: 30, recovery: 70, firstShotAccuracy: 80, fireRate: 600, type: "ar"
};

export function getWeaponProfile(name: string, recoil: number, range: number, type: string): WeaponProfile {
  const p = PROFILES[name];
  if (p) return p;
  return {
    verticalRecoil: recoil,
    horizontalRecoil: Math.round(recoil * 0.6),
    recovery: Math.max(50, 100 - Math.round(recoil * 0.3)),
    firstShotAccuracy: Math.min(95, 60 + Math.round(range * 0.3)),
    fireRate: 600,
    type: (type as WeaponProfile["type"]) || "ar",
  };
}
