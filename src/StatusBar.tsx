import { useLang } from "./LanguageContext";
import { t } from "./i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NightModeToggle } from "./Features";

export function StatusBar({ ping }: { ping: number | null }) {
  const { lang } = useLang();
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#05070c]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-3">
        <a href="#" className="flex items-center gap-2">
          <div className="relative h-9 w-9 overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-[0_0_20px_rgba(255,122,0,0.4)]">
            <div className="absolute inset-0 bg-grid opacity-30" />
            <div className="relative flex h-full w-full items-center justify-center font-display text-xl font-black text-white">A</div>
          </div>
          <div>
            <div className="font-display text-sm font-black text-white">ALYAZOURI</div>
            <div className="text-[9px] uppercase tracking-widest text-orange-300/70">2026 · Jordan</div>
          </div>
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {[
            { href: "#generator", label: t("nav_generator", lang) },
            { href: "#ping", label: t("nav_ping", lang) },
            { href: "#weapons", label: t("nav_weapons", lang) },
            { href: "#pac", label: t("nav_pac", lang) },
            { href: "#about", label: t("nav_about", lang) },
          ].map((l) => (
            <a key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/5 hover:text-orange-300">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1.5 rounded-lg border border-emerald-400/20 bg-emerald-500/5 px-2.5 py-1.5 sm:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            <span className="font-display text-[10px] font-bold text-emerald-300 tabular-nums">{ping ?? "—"}ms</span>
          </div>
          <NightModeToggle />
          <LanguageSwitcher />
          <a href="#generator" className="btn-primary hidden rounded-lg px-4 py-2 text-xs sm:inline-flex">
            {t("nav_cta", lang)}
          </a>
        </div>
      </div>
    </header>
  );
}
