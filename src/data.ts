export type Device = {
  name: string;
  fps: number;
  touchRate: number; // Hz
  screenSize: number; // inches
  resolution: string;
  gyroQuality: "excellent" | "good" | "average";
};

export type DeviceBrand = {
  id: string;
  name: string;
  icon: string;
  accent: string;
  devices: Device[];
};

const d = (name: string, fps: number, touchRate: number, screenSize: number, resolution: string, gyroQuality: Device["gyroQuality"]): Device =>
  ({ name, fps, touchRate, screenSize, resolution, gyroQuality });

export const BRANDS: DeviceBrand[] = [
  {
    id: "apple", name: "Apple", icon: "🍎", accent: "from-slate-300 to-slate-500",
    devices: [
      d("iPhone 16 Pro Max", 120, 240, 6.9, "2868×1320", "excellent"),
      d("iPhone 16 Pro", 120, 240, 6.3, "2622×1206", "excellent"),
      d("iPhone 16 Plus", 60, 120, 6.7, "2796×1290", "excellent"),
      d("iPhone 16", 60, 120, 6.1, "2556×1179", "excellent"),
      d("iPhone 15 Pro Max", 120, 240, 6.7, "2796×1290", "excellent"),
      d("iPhone 15 Pro", 120, 240, 6.1, "2556×1179", "excellent"),
      d("iPhone 15 Plus", 60, 120, 6.7, "2796×1290", "excellent"),
      d("iPhone 15", 60, 120, 6.1, "2556×1179", "excellent"),
      d("iPhone 14 Pro Max", 120, 240, 6.7, "2796×1290", "excellent"),
      d("iPhone 14 Pro", 120, 240, 6.1, "2556×1179", "excellent"),
      d("iPhone 14 Plus", 60, 120, 6.7, "2778×1284", "excellent"),
      d("iPhone 13 Pro Max", 120, 240, 6.7, "2778×1284", "excellent"),
      d("iPhone 13 Pro", 120, 240, 6.1, "2532×1170", "excellent"),
      d("iPhone 13", 60, 120, 6.1, "2532×1170", "excellent"),
      d("iPhone 12 Pro", 60, 120, 6.1, "2532×1170", "good"),
      d("iPhone 11 Pro Max", 60, 120, 6.5, "2688×1242", "good"),
      d("iPhone 11", 60, 120, 6.1, "1792×828", "good"),
      d("iPad Pro 13 (M4)", 120, 240, 13.0, "2752×2064", "excellent"),
      d("iPad Pro 12.9 (M2)", 120, 240, 12.9, "2732×2048", "excellent"),
      d("iPad Pro 11 (M4)", 120, 240, 11.0, "2420×1668", "excellent"),
      d("iPad Air M2", 60, 120, 11.0, "2360×1640", "excellent"),
      d("iPad Air 5", 60, 120, 10.9, "2360×1640", "good"),
      d("iPad Mini 6", 60, 120, 8.3, "2266×1488", "good"),
      d("iPad 10", 60, 60, 10.9, "2360×1640", "average"),
    ],
  },
  {
    id: "samsung", name: "Samsung", icon: "📱", accent: "from-blue-400 to-indigo-600",
    devices: [
      d("Galaxy S25 Ultra", 120, 240, 6.9, "3120×1440", "excellent"),
      d("Galaxy S25+", 120, 240, 6.7, "3120×1440", "excellent"),
      d("Galaxy S25", 120, 240, 6.2, "2340×1080", "excellent"),
      d("Galaxy S24 Ultra", 120, 240, 6.8, "3120×1440", "excellent"),
      d("Galaxy S24+", 120, 240, 6.7, "3120×1440", "excellent"),
      d("Galaxy S24", 120, 240, 6.2, "2340×1080", "excellent"),
      d("Galaxy S23 Ultra", 120, 240, 6.8, "3088×1440", "excellent"),
      d("Galaxy S22 Ultra", 120, 240, 6.8, "3088×1440", "excellent"),
      d("Galaxy S23+", 120, 240, 6.6, "2340×1080", "excellent"),
      d("Galaxy S23", 120, 240, 6.1, "2340×1080", "excellent"),
      d("Galaxy Z Fold 6", 120, 240, 7.6, "2160×1856", "excellent"),
      d("Galaxy Z Flip 6", 120, 240, 6.7, "2640×1080", "good"),
      d("Galaxy Tab S10 Ultra", 120, 240, 14.6, "2960×1848", "excellent"),
      d("Galaxy Tab S9 Ultra", 120, 240, 14.6, "2960×1848", "excellent"),
      d("Galaxy Tab S9+", 120, 240, 12.4, "2800×1752", "excellent"),
      d("Galaxy Tab S9", 120, 240, 11.0, "2560×1600", "excellent"),
    ],
  },
  {
    id: "xiaomi", name: "Xiaomi", icon: "🔥", accent: "from-orange-400 to-red-500",
    devices: [
      d("Xiaomi 15 Ultra", 120, 240, 6.73, "3200×1440", "excellent"),
      d("Xiaomi 14 Ultra", 120, 240, 6.73, "3200×1440", "excellent"),
      d("Xiaomi 14 Pro", 120, 240, 6.73, "3200×1440", "excellent"),
      d("Xiaomi 14", 120, 240, 6.36, "2670×1200", "excellent"),
      d("Xiaomi 13T Pro", 144, 480, 6.67, "2712×1220", "excellent"),
      d("Redmi K70 Pro", 120, 480, 6.67, "3200×1440", "excellent"),
      d("Redmi K70", 120, 480, 6.67, "2712×1220", "excellent"),
      d("Poco F7 Pro", 120, 480, 6.67, "3200×1440", "excellent"),
      d("Poco F6 Pro", 120, 480, 6.67, "3200×1440", "excellent"),
      d("Poco F6", 120, 240, 6.67, "2712×1220", "good"),
      d("Poco X6 Pro", 120, 240, 6.67, "2712×1220", "good"),
      d("Redmi Note 13 Pro+", 120, 240, 6.67, "2400×1080", "average"),
    ],
  },
  {
    id: "rog", name: "ASUS ROG", icon: "🎮", accent: "from-red-500 to-rose-700",
    devices: [
      d("ROG Phone 9 Ultimate", 185, 720, 6.78, "2400×1080", "excellent"),
      d("ROG Phone 9 Pro", 165, 720, 6.78, "2400×1080", "excellent"),
      d("ROG Phone 8 Pro", 165, 720, 6.78, "2400×1080", "excellent"),
      d("ROG Phone 7 Ultimate", 165, 720, 6.78, "2400×1080", "excellent"),
    ],
  },
  {
    id: "oneplus", name: "OnePlus", icon: "⚡", accent: "from-red-400 to-pink-600",
    devices: [
      d("OnePlus 13", 120, 240, 6.82, "3168×1440", "excellent"),
      d("OnePlus 12", 120, 240, 6.82, "3168×1440", "excellent"),
      d("OnePlus 11", 120, 240, 6.7, "3216×1440", "excellent"),
      d("OnePlus 12R", 120, 240, 6.78, "2780×1264", "good"),
      d("OnePlus Nord 4", 120, 240, 6.74, "2772×1240", "good"),
    ],
  },
  {
    id: "realme", name: "Realme", icon: "🟡", accent: "from-yellow-400 to-amber-600",
    devices: [
      d("Realme GT 7 Pro", 120, 240, 6.78, "2780×1264", "excellent"),
      d("Realme GT 6", 120, 240, 6.78, "2780×1264", "excellent"),
      d("Realme GT 5 Pro", 120, 240, 6.78, "2780×1264", "excellent"),
      d("Realme 13 Pro+", 120, 240, 6.7, "2412×1080", "good"),
      d("Realme 12 Pro+", 120, 240, 6.7, "2412×1080", "good"),
    ],
  },
  {
    id: "huawei", name: "Huawei", icon: "🌸", accent: "from-rose-400 to-pink-600",
    devices: [
      d("Huawei P60 Pro", 120, 240, 6.67, "2700×1220", "good"),
      d("Huawei Mate 50 Pro", 120, 240, 6.74, "2616×1212", "good"),
      d("Huawei P50 Pro", 120, 240, 6.6, "2700×1228", "good"),
      d("Huawei Nova 11 Pro", 120, 240, 6.78, "2652×1200", "average"),
    ],
  },
  {
    id: "honor", name: "Honor", icon: "✨", accent: "from-sky-400 to-blue-600",
    devices: [
      d("Honor Magic 7 Pro", 120, 240, 6.78, "2800×1280", "excellent"),
      d("Honor Magic 6 Pro", 120, 240, 6.78, "2800×1280", "excellent"),
      d("Honor 200 Pro", 120, 240, 6.78, "2700×1224", "good"),
    ],
  },
  {
    id: "oppo", name: "OPPO", icon: "🟢", accent: "from-green-400 to-emerald-600",
    devices: [
      d("OPPO Find X8 Pro", 120, 240, 6.78, "2780×1264", "excellent"),
      d("OPPO Find X7 Ultra", 120, 240, 6.82, "3168×1440", "excellent"),
      d("OPPO Reno 12 Pro", 120, 240, 6.7, "2412×1080", "good"),
    ],
  },
  {
    id: "vivo", name: "Vivo", icon: "🔵", accent: "from-indigo-400 to-blue-600",
    devices: [
      d("Vivo X200 Pro", 120, 240, 6.78, "2800×1280", "excellent"),
      d("Vivo X100 Pro", 120, 240, 6.78, "3200×1440", "excellent"),
      d("Vivo V30 Pro", 120, 240, 6.78, "2800×1264", "good"),
    ],
  },
  {
    id: "google", name: "Google", icon: "🔷", accent: "from-cyan-400 to-teal-600",
    devices: [
      d("Pixel 9 Pro XL", 120, 240, 6.8, "2992×1344", "excellent"),
      d("Pixel 9 Pro", 120, 240, 6.3, "2856×1280", "excellent"),
      d("Pixel 8 Pro", 120, 240, 6.7, "2992×1344", "excellent"),
      d("Pixel 8", 120, 240, 6.2, "2400×1080", "excellent"),
      d("Pixel 7 Pro", 120, 240, 6.7, "3120×1440", "good"),
    ],
  },
  {
    id: "other", name: "Other", icon: "📲", accent: "from-gray-400 to-gray-600",
    devices: [
      d("Generic High-End (120Hz)", 120, 240, 6.5, "2400×1080", "good"),
      d("Generic Mid-Range (90Hz)", 90, 180, 6.5, "2400×1080", "average"),
      d("Generic Budget (60Hz)", 60, 120, 6.5, "2400×1080", "average"),
      d("Low-End Device (30-60Hz)", 60, 60, 6.0, "1600×720", "average"),
    ],
  },
];

