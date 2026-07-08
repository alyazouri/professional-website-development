import { useLang } from "./LanguageContext";
import { t } from "./i18n";
import { getWeaponProfile } from "./weaponProfiles";
import type { Device, ProProfileId } from "./data";
import { PRO_PROFILES } from "./data";

export type ScopeSens = {
  noScope: number; red: number; scope2: number;
  scope3: number; scope4: number; scope6: number; scope8: number;
  tpp: number; fpp: number;
};

export type GyroMode = "off" | "scope" | "always";

export type SensParams = {
  deviceId: string; device: Device; brandId: string;
  fingers: number; styleId: string; gyroMode: GyroMode;
  weaponId: string; weaponName: string;
  weaponRecoil: number; weaponRange: number; weaponType: string;
  proProfile: string;
};

export type Sens = {
  cam: ScopeSens; ads: ScopeSens;
  gyro: { cam: ScopeSens; ads: ScopeSens };
  freeLook: { cam: number; parashoot: number; vehicle: number };
  aiScore: number;
  factors: { deviceFactor: number; weaponFactor: number; fingerFactor: number; styleFactor: number };
};

export type SavedProfile = { id: string; name: string; savedAt: number; params: SensParams };

// ═══════════════════════════════════════════════════════════════════
//  MASTER CASCADE — every scope drops naturally from the previous one
//  Verified against PUBG Mobile Global pro settings (Gamuters, TalkEsport, BitTopup, Cashify)
// ═══════════════════════════════════════════════════════════════════

const CASCADE: Record<string, number> = {
  tpp:1.00, fpp:0.95, noScope:1.00, red:0.48, scope2:0.34, scope3:0.24,
  scope4:0.18, scope6:0.14, scope8:0.10,
};

// Global multipliers — fixed relationships between the 4 tables
const G_ADS  = 0.92;
const G_GYRO = 2.85;
const G_ADGY = 0.92;

// Fingers: more fingers = more control → slightly less sensitivity needed
const F: Record<number, number> = { 2:1.06, 3:1.03, 4:1.00, 5:0.97, 6:0.94 };

// Styles: each has a different camera/ADS/gyro bias
type M = { c:number; a:number; g:number };
const S: Record<string, M> = {
  balanced:   {c:1.00,a:1.00,g:1.00}, aggressive:{c:1.06,a:1.03,g:1.10},
  headshot:   {c:0.92,a:0.96,g:0.94}, spray:     {c:0.97,a:1.07,g:1.14},
  competitive:{c:0.94,a:0.97,g:0.92}, close:     {c:1.10,a:1.05,g:1.18},
  closespray: {c:1.12,a:1.10,g:1.22}, longspray: {c:0.88,a:1.13,g:1.06},
  proelite:   {c:1.06,a:1.16,g:1.38},
};

// Weapon type biases
const T: Record<string, M> = {
  ar:{c:1.00,a:1.00,g:1.00}, smg:{c:1.14,a:0.90,g:1.24},
  dmr:{c:0.90,a:0.86,g:0.88}, sniper:{c:0.78,a:0.80,g:0.82},
  lmg:{c:1.00,a:1.10,g:1.18}, shotgun:{c:1.14,a:1.00,g:1.18},
  pistol:{c:1.18,a:1.00,g:1.24},
};

type ScopeKey = keyof ScopeSens;
const SCOPE_KEYS: ScopeKey[] = ["noScope","red","scope2","scope3","scope4","scope6","scope8"];
export const SCOPE_DEFS: { key: ScopeKey|"tpp"|"fpp"; icon: string; labelKey: string }[] = [
  {key:"tpp",icon:"👁️",labelKey:"sens_tpp"},{key:"fpp",icon:"👁️",labelKey:"sens_fpp"},
  {key:"red",icon:"🔴",labelKey:"sens_red_dot"},{key:"scope2",icon:"🎯",labelKey:"sens_2x"},
  {key:"scope3",icon:"🎯",labelKey:"sens_3x"},{key:"scope4",icon:"🔭",labelKey:"sens_4x"},
  {key:"scope6",icon:"🔭",labelKey:"sens_6x"},{key:"scope8",icon:"🔭",labelKey:"sens_8x"},
];

const cl = (v:number,lo:number,hi:number) => Math.max(lo,Math.min(hi,v));
export function computePPI(d: Device): number {
  const p = d.resolution.split("×"); if(p.length!==2) return 400;
  const w=parseInt(p[0],10), h=parseInt(p[1],10);
  if(!w||!h||!d.screenSize) return 400;
  return Math.round(Math.sqrt(w*w+h*h)/d.screenSize);
}

