import { useLang } from "./LanguageContext";

export function HudPreview({ fingers }: { fingers: number }) {
  const { lang } = useLang();
  const buttons = [
    { id: "fire", label: "🔥 FIRE", x: 82, y: 78, size: 56, finger: "R1" },
    { id: "aim", label: "🎯 AIM", x: 70, y: 82, size: 44, finger: "R2" },
    { id: "jump", label: "⬆️ JUMP", x: 15, y: 70, size: 44, finger: "L1" },
    { id: "crouch", label: "⬇️ CROUCH", x: 25, y: 78, size: 38, finger: "L2" },
    { id: "prone", label: "⤵️ PRONE", x: 18, y: 86, size: 34, finger: "L3" },
    { id: "reload", label: "🔄 RLD", x: 85, y: 60, size: 32, finger: "R3" },
    { id: "scope", label: "🔍", x: 78, y: 70, size: 36, finger: "R1" },
  ];
  const visible = new Set<string>();
  if (fingers >= 2) { ["fire", "aim", "jump", "crouch"].forEach(id => visible.add(id)); }
  if (fingers >= 3) { ["reload", "scope"].forEach(id => visible.add(id)); }
  if (fingers >= 4) { ["prone"].forEach(id => visible.add(id)); visible.add("reload"); visible.add("scope"); }
  if (fingers >= 5) { buttons.forEach(b => visible.add(b.id)); }
  if (fingers >= 6) { buttons.forEach(b => visible.add(b.id)); }

  return (
    <div className="card rounded-2xl p-5">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="font-display text-sm font-bold tracking-widest text-white/90">
          {lang === "ar" ? "معاينة HUD" : "HUD Preview"}
        </h4>
        <span className="rounded-full bg-orange-500/15 px-2.5 py-0.5 text-[10px] font-bold text-orange-300">
          {fingers} {lang === "ar" ? "أصابع" : "Fingers"}
        </span>
      </div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-black/40 to-emerald-950/30">
        <div className="absolute inset-0 bg-grid opacity-30" />

        {/* Crosshair */}
        <div className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2">
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-red-400/60" />
          <div className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-red-400/60" />
        </div>

        {/* Top HUD */}
        <div className="absolute left-3 top-3 rounded-lg border border-white/10 bg-black/50 px-2 py-1 text-[10px] text-white/80 backdrop-blur">
          {lang === "ar" ? "أحياء" : "Alive"}: 87 · {lang === "ar" ? "قتل" : "Kills"}: 4 · 120 FPS
        </div>

        {/* Mini-map */}
        <div className="absolute right-3 top-3 h-14 w-14 rounded-lg border border-white/20 bg-black/50 backdrop-blur">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400" />
        </div>

        {/* Health bar */}
        <div className="absolute bottom-3 left-1/2 w-32 -translate-x-1/2">
          <div className="h-1.5 rounded-full bg-white/10">
            <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-emerald-400 to-amber-400" />
          </div>
        </div>

        {/* Buttons */}
        {buttons
          .filter((b) => visible.has(b.id))
          .map((b) => (
            <button
              key={b.id}
              style={{ left: `${b.x}%`, top: `${b.y}%`, width: b.size, height: b.size }}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-orange-400/40 bg-orange-500/20 text-[9px] font-bold text-white backdrop-blur transition-all hover:border-orange-400 hover:bg-orange-500/40"
            >
              {b.label}
              {b.finger && (
                <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-purple-500 text-[7px]">
                  {b.finger.slice(-1)}
                </span>
              )}
            </button>
          ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {["L1", "L2", "L3", "R1", "R2", "R3"].slice(0, fingers).map((f) => (
          <span key={f} className="rounded-lg border border-purple-400/20 bg-purple-500/10 px-2 py-1 text-[10px] font-bold text-purple-300">
            {f} {lang === "ar" ? "نشط" : "active"}
          </span>
        ))}
      </div>
    </div>
  );
}
