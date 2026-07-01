import { useEffect, useRef } from "react";

/**
 * GOLDEN DUST — phenomenal animated background.
 *
 *  • Flow-field wind (sin/cos currents) drives organic swirling motion.
 *  • `lighter` composite blending makes overlapping motes glow like embers.
 *  • A translucent dark wash each frame leaves bright motion trails
 *    → the motion is unmistakable and looks like flowing gold dust.
 *  • A layer of large, soft bokeh orbs adds depth.
 */
export function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clampN = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

    const GOLD = ["#ffd166", "#ff7a00", "#ffefc4", "#ffb347", "#ffe08a", "#ffcb6b", "#ff9a3c"];

    type Mote = {
      x: number; y: number; r: number; vx: number; vy: number;
      color: string; phase: number; ps: number; sway: number; a: number;
    };

    // ---- fine drifting gold dust ----
    const dustCount = reduced ? 30 : clampN(Math.floor((w * h) / 8500), 70, 190);
    const dust: Mote[] = [];
    for (let i = 0; i < dustCount; i++) {
      dust.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.8 + 0.5,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -(Math.random() * 0.45 + 0.12),
        color: GOLD[Math.floor(Math.random() * GOLD.length)],
        phase: Math.random() * Math.PI * 2,
        ps: Math.random() * 0.05 + 0.01,
        sway: Math.random() * 0.6 + 0.2,
        a: Math.random() * 0.4 + 0.25,
      });
    }

    // ---- brighter glowing sparks (few, with real shadow glow) ----
    const sparkCount = reduced ? 6 : clampN(Math.floor(dustCount / 11), 8, 22);
    const sparks: Mote[] = [];
    for (let i = 0; i < sparkCount; i++) {
      sparks.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 1.6,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -(Math.random() * 0.55 + 0.2),
        color: GOLD[Math.floor(Math.random() * 3)], // warmest tones
        phase: Math.random() * Math.PI * 2,
        ps: Math.random() * 0.06 + 0.02,
        sway: Math.random() * 0.9 + 0.3,
        a: Math.random() * 0.35 + 0.5,
      });
    }

    // ---- depth bokeh ----
    const bokehCount = reduced ? 0 : clampN(Math.floor((w * h) / 110000), 4, 11);
    const bokeh = Array.from({ length: bokehCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 70 + 35,
      vy: -(Math.random() * 0.12 + 0.03),
      phase: Math.random() * Math.PI * 2,
      color: GOLD[Math.floor(Math.random() * 3)],
    }));

    let t = 0;
    let raf = 0;

    const drawMote = (p: Mote, glow: boolean) => {
      const tw = 0.45 + (Math.sin(p.phase) * 0.5 + 0.5) * 0.55; // 0.45–1.0 twinkle
      ctx.globalAlpha = tw * p.a;
      ctx.fillStyle = p.color;
      if (glow) {
        ctx.shadowBlur = 14;
        ctx.shadowColor = p.color;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    };

    const loop = () => {
      // 1) translucent dark wash → motion trails (keeps it dark + dynamic)
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(5,7,12,0.16)";
      ctx.fillRect(0, 0, w, h);

      // 2) additive glow for all gold
      ctx.globalCompositeOperation = "lighter";

      const windY = (p: Mote) => Math.sin(p.y * 0.0035 + t) * 0.45 + Math.cos(p.x * 0.0025 + t * 0.7) * 0.35;

      // depth bokeh (soft, slow)
      for (const b of bokeh) {
        b.y += b.vy;
        b.phase += 0.006;
        if (b.y < -b.r) { b.y = h + b.r; b.x = Math.random() * w; }
        const al = 0.03 + (Math.sin(b.phase) * 0.5 + 0.5) * 0.05;
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0, b.color);
        g.addColorStop(1, "rgba(255,209,102,0)");
        ctx.globalAlpha = al;
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // fine dust
      for (const p of dust) {
        p.x += p.vx + windY(p) + Math.sin(t + p.phase) * p.sway * 0.25;
        p.y += p.vy;
        p.phase += p.ps;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        drawMote(p, false);
      }

      // glowing sparks
      for (const p of sparks) {
        p.x += p.vx + windY(p) + Math.sin(t + p.phase) * p.sway * 0.3;
        p.y += p.vy;
        p.phase += p.ps;
        if (p.y < -12) { p.y = h + 12; p.x = Math.random() * w; }
        if (p.x < -12) p.x = w + 12;
        if (p.x > w + 12) p.x = -12;
        drawMote(p, true);
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      t += 0.012;
      raf = requestAnimationFrame(loop);
    };
    loop();

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true" />;
}