// ═══════════════════════════════════════════════════════════════════
//  DEVICE FACTOR — one clean formula
//
//  Better device → lower DF → lower sensitivity needed
//  (because the device is more responsive and precise)
//
//  DF = 1.0 is the reference (120Hz phone, excellent gyro)
//  DF < 1.0 = gaming phone, 165Hz+
//  DF > 1.0 = budget device, needs higher sens to compensate
// ═══════════════════════════════════════════════════════════════════

function deviceFactor(device: Device): {df:number; Gq:number} {
  const fps   = device.fps>=165?0.92 : device.fps>=120?0.97 : device.fps>=90?1.03 : 1.10;
  const touch = device.touchRate>=720?0.94 : device.touchRate>=480?0.97 : device.touchRate>=240?1.00 : 1.04;
  const size  = device.screenSize>=12?1.04 : device.screenSize>=10?1.02 : device.screenSize>=6.5?0.98 : 0.96;
  const gyro  = device.gyroQuality==="excellent"?1.00 : device.gyroQuality==="good"?0.97 : 0.92;
  const Gq    = device.gyroQuality==="excellent"?1.00 : device.gyroQuality==="good"?0.95 : 0.88;
  return { df: cl(fps*touch*size*gyro, 0.78, 1.18), Gq };
}

// ═══════════════════════════════════════════════════════════════════
//  WEAPON RECOIL — clean, wide range
// ═══════════════════════════════════════════════════════════════════

function weaponMod(recoil:number, rpm:number):{c:number;a:number;g:number} {
  const r=recoil/100, f=rpm/700;
  return {
    c: cl(1-(r-0.50)*0.30, 0.88, 1.08),      // camera: slightly lower for high recoil
    a: cl(1+(r-0.50)*1.10+(f-1)*0.35, 0.60, 1.40), // ADS: much higher for high recoil
    g: cl(1+(r-0.50)*1.50+(f-1)*0.50, 0.50, 1.55), // Gyro: dominates recoil control
  };
}

// PRO ELITE sticky boost — CQC scopes get extra gyro
const STICKY: Record<string, Record<string, number>> = {
  proelite: { noScope:1.38, red:1.32, scope2:1.22, scope3:1.06, scope4:1.08, scope6:0.94, scope8:0.86 },
};

// ═══════════════════════════════════════════════════════════════════
//  MAIN ENGINE
// ═══════════════════════════════════════════════════════════════════