export type Weapon = { name: string; recoil: number; range: number; type: string };
export type WeaponCategory = { id: string; name: string; icon: string; weapons: Weapon[] };

export const WEAPONS: WeaponCategory[] = [
  {
    id: "ar", name: "Assault Rifles", icon: "🔫",
    weapons: [
      { name: "M416", recoil: 52, range: 72, type: "ar" },
      { name: "AKM", recoil: 78, range: 68, type: "ar" },
      { name: "SCAR-L", recoil: 48, range: 70, type: "ar" },
      { name: "M762", recoil: 72, range: 65, type: "ar" },
      { name: "AUG", recoil: 45, range: 75, type: "ar" },
      { name: "M16A4", recoil: 58, range: 80, type: "ar" },
      { name: "G36C", recoil: 50, range: 65, type: "ar" },
      { name: "QBZ", recoil: 46, range: 72, type: "ar" },
      { name: "ACE32", recoil: 54, range: 70, type: "ar" },
      { name: "FAMAS", recoil: 55, range: 68, type: "ar" },
      { name: "Groza", recoil: 68, range: 62, type: "ar" },
      { name: "Mk47 Mutant", recoil: 70, range: 74, type: "ar" },
    ],
  },
  {
    id: "smg", name: "SMGs", icon: "⚡",
    weapons: [
      { name: "UMP45", recoil: 32, range: 45, type: "smg" },
      { name: "Vector", recoil: 28, range: 38, type: "smg" },
      { name: "Tommy Gun", recoil: 40, range: 40, type: "smg" },
      { name: "MP5K", recoil: 30, range: 42, type: "smg" },
      { name: "PP-19 Bizon", recoil: 26, range: 36, type: "smg" },
      { name: "P90", recoil: 34, range: 44, type: "smg" },
      { name: "UMP9", recoil: 33, range: 44, type: "smg" },
    ],
  },
  {
    id: "dmr", name: "DMRs", icon: "🎯",
    weapons: [
      { name: "Mini14", recoil: 38, range: 82, type: "dmr" },
      { name: "SKS", recoil: 48, range: 78, type: "dmr" },
      { name: "SLR", recoil: 62, range: 85, type: "dmr" },
      { name: "Mk14", recoil: 72, range: 88, type: "dmr" },
      { name: "DMR", recoil: 58, range: 80, type: "dmr" },
      { name: "VSS", recoil: 22, range: 50, type: "dmr" },
      { name: "QBU", recoil: 42, range: 86, type: "dmr" },
    ],
  },
  {
    id: "sniper", name: "Snipers", icon: "🎯",
    weapons: [
      { name: "AWM", recoil: 92, range: 100, type: "sniper" },
      { name: "Kar98k", recoil: 80, range: 90, type: "sniper" },
      { name: "M24", recoil: 78, range: 92, type: "sniper" },
      { name: "Win94", recoil: 55, range: 45, type: "sniper" },
      { name: "Lynx AMR", recoil: 95, range: 98, type: "sniper" },
    ],
  },
  {
    id: "lmg", name: "LMGs", icon: "💥",
    weapons: [
      { name: "M249", recoil: 68, range: 75, type: "lmg" },
      { name: "DP-28", recoil: 72, range: 70, type: "lmg" },
    ],
  },
  {
    id: "shotgun", name: "Shotguns", icon: "🔥",
    weapons: [
      { name: "S12K", recoil: 65, range: 20, type: "shotgun" },
      { name: "S1897", recoil: 85, range: 15, type: "shotgun" },
      { name: "S686", recoil: 90, range: 18, type: "shotgun" },
      { name: "DBS", recoil: 78, range: 22, type: "shotgun" },
    ],
  },
  {
    id: "pistol", name: "Pistols", icon: "🔫",
    weapons: [
      { name: "P92", recoil: 25, range: 30, type: "pistol" },
      { name: "P1911", recoil: 22, range: 28, type: "pistol" },
      { name: "R1895", recoil: 40, range: 25, type: "pistol" },
      { name: "Desert Eagle", recoil: 55, range: 35, type: "pistol" },
      { name: "P18C", recoil: 32, range: 32, type: "pistol" },
      { name: "Scorpion", recoil: 28, range: 30, type: "pistol" },
    ],
  },
];

