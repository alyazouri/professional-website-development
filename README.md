# ALYAZOURI 2026 — PUBG Mobile Jordan Optimizer

> Professional AI-powered sensitivity generator for PUBG Mobile.
> مُحسّن PUBG Mobile الأردني — مولّد حساسية ذكاء اصطناعي احترافي.

![Version](https://img.shields.io/badge/version-2026-ff7a00)
![React](https://img.shields.io/badge/React-19.2.6-61dafb)
![Vite](https://img.shields.io/badge/Vite-7.3.2-646cff)
![Tailwind](https://img.shields.io/badge/Tailwind-4.1.17-38bdf8)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178c6)
![Languages](https://img.shields.io/badge/langs-AR%20%7C%20EN%20%7C%20TR%20%7C%20RU%20%7C%20ES-orange)

## 🎯 Overview

**ALYAZOURI 2026** is a fully client-side web application that generates optimal PUBG Mobile sensitivity settings based on:

- 📱 **77 Devices** — Apple, Samsung, Xiaomi, ROG, OnePlus, Realme, Huawei, Honor, OPPO, Vivo, Google
- 🔫 **44 Weapons** — AR, SMG, DMR, Sniper, LMG, Shotgun, Pistol — each with calibrated recoil profile
- 🌍 **7 Servers** — Live ping monitor (Jordan, Saudi, Turkey, Egypt, India, Singapore, Europe)
- 🤖 **AI Scoring** — compatibility score based on FPS, PPI, touch rate, gyro quality
- 🎮 **Pro Profiles** — 6 play styles (Aggressive, Balanced, Competitive, Headshot, Sniper Elite, Spray Master)
- 📜 **PAC Script** — One-click acceleration for Jordan servers
- 🌐 **5 Languages** — العربية, English, Türkçe, Русский, Español (full RTL support)

## ✨ Features

### 🎮 AI Sensitivity Generator
- Real physics-based calculations using FPS, Touch Rate, PPI, Gyro Quality
- 6 scopes + TPP/FPP + ADS + Free Look + Gyro
- Recoil-aware stability adjustments
- Pro profile multipliers

### 📡 Live Ping Monitor
- 7 global servers tested in real-time
- Latency, jitter, packet loss per server
- "Best server" highlighting
- Auto-runs on page load

### 🧮 DPI Calculator
- eDPI computation
- cm/360°, cm/180°, cm/90° swipe distances
- Closest pro player matching
- Speed category classification

### 🎥 Screen Recorder
- Native MediaRecorder API
- Screen capture with download
- No server needed — 100% client-side

### 👆 Touch Speed Test
- 10-second CPS test
- Rating system (Legendary, Pro, Good, Keep practicing)

### 🎵 Background Music
- YouTube IFrame API
- Toggleable with persistent preference
- Auto-plays on first user interaction

### 📱 PWA Support
- Installable on mobile/desktop
- Manifest.json with offline capability
- Smart install banner

### 🌙 Gaming Night Mode
- Purple neon theme
- Persistent across sessions
- One-click toggle

### ⭐ Rating System
- 5-star rating
- Optional comment
- Stored locally
- Editable

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 19.2.6 |
| Build | Vite 7.3.2 |
| Styling | Tailwind CSS 4.1.17 |
| Language | TypeScript 5.9.3 |
| Bundling | vite-plugin-singlefile (produces single HTML) |
| Fonts | Orbitron, Cairo, Inter (Google Fonts) |
| Video | YouTube IFrame API, MediaRecorder API |
| Icons | Emoji-based (no icon library) |

## 📁 Project Structure

```
professional-website-development/
├── index.html                 # Entry HTML with SEO meta
├── package.json               # Dependencies & scripts
├── tsconfig.json              # TypeScript config (strict)
├── vite.config.ts             # Vite config with alias & singlefile
├── public/
│   └── manifest.json          # PWA manifest
└── src/
    ├── main.tsx               # React entry point
    ├── App.tsx                # Main app (all sections)
    ├── index.css              # Global styles, animations, theme
    ├── i18n.ts                # 5-language translation system
    ├── LanguageContext.tsx    # Language provider + hook
    ├── LanguageSwitcher.tsx   # Language dropdown
    ├── data.ts                # Devices, weapons, servers, pro profiles
    ├── weaponProfiles.ts      # Calibrated recoil profiles (44 weapons)
    ├── sensitivity.tsx        # Physics engine + UI components
    ├── Hero.tsx               # Hero section with live ping card
    ├── Features.tsx           # Rating, Share, AI Predictions, Night Mode
    ├── StatusBar.tsx          # Sticky navigation header
    ├── Particles.tsx          # Animated canvas background
    ├── HudPreview.tsx         # Visual HUD preview by finger count
    ├── PingMonitor.tsx        # 7-server live ping test
    ├── PacSection.tsx         # PAC Script installation wizard
    ├── DPICalculator.tsx      # DPI/eDPI/cm calculator
    ├── TouchTest.tsx          # 10-second CPS test
    ├── QuickSearch.tsx        # Search devices/weapons
    ├── ScreenRecorder.tsx     # MediaRecorder-based recorder
    ├── MusicPlayer.tsx        # YouTube background music
    ├── PWABanner.tsx          # Install prompt banner
    └── utils/
        └── cn.ts              # clsx + tailwind-merge helper
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (recommended: 20+)
- npm 9+

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production (outputs single index.html)
npm run build

# Preview production build
npm run preview
```

### Environment
No environment variables required — 100% client-side application.

## 🧠 How It Works

### Sensitivity Algorithm

The engine computes sensitivity values using a multi-factor formula:

```
Base = 135 × DeviceFactor × FingerFactor × StyleFactor × TypeMultiplier × GyroBoost × ProMultiplier
```

**Device Factor** (D):
- FPS tier (120Hz = 1.0, 90Hz = 1.03, 60Hz = 1.05)
- Touch rate (240Hz = 1.0, 480Hz = 0.99, 960Hz = 0.97)
- Screen size (6.5" = 0.96, 11" = 1.0, 13" = 1.03)
- PPI density (300 = 1.0, 400 = 0.99, 500 = 0.98)
- Gyro quality (excellent = 1.0, good = 0.97, average = 0.92)

**Scope Multipliers** (decrease with magnification):
```
scopeMul(mag) = 1 / (mag^0.55) × recoilAdj × farAdj
```

**AI Score** = weighted combination of device capability, finger count, style match, weapon compatibility, and gyro quality.

## 🎯 User Flow

1. Select device (brand → model) or use Quick Search
2. Choose Gyro Mode (Off / Scope / Always)
3. Select Pro Profile (6 play styles)
4. Pick finger count (2F - 6F)
5. Choose play style (Balanced, Aggressive, Headshot, etc.)
6. Select weapon category → weapon
7. Get instant results:
   - Camera Sensitivity (7 scopes)
   - ADS Sensitivity (7 scopes)
   - Gyro Sensitivity (if enabled)
   - Free Look values
   - AI Score (0-100)
   - Stability Analysis (4 factors)
   - AI Predictions (headshot accuracy, etc.)
   - HUD Preview
8. Copy / Share / Save profile

## 🌐 Supported Languages

| Language | Code | Direction |
|----------|------|-----------|
| العربية | ar | RTL |
| English | en | LTR |
| Türkçe | tr | LTR |
| Русский | ru | LTR |
| Español | es | LTR |

## 📜 PAC Script

The PAC script accelerates routing to Jordan servers. Installation steps provided for:
- 🤖 Android
- 🍎 iOS
- 🪟 Windows

## 🎨 Design System

- **Colors**: Orange `#ff7a00` → Gold `#ffd166` → Red `#ff4500`
- **Gaming Mode**: Purple `#a855f7` → Pink `#ec4899`
- **Background**: `#05070c` (deep black)
- **Typography**: Orbitron (display), Cairo (Arabic), Inter (body)
- **Effects**: Neon glow, shimmer text, scan lines, pulse glow, grid backgrounds
- **Cards**: Glassmorphism with subtle borders

## 📝 Scripts

```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

## 🔒 Privacy

- 100% client-side — no backend, no database
- All data stored in localStorage:
  - Language preference
  - Night mode preference
  - Saved profiles (max 5)
  - Rating data
  - Music muted state
  - PWA banner dismissed flag
- No tracking, no analytics, no cookies
- Music from YouTube (external)

## 🏆 Credits

- **Developer**: Alyazouri 🇯🇴
- **TikTok**: @sceedalyazouri0
- **Instagram**: @sceedjor11
- **PUBG ID**: 5744469523

## 📄 License

© 2026 ALYAZOURI — All rights reserved.

**FORGED IN JORDAN 🇯🇴 — BUILT FOR WINNERS**
