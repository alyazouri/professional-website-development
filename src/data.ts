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
    id: "apple",
    name: "Apple",
    icon: "🍎",
    accent: "from-slate-300 to-slate-500",
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
    id: "samsung",
    name: "Samsung",
    icon: "📱",
    accent: "from-blue-400 to-indigo-600",
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
    id: "xiaomi",
    name: "Xiaomi",
    icon: "📲",
    accent: "from-orange-400 to-red-500",
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
      d("Redmi Note 13 Pro+", 120, 240, 6.67, "2712×1220", "good"),
      d("Redmi Note 13", 120, 240, 6.67, "2400×1080", "average"),
    ],
  },
  {
    id: "rog",
    name: "ASUS ROG",
    icon: "🎮",
    accent: "from-red-500 to-rose-700",
    devices: [
      d("ROG Phone 9 Ultimate", 185, 720, 6.78, "2400×1080", "excellent"),
      d("ROG Phone 9 Pro", 165, 720, 6.78, "2400×1080", "excellent"),
      d("ROG Phone 8 Pro", 165, 720, 6.78, "2400×1080", "excellent"),
      d("ROG Phone 7 Ultimate", 165, 720, 6.78, "2400×1080", "excellent"),
    ],
  },
  {
    id: "oneplus",
    name: "OnePlus",
    icon: "⚡",
    accent: "from-red-400 to-pink-600",
    devices: [
      d("OnePlus 13", 120, 240, 6.82, "3168×1440", "excellent"),
      d("OnePlus 12", 120, 240, 6.82, "3168×1440", "excellent"),
      d("OnePlus 11", 120, 240, 6.7, "3216×1440", "excellent"),
      d("OnePlus 12R", 120, 240, 6.78, "2780×1264", "good"),
      d("OnePlus Nord 4", 120, 240, 6.74, "2772×1240", "good"),
    ],
  },
  {
    id: "oppo",
    name: "OPPO",
    icon: "📸",
    accent: "from-emerald-400 to-teal-600",
    devices: [
      d("OPPO Find X8 Pro", 120, 240, 6.78, "2780×1264", "excellent"),
      d("OPPO Find X7 Ultra", 120, 240, 6.82, "3168×1440", "excellent"),
      d("OPPO Reno 12 Pro", 120, 240, 6.7, "2412×1080", "good"),
      d("OPPO Reno 12", 120, 240, 6.7, "2412×1080", "good"),
    ],
  },
  {
    id: "realme",
    name: "Realme",
    icon: "🌟",
    accent: "from-yellow-400 to-amber-600",
    devices: [
      d("Realme GT 7 Pro", 120, 480, 6.78, "2780×1264", "excellent"),
      d("Realme GT 6", 120, 240, 6.78, "2780×1264", "good"),
      d("Realme GT Neo 6", 120, 240, 6.78, "2780×1264", "good"),
    ],
  },
  {
    id: "huawei",
    name: "Huawei",
    icon: "🛰️",
    accent: "from-rose-400 to-red-600",
    devices: [
      d("Huawei Mate 60 Pro", 120, 240, 6.82, "2720×1260", "good"),
      d("Huawei P60 Pro", 120, 240, 6.67, "2700×1220", "good"),
      d("Huawei Mate X5", 120, 240, 7.85, "2496×2224", "good"),
    ],
  },
  {
    id: "gaming",
    name: "Gaming",
    icon: "🕹️",
    accent: "from-fuchsia-500 to-purple-700",
    devices: [
      d("RedMagic 10 Pro", 144, 960, 6.85, "2688×1216", "excellent"),
      d("RedMagic 9 Pro", 120, 960, 6.8, "2480×1116", "excellent"),
      d("RedMagic 8 Pro", 120, 960, 6.8, "2480×1116", "excellent"),
      d("Lenovo Legion Y700", 144, 240, 8.8, "2560×1600", "excellent"),
      d("Lenovo Legion Phone 2 Pro", 144, 720, 6.92, "2460×1080", "excellent"),
    ],
  },
];

export type WeaponCategory = {
  id: string;
  name: string;
  icon: string;
  weapons: { name: string; recoil: number; range: number; type: string }[];
};

