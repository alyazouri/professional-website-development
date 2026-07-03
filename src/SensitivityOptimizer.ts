import type { Device } from "./data";
import { BRANDS, PRO_PLAYERS } from "./data";
import type { ProPlayer } from "./data";
import { computePPI } from "./sensitivity";

// #19 VISUAL PERCEPTION DELAY
export function reactionTimeCompensation(device: Device, ageEstimate?: number): number {
  const fps = device.fps;
  const baseRT = fps >= 165 ? 180 : fps >= 120 ? 200 : fps >= 90 ? 220 : 250;
  const age = ageEstimate ?? 22;
  const ageFactor = 1 + Math.max(0, (age - 18) * 0.004);
  const rt = baseRT * ageFactor;
  const avgRT = 210;
  return clamp(1 + (rt - avgRT) / avgRT * 0.5, 0.85, 1.15);
}

// #28 CROSS-DEVICE TRANSFER
export type TransferResult = { factors: Record<string, number>; similarity: number; recommendation: string };

export function crossDeviceTransfer(from: Device, to: Device): TransferResult {
  const fFps = dt(from.fps, to.fps);
  const fTouch = dt(from.touchRate, to.touchRate, true);
  const fSize = dt(from.screenSize, to.screenSize);
  const fPpi = dt(computePPI(from), computePPI(to));
  const fGyro = gt(from.gyroQuality, to.gyroQuality);
  const factors = { fps: r(fFps), touch: r(fTouch), screenSize: r(fSize), ppi: r(fPpi), gyro: r(fGyro) };
  const similarity = clamp(1 - Math.abs(1 - fFps*fTouch*fSize*fPpi*fGyro) * 2, 0, 1);
  const recommendation = similarity > 0.8 ? "Very similar devices — nearly same sensitivity"
    : similarity > 0.5 ? "Minor adjustment needed — tweak sensitivity by 5-10%"
    : "Major change — recalibrate from scratch";
  return { factors, similarity: r(similarity), recommendation };
}
function dt(a: number, b: number, inv = false): number {
  return clamp(inv ? a / Math.max(1, b) : b / Math.max(1, a), 0.85, 1.15);
}
function gt(a: string, b: string): number {
  const m: Record<string, number> = { excellent: 1.0, good: 0.96, average: 0.90 };
  return clamp((m[b] ?? 0.96) / (m[a] ?? 0.96), 0.88, 1.12);
}

// #36 TRANSFER LEARNING FROM PROS
export type ProMatch = { player: ProPlayer; similarity: number; deviceMatch: number; styleMatch: number };

export function findClosestPros(device: Device, styleId: string, fingers: number): ProMatch[] {
  return PRO_PLAYERS.map(pro => {
    const pd = BRANDS.flatMap(b => b.devices).find(d => pro.device.includes(d.name.split(" ")[0]))
      ?? { fps: 120, gyroQuality: "excellent" as const, screenSize: 6.5 };
    const dFps = 1 - Math.abs(Math.log2(device.fps / Math.max(60, pd.fps))) * 0.3;
    const dGyro = device.gyroQuality === pd.gyroQuality ? 1 : 0.7;
    const dSize = 1 - Math.abs(device.screenSize - pd.screenSize) / 13;
    const deviceMatch = clamp((dFps + dGyro + dSize) / 3, 0, 1);
    const styleMatch = styleId === pro.style ? 1 : 0.5;
    const fingerMatch = 1 - Math.abs(fingers - pro.fingers) / 4;
    const similarity = clamp(deviceMatch*0.4 + styleMatch*0.35 + fingerMatch*0.25, 0, 1);
    return { player: pro, similarity: r(similarity), deviceMatch: r(deviceMatch), styleMatch: r(styleMatch) };
  }).sort((a, b) => b.similarity - a.similarity).slice(0, 3);
}

// #39 TEMPORAL STABILITY
export type SessionRecord = { timestamp: number; accuracy: number; time: number };

export function temporalStability(sessions: SessionRecord[]): { score: number; trend: string; recommendation: string } {
  if (sessions.length < 3) return { score: 0.7, trend: "stable", recommendation: "Need 3+ sessions" };
  const acc = sessions.map(s => s.accuracy);
  const mean = acc.reduce((a, b) => a + b, 0) / acc.length;
  const std = Math.sqrt(acc.reduce((s, v) => s + (v - mean)**2, 0) / acc.length);
  const cv = std / Math.max(0.01, mean);
  const score = r(clamp(1 / (1 + cv * 3), 0, 1));
  const n = sessions.length;
  const times = sessions.map(s => s.timestamp);
  const mT = times.reduce((a, b) => a + b, 0) / n;
  const slope = times.reduce((s, t, i) => s + (t - mT) * (acc[i] - mean), 0)
    / Math.max(1, times.reduce((s, t) => s + (t - mT)**2, 0));
  const trend = slope > 0.002 ? "improving" : slope < -0.002 ? "declining" : "stable";
  const rec = score > 0.8 ? "Stable — no change needed"
    : trend === "declining" ? "Declining — try reducing ADS by 2-3%"
    : "Recalibrate for consistency";
  return { score, trend, recommendation: rec };
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const r = (v: number, d = 2) => Math.round(v * 10**d) / 10**d;
