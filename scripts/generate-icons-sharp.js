/**
 * Generate PNG icons from SVG using Sharp
 * Works on Linux, macOS, Windows
 * 
 * Usage: node scripts/generate-icons-sharp.js
 * Requires: npm install sharp
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.join(__dirname, '..', 'icons');
const SVG_SOURCE = path.join(ICONS_DIR, 'icon.svg');
const SVG_MASKABLE = path.join(ICONS_DIR, 'icon-maskable.svg');

// Icon sizes needed for PWA
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const MASKABLE_SIZES = [192, 512];

// Screenshot sizes
const SCREENSHOTS = [
  { name: 'screenshot-wide.png', width: 1280, height: 720 },
  { name: 'screenshot-narrow.png', width: 720, height: 1280 }
];

async function generateIcons() {
  console.log('🎨 Generating PWA icons from SVG...\n');

  // Ensure icons directory exists
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  // Check if source SVG exists
  if (!fs.existsSync(SVG_SOURCE)) {
    console.error('❌ Source SVG not found:', SVG_SOURCE);
    process.exit(1);
  }

  const svgBuffer = fs.readFileSync(SVG_SOURCE);
  const maskableSvgBuffer = fs.existsSync(SVG_MASKABLE) 
    ? fs.readFileSync(SVG_MASKABLE) 
    : svgBuffer;

  // Generate regular icons
  console.log('📐 Generating standard icons...');
  for (const size of ICON_SIZES) {
    const outputPath = path.join(ICONS_DIR, `icon-${size}x${size}.png`);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`  ✓ icon-${size}x${size}.png`);
  }

  // Generate maskable icons
  console.log('\n🎭 Generating maskable icons...');
  for (const size of MASKABLE_SIZES) {
    const outputPath = path.join(ICONS_DIR, `icon-maskable-${size}x${size}.png`);
    await sharp(maskableSvgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`  ✓ icon-maskable-${size}x${size}.png`);
  }

  // Generate Apple Touch Icon
  console.log('\n🍎 Generating Apple Touch Icon...');
  const appleTouchPath = path.join(ICONS_DIR, 'apple-touch-icon.png');
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(appleTouchPath);
  console.log('  ✓ apple-touch-icon.png (180x180)');

  // Generate favicon
  console.log('\n🔖 Generating favicon...');
  const faviconPath = path.join(ICONS_DIR, 'favicon-32x32.png');
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(faviconPath);
  console.log('  ✓ favicon-32x32.png');

  const favicon16Path = path.join(ICONS_DIR, 'favicon-16x16.png');
  await sharp(svgBuffer)
    .resize(16, 16)
    .png()
    .toFile(favicon16Path);
  console.log('  ✓ favicon-16x16.png');

  // Generate placeholder screenshots
  console.log('\n📸 Generating placeholder screenshots...');
  for (const screenshot of SCREENSHOTS) {
    const outputPath = path.join(ICONS_DIR, screenshot.name);
    
    // Create a simple placeholder with the app colors
    const placeholderSvg = `
      <svg width="${screenshot.width}" height="${screenshot.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0f172a"/>
            <stop offset="100%" style="stop-color:#1e293b"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <text x="50%" y="45%" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" fill="#14b8a6">AI Model Strategy</text>
        <text x="50%" y="55%" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#64748b">Medical Illustration PWA</text>
      </svg>
    `;
    
    await sharp(Buffer.from(placeholderSvg))
      .resize(screenshot.width, screenshot.height)
      .png()
      .toFile(outputPath);
    console.log(`  ✓ ${screenshot.name}`);
  }

  console.log('\n✅ All icons generated successfully!');
  console.log(`📁 Output directory: ${ICONS_DIR}`);
}

// Run the generator
generateIcons().catch((err) => {
  console.error('❌ Error generating icons:', err);
  process.exit(1);
});
