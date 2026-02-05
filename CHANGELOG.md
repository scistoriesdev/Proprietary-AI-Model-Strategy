# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-02-05

### Added

- **Favicon.ico generation** - Multi-resolution ICO file (16x16, 32x32, 48x48) generated from SVG
- **png-to-ico dependency** - Added for proper ICO format generation
- **Favicon fallback** - PNG-based fallback if ICO generation fails

### Changed

- **Build script enhanced** - `generate-icons-sharp.js` now generates favicon.ico
- **HTML favicon references** - Added favicon.ico link to all pages

---

## [1.1.0] - 2026-02-05

### Added

- **README link in navigation** - Added README link to top navigation bar across all pages
- **Automatic content updates** - Service worker now detects content changes and notifies all connected clients
- **Version-based cache management** - Incrementing `VERSION` in service-worker.js forces updates to all clients
- **Update notifications** - Users see banners when new versions or content updates are available
- **Content change detection** - Service worker compares cached vs network responses to detect changes
- **Multi-tab broadcast** - All open tabs/windows receive update notifications simultaneously

### Changed

- **Service worker caching strategy** - HTML pages now use network-first strategy for fresher content
- **Update check interval** - App checks for updates every 5 minutes when tab is visible

## [1.0.0] - 2026-02-05

### Added

- **Progressive Web App (PWA) support** - Full PWA implementation for all platforms
  - Web App Manifest (`manifest.json`) with icons, shortcuts, and screenshots
  - Service Worker (`service-worker.js`) for offline caching
  - Install prompt handling for Add to Home Screen
  
- **Cross-platform installability**
  - Windows 10/11 (Chrome/Edge)
  - macOS (Chrome/Safari)
  - Linux (Chrome/Chromium)
  - Android (Chrome/Samsung Internet)
  - iOS (Safari)

- **PWA Icons**
  - Source SVG icons (`icons/icon.svg`, `icons/icon-maskable.svg`)
  - Generated PNG icons in all required sizes (72-512px)
  - Apple Touch Icon (180x180)
  - Windows tile configuration (`browserconfig.xml`)

- **Build System**
  - `package.json` with build scripts
  - Cross-platform icon generation (`scripts/generate-icons.js`)
  - Sharp-based icon generation (`scripts/generate-icons-sharp.js`)

- **GitHub Pages Deployment**
  - GitHub Actions workflow (`.github/workflows/deploy.yml`)
  - Automatic deployment on push to main/master
  - `.nojekyll` file for proper static file serving

- **Documentation**
  - `INSTALLATION.md` - Platform-specific installation guide
  - Table of Contents added to `README.md`

- **PWA Meta Tags** - Added to all HTML pages:
  - `index.html`
  - `training.html`
  - `scientific.html`
  - `hardware.html`
  - `cloud.html`
  - `legal.html`
  - `readme.html`

### Technical Details

- Service Worker uses stale-while-revalidate for assets, network-first for HTML
- Supports offline access to all cached pages
- Automatic cache cleanup on version updates
- `clients.claim()` for immediate activation of new service workers

---

## Version Numbering

- **MAJOR**: Breaking changes or major feature overhauls
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, minor improvements

## Triggering Updates

To push updates to all clients, increment the version in `service-worker.js`:

```javascript
const VERSION = '1.1.0';  // Change this to trigger update
```