export const WEAPONS: WeaponCategory[] = [
  {
    id: "ar",
    name: "بنادق AR",
    icon: "🔫",
    weapons: [
      { name: "M416", recoil: 72, range: 65, type: "AR" },
      { name: "AKM", recoil: 85, range: 68, type: "AR" },
      { name: "M762", recoil: 88, range: 70, type: "AR" },
      { name: "SCAR-L", recoil: 62, range: 60, type: "AR" },
      { name: "G36C", recoil: 65, range: 62, type: "AR" },
      { name: "AUG", recoil: 60, range: 64, type: "AR" },
      { name: "QBZ", recoil: 64, range: 60, type: "AR" },
      { name: "M16A4", recoil: 55, range: 75, type: "AR" },
      { name: "FAMAS", recoil: 68, range: 58, type: "AR" },
      { name: "ACE32", recoil: 78, range: 66, type: "AR" },
      { name: "Groza", recoil: 82, range: 62, type: "AR" },
      { name: "Honey Badger", recoil: 70, range: 58, type: "AR" },
      { name: "Mk47 Mutant", recoil: 58, range: 72, type: "AR" },
      { name: "K2", recoil: 66, range: 62, type: "AR" },
    ],
  },
  {
    id: "smg",
    name: "SMG",
    icon: "💥",
    weapons: [
      { name: "UZI", recoil: 55, range: 30, type: "SMG" },
      { name: "UMP45", recoil: 45, range: 40, type: "SMG" },
      { name: "Vector", recoil: 58, range: 32, type: "SMG" },
      { name: "MP5K", recoil: 48, range: 36, type: "SMG" },
      { name: "Tommy Gun", recoil: 52, range: 35, type: "SMG" },
      { name: "P90", recoil: 40, range: 38, type: "SMG" },
      { name: "JS9", recoil: 42, range: 35, type: "SMG" },
      { name: "PP-19 Bizon", recoil: 44, range: 34, type: "SMG" },
      { name: "MP9", recoil: 50, range: 28, type: "SMG" },
    ],
  },
  {
    id: "sniper",
    name: "Sniper",
    icon: "🎯",
    weapons: [
      { name: "AWM", recoil: 95, range: 100, type: "Sniper" },
      { name: "M24", recoil: 82, range: 92, type: "Sniper" },
      { name: "Kar98k", recoil: 78, range: 88, type: "Sniper" },
      { name: "Win94", recoil: 70, range: 70, type: "Sniper" },
      { name: "Mosin-Nagant", recoil: 78, range: 88, type: "Sniper" },
      { name: "Lynx AMR", recoil: 98, range: 100, type: "Sniper" },
      { name: "M1 Garand", recoil: 72, range: 85, type: "Sniper" },
    ],
  },
  {
    id: "dmr",
    name: "DMR",
    icon: "🔭",
    weapons: [
      { name: "Mini14", recoil: 50, range: 82, type: "DMR" },
      { name: "SKS", recoil: 60, range: 80, type: "DMR" },
      { name: "SLR", recoil: 72, range: 85, type: "DMR" },
      { name: "Mk14", recoil: 78, range: 88, type: "DMR" },
      { name: "QBU", recoil: 55, range: 82, type: "DMR" },
      { name: "VSS", recoil: 40, range: 60, type: "DMR" },
      { name: "Mk12", recoil: 52, range: 84, type: "DMR" },
      { name: "Dragunov", recoil: 65, range: 86, type: "DMR" },
    ],
  },
  {
    id: "lmg",
    name: "LMG",
    icon: "💣",
    weapons: [
      { name: "M249", recoil: 68, range: 55, type: "LMG" },
      { name: "DP-28", recoil: 62, range: 58, type: "LMG" },
      { name: "MG3", recoil: 75, range: 60, type: "LMG" },
    ],
  },
  {
    id: "shotgun",
    name: "Shotgun",
    icon: "🧨",
    weapons: [
      { name: "S12K", recoil: 80, range: 20, type: "Shotgun" },
      { name: "S1897", recoil: 85, range: 18, type: "Shotgun" },
      { name: "S686", recoil: 88, range: 15, type: "Shotgun" },
      { name: "DBS", recoil: 90, range: 22, type: "Shotgun" },
      { name: "M1014", recoil: 82, range: 20, type: "Shotgun" },
      { name: "NS2000", recoil: 86, range: 17, type: "Shotgun" },
      { name: "O12", recoil: 84, range: 19, type: "Shotgun" },
    ],
  },
];

