import { useMemo } from "react";
import { SERVERS } from "./data";
import { useLang } from "./LanguageContext";

/* Simple SVG world heatmap — server quality visualization */
const CITIES: { name: string; flag: string; x: number; y: number; serverId: string }[] = [
  { name: "Abu Dhabi", flag: "🇦🇪", x: 62, y: 52, serverId: "me" },
  { name: "Frankfurt", flag: "🇪🇺", x: 49, y: 30, serverId: "eu" },
  { name: "Mumbai", flag: "🇮🇳", x: 68, y: 48, serverId: "in" },
  { name: "Singapore", flag: "🇸🇬", x: 76, y: 56, serverId: "as" },
  { name: "Seoul", flag: "🇰🇷", x: 82, y: 34, serverId: "krjp" },
  { name: "Virginia", flag: "🇺🇸", x: 26, y: 35, serverId: "na" },
  { name: "São Paulo", flag: "🇧🇷", x: 33, y: 70, serverId: "sa" },
];

export function NetworkHeatmap() {
  const { lang } = useLang();
  const isAr = lang === "ar";

  const servers = useMemo(() => SERVERS.map(s => {
    const city = CITIES.find(c => c.serverId === s.id);
    const quality = s.base < 60 ? "excellent" : s.base < 120 ? "good" : s.base < 180 ? "medium" : "poor";
    const color = quality === "excellent" ? "#10b981" : quality === "good" ? "#f59e0b" : quality === "medium" ? "#f97316" : "#ef4444";
    return { ...s, x: city?.x ?? 0, y: city?.y ?? 0, flag: city?.flag ?? "", cityName: city?.name ?? "", quality, color };
  }), []);

  // Animated pulse orbits around best server
  const best = servers.reduce((a, b) => a.base < b.base ? a : b);

  return (
    <div className="card neon-box rounded-3xl p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-orange-300/70">
            {isAr ? "خريطة الشبكة العالمية" : "GLOBAL NETWORK HEATMAP"}
          </span>
          <h2 className="font-display text-xl font-black text-white sm:text-2xl">
            {isAr ? "🌍 جودة الاتصال حسب المنطقة" : "🌍 Connection Quality by Region"}
          </h2>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> {isAr ? "ممتاز" : "Excellent"}</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" /> {isAr ? "جيد" : "Good"}</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> {isAr ? "ضعيف" : "Poor"}</span>
        </div>
      </div>

      {/* SVG World Map */}
      <div className="relative aspect-[2/1] overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-br from-slate-900/50 to-blue-950/30">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
          {/* Simplified world landmass */}
          <defs>
            <radialGradient id="heat">
              <stop offset="0%" stopColor="rgba(255,122,0,0.4)" />
              <stop offset="100%" stopColor="rgba(255,122,0,0)" />
            </radialGradient>
          </defs>

          {/* Continents outline */}
          <path d="M10,30 Q20,15 25,20 Q30,15 35,22 Q40,18 48,25 Q52,20 55,28 Q50,32 45,28 Q40,35 35,30 Q30,38 25,32 Q18,38 10,30Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" />
          <path d="M42,28 Q55,15 60,20 Q68,15 72,22 Q78,18 85,25 Q90,28 88,35 Q85,40 88,45 Q85,50 78,48 Q72,52 65,48 Q58,52 50,45 Q45,50 42,28Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" />
          <path d="M22,38 Q28,32 35,35 Q40,42 35,50 Q30,55 25,58 Q20,62 15,58 Q12,52 15,45 Q18,40 22,38Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" />

          {/* Connection lines from Jordan to each server */}
          {servers.map(s => (
            <line key={s.id} x1="58" y1="48" x2={s.x} y2={s.y}
              stroke={s.color} strokeWidth={s.id === best.id ? "0.4" : "0.15"}
              opacity={s.id === best.id ? 0.7 : 0.25}
              strokeDasharray={s.id === best.id ? "none" : "1,2"}
            />
          ))}

          {/* Server nodes with pulse */}
          {servers.map(s => (
            <g key={s.id}>
              {s.id === best.id && (
                <circle cx={s.x} cy={s.y} r="3" fill="none" stroke={s.color} strokeWidth="0.2" opacity="0.5">
                  <animate attributeName="r" from="2" to="5" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={s.x} cy={s.y} r={s.id === best.id ? "1.2" : "0.7"} fill={s.color} />
              <text x={s.x} y={s.y - 2} textAnchor="middle" fill="white" fontSize="4" fontWeight="bold">{s.flag}</text>
              <text x={s.x} y={s.y + 5} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="2">{s.cityName}</text>
            </g>
          ))}

          {/* Jordan marker */}
          <circle cx="58" cy="48" r="1.5" fill="#ff7a00" />
          <circle cx="58" cy="48" r="2.5" fill="none" stroke="#ff7a00" strokeWidth="0.3" opacity="0.6">
            <animate attributeName="r" from="1.5" to="4" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <text x="58" y="46" textAnchor="middle" fill="white" fontSize="3" fontWeight="black">🇯🇴</text>
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {servers.map(s => (
          <div key={s.id} className="flex items-center gap-2 rounded-lg border border-white/5 bg-black/20 px-3 py-2">
            <span className="text-lg">{s.flag}</span>
            <div>
              <div className="text-[11px] font-bold text-white">{s.name}</div>
              <div className="text-[10px]" style={{ color: s.color }}>{s.base}ms · {s.quality}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
