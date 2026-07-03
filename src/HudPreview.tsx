import { useLang } from "./LanguageContext";

type Hbtn = { id: string; icon: string; pos: string; min: number };

const BUTTONS: Hbtn[] = [
  { id: "joystick", icon: "🕹️", pos: "bottom-3 left-3", min: 2 },
  { id: "fire", icon: "🔫", pos: "bottom-3 right-3", min: 2 },
  { id: "scope", icon: "🔭", pos: "bottom-20 right-5", min: 3 },
  { id: "jump", icon: "⬆️", pos: "bottom-3 right-24", min: 3 },
  { id: "crouch", icon: "🔽", pos: "bottom-16 left-24", min: 4 },
  { id: "reload", icon: "🔄", pos: "top-20 right-4", min: 4 },
  { id: "prone", icon: "🛌", pos: "bottom-3 left-24", min: 5 },
  { id: "lean", icon: "↔️", pos: "top-24 left-4", min: 6 },
];

export function HudPreview({ fingers }: { fingers: number }) {
  const { lang } = useLang();
  const isAr = lang === "ar";

  const visible = new Set(BUTTONS.filter((b) => b.min <= fingers).map((b) => b.id));
  const hp = 88;

  return (
    <div className="card rounded-2xl p-5">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="font-display text-sm font-bold tracking-widest text-white/90">
          {isAr ? "معاينة HUD" : "HUD Preview"}
        </h4>
        <span className="rounded-full bg-orange-500/15 px-2.5 py-0.5 text-[10px] font-bold text-orange-300">
          {fingers} {isAr ? "أصابع" : "Fingers"}
        </span>
      </div>

      <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-black/40 to-emerald-950/30">
        {/* Crosshair */}
        <div className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2">
          <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(255,122,0,0.9)]" />
          <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-orange-400/60" />
          <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-orange-400/60" />
        </div>

        {/* Top HUD */}
        <div className="absolute left-3 top-3 rounded-md border border-white/10 bg-black/40 px-2 py-1 text-[9px] font-bold text-white/80 backdrop-blur">
          {isAr ? "أحياء" : "Alive"}: 87 · {isAr ? "قتل" : "Kills"}: 4 · 120 FPS
        </div>

        {/* Mini-map */}
        <div className="absolute right-3 top-3 h-14 w-14 rounded-lg border border-white/20 bg-black/50 backdrop-blur">
          <div className="absolute inset-0 rounded-lg bg-grid opacity-20" />
          <span className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400" />
        </div>

        {/* Health bar */}
        <div className="absolute bottom-3 left-1/2 w-32 -translate-x-1/2">
          <div className="h-2 overflow-hidden rounded-full border border-white/15 bg-black/50">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400" style={{ width: `${hp}%` }} />
          </div>
        </div>

        {/* Buttons */}
        {BUTTONS.filter((b) => visible.has(b.id)).map((b) => (
          <span
            key={b.id}
            className={`absolute flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/50 text-base backdrop-blur ${b.pos}`}
          >
            {b.icon}
          </span>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {["L1", "L2", "L3", "R1", "R2", "R3"].slice(0, fingers).map((f) => (
          <span key={f} className="rounded-lg border border-purple-400/20 bg-purple-500/10 px-2 py-1 text-[10px] font-bold text-purple-300">
            {f} {isAr ? "نشط" : "active"}
          </span>
        ))}
      </div>
    </div>
  );
}