export type FingerCount = 2 | 3 | 4 | 5 | 6;
export const FINGERS: FingerCount[] = [2, 3, 4, 5, 6];

export type ProProfileId = "aggressive" | "balanced" | "competitive" | "headshot_pro" | "sniper_elite" | "spray_master";
export type ProProfile = {
  id: ProProfileId;
  name: string;
  emoji: string;
  description: string;
  descriptionAr: string;
  recoilControl: number;
  tracking: number;
  flicking: number;
  longRange: number;
  cqcPower: number;
  strengths: string[];
  strengthsAr: string[];
  weaknesses: string[];
  weaknessesAr: string[];
  bestFor: string[];
  bestForAr: string[];
  cqcMul: number;
  scopeNearMul: number;
  scopeFarMul: number;
  gyroMul: number;
  gyroFarMul: number;
};

export const PRO_PROFILES: ProProfile[] = [
  {
    id: "aggressive",
    name: "Aggressive Rusher",
    emoji: "⚡",
    description: "Fast entry, close-quarters combat, aggressive rotations.",
    descriptionAr: "دخول سريع، قتال قريب، هجمات عدوانية.",
    recoilControl: 88, tracking: 92, flicking: 95, longRange: 62, cqcPower: 98,
    strengths: ["CQC", "Fast entry", "Building fights"],
    strengthsAr: ["قتال قريب", "دخول سريع", "معارك المباني"],
    weaknesses: ["Long-range", "Sniper duels"],
    weaknessesAr: ["مدى بعيد", "مبارزات قنّاصين"],
    bestFor: ["SMG", "AR", "TDM", "Rush"],
    bestForAr: ["SMG", "AR", "TDM", "هجوم"],
    cqcMul: 1.08, scopeNearMul: 1.04, scopeFarMul: 0.96, gyroMul: 1.04, gyroFarMul: 0.95,
  },
  {
    id: "balanced",
    name: "Balanced All-Rounder",
    emoji: "⚖️",
    description: "Stable setup for ranked and consistent muscle memory.",
    descriptionAr: "إعداد مستقر للترتيب والذاكرة العضلية الثابتة.",
    recoilControl: 85, tracking: 86, flicking: 82, longRange: 80, cqcPower: 84,
    strengths: ["Versatile", "Stable", "All ranges"],
    strengthsAr: ["متعدد", "مستقر", "كل المدى"],
    weaknesses: ["None"],
    weaknessesAr: ["لا شيء"],
    bestFor: ["AR", "DMR", "Ranked", "Classic"],
    bestForAr: ["AR", "DMR", "ترتيب", "كلاسيكي"],
    cqcMul: 1.0, scopeNearMul: 1.0, scopeFarMul: 1.0, gyroMul: 1.0, gyroFarMul: 1.0,
  },
  {
    id: "competitive",
    name: "Tournament Pro",
    emoji: "🏆",
    description: "Tournament-grade stability with strict recoil discipline.",
    descriptionAr: "ثبات بمستوى البطولات مع انضباط صارم للارتداد.",
    recoilControl: 96, tracking: 94, flicking: 80, longRange: 88, cqcPower: 82,
    strengths: ["Max stability", "Recoil control", "Long-range"],
    strengthsAr: ["أقصى ثبات", "تحكم ارتداد", "مدى بعيد"],
    weaknesses: ["Slow entry"],
    weaknessesAr: ["دخول بطيء"],
    bestFor: ["AR", "DMR", "Snipers", "Conqueror"],
    bestForAr: ["AR", "DMR", "قناصة", "فاتح"],
    cqcMul: 0.98, scopeNearMul: 0.98, scopeFarMul: 1.05, gyroMul: 1.02, gyroFarMul: 1.06,
  },
  {
    id: "headshot_pro",
    name: "Headshot Specialist",
    emoji: "🎯",
    description: "Built for head-level tracking and micro-corrections.",
    descriptionAr: "مبني لتتبع مستوى الرأس والتصحيحات الدقيقة.",
    recoilControl: 82, tracking: 98, flicking: 92, longRange: 86, cqcPower: 78,
    strengths: ["Precision", "Tracking", "Headshots"],
    strengthsAr: ["دقة", "تتبع", "رأس"],
    weaknesses: ["Spray control"],
    weaknessesAr: ["تحكم رش"],
    bestFor: ["Sniper", "DMR", "Headshot", "Precision"],
    bestForAr: ["قناص", "DMR", "رأس", "دقة"],
    cqcMul: 0.96, scopeNearMul: 0.96, scopeFarMul: 1.04, gyroMul: 1.05, gyroFarMul: 1.07,
  },
  {
    id: "sniper_elite",
    name: "Sniper Elite",
    emoji: "🏹",
    description: "Ultra-stable sniper setup for disciplined long-range play.",
    descriptionAr: "إعداد قناص فائق الثبات للعب بعيد المدى المنضبط.",
    recoilControl: 90, tracking: 84, flicking: 70, longRange: 98, cqcPower: 55,
    strengths: ["Long-range", "One-shot", "Breath control"],
    strengthsAr: ["مدى بعيد", "طلقة واحدة", "تحكم تنفس"],
    weaknesses: ["CQC", "Close fights"],
    weaknessesAr: ["قتال قريب"],
    bestFor: ["AWM", "M24", "Kar98k", "6x/8x"],
    bestForAr: ["AWM", "M24", "Kar98k", "6x/8x"],
    cqcMul: 0.88, scopeNearMul: 0.85, scopeFarMul: 1.12, gyroMul: 1.08, gyroFarMul: 1.15,
  },
  {
    id: "spray_master",
    name: "Spray Master",
    emoji: "💧",
    description: "Laser-beam spray patterns for mid-range dominance.",
    descriptionAr: "أنماط رش ليزرية لهيمنة المدى المتوسط.",
    recoilControl: 95, tracking: 90, flicking: 78, longRange: 70, cqcPower: 90,
    strengths: ["Spray", "Mid-range", "Beams"],
    strengthsAr: ["رش", "مدى متوسط", "شعاع"],
    weaknesses: ["Long range"],
    weaknessesAr: ["مدى بعيد"],
    bestFor: ["M416", "SCAR-L", "AKM", "TDM"],
    bestForAr: ["M416", "SCAR-L", "AKM", "TDM"],
    cqcMul: 1.04, scopeNearMul: 1.06, scopeFarMul: 0.94, gyroMul: 1.03, gyroFarMul: 0.97,
  },
];