// PUBG Mobile Official Servers
export const SERVERS = [
  { id: "jordan", name: "Jordan", flag: "🇯🇴", ping: 35 },
  { id: "middle-east", name: "Middle East", flag: "🇦🇪", ping: 48 },
  { id: "europe", name: "Europe", flag: "🇪🇺", ping: 118 },
  { id: "asia", name: "Asia", flag: "🌏", ping: 145 },
  { id: "north-america", name: "North America", flag: "🇺🇸", ping: 185 },
  { id: "south-america", name: "South America", flag: "🇧🇷", ping: 210 },
  { id: "krjp", name: "KRJP", flag: "🇰🇷", ping: 245 },
];

export const STYLES = [
  { id: "headshot", name: "هيدشوت", icon: "🎯" },
  { id: "spray", name: "سبراي", icon: "🔫" },
  { id: "competitive", name: "تنافسي", icon: "🏆" },
  { id: "close", name: "قريب المدى", icon: "⚡" },
  { id: "reflex", name: "ردود فعل", icon: "💨" },
  { id: "conqueror", name: "كونكر", icon: "👑" },
];

// ════════════════════════════════════════════════════════════
// 4 Professional Esports Profiles
// ════════════════════════════════════════════════════════════
export type ProProfileId = "aggressive" | "balanced" | "competitive" | "headshot_pro" | "sniper_elite" | "spray_master" | "clutch_king" | "tdm_destroyer";

export interface ProProfile {
  id: ProProfileId;
  name: string;
  nameAr: string;
  icon: string;
  description: string;
  descriptionAr: string;
  color: string;
  tier: "S" | "S+" | "A";
  // Multipliers applied ON TOP of weapon profile
  cqcMul: number;
  scopeNearMul: number;
  scopeFarMul: number;
  gyroMul: number;
  gyroFarMul: number;
  // Advanced attributes
  recoilControl: number;   // 1-10
  tracking: number;        // 1-10
  flicking: number;        // 1-10
  longRange: number;       // 1-10
  cqcPower: number;        // 1-10
  strengths: string[];
  strengthsAr: string[];
  weaknesses: string[];
  weaknessesAr: string[];
  bestFor: string[];
  bestForAr: string[];
}

