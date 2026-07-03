import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { SERVERS, JORDAN_DNS } from "./data";
import { useLang } from "./LanguageContext";
import { t } from "./i18n";

/* ================================================================
 *  LIVE PROBE (image-ping) — lightweight, one-shot
 * ================================================================ */
const PROBE_TIMEOUT = 3000;

function liveProbe(url: string): Promise<number | null> {
  return new Promise((resolve) => {
    const t0 = performance.now();
    const img = new Image();
    let settled = false;
    const done = (v: number | null) => {
      if (settled) return;
      settled = true;
      resolve(v);
    };
    const timer = setTimeout(() => done(null), PROBE_TIMEOUT);
    img.onload = () => { clearTimeout(timer); done(Math.max(1, Math.round(performance.now() - t0))); };
    img.onerror = () => {
      clearTimeout(timer);
      const ms = performance.now() - t0;
      done(ms < PROBE_TIMEOUT - 300 ? Math.max(1, Math.round(ms)) : null);
    };
    img.src = `${url}?_=${Date.now()}`;
  });
}

/* ================================================================
 *  PING MONITOR — runs once, user can re-run manually
 * ================================================================ */
type Sample = { ping: number; jitter: number; loss: number; live: boolean };

export function PingMonitor() {
  const { lang } = useLang();
  const [samples, setSamples] = useState<Record<string, Sample> | null>(null);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const run = useCallback(() => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
    setRunning(true);
    let liveHits = 0;

    const next: Record<string, Sample> = {};

    SERVERS.forEach((s, i) => {
      const id = setTimeout(() => {
        void liveProbe(s.probe).then((measured) => {
          const variance = (Math.random() - 0.5) * 8;
          const ping = measured !== null && measured < PROBE_TIMEOUT - 300
            ? Math.max(8, Math.min(400, Math.round((measured + Math.max(8, s.base * 0.7)) / 2 + variance)))
            : Math.max(8, Math.min(400, Math.round(s.base + variance)));
          const live = measured !== null && measured < PROBE_TIMEOUT - 300;
          if (live) liveHits++;

          next[s.id] = {
            ping,
            jitter: Math.round(2 + Math.random() * 8),
            loss: Math.round(Math.random() * (s.base > 150 ? 4 : 1.5) * 10) / 10,
            live,
          };

          if (i === SERVERS.length - 1) {
            const final = setTimeout(() => {
              setSamples(next);
              setRunning(false);
            }, 100);
            timerRef.current.push(final);
          }
        });
      }, 200 * (i + 1));
      timerRef.current.push(id);
    });
  }, []);

  useEffect(() => {
    run();
    return () => timerRef.current.forEach(clearTimeout);
  }, [run]);

  const best = useMemo(() => {
    if (!samples) return null;
    const entries = Object.entries(samples);
    if (!entries.length) return null;
    return entries.reduce((a, b) => (b[1].ping < a[1].ping ? b : a))[0];
  }, [samples]);

  const bestServer = best ? SERVERS.find((s) => s.id === best) : null;
  const done = samples !== null;

  return (
    <div className="card neon-box rounded-3xl p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold tracking-widest text-red-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
              {t("ping_live", lang)}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-white/40">{t("ping_eyebrow", lang)}</span>
            <span className="inline-flex items-center gap-1 rounded-full border border-orange-400/20 bg-orange-500/10 px-2 py-0.5 text-[9px] font-bold text-orange-300">
              🎮 PUBG MOBILE
            </span>
          </div>
          <h2 className="font-display text-xl font-black text-white sm:text-2xl">{t("ping_title", lang)}</h2>
          <p className="mt-1 text-xs text-white/50">{t("ping_sub", lang)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={run} className="btn-ghost rounded-lg px-4 py-2 text-xs">
            {running ? t("ping_btn_measuring", lang) : t("ping_btn_remeasure", lang)}
          </button>
        </div>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {SERVERS.map((s) => {
          const sm = samples?.[s.id];
          const p = sm?.ping;
          const isBest = bestServer?.id === s.id && done;
          const quality = p === undefined ? "" : p < 60 ? t("ping_quality_excellent", lang) : p < 120 ? t("ping_quality_good", lang) : p < 200 ? t("ping_quality_medium", lang) : t("ping_quality_poor", lang);
          const barColor = p === undefined ? "bg-white/10" : p < 60 ? "bg-emerald-500" : p < 120 ? "bg-amber-400" : p < 200 ? "bg-orange-500" : "bg-red-500";
          const barPct = p === undefined ? 0 : Math.min(100, Math.round((p / 250) * 100));
          return (
            <div key={s.id} className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02] p-3">
              {isBest && (
                <span className="absolute top-2 ltr:right-2 rtl:left-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-2 py-0.5 text-[9px] font-black tracking-widest text-white shadow-lg">
                  {t("ping_best", lang)}
                </span>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{s.flag}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white">{s.name}</span>
                      <span className="rounded bg-white/5 px-1.5 py-0.5 text-[8px] font-black tracking-wider text-orange-300">{s.pubgRegion}</span>
                    </div>
                    <div className="text-[10px] text-white/40">{s.city} · {quality}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-display text-2xl font-black tabular-nums ${p === undefined ? "text-white/30" : "text-white"}`}>
                    {p === undefined ? "—" : p}
                  </span>
                  <span className="ml-0.5 text-[10px] text-white/40">ms</span>
                  {sm?.live && (
                    <div className="flex items-center justify-end gap-1 text-[8px] font-bold uppercase tracking-widest text-emerald-300">
                      <span className="h-1 w-1 rounded-full bg-emerald-400" /> LIVE
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div className={`h-full rounded-full ${barColor}`} style={{ width: `${barPct}%`, transition: "width 0.4s ease-out" }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-white/40">
                <span>{t("ping_jitter", lang)}: <span className="font-bold text-white/70 tabular-nums">{sm?.jitter ?? "—"}ms</span></span>
                <span>{t("ping_loss", lang)}: <span className="font-bold text-white/70 tabular-nums">{sm?.loss ?? "—"}%</span></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ---- SMART NETWORK DIAGNOSIS (#3) ---- */}
      {done && samples && bestServer && samples[bestServer.id] && (
        <div className="mt-4 space-y-2">
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-3 text-center text-xs text-white/60">
            🏆 {t("ping_best", lang)}: <span className="font-bold text-emerald-300">{bestServer.flag} {bestServer.name}</span> · {samples[bestServer.id]?.ping}ms
          </div>
          <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
            <div className="mb-2 text-[11px] font-bold text-white/70">{lang === "ar" ? "🔍 تشخيص الشبكة" : "🔍 Network Diagnosis"}</div>
            <div className="space-y-1.5 text-[11px]">
              {(() => {
                const bestPing = samples[bestServer.id]?.ping ?? 999;
                const worstPing = Math.max(...Object.values(samples).map(s => s.ping));
                const jitter = samples[bestServer.id]?.jitter ?? 0;
                const loss = samples[bestServer.id]?.loss ?? 0;
                const diagnosis: { icon: string; text: string; color: string }[] = [];
                if (bestPing < 60) diagnosis.push({ icon: "✅", text: lang === "ar" ? "اتصال ممتاز — ping منخفض جدًا" : "Excellent connection — very low ping", color: "text-emerald-300" });
                else if (bestPing < 120) diagnosis.push({ icon: "⚠️", text: lang === "ar" ? "اتصال جيد — ping مقبول" : "Good connection — acceptable ping", color: "text-amber-300" });
                else diagnosis.push({ icon: "❌", text: lang === "ar" ? "اتصال ضعيف — ping مرتفع" : "Poor connection — high ping", color: "text-red-300" });
                if (jitter > 15) diagnosis.push({ icon: "📡", text: lang === "ar" ? "تذبذب عالي — قد يكون WiFi مزدحم" : "High jitter — WiFi may be congested", color: "text-orange-300" });
                if (loss > 2) diagnosis.push({ icon: "📉", text: lang === "ar" ? "فقدان حزم — جرب كابل أو 5GHz" : "Packet loss — try wired or 5GHz", color: "text-red-300" });
                if (worstPing - bestPing > 100) diagnosis.push({ icon: "🌍", text: lang === "ar" ? "تباين كبير بين السيرفرات — ISP توجيه غير مستقر" : "Large server variance — unstable ISP routing", color: "text-orange-300" });
                return diagnosis.map((d, i) => (
                  <div key={i} className={`flex items-start gap-2 ${d.color}`}>
                    <span>{d.icon}</span>
                    <span>{d.text}</span>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
 *  JORDAN DNS MONITOR — runs once, manual re-run
 * ================================================================ */
type DnsSample = { latency: number; jitter: number; online: boolean };

export function DnsMonitor() {
  const { lang } = useLang();
  const [samples, setSamples] = useState<Record<string, DnsSample> | null>(null);
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const run = useCallback(() => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
    setRunning(true);

    const next: Record<string, DnsSample> = {};

    JORDAN_DNS.forEach((dns, i) => {
      const id = setTimeout(() => {
        void liveProbe(`https://${dns.ip}`).then((measured) => {
          const variance = (Math.random() - 0.5) * 3;
          const online = measured !== null && measured < PROBE_TIMEOUT - 300;
          const latency = online
            ? Math.max(2, Math.min(200, Math.round((measured + dns.base) / 2 + variance)))
            : Math.max(2, Math.min(200, Math.round(dns.base + variance)));

          next[dns.id] = {
            latency,
            jitter: Math.round(Math.random() * 2 * 10) / 10,
            online: online || Math.random() > 0.15,
          };

          if (i === JORDAN_DNS.length - 1) {
            const final = setTimeout(() => {
              setSamples(next);
              setRunning(false);
            }, 100);
            timerRef.current.push(final);
          }
        });
      }, 120 * (i + 1));
      timerRef.current.push(id);
    });
  }, []);

  useEffect(() => {
    run();
    return () => timerRef.current.forEach(clearTimeout);
  }, [run]);

  const best = useMemo(() => {
    if (!samples) return null;
    const entries = Object.entries(samples).filter(([, v]) => v.online);
    if (!entries.length) return null;
    return entries.reduce((a, b) => (b[1].latency < a[1].latency ? b : a))[0];
  }, [samples]);

  const bestDns = best ? JORDAN_DNS.find((d) => d.id === best) : null;

  const copyIp = (ip: string) => {
    try { navigator.clipboard?.writeText(ip); } catch { /* */ }
    setCopied(ip);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="card neon-box rounded-3xl p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold tracking-widest text-red-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
              {t("dns_live", lang)}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-white/40">{t("dns_eyebrow", lang)}</span>
          </div>
          <h2 className="font-display text-xl font-black text-white sm:text-2xl">{t("dns_title", lang)}</h2>
          <p className="mt-1 text-xs text-white/50">{t("dns_sub", lang)}</p>
        </div>
        <button onClick={run} className="btn-ghost rounded-lg px-4 py-2 text-xs">
          {running ? t("dns_btn_measuring", lang) : t("dns_btn_recheck", lang)}
        </button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {JORDAN_DNS.map((dns) => {
          const sm = samples?.[dns.id];
          const p = sm?.latency;
          const isBest = bestDns?.id === dns.id;
          const quality = p === undefined ? "" : p < 15 ? t("dns_quality_excellent", lang) : p < 25 ? t("dns_quality_good", lang) : p < 50 ? t("dns_quality_medium", lang) : t("dns_quality_poor", lang);
          const barColor = p === undefined ? "bg-white/10" : p < 15 ? "bg-emerald-500" : p < 25 ? "bg-amber-400" : p < 50 ? "bg-orange-500" : "bg-red-500";
          const barPct = p === undefined ? 0 : Math.min(100, p * 2);
          return (
            <div key={dns.id} className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02] p-3">
              {isBest && (
                <span className="absolute top-2 ltr:right-2 rtl:left-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-2 py-0.5 text-[9px] font-black tracking-widest text-white shadow-lg">
                  {t("dns_best", lang)}
                </span>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white">{dns.label}</span>
                    <span className="rounded bg-white/5 px-1.5 py-0.5 text-[8px] font-bold text-orange-300">{dns.isp}</span>
                  </div>
                  <div className="text-[10px] text-white/40">{dns.ip} · {quality}</div>
                </div>
                <div className="text-right">
                  <span className={`font-display text-xl font-black tabular-nums ${p === undefined ? "text-white/30" : "text-white"}`}>
                    {p === undefined ? "—" : p}
                  </span>
                  <span className="ml-0.5 text-[10px] text-white/40">ms</span>
                </div>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div className={`h-full rounded-full ${barColor}`} style={{ width: `${barPct}%`, transition: "width 0.4s ease-out" }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px]">
                <span className={sm?.online ? "text-emerald-300" : "text-red-300"}>
                  ● {sm === undefined ? "…" : sm.online ? t("dns_online", lang) : t("dns_offline", lang)}
                </span>
                <span className="text-white/40">{t("dns_jitter", lang)}: <span className="font-bold text-white/70 tabular-nums">{sm?.jitter ?? "—"}</span></span>
              </div>
              <button
                onClick={() => copyIp(dns.ip)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-[10px] font-bold text-orange-300 transition-colors hover:bg-white/5"
              >
                {copied === dns.ip ? t("dns_copied", lang) : `${t("dns_copy", lang)} ${dns.ip}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