export type Server = {
  id: string;
  name: string;
  region: string;
  flag: string;
  ping: number; // baseline ms
};

export const SERVERS: Server[] = [
  { id: "jordan", name: "Jordan", region: "Middle East", flag: "🇯🇴", ping: 12 },
  { id: "ksa", name: "Saudi Arabia", region: "Middle East", flag: "🇸🇦", ping: 22 },
  { id: "turkey", name: "Turkey", region: "Middle East", flag: "🇹🇷", ping: 35 },
  { id: "egypt", name: "Egypt", region: "Africa", flag: "🇪🇬", ping: 42 },
  { id: "india", name: "India", region: "Asia", flag: "🇮🇳", ping: 110 },
  { id: "singapore", name: "Singapore", region: "Asia", flag: "🇸🇬", ping: 180 },
  { id: "europe", name: "Europe", region: "EU", flag: "🇪🇺", ping: 145 },
];

export type DNSServer = {
  id: string;
  name: string;
  provider: string;
  ip: string;
  baseline: number; // ms
};

export const DNS_SERVERS: DNSServer[] = [
  { id: "jo-orange-1", name: "Orange Jordan DNS", provider: "Orange", ip: "37.205.149.1", baseline: 8 },
  { id: "jo-orange-2", name: "Orange Secondary", provider: "Orange", ip: "37.205.167.2", baseline: 10 },
  { id: "jo-zain-1", name: "Zain Jordan DNS", provider: "Zain", ip: "94.142.37.179", baseline: 11 },
  { id: "jo-zain-2", name: "Zain Secondary", provider: "Zain", ip: "94.142.53.34", baseline: 12 },
  { id: "jo-umnea-1", name: "Umniah DNS", provider: "Umniah", ip: "92.253.13.100", baseline: 9 },
  { id: "jo-umnea-2", name: "Umniah Backup", provider: "Umniah", ip: "92.253.19.31", baseline: 11 },
  { id: "jo-umnea-3", name: "Umniah Fast", provider: "Umniah", ip: "92.253.101.217", baseline: 10 },
  { id: "jo-damamax-1", name: "Damamax DNS", provider: "Damamax", ip: "213.186.174.202", baseline: 13 },
  { id: "jo-xsservers", name: "XServers Amman", provider: "XServers", ip: "46.185.162.241", baseline: 14 },
];
