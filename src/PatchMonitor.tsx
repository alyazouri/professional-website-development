import { useState } from "react";
import { useLang } from "./LanguageContext";

const PATCHES = [
  { version: "4.4", date: "2026-04-15", summary_ar: "تعديلات ثبات M416 و AUG (5.56mm). خفّض حساسية ADS بـ 2-5%", summary_en: "M416 & AUG stability adjustments (5.56mm). Reduce ADS sensitivity by 2-5%", affected: ["M416","AUG","SCAR-L","G36C","QBZ"] },
  { version: "4.3", date: "2026-02-20", summary_ar: "تعزيز ضرر 7.62mm. ارفع ADS Red Dot لـ AKM/M762 بـ 5-8%", summary_en: "7.62mm damage buff. Increase ADS Red Dot for AKM/M762 by 5-8%", affected: ["AKM","M762","Groza","Mk47 Mutant"] },
  { version: "4.2", date: "2026-01-07", summary_ar: "إصلاح حساسية 6x/8x. اضبط 6x ADS 15-25%، 8x ADS 12%", summary_en: "6x/8x sensitivity bug fix. Set 6x ADS to 15-25%, 8x ADS to 12%", affected: [] },
  { version: "4.1", date: "2025-11-06", summary_ar: "تعديل DMR ثبات +60%. ارفع حساسية Mini14/SKS", summary_en: "DMR stability buff +60%. Increase Mini14/SKS sensitivity", affected: ["Mini14","SKS","SLR","Mk14","QBU"] },
];

export function PatchMonitor({ currentWeapon }: { currentWeapon: string }) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const [dismissed, setDismissed] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("alyazouri_patch_dismissed") || "[]"); } catch { return []; }
  });

  const relevant = PATCHES.filter(p => !dismissed.includes(p.version) && (p.affected.length === 0 || p.affected.some(w => w.toLowerCase() === currentWeapon.toLowerCase())));

  if (relevant.length === 0) return null;

  const dismiss = (v: string) => {
    const next = [...dismissed, v];
    setDismissed(next);
    try { localStorage.setItem("alyazouri_patch_dismissed", JSON.stringify(next)); } catch { /* */ }
  };

  return (
    <section className="py-4">
      {relevant.map((p) => (
        <div key={p.version} className="card neon-box rounded-2xl p-4 mb-3 border-l-4 border-l-orange-400">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">📢</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-orange-500/15 px-1.5 py-0.5 text-[10px] font-black text-orange-300">v{p.version}</span>
                  <span className="text-[10px] text-white/40">{p.date}</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-white/70">{isAr ? p.summary_ar : p.summary_en}</p>
                {p.affected.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {p.affected.map(w => (
                      <span key={w} className={`rounded bg-white/5 px-1.5 py-0.5 text-[9px] ${w === currentWeapon ? "text-orange-300 font-bold bg-orange-500/10" : "text-white/50"}`}>{w}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button onClick={() => dismiss(p.version)} className="shrink-0 text-white/30 hover:text-white/70 text-xs">✕</button>
          </div>
        </div>
      ))}
    </section>
  );
}
