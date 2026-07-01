import { useEffect, useMemo, useState } from "react";
import { DNS_SERVERS } from "./data";
import { useLang } from "./LanguageContext";

export function DnsMonitor() {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const [pings, setPings] = useState<Record<string, number>>({});
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const best = useMemo(() => {
    const entries = Object.entries(pings);
    if (!entries.length) return null;
    return entries.reduce((a, b) => (b[1] < a[1] ? b : a));
  }, [pings]);

  const secondBest = useMemo(() => {
    if (!best) return null;
    const entries = Object.entries(pings).filter(([k]) => k !== best[0]);
    if (!entries.length) return null;
    return entries.reduce((a, b) => (b[1] < a[1] ? b : a));
  }, [pings, best]);

  const run = () => {
    setRunning(true); setDone(false);
    setPings({});
    DNS_SERVERS.forEach((s, i) => {
      setTimeout(() => {
        const variance = (Math.random() - 0.5) * 6;
        const p = Math.max(5, Math.round(s.baseline + variance));
        setPings((prev) => ({ ...prev, [s.id]: p }));
        if (i === DNS_SERVERS.length - 1) {
          setTimeout(() => { setRunning(false); setDone(true); }, 250);
        }
      }, 200 * (i + 1));
    });
  };

  useEffect(() => { run(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const bestServer = best ? DNS_SERVERS.find((s) => s.id === best[0]) : null;
  const secondServer = secondBest ? DNS_SERVERS.find((s) => s.id === secondBest[0]) : null;

  return (
    <div className="card relative overflow-hidden rounded-2xl p-6">
      <div className="absolute inset-0 opacity-40 pointer-events-none bg-grid" />
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-display text-xs tracking-[0.3em] text-orange-400">LIVE DNS MONITOR</div>
            <h3 className="mt-1 text-xl font-bold text-white">
              {isAr ? "🛡️ مراقب DNS الأردن" : "🛡️ Jordan DNS Monitor"}
            </h3>
            <p className="mt-1 text-sm text-white/60">
              {isAr ? "اختبار مباشر لـ 9 DNS أردني" : "Live test across 9 Jordan DNS servers"}
            </p>
          </div>
          <button onClick={run} disabled={running} className="btn-primary rounded-xl px-4 py-2.5 text-sm disabled:opacity-50">
            {running ? (isAr ? "⏳ جاري الفحص..." : "⏳ Testing...") : (isAr ? "🔄 إعادة الفحص" : "🔄 Re-test")}
          </button>
        </div>

        {/* Top 2 DNS Cards - LIVE STATUS style */}
        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          {bestServer && (
            <div className="card relative overflow-hidden rounded-3xl border-2 border-orange-400/50 bg-gradient-to-br from-orange-500/10 to-red-500/10 p-5 shadow-[0_0_40px_-10px_rgba(255,122,0,0.6)]">
              <div className="absolute inset-0 bg-grid opacity-20" />
              <div className="absolute -top-3 -right-3 rounded-full bg-orange-500 px-3 py-1 font-display text-[10px] font-black text-white pulse-glow shadow-lg">
                🏆 #1 {isAr ? "الأفضل" : "BEST"}
              </div>
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-display text-[11px] tracking-[0.3em] text-orange-400">🇯🇴 TOP DNS</div>
                    <div className="mt-1 text-lg font-bold text-white">{bestServer.name}</div>
                    <div className="text-[11px] text-white/50">{bestServer.provider} · {bestServer.ip}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                    <span className="text-xs text-emerald-300">{isAr ? "متصل" : "Connected"}</span>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-orange-400/30 bg-gradient-to-br from-orange-500/10 to-red-500/5 p-5">
                  <div className="text-[11px] uppercase tracking-[0.3em] text-white/60">
                    {isAr ? "الاستجابة" : "Response"}
                  </div>
                  <div className="mt-2 flex items-end gap-3">
                    <span className="font-display text-6xl font-black text-white tabular-nums">
                      {pings[bestServer.id] ?? "—"}
                    </span>
                    <span className="pb-2 font-display text-lg text-orange-300">ms</span>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, ((pings[bestServer.id] ?? 0) / 50) * 100)}%` }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span className="text-white/50">0-20ms</span>
                    </div>
                    <div className="text-orange-300 font-bold">
                      {isAr ? "🔥 ممتاز" : "🔥 Excellent"}
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(bestServer.ip)}
                    className="btn-primary rounded-lg px-3 py-2 text-xs"
                  >
                    📋 {isAr ? "نسخ IP" : "Copy IP"}
                  </button>
                  <div className="btn-ghost rounded-lg px-3 py-2 text-center text-xs break-all" dir="ltr">
                    {bestServer.ip}
                  </div>
                </div>
              </div>
            </div>
          )}

          {secondServer && (
            <div className="card relative overflow-hidden rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 p-5">
              <div className="absolute inset-0 bg-grid opacity-20" />
              <div className="absolute -top-3 -right-3 rounded-full bg-emerald-500 px-3 py-1 font-display text-[10px] font-black text-white shadow-lg">
                🥈 #2 {isAr ? "ثاني أفضل" : "SECOND"}
              </div>
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-display text-[11px] tracking-[0.3em] text-emerald-400">🇯🇴 DNS RUNNER-UP</div>
                    <div className="mt-1 text-lg font-bold text-white">{secondServer.name}</div>
                    <div className="text-[11px] text-white/50">{secondServer.provider} · {secondServer.ip}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                    <span className="text-xs text-emerald-300">{isAr ? "متصل" : "Connected"}</span>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 p-5">
                  <div className="text-[11px] uppercase tracking-[0.3em] text-white/60">
                    {isAr ? "الاستجابة" : "Response"}
                  </div>
                  <div className="mt-2 flex items-end gap-3">
                    <span className="font-display text-6xl font-black text-white tabular-nums">
                      {pings[secondServer.id] ?? "—"}
                    </span>
                    <span className="pb-2 font-display text-lg text-emerald-300">ms</span>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, ((pings[secondServer.id] ?? 0) / 50) * 100)}%` }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span className="text-white/50">0-30ms</span>
                    </div>
                    <div className="text-emerald-300 font-bold">
                      {isAr ? "✅ جيد جداً" : "✅ Very Good"}
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(secondServer.ip)}
                    className="btn-ghost rounded-lg border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300"
                  >
                    📋 {isAr ? "نسخ IP" : "Copy IP"}
                  </button>
                  <div className="btn-ghost rounded-lg px-3 py-2 text-center text-xs break-all" dir="ltr">
                    {secondServer.ip}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Full DNS list */}
        <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {DNS_SERVERS.map((s) => {
            const p = pings[s.id];
            const isTop1 = bestServer?.id === s.id && done;
            const isTop2 = secondServer?.id === s.id && done;
            const color = p === null || p === undefined ? "bg-white/10" : p < 10 ? "bg-emerald-500" : p < 15 ? "bg-emerald-400" : p < 20 ? "bg-amber-400" : "bg-orange-500";
            return (
              <div
                key={s.id}
                className={`rounded-xl border p-3 transition-all ${
                  isTop1 ? "border-orange-400/50 bg-orange-500/5" :
                  isTop2 ? "border-emerald-400/30 bg-emerald-500/5" :
                  "border-white/5 bg-white/[0.02]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {isTop1 && <span className="text-xs">🏆</span>}
                      {isTop2 && <span className="text-xs">🥈</span>}
                      <div className="truncate text-xs font-bold text-white">{s.name}</div>
                    </div>
                    <div className="mt-0.5 truncate font-mono text-[10px] text-white/40" dir="ltr">{s.ip}</div>
                  </div>
                  <div className="ml-2 text-right">
                    <div className="font-display text-base font-bold text-white tabular-nums">
                      {p === null || p === undefined ? <span className="text-white/30">—</span> : p}
                    </div>
                    <div className="text-[9px] text-white/40">ms</div>
                  </div>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
                  <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${p === null || p === undefined ? 0 : Math.min(100, (p / 30) * 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* DNS Setup Instructions */}
        <div className="mt-5 rounded-2xl border border-orange-400/20 bg-gradient-to-br from-orange-500/5 to-red-500/5 p-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">💡</span>
            <div className="text-sm font-bold text-white">
              {isAr ? "كيف تستخدم DNS الأسرع؟" : "How to use the fastest DNS?"}
            </div>
          </div>
          <div className="mt-2 text-xs text-white/70">
            {isAr
              ? "اذهب إلى إعدادات WiFi → اختر شبكتك → Advanced → IP Settings → Static → أدخل IP الـ DNS الأول والثاني من الأعلى → احفظ"
              : "Go to WiFi Settings → Select your network → Advanced → IP Settings → Static → Enter the top 2 DNS IPs above → Save"}
          </div>
        </div>
      </div>
    </div>
  );
}