export const PRO_PROFILES: ProProfile[] = [
  {
    id: "aggressive",
    name: "Aggressive Entry Fragger",
    nameAr: "هجومي عدواني",
    icon: "⚡",
    description: "Maximum speed for CQC dominance. Higher TPP/FPP and Red Dot for instant 180° reactions.",
    descriptionAr: "أقصى سرعة للسيطرة على القتال القريب. ردة فعل 180° فورية.",
    color: "from-red-500 to-orange-500",
    tier: "S",
    cqcMul: 1.08, scopeNearMul: 1.05, scopeFarMul: 0.98, gyroMul: 1.06, gyroFarMul: 0.97,
    recoilControl: 8, tracking: 9, flicking: 10, longRange: 7, cqcPower: 10,
    strengths: ["Fast 180° turns", "Quick Red Dot tracking", "Dominant in buildings"],
    strengthsAr: ["لفة 180° سريعة", "تتبع Red Dot سريع", "سيطرة في المباني"],
    weaknesses: ["Less stable at 6x/8x", "Needs recoil skill"],
    weaknessesAr: ["أقل ثباتاً على 6x/8x", "يحتاج مهارة ارتداد"],
    bestFor: ["Rush", "Entry fragger", "TDM", "Hot drops"],
    bestForAr: ["راش", "أول من يدخل", "TDM", "هوت دروب"],
  },
  {
    id: "balanced",
    name: "Balanced All-Rounder",
    nameAr: "متوازن شامل",
    icon: "⚖️",
    description: "Perfect balance between speed and stability. Works for all ranges.",
    descriptionAr: "توازن مثالي بين السرعة والثبات لكل المسافات.",
    color: "from-emerald-500 to-teal-500",
    tier: "A",
    cqcMul: 1.0, scopeNearMul: 1.0, scopeFarMul: 1.0, gyroMul: 1.0, gyroFarMul: 1.0,
    recoilControl: 9, tracking: 9, flicking: 9, longRange: 9, cqcPower: 9,
    strengths: ["Consistent at all ranges", "Easy muscle memory", "Good for learning"],
    strengthsAr: ["ثابت على كل المسافات", "سهل لذاكرة العضلات", "جيد للتعلّم"],
    weaknesses: ["Not specialized", "May feel slow for aggressive"],
    weaknessesAr: ["غير متخصص", "قد يشعر بالبطء للعدوانيين"],
    bestFor: ["All-round", "Squad support", "Ranked", "Beginners"],
    bestForAr: ["شامل", "دعم الفريق", "رانكد", "مبتدئين"],
  },
  {
    id: "competitive",
    name: "Professional Competitive",
    nameAr: "تنافسي احترافي",
    icon: "🏆",
    description: "Tournament-grade stability. Maximum precision for scrims and competitive play.",
    descriptionAr: "ثبات بطولات. أقصى دقة للسكريم واللعب التنافسي.",
    color: "from-amber-500 to-yellow-500",
    tier: "S+",
    cqcMul: 0.97, scopeNearMul: 0.96, scopeFarMul: 0.93, gyroMul: 0.98, gyroFarMul: 0.94,
    recoilControl: 10, tracking: 10, flicking: 8, longRange: 10, cqcPower: 8,
    strengths: ["Maximum long-range stability", "Tournament precision", "Best recoil control"],
    strengthsAr: ["أقصى ثبات بعيد المدى", "دقة بطولات", "أفضل تحكم بالارتداد"],
    weaknesses: ["Slower CQC", "Needs positioning skill"],
    weaknessesAr: ["ردة فعل أبطأ بالقريب", "يحتاج مهارة تموضع"],
    bestFor: ["Scrims", "Tournaments", "IGL/Support", "Conqueror"],
    bestForAr: ["سكريم", "بطولات", "قائد الفريق", "كونكر"],
  },
  {
    id: "headshot_pro",
    name: "Headshot Precision",
    nameAr: "دقة الهيدشوت",
    icon: "🎯",
    description: "Precision-first. Lower sensitivity for head-level tracking. Higher gyro for micro-adjustments.",
    descriptionAr: "الدقة أولاً. حساسية أقل لتتبع الرأس. جايرو أعلى للتعديلات الدقيقة.",
    color: "from-purple-500 to-pink-500",
    tier: "S",
    cqcMul: 0.95, scopeNearMul: 0.94, scopeFarMul: 0.92, gyroMul: 1.04, gyroFarMul: 1.02,
    recoilControl: 10, tracking: 10, flicking: 8, longRange: 10, cqcPower: 7,
    strengths: ["Best headshot accuracy", "Smooth head tracking", "High gyro precision"],
    strengthsAr: ["أفضل دقة هيدشوت", "تتبع رأس سلس", "دقة جايرو عالية"],
    weaknesses: ["Slowest CQC speed", "Requires patience"],
    weaknessesAr: ["أبطأ سرعة بالقريب", "يحتاج صبر"],
    bestFor: ["Sniper main", "DMR", "Headshot hunter", "Patient player"],
    bestForAr: ["سنايبر", "DMR", "صياد هيدشوت", "لاعب صبور"],
  },
  {
    id: "sniper_elite",
    name: "Sniper Elite",
    nameAr: "نخبة القناصين",
    icon: "🔭",
    description: "Bolt-action specialist. Ultra-stable 6x/8x. Smooth scope transitions for one-shot kills.",
    descriptionAr: "متخصص بولت أكشن. ثبات مطلق على 6x/8x. انتقالات سكوب سلسة لقتلة بطلقة.",
    color: "from-indigo-500 to-blue-600",
    tier: "S",
    cqcMul: 0.92, scopeNearMul: 0.93, scopeFarMul: 0.88, gyroMul: 1.06, gyroFarMul: 1.05,
    recoilControl: 9, tracking: 10, flicking: 7, longRange: 10, cqcPower: 7,
    strengths: ["Ultra-stable 6x/8x", "Perfect bolt-action aim", "Deadly at 300m+"],
    strengthsAr: ["ثبات مطلق 6x/8x", "تصويب بولت أكشن مثالي", "قاتل على 300م+"],
    weaknesses: ["Very slow CQC", "Terrible in buildings", "Needs team cover"],
    weaknessesAr: ["بطيء جداً بالقريب", "سيء في المباني", "يحتاج غطاء الفريق"],
    bestFor: ["Bolt-action sniper", "AWM/M24/Kar98k main", "Long-range support"],
    bestForAr: ["سنايبر بولت", "AWM/M24/Kar98k", "دعم بعيد المدى"],
  },
  {
    id: "spray_master",
    name: "Spray Master",
    nameAr: "سيّد السبراي",
    icon: "🔫",
    description: "Full-auto recoil control specialist. Maximum spray stability on 3x/4x. Gyro tuned for vertical pull-down.",
    descriptionAr: "متخصص بالتحكم في الارتداد التلقائي. أقصى ثبات سبراي على 3x/4x. جايرو مضبوط للسحب.",
    color: "from-orange-500 to-red-600",
    tier: "S+",
    cqcMul: 1.03, scopeNearMul: 1.02, scopeFarMul: 0.95, gyroMul: 1.08, gyroFarMul: 1.06,
    recoilControl: 10, tracking: 10, flicking: 9, longRange: 9, cqcPower: 9,
    strengths: ["Best spray control", "Stable 3x/4x sprays", "High gyro recoil compensation"],
    strengthsAr: ["أفضل تحكم بالسبراي", "ثبات 3x/4x عالي", "تعويض ارتداد جايرو قوي"],
    weaknesses: ["Not fastest CQC", "Needs spray practice daily"],
    weaknessesAr: ["ليس الأسرع بالقريب", "يحتاج تمرين سبراي يومي"],
    bestFor: ["M762/AKM spray", "3x/4x spray", "Mid-range dominance", "Recoil control pros"],
    bestForAr: ["سبراي M762/AKM", "سبراي 3x/4x", "سيطرة المتوسط", "محترفي الارتداد"],
  },
  {
    id: "clutch_king",
    name: "Clutch King",
    nameAr: "ملك الكلاتش",
    icon: "👑",
    description: "Survival specialist. Balanced but slightly faster CQC for 1vX situations. Smart gyro for multi-enemy tracking.",
    descriptionAr: "متخصص بالبقاء. متوازن مع CQC أسرع لمواجهات 1 ضد الجميع. جايرو ذكي لتتبع عدة أعداء.",
    color: "from-yellow-500 to-amber-600",
    tier: "S+",
    cqcMul: 1.05, scopeNearMul: 1.02, scopeFarMul: 0.96, gyroMul: 1.04, gyroFarMul: 0.98,
    recoilControl: 10, tracking: 10, flicking: 10, longRange: 9, cqcPower: 10,
    strengths: ["Best for 1vX clutches", "Fast target switching", "Adaptable to any situation"],
    strengthsAr: ["الأفضل لكلاتش 1vX", "تبديل أهداف سريع", "قابل للتكيف مع أي موقف"],
    weaknesses: ["Not best at any extreme", "Needs game sense"],
    weaknessesAr: ["ليس الأفضل في أي طرف", "يحتاج حس لعب"],
    bestFor: ["Solo player", "1vX clutches", "Solo vs Squad", "Last alive"],
    bestForAr: ["لاعب سولو", "كلاتش 1vX", "سولو ضد سكواد", "آخر واقف"],
  },
  {
    id: "tdm_destroyer",
    name: "TDM Destroyer",
    nameAr: "مدمّر TDM",
    icon: "💀",
    description: "Pure hip-fire and Red Dot speed. Highest TPP/FPP for instant reactions. Built for Arena and TDM domination.",
    descriptionAr: "سرعة هيب فاير و Red Dot مطلقة. أعلى TPP/FPP لردة فعل فورية. مصمم لسيطرة TDM والأرينا.",
    color: "from-rose-500 to-red-700",
    tier: "S",
    cqcMul: 1.12, scopeNearMul: 1.08, scopeFarMul: 0.96, gyroMul: 1.08, gyroFarMul: 0.95,
    recoilControl: 8, tracking: 10, flicking: 10, longRange: 7, cqcPower: 10,
    strengths: ["Fastest reactions in game", "Hip-fire beast", "Red Dot god-speed"],
    strengthsAr: ["أسرع ردة فعل في اللعبة", "وحش الهيب فاير", "سرعة Red Dot خارقة"],
    weaknesses: ["Unstable at long range", "Hard to spray 4x+", "Not for ranked"],
    weaknessesAr: ["غير ثابت من بعيد", "صعب السبراي 4x+", "ليس للرانكد"],
    bestFor: ["TDM", "Arena", "Warehouse 1v1", "Close-range only"],
    bestForAr: ["TDM", "أرينا", "وير هاوس 1v1", "قريب فقط"],
  },
];

export const FINGERS = [2, 3, 4, 5, 6] as const;
