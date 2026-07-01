import { useState } from "react";
import { useLang } from "./LanguageContext";
import { t } from "./i18n";

const PAC_URL = "http://raw.githubusercontent.com/alyazouri/Website/refs/heads/main/pubg-jordan.pac";

export function PacSection() {
  const { lang } = useLang();
  const [enabled, setEnabled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"android" | "ios" | "windows">("android");
  const [showRestart, setShowRestart] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(PAC_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      setTimeout(() => setShowRestart(true), 600);
    } catch { /* ignore */ }
  };

  const getSteps = (platform: "android" | "ios" | "windows"): string[] => {
    if (platform === "android") return [
      t("pac_step_android_1", lang), t("pac_step_android_2", lang),
      t("pac_step_android_3", lang), t("pac_step_android_4", lang),
    ];
    if (platform === "ios") return [
      t("pac_step_ios_1", lang), t("pac_step_ios_2", lang),
      t("pac_step_ios_3", lang), t("pac_step_ios_4", lang),
    ];
    return [t("pac_step_windows_1", lang), t("pac_step_windows_2", lang), t("pac_step_windows_3", lang)];
  };

  const platformInfo = {
    android: { title: "Android", icon: "🤖" },
    ios: { title: "iOS", icon: "🍎" },
    windows: { title: "Windows", icon: "🪟" },
  };

  const currentSteps = getSteps(activeTab);
  void platformInfo; // keep reference for future use

  return (
    <div className="card relative overflow-hidden rounded-3xl p-6 sm:p-8">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />

      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-display text-xs tracking-[0.3em] text-orange-400">{t("pac_eyebrow", lang)}</div>
            <h3 className="mt-1 text-2xl font-black text-white sm:text-3xl">{t("pac_title", lang)}</h3>
            <p className="mt-1 max-w-xl text-sm text-white/60">{t("pac_sub", lang)}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-white/50">{t("pac_status", lang)}</div>
              <div className={`font-display text-sm font-bold ${enabled ? "text-emerald-400" : "text-white/40"}`}>
                {enabled ? t("pac_enabled", lang) : t("pac_disabled", lang)}
              </div>
            </div>
            <button
              onClick={() => setEnabled(!enabled)}
              className={`relative h-14 w-28 rounded-full border-2 transition-all duration-300 ${
                enabled
                  ? "border-emerald-400 bg-emerald-500/20 shadow-[0_0_30px_-5px_rgba(52,211,153,0.6)]"
                  : "border-white/15 bg-black/40"
              }`}
              aria-label="Toggle Jordan Server"
            >
              <div
                className={`absolute top-1 h-10 w-10 rounded-full transition-all duration-300 ${
                  enabled ? "bg-gradient-to-br from-emerald-400 to-teal-500" : "bg-white/30"
                }`}
                style={{ right: enabled ? "0.25rem" : "calc(100% - 2.75rem)" }}
              />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-around px-3">
                <span className={`font-display text-[10px] font-bold tracking-widest ${enabled ? "text-emerald-300" : "text-white/40"}`}>
                  {t("pac_toggle_on", lang)}
                </span>
                <span className={`font-display text-[10px] font-bold tracking-widest ${enabled ? "text-white/30" : "text-white/60"}`}>
                  {t("pac_toggle_off", lang)}
                </span>
              </div>
            </button>
          </div>
        </div>

        {enabled && (
          <div className="mt-6 space-y-5">
            <div className="relative overflow-hidden rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 p-5">
              <div className="absolute top-0 right-0 rounded-bl-xl bg-emerald-500/20 px-3 py-1 font-display text-[10px] font-bold tracking-widest text-emerald-300">
                {t("pac_ready", lang)}
              </div>
              <div className="text-[11px] uppercase tracking-widest text-white/60">{t("pac_link_label", lang)}</div>
              <div
                dir="ltr"
                className="mt-2 select-all break-all rounded-lg border border-white/10 bg-black/50 p-3 font-mono text-xs text-orange-200"
              >
                {PAC_URL}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={copyLink} className="btn-primary rounded-xl px-5 py-2.5 text-sm">
                  {copied ? t("pac_copied", lang) : t("pac_copy", lang)}
                </button>
                <a href={PAC_URL} target="_blank" rel="noreferrer" className="btn-ghost rounded-xl px-5 py-2.5 text-sm">
                  {t("pac_open", lang)}
                </a>
              </div>
            </div>

            <div className="flex gap-2 border-b border-white/5">
              {(["android", "ios", "windows"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                    activeTab === tab
                      ? "border-orange-400 text-orange-300"
                      : "border-transparent text-white/60 hover:text-white"
                  }`}
                >
                  <span>{platformInfo[tab].icon}</span>
                  <span>{platformInfo[tab].title}</span>
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {currentSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600 font-display text-sm font-black text-white">
                    {i + 1}
                  </div>
                  <div className="pt-1 text-sm text-white/80">{step}</div>
                </div>
              ))}
            </div>

            {showRestart && (
              <div className="rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔄</span>
                  <div className="text-sm font-bold text-white">{t("pac_restart", lang)}</div>
                </div>
                <div className="mt-2 text-xs text-white/60">{t("pac_restart_note", lang)}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
