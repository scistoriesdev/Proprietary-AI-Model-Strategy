# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.7.1] - 2026-02-05

### Changed

- **Copyright & Attribution** - Updated footer across all HTML pages:
  - Year updated to 2026
  - Attribution changed to [SciStories](https://SciStories.com)
  - License changed to "For internal use only"

---

## [1.7.0] - 2026-02-05

### Added

- **Expanded Legal Section** - Comprehensive coverage of AI legal frameworks:
  - **Base Model License Implications** - SDXL (RAIL), Flux (Non-Commercial vs Apache 2.0), LoRA ownership clarification
  - **AI Contract Templates** - Ready-to-use clauses for scope, IP protection, disclosure, liability, confidentiality
  - **Case Law & Precedents** - Thaler v. Perlmutter, Zarya of the Dawn, Getty v. Stability AI, trade secret cases
  - **Ethical Guidelines** - Transparency standards by audience, accuracy obligations, professional organizations (AMI, GNSI, BCA)
  - **Insurance Considerations** - E&O coverage, cyber liability, IP insurance, emerging AI exclusions
- **New Legal Tabs in HTML** - 10 tabs: Ownership, Training Data, Model Licenses, Contracts, Case Law, Jurisdiction, Commercial, Medical, Ethics, Insurance
- **Updated Search Index** - 4 new legal entries with content snippets

### Changed

- **README Table of Contents** - Added sections 6.9-6.13 for new legal content
- **legal.html** - Restructured with expanded tabbed interface

---

## [1.6.1] - 2026-02-05

### Added

- **Enhanced Search with Content Matching** - Search now matches within section content, not just titles
  - Content snippets from each section added to search index
  - Matching content displayed as preview in search results
  - Improved scoring: title match > keyword match > content match
  - Results increased from 8 to 10 for broader discovery

---

## [1.6.0] - 2026-02-05

### Added

- **Platform-Specific Setup Guides** - Complete installation and configuration instructions:
  - **Windows**: OneTrainer, Kohya_ss, ComfyUI installation with PowerShell commands
  - **Linux (Ubuntu)**: NVIDIA drivers, CUDA toolkit, Python environment setup
  - **macOS (Apple Silicon)**: MPS support, limitations, ComfyUI configuration
  - **RunPod Cloud**: Pod configuration, dataset upload methods, training workflow
- **Cross-platform comparison table** - Best use cases for each platform
- **Platform-specific optimizations** - Environment variables, performance tuning
- **Security best practices** for cloud training

### Changed

- **README Section 8** - New comprehensive platform setup documentation
- **training.html** - Added tabbed interface for platform guides with code snippets
- **Section numbering** - Reorganized to accommodate new Section 8 (Conclusion → 9, Appendix → 10, Resources → 11)

---

## [1.5.0] - 2026-02-05

### Added

- **Training Art Guide** - Comprehensive guidance on creating different art styles for LoRA training:
  - Style categories: Flat Vector, Isometric 3D, Realistic Render, Cross-Section, SEM/Microscopy, Watercolor/Sketch
  - The 80/20 Rule for training dataset consistency
  - Technical requirements by style (resolution, backgrounds, export formats)
  - 3D blockout workflow for generating consistent training data
  - Hand-drawn guidelines with common mistakes to avoid
- **Public Domain Sources** - Curated list of legally safe training data sources:
  - Public domain medical art (Gray's Anatomy, Biodiversity Heritage Library, Wellcome Collection)
  - Open scientific databases (IDR, Cell Image Library, Protein Data Bank, OpenStax)
  - Creative Commons resources (Wikimedia, NASA, USDA)
  - License compatibility matrix for commercial training
  - Regularization dataset guidance

### Changed

- **README Sections 5.3 & 5.4** - Added detailed documentation for creating training art and public domain sources
- **training.html** - Added two new sections with interactive UI for training art styles and public domain links

---

## [1.4.0] - 2026-02-05

### Added

- **Resources page** - New searchable page with curated links to all essential tools and platforms
- **50+ external links** organized by category:
  - Base Models (SDXL, Flux, CivitAI, Hugging Face)
  - Training Software (OneTrainer, Kohya, AI Toolkit, Diffusers)
  - Inference Tools (ComfyUI, Automatic1111, Fooocus, InvokeAI)
  - Cloud Providers (RunPod, Lambda Labs, Vast.ai, Paperspace)
  - SaaS Platforms (fal.ai, Astria, Scenario, Replicate)
  - 3D & Preprocessing (Blender, ZBrush, Real-ESRGAN)
  - Documentation & Communities
- **README Section 10** - Added Essential Resources & Tools with organized reference tables
- **Resources in search index** - All resource categories searchable via autocomplete

### Changed

- **Navigation updated** - Added Resources link to all page headers

---

## [1.3.0] - 2026-02-05

### Added

- **Autocomplete search** - Global search with keyboard navigation across all pages
- **Search index** - Pre-built index covering Training, Scientific, Hardware, Cloud, Legal, and README sections
- **Keyboard shortcut** - Press `Ctrl/Cmd + K` to open search from anywhere
- **Search features**:
  - Debounced input for performance
  - Relevance-based scoring algorithm
  - Section badges with color coding
  - Match highlighting in results
  - Arrow key navigation
  - Click outside to close

### Changed

- **Header navigation** - Added search input to all page headers

---

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
