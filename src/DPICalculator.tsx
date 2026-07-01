import { useState, useMemo } from "react";
import { useLang } from "./LanguageContext";

const PRO_PRESETS = [
  { name: "Paraboy", dpi: 320, sens: 200, style: "Spray" },
  { name: "Jonathan", dpi: 280, sens: 180, style: "Headshot" },
  { name: "Levinho", dpi: 300, sens: 160, style: "Balanced" },
  { name: "Mortal", dpi: 260, sens: 170, style: "Aggressive" },
  { name: "Athena", dpi: 300, sens: 190, style: "CQC" },
];

export function DPICalculator() {
  const { lang } = useLang();
  const isAr = lang === "ar";

  const [dpi, setDpi] = useState(300);
  const [sensitivity, setSensitivity] = useState(150);
  const [screenWidth, setScreenWidth] = useState(6.5);

  const results = useMemo(() => {
    const eDPI = dpi * sensitivity;
    const screenWidthCm = screenWidth * 2.54;
    const cmPer360 = screenWidthCm * (100 / sensitivity);
    const cmPer180 = cmPer360 / 2;
    const cmPer90 = cmPer360 / 4;
    const closestPro = PRO_PRESETS.reduce((closest, pro) => {
      const proDPI = pro.dpi * pro.sens;
      const diff = Math.abs(proDPI - eDPI);
      const closestDiff = Math.abs(closest.dpi * closest.sens - eDPI);
      return diff < closestDiff ? pro : closest;
    }, PRO_PRESETS[0]);

    const speedCategory =
      cmPer360 > 30 ? { label: isAr ? "بطيء جداً — دقة عالية" : "Very Slow — High Precision", color: "text-sky-300", icon: "🎯" } :
      cmPer360 > 20 ? { label: isAr ? "بطيء — دقة جيدة" : "Slow — Good Precision", color: "text-cyan-300", icon: "🏹" } :
      cmPer360 > 12 ? { label: isAr ? "متوسط — متوازن" : "Medium — Balanced", color: "text-emerald-300", icon: "⚖️" } :
      cmPer360 > 6 ? { label: isAr ? "سريع — عدواني" : "Fast — Aggressive", color: "text-orange-300", icon: "⚡" } :
      { label: isAr ? "سريع جداً — محترف" : "Very Fast — Pro", color: "text-red-300", icon: "🔥" };

    return { eDPI, cmPer360, cmPer180, cmPer90, closestPro, speedCategory };
  }, [dpi, sensitivity, screenWidth, isAr]);

  return (
    <div className="card neon-box rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xl">🧮</span>
        <h3 className="font-display text-sm font-bold tracking-widest text-white">
          {isAr ? "حاسبة DPI / الحساسية" : "DPI / Sensitivity Calculator"}
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs text-white/70">DPI</label>
            <span className="font-display text-sm font-bold text-orange-300 tabular-nums">{dpi}</span>
          </div>
          <input type="range" min="100" max="800" step="10" value={dpi} onChange={(e) => setDpi(Number(e.target.value))} className="w-full" />
          <div className="mt-1 flex justify-between text-[9px] text-white/30">
            <span>100</span><span>400</span><span>800</span>
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs text-white/70">{isAr ? "الحساسية" : "Sensitivity"} %</label>
            <span className="font-display text-sm font-bold text-orange-300 tabular-nums">{sensitivity}%</span>
          </div>
          <input type="range" min="10" max="300" step="5" value={sensitivity} onChange={(e) => setSensitivity(Number(e.target.value))} className="w-full" />
          <div className="mt-1 flex justify-between text-[9px] text-white/30">
            <span>10%</span><span>150%</span><span>300%</span>
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs text-white/70">{isAr ? "حجم الشاشة" : "Screen Size"}</label>
            <span className="font-display text-sm font-bold text-orange-300 tabular-nums">{screenWidth}"</span>
          </div>
          <input type="range" min="5" max="13" step="0.1" value={screenWidth} onChange={(e) => setScreenWidth(Number(e.target.value))} className="w-full" />
          <div className="mt-1 flex justify-between text-[9px] text-white/30">
            <span>5"</span><span>8"</span><span>13"</span>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div className="rounded-xl border border-orange-400/30 bg-gradient-to-br from-orange-500/10 to-red-500/5 p-4 text-center">
          <div className="text-[10px] uppercase tracking-widest text-white/50">eDPI</div>
          <div className="mt-1 font-display text-3xl font-black text-orange-300 tabular-nums">{results.eDPI.toLocaleString()}</div>
          <div className={`mt-1 flex items-center justify-center gap-1.5 text-xs font-semibold ${results.speedCategory.color}`}>
            <span>{results.speedCategory.icon}</span><span>{results.speedCategory.label}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-white/5 bg-black/30 p-2.5 text-center">
            <div className="text-[10px] text-white/40">360°</div>
            <div className="font-display text-base font-bold text-white tabular-nums">{results.cmPer360.toFixed(1)}</div>
            <div className="text-[9px] text-white/30">cm</div>
          </div>
          <div className="rounded-lg border border-white/5 bg-black/30 p-2.5 text-center">
            <div className="text-[10px] text-white/40">180°</div>
            <div className="font-display text-base font-bold text-white tabular-nums">{results.cmPer180.toFixed(1)}</div>
            <div className="text-[9px] text-white/30">cm</div>
          </div>
          <div className="rounded-lg border border-white/5 bg-black/30 p-2.5 text-center">
            <div className="text-[10px] text-white/40">90°</div>
            <div className="font-display text-base font-bold text-white tabular-nums">{results.cmPer90.toFixed(1)}</div>
            <div className="text-[9px] text-white/30">cm</div>
          </div>
        </div>

        <div className="rounded-xl border border-purple-400/20 bg-purple-500/5 p-3">
          <div className="mb-2 text-[10px] uppercase tracking-widest text-purple-300/70">
            {isAr ? "أقرب لاعب محترف" : "Closest Pro Player"}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display text-sm font-bold text-white">👑 {results.closestPro.name}</div>
              <div className="text-[10px] text-white/50">{results.closestPro.style}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-white/50">DPI: {results.closestPro.dpi} · Sens: {results.closestPro.sens}%</div>
              <div className="text-[10px] text-purple-300">eDPI: {(results.closestPro.dpi * results.closestPro.sens).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
