<div align="center">

<!-- Banner -->
<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:0f0f0f,50:1a1a2e,100:16213e&height=200&section=header&text=MechTrix&fontSize=80&fontColor=f97316&animation=fadeIn&fontAlignY=38&desc=Mechanic+App&descAlignY=60&descSize=22&descColor=94a3b8" />

<br/>

<p>
  <img src="https://img.shields.io/badge/Expo_SDK-54-000020?style=for-the-badge&logo=expo&logoColor=white" />
  <img src="https://img.shields.io/badge/React_Native-0.81-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Platform-Android%20%7C%20iOS%20%7C%20Web-f97316?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white" />
</p>

<p>
  <strong>The mobile command center for MechTrix mechanics.</strong><br/>
  Bookings · Earnings · Navigation · Real-time updates — all in one wrench-tight package.
</p>

---

</div>

## 🔧 What Is This?

**MechTrix Mechanic App** is the React Native (Expo) mobile application powering the mechanic side of the MechTrix platform. It handles everything a mechanic needs on the go — from accepting bookings and navigating to job sites, to tracking earnings and managing their profile.

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Expo SDK 54](https://expo.dev) + React Native 0.81 |
| Navigation | [React Navigation](https://reactnavigation.org) |
| HTTP Client | [Axios](https://axios-http.com) |
| Real-time | [Socket.IO Client](https://socket.io/docs/v4/client-api/) |
| Builds | [EAS Build](https://docs.expo.dev/build/introduction/) |

---

## 🛠️ Prerequisites

Before you start, make sure you have:

- **Node.js** `18+` — [Download](https://nodejs.org)
- **npm** `9+`
- **Android Studio** — for emulator/device builds
- **Expo CLI** — optional; `npx expo` works without a global install

---

## 🚀 Setup

### 1 · Navigate to the app directory

```bash
cd mechanic-app
```

### 2 · Install dependencies

```bash
npm install
```

### 3 · Create your local environment file

<details>
<summary>🪟 <strong>PowerShell (Windows)</strong></summary>

```powershell
Copy-Item .env.example .env
```

</details>

<details>
<summary>🍎 <strong>macOS / Linux</strong></summary>

```bash
cp .env.example .env
```

</details>

### 4 · Fill in your `.env` values

```env
EXPO_PUBLIC_API_URL=https://your-backend-domain/api
EXPO_PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_key
```

> **⚠️ Important:** `EXPO_PUBLIC_API_URL` is **mandatory** — the app will refuse to start without it.

---

## ▶️ Running the App

| Command | What it does |
|---|---|
| `npm run start` | Start the Expo dev server |
| `npm run android` | Launch on Android emulator/device |
| `npm run ios` | Launch on iOS simulator *(macOS only)* |
| `npm run web` | Launch web preview in browser |

---

## 📦 Building with EAS

> Make sure you're logged into your Expo account (`npx eas login`) and EAS CLI is installed (`npm install -g eas-cli`).

**Preview APK** — great for testing on real devices:

```bash
eas build --platform android --profile preview
```

**Production AAB** — ready for the Play Store:

```bash
eas build --platform android --profile production
```

---

## 🗂️ Project Structure

```
mechanic-app/
├── App.js               # App entry point, navigation composition
├── AuthContext.js        # Authentication state & context provider
├── ThemeContext.js       # Theme state & context provider
├── config/
│   └── api.js           # API base URL + Maps key wiring
├── screens/             # All mechanic-facing screens
│   ├── Dashboard
│   ├── Bookings
│   ├── Earnings
│   ├── Navigation
│   └── Profile
└── android/             # Native Android project files
```

---

## 🌍 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | ✅ Yes | Backend API base URL. App **will not start** without this. |
| `EXPO_PUBLIC_GOOGLE_MAPS_KEY` | ⚠️ Recommended | Powers all maps & navigation features. |

---

## 🩺 Troubleshooting

<details>
<summary>❌ <strong>Missing API URL error</strong></summary>

If you see:

```
Missing EXPO_PUBLIC_API_URL environment variable
```

**Fix:** Make sure `.env` exists inside `mechanic-app/` and contains `EXPO_PUBLIC_API_URL`.

</details>

<details>
<summary>❌ <strong>Android build issues</strong></summary>

1. Verify Android SDK is installed and an emulator/device is connected.
2. Try a clean reinstall:

**PowerShell:**
```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

**macOS / Linux:**
```bash
rm -rf node_modules package-lock.json
npm install
```

</details>

---

## 📜 Scripts Reference

| Script | Description |
|---|---|
| `npm run start` | Start Expo development server |
| `npm run android` | Run on Android |
| `npm run ios` | Run on iOS (macOS only) |
| `npm run web` | Run web preview |

---

<div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:16213e,50:1a1a2e,100:0f0f0f&height=100&section=footer" />

<sub>Built for the MechTrix platform · React Native + Expo</sub>

</div>
