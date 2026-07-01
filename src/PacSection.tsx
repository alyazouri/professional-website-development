import { useState } from "react";
import { useLang } from "./LanguageContext";
import { t } from "./i18n";

const PAC_URL = "https://alyazouri.pages.dev/jordan.pac";

type Tab = "android" | "ios" | "windows";

export function PacSection() {
  const { lang } = useLang();
  const [enabled, setEnabled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<Tab>("android");
  const [showRestart, setShowRestart] = useState(false);

  const stepsByTab: Record<Tab, string[]> = {
    android: ["pac_step_android_1", "pac_step_android_2", "pac_step_android_3", "pac_step_android_4"],
    ios: ["pac_step_ios_1", "pac_step_ios_2", "pac_step_ios_3", "pac_step_ios_4"],
    windows: ["pac_step_windows_1", "pac_step_windows_2", "pac_step_windows_3"],
  };
  const currentSteps = stepsByTab[tab].map((k) => t(k as never, lang));

  const tabs: { id: Tab; icon: string; label: string }[] = [
    { id: "android", icon: "🤖", label: "Android" },
    { id: "ios", icon: "🍎", label: "iOS" },
    { id: "windows", icon: "🪟", label: "Windows" },
  ];

  const copy = () => {
    try {
      navigator.clipboard?.writeText(PAC_URL);
    } catch { /* ignore */ }
    setCopied(true);
    setShowRestart(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="card neon-box rounded-3xl p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-orange-300/70">{t("pac_eyebrow", lang)}</span>
          <h2 className="font-display text-xl font-black text-white sm:text-2xl">{t("pac_title", lang)}</h2>
          <p className="mt-1 text-xs text-white/50">{t("pac_sub", lang)}</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
          <span className="text-[10px] uppercase tracking-widest text-white/40">{t("pac_status", lang)}</span>
          <button
            onClick={() => setEnabled((e) => !e)}
            className={`relative h-6 w-11 rounded-full transition-colors ${enabled ? "bg-orange-500" : "bg-white/15"}`}
            aria-label="toggle pac"
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${enabled ? "left-[22px]" : "left-0.5"}`} />
          </button>
          <span className={`text-xs font-bold ${enabled ? "text-orange-300" : "text-white/50"}`}>
            {enabled ? t("pac_enabled", lang) : t("pac_disabled", lang)}
          </span>
        </div>
      </div>

      {enabled && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-4">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
              ✅ {t("pac_ready", lang)}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-white/40">{t("pac_link_label", lang)}</div>
            <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center">
              <code className="flex-1 break-all rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-orange-200">
                {PAC_URL}
              </code>
              <div className="flex gap-2">
                <button onClick={copy} className="btn-primary rounded-lg px-3 py-2 text-xs">
                  {copied ? t("pac_copied", lang) : t("pac_copy", lang)}
                </button>
                <a href={PAC_URL} target="_blank" rel="noreferrer" className="btn-ghost rounded-lg px-3 py-2 text-xs">
                  {t("pac_open", lang)}
                </a>
              </div>
            </div>
          </div>

          <div className="flex gap-1.5 rounded-xl border border-white/10 bg-black/20 p-1">
            {tabs.map((tb) => (
              <button
                key={tb.id}
                onClick={() => setTab(tb.id)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                  tab === tb.id ? "bg-orange-500/20 text-orange-300" : "text-white/60 hover:bg-white/5"
                }`}
              >
                <span>{tb.icon}</span>
                <span className="hidden sm:inline">{tb.label}</span>
              </button>
            ))}
          </div>

          <ol className="space-y-2.5">
            {currentSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-xs font-black text-white">
                  {i + 1}
                </span>
                <span className="pt-1 text-sm text-white/80">{step}</span>
              </li>
            ))}
          </ol>

          {showRestart && (
            <div className="rounded-2xl border border-orange-400/30 bg-orange-500/10 p-4 text-center">
              <button
                onClick={() => {
                  setShowRestart(false);
                  setTimeout(() => window.location.reload(), 350);
                }}
                className="btn-primary w-full rounded-xl px-4 py-2.5 text-sm"
              >
                🔄{t("pac_restart", lang)}
              </button>
              <p className="mt-2 text-[11px] leading-relaxed text-white/60">{t("pac_restart_note", lang)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