export function computeSensitivity(p: SensParams): Sens {
  const { device, fingers, styleId, gyroMode, weaponName, weaponRecoil, weaponRange, weaponType, proProfile } = p;

  const { df, Gq } = deviceFactor(device);
  const fin = F[fingers]??1;
  const sty = S[styleId]??S.balanced;
  const pro = PRO_PROFILES.find(x=>x.id===(proProfile as ProProfileId));
  const pm = pro?.sensMultiplier??1;
  const wp = getWeaponProfile(weaponName, weaponRecoil, weaponRange, weaponType);
  const wt = T[wp.type]??T.ar;
  const wr = weaponMod(wp.verticalRecoil, wp.fireRate);

  // BASE: reference TPP Camera value before weapon correction
  const base = 120 * df * fin * sty.c * wt.c * wr.c * pm;

  // CAMERA = base × cascade
  const tppCam = cl(Math.round(base),1,300);
  const fppCam = cl(Math.round(tppCam*(CASCADE.fpp??0.95)),1,300);
  const cam: Record<string,number> = {tpp:tppCam, fpp:fppCam};
  for (const k of SCOPE_KEYS) cam[k] = cl(Math.round(tppCam*(CASCADE[k]??0.18)),1,300);

  // ADS = camera × G_ADS × recoil × style
  const ads: Record<string,number> = {};
  for (const k of [...SCOPE_KEYS,"tpp"as const,"fpp"as const])
    ads[k] = cl(Math.round(cam[k]*G_ADS*wr.a*sty.a*wt.a),1,300);

  // GYRO = base × cascade × G_GYRO × recoil × gyroQuality × trust
  const buildGyro = (mode:GyroMode): Record<string,number> => {
    if (mode==="off") { const z:Record<string,number>={}; for(const k of [...SCOPE_KEYS,"tpp","fpp"])z[k]=0; return z; }
    const out: Record<string,number> = {};
    for (const k of SCOPE_KEYS) {
      if (mode==="scope"&&k==="noScope") { out[k]=0; continue; }
      const sk = (STICKY[styleId]?.[k]??1);
      out[k] = cl(Math.round(base*(CASCADE[k]??0.18)*G_GYRO*wr.g*sty.g*wt.g*Gq*sk),1,400);
    }
    out.tpp = mode==="scope"?0 : cl(Math.round(base*G_GYRO*wr.g*sty.g*wt.g*Gq),1,400);
    out.fpp = mode==="scope"?0 : cl(Math.round(out.tpp*(CASCADE.fpp??0.95)),1,400);
    return out;
  };
  const gc = buildGyro(gyroMode);

  // ADS GYRO = gyro × G_ADGY × recoil
  const ga: Record<string,number> = {};
  for (const k of [...SCOPE_KEYS,"tpp"as const,"fpp"as const]) {
    const sk = (STICKY[styleId]?.[k]??1);
    ga[k] = cl(Math.round(gc[k]*G_ADGY*wr.a*sty.a*sk), gc[k]>0?1:0, 400);
  }

  const vb = styleId==="proelite"?1.42:1.04;
  const fl = {
    cam:cl(Math.round(tppCam*1.04),1,300), parashoot:cl(Math.round(tppCam*1.20),1,300),
    vehicle:cl(Math.round(tppCam*vb),1,300),
  };

  const dF=df, wF=cl((100-wp.verticalRecoil*0.5)/100,0.4,1), fF=1/fin, sF=sty.c;
  const gyS = gyroMode==="off"?0.5:device.gyroQuality==="excellent"?1:device.gyroQuality==="good"?0.8:0.6;
  const ai = Math.round(cl((dF*0.3+wF*0.2+fF*0.2+sF*0.15+gyS*0.15)*100,1,100));

  return {
    cam:cam as ScopeSens, ads:ads as ScopeSens,
    gyro:{cam:gc as ScopeSens, ads:ga as ScopeSens},
    freeLook:fl, aiScore:ai,
    factors:{deviceFactor:dF, weaponFactor:wF, fingerFactor:fF, styleFactor:sF},
  };
}

export function SensTable({title,icon,data,max,accent="text-orange-300",barClass="from-orange-500 to-amber-400"}:{
  title:string;icon:string;data:ScopeSens;max:number;accent?:string;barClass?:string;
}) {
  const {lang}=useLang();
  return (
    <div className="card rounded-2xl p-4">
      <div className="mb-2 flex items-center gap-2"><span className="text-base">{icon}</span><span className="text-xs font-bold uppercase tracking-widest text-white/70">{title}</span></div>
      <div className="space-y-1.5">
        {SCOPE_DEFS.map(r=>{const v=(data as Record<string,number>)[r.key]??0,off=v<=0,pct=off?0:Math.round(v/max*100);
          return (<div key={r.label} className={`rounded-lg bg-white/[0.02] px-2.5 py-1.5 ${off?"opacity-40":""}`}>
            <div className="mb-1 flex items-center justify-between"><span className="flex items-center gap-1.5 text-xs text-white/70"><span>{r.icon}</span><span>{t(r.labelKey as never,lang)}</span></span><span className={`font-display text-sm font-bold tabular-nums ${off?"text-white/30":accent}`}>{off?"—":`${v}%`}</span></div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/5"><div className={`h-full rounded-full bg-gradient-to-r ${barClass}`} style={{width:`${pct}%`,transition:"width 0.4s ease-out"}}/></div>
          </div>);
        })}
      </div>
    </div>
  );
}

export function FactorsCard({factors}:{factors:Sens["factors"]}) {
  const {lang}=useLang();
  const items=[{k:"D",label:t("stability_device",lang),v:factors.deviceFactor},{k:"W",label:t("stability_weapon",lang),v:factors.weaponFactor},{k:"F",label:t("stability_fingers",lang),v:factors.fingerFactor},{k:"S",label:t("stability_style",lang),v:factors.styleFactor}];
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map(it=>(<div key={it.k} className="card rounded-xl p-3 text-center"><div className="font-display text-lg font-black text-orange-300">{it.k}</div><div className="text-[10px] text-white/50">{it.label}</div><div className="font-display text-sm font-bold text-white tabular-nums">{(it.v*100).toFixed(0)}%</div></div>))}
    </div>
  );
}
