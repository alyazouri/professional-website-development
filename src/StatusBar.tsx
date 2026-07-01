import { useLang } from "./LanguageContext";
import { t } from "./i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NightModeToggle } from "./Features";

export function StatusBar({ ping }: { ping: number | null }) {
  const { lang } = useLang();

  const links = [
    { href: "#generator", label: t("nav_generator", lang) },
    { href: "#ping", label: t("nav_ping", lang) },
    { href: "#pac", label: t("nav_pac", lang) },
    { href: "#about", label: t("nav_about", lang) },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/8 bg-[#05070c]/80 backdrop-blur-xl">
      <div className="container-section flex h-14 items-center justify-between gap-3">
        <a href="#top" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600 font-display text-base font-black text-white shadow-lg">
            A
          </span>
          <span className="font-display text-sm font-black tracking-wide text-white">
            ALYAZOURI <span className="text-orange-400">2026</span>
            <span className="hidden text-[10px] font-medium text-white/40 sm:inline"> · Jordan</span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white/60 transition-colors hover:bg-white/5 hover:text-orange-300"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1 rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-[11px] font-bold text-emerald-300 sm:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            {ping ?? "—"}ms
          </span>
          <NightModeToggle />
          <LanguageSwitcher />
          <a href="#generator" className="btn-primary hidden rounded-lg px-3 py-2 text-xs sm:inline-flex">
            {t("nav_cta", lang)}
          </a>
        </div>
      </div>
    </header>
  );
}
