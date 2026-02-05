# PWA Installation Guide

This Progressive Web App (PWA) can be installed on all major platforms for offline access and a native app-like experience.

## 🚀 Quick Start

### Build Icons (Required First)

```bash
# Install dependencies
npm install

# Generate PNG icons from SVG
npm run build:icons
```

### Local Development

```bash
# Serve locally (requires npx or install serve globally)
npm run serve

# Or use any local server:
python -m http.server 3000
# or
npx serve . -l 3000
```

## 📱 Platform Installation Guide

### Windows 10/11

**Chrome/Edge:**
1. Visit the site in Chrome or Edge
2. Click the install icon (⊕) in the address bar, OR
3. Click Menu (⋮) → "Install AI Strategy"
4. The app appears in Start Menu and can be pinned to taskbar

### macOS

**Chrome:**
1. Visit the site in Chrome
2. Click the install icon (⊕) in the address bar
3. The app appears in Applications folder and Launchpad

**Safari (macOS Sonoma+):**
1. Visit the site in Safari
2. File → Add to Dock
3. The app appears in Dock

### Linux

**Chrome/Chromium:**
1. Visit the site in Chrome
2. Click the install icon in the address bar
3. The app appears in your application menu

**Firefox:** PWA install not natively supported, use a third-party solution or Chrome.

### Android

**Chrome:**
1. Visit the site in Chrome
2. Tap the "Add to Home Screen" banner, OR
3. Tap Menu (⋮) → "Install app" or "Add to Home screen"
4. The app icon appears on your home screen

**Samsung Internet:**
1. Visit the site
2. Tap Menu → "Add page to" → "Home screen"

### iOS (iPhone/iPad)

**Safari (required):**
1. Visit the site in Safari
2. Tap the Share button (□↑)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" in the top right
5. The app icon appears on your home screen

> **Note:** iOS requires Safari for PWA installation. Chrome/Firefox on iOS cannot install PWAs.

## 🔧 Build Scripts

### Icon Generation

The project includes scripts for generating PNG icons from SVG sources:

```bash
# Using Sharp (recommended, cross-platform)
npm run build:icons

# Alternative: Using Sharp directly
npm run build:icons:sharp
```

### Required Tools (if Sharp fails)

If Sharp isn't available, the script falls back to system tools:

**Windows:**
```powershell
# Install via Chocolatey
choco install inkscape
# or
choco install imagemagick
```

**macOS:**
```bash
# Install via Homebrew
brew install inkscape
# or
brew install librsvg
# or
brew install imagemagick
```

**Linux:**
```bash
# Debian/Ubuntu
sudo apt install inkscape
# or
sudo apt install librsvg2-bin
# or
sudo apt install imagemagick
```

## 🌐 GitHub Pages Deployment

### Automatic Deployment

Push to `main` or `master` branch triggers automatic deployment via GitHub Actions.

### Manual Setup

1. Enable GitHub Pages in repository settings
2. Set source to "GitHub Actions"
3. Push changes to trigger deployment

### Repository Settings

1. Go to Settings → Pages
2. Source: "GitHub Actions"
3. The workflow at `.github/workflows/deploy.yml` handles the rest

## 📁 Project Structure

```
├── index.html              # Main entry point
├── manifest.json           # PWA manifest
├── service-worker.js       # Offline caching
├── app.js                  # App JavaScript + SW registration
├── styles.css              # Shared styles
├── package.json            # Build scripts
├── icons/
│   ├── icon.svg            # Source icon
│   ├── icon-maskable.svg   # Maskable variant
│   ├── icon-*.png          # Generated icons
│   └── browserconfig.xml   # Windows tile config
├── scripts/
│   ├── generate-icons.js   # Cross-platform icon generator
│   └── generate-icons-sharp.js
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Pages deployment
└── *.html                  # App pages
```

## ✅ PWA Checklist

The app meets all PWA requirements:

- [x] HTTPS (required for production, localhost works for dev)
- [x] Valid Web App Manifest (`manifest.json`)
- [x] Service Worker with fetch handler
- [x] Icons: 192x192 and 512x512 (minimum)
- [x] Maskable icons for Android adaptive icons
- [x] Apple Touch Icon for iOS
- [x] Offline functionality via service worker caching
- [x] Responsive design
- [x] `display: standalone` for app-like experience

## 🔍 Testing PWA

### Chrome DevTools

1. Open DevTools (F12)
2. Go to "Application" tab
3. Check "Manifest" for manifest validation
4. Check "Service Workers" for SW status
5. Use "Lighthouse" for PWA audit

### Lighthouse Audit

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run PWA audit
lighthouse https://your-site.github.io --only-categories=pwa
```

## 🐛 Troubleshooting

**Install button not showing:**
- Must be served over HTTPS (or localhost)
- Manifest must be valid
- Service worker must be registered
- Site must not already be installed

**Service Worker not registering:**
- Check browser console for errors
- Ensure `service-worker.js` is at root
- Must be served over HTTPS (or localhost)

**Icons not loading:**
- Run `npm run build:icons` first
- Check icon paths in manifest.json
- Verify icons exist in `icons/` folder

**iOS issues:**
- Must use Safari (not Chrome/Firefox)
- Apple Touch Icon must be 180x180
- `apple-mobile-web-app-capable` meta tag required
