import { useEffect, useRef } from "react";

export function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const gold = ["#ffd166","#ffb347","#ff9a3c","#ffe08a","#ffcb6b","#ff7a00","#ffefc4"];
    type D = { x: number; y: number; r: number; vy: number; vx: number; a: number; t: number; c: string };
    const count = Math.min(60, Math.floor((W * H) / 28000));
    const dots: D[] = [];
    for (let i = 0; i < count; i++) {
      dots.push({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 2.5 + 0.5,
        vy: -(Math.random() * 0.5 + 0.25),
        vx: (Math.random() - 0.5) * 0.3,
        a: Math.random() * 0.4 + 0.12,
        t: Math.random() * Math.PI * 2,
        c: gold[Math.floor(Math.random() * gold.length)],
      });
    }

    let raf = 0, f = 0;
    const loop = () => {
      f++;
      ctx.clearRect(0, 0, W, H);
      for (const d of dots) {
        d.y += d.vy; d.x += d.vx + Math.sin(d.t + f * 0.008) * 0.1; d.t += 0.014;
        if (d.y < -8) { d.y = H + 8; d.x = Math.random() * W; }
        if (d.x < -8) d.x = W + 8; if (d.x > W + 8) d.x = -8;
        ctx.globalAlpha = d.a * (0.5 + Math.abs(Math.sin(d.t)) * 0.5);
        ctx.fillStyle = d.c; ctx.shadowBlur = 6; ctx.shadowColor = d.c;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(loop);
    };
    loop();

    const rs = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", rs);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", rs); };
  }, []);

  return (
    <>
      {/* Golden Eagle SVG — majestic backdrop */}
      <div className="pointer-events-none fixed inset-0 flex items-start justify-center overflow-hidden" aria-hidden="true" style={{ zIndex: -3, paddingTop: '3vh' }}>
        <svg viewBox="0 0 800 550" width="100%" height="auto"
          style={{
            maxWidth: '950px',
            opacity: 0.20,
            filter: 'drop-shadow(0 0 70px rgba(255,140,0,0.7)) drop-shadow(0 0 160px rgba(255,100,0,0.35))',
            animation: 'eagleFloat 8s ease-in-out infinite',
          }}
        >
          <defs>
            <linearGradient id="eg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffd166" />
              <stop offset="40%" stopColor="#ff7a00" />
              <stop offset="100%" stopColor="#ff4500" />
            </linearGradient>
            <linearGradient id="eb" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#1a0800" />
              <stop offset="100%" stopColor="#3a1500" />
            </linearGradient>
          </defs>
          <ellipse cx="400" cy="280" rx="55" ry="100" fill="url(#eb)" />
          <ellipse cx="400" cy="235" rx="38" ry="65" fill="#2a1000" />
          <ellipse cx="400" cy="155" rx="30" ry="35" fill="#1a0800" />
          <path d="M395 125 L412 142 L395 155 Z" fill="#ff7a00" />
          <circle cx="412" cy="145" r="6" fill="#ffd166" />
          <circle cx="413" cy="144" r="2.5" fill="#05070c" />
          <path d="M340 240 Q180 100 60 30 Q130 80 190 140 Q90 45 15 65 Q110 110 185 170 Q70 95 5 125 Q95 150 180 190 Q70 155 10 195 Q95 190 185 215 Q110 215 50 240 Q140 230 215 235 Q160 250 80 265 Q175 265 270 255 L340 240Z" fill="url(#eg)" stroke="#ff4500" strokeWidth="1" opacity="0.85" />
          <path d="M190 140 Q140 95 60 30" stroke="#ffd166" strokeWidth="1.5" fill="none" opacity="0.5" />
          <path d="M185 170 Q110 85 15 65" stroke="#ffd166" strokeWidth="1.5" fill="none" opacity="0.5" />
          <path d="M180 190 Q95 120 5 125" stroke="#ffd166" strokeWidth="1.5" fill="none" opacity="0.5" />
          <path d="M185 215 Q95 170 10 195" stroke="#ffd166" strokeWidth="1.5" fill="none" opacity="0.5" />
          <path d="M460 240 Q620 100 740 30 Q670 80 610 140 Q710 45 785 65 Q690 110 615 170 Q730 95 795 125 Q705 150 620 190 Q730 155 790 195 Q705 190 615 215 Q690 215 750 240 Q660 230 585 235 Q640 250 720 265 Q625 265 530 255 L460 240Z" fill="url(#eg)" stroke="#ff4500" strokeWidth="1" opacity="0.85" />
          <path d="M610 140 Q660 95 740 30" stroke="#ffd166" strokeWidth="1.5" fill="none" opacity="0.5" />
          <path d="M615 170 Q690 85 785 65" stroke="#ffd166" strokeWidth="1.5" fill="none" opacity="0.5" />
          <path d="M620 190 Q705 120 795 125" stroke="#ffd166" strokeWidth="1.5" fill="none" opacity="0.5" />
          <path d="M615 215 Q705 170 790 195" stroke="#ffd166" strokeWidth="1.5" fill="none" opacity="0.5" />
          <path d="M365 375 L345 450 Q400 475 455 450 L435 375Z" fill="#2a1000" />
          <path d="M375 375 L358 460 L400 485 L442 460 L425 375Z" fill="url(#eg)" opacity="0.6" />
          <path d="M375 378 L370 420 L355 432 M370 420 L382 438 M370 420 L365 436" stroke="#ff7a00" strokeWidth="2" fill="none" />
          <path d="M425 378 L430 420 L445 432 M430 420 L418 438 M430 420 L435 436" stroke="#ff7a00" strokeWidth="2" fill="none" />
        </svg>
      </div>

      {/* Floating gold dust canvas */}
      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0" aria-hidden="true" style={{ zIndex: -2, opacity: 0.75 }} />
    </>
  );
}
