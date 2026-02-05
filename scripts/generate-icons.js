/**
 * Cross-platform icon generation script
 * Attempts to use Sharp first, falls back to system tools
 * 
 * Usage: node scripts/generate-icons.js
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.join(__dirname, '..', 'icons');
const SVG_SOURCE = path.join(ICONS_DIR, 'icon.svg');

// Icon sizes needed for PWA
const ICON_SIZES = [16, 32, 72, 96, 128, 144, 152, 180, 192, 384, 512];

function checkCommand(cmd) {
  try {
    execSync(`${cmd} --version`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function detectPlatform() {
  const platform = process.platform;
  console.log(`🖥️  Detected platform: ${platform}\n`);
  return platform;
}

function generateWithInkscape(svgPath, pngPath, size) {
  // Inkscape command (works on Linux, macOS, Windows)
  const cmd = `inkscape "${svgPath}" --export-filename="${pngPath}" --export-width=${size} --export-height=${size}`;
  execSync(cmd, { stdio: 'inherit' });
}

function generateWithRsvg(svgPath, pngPath, size) {
  // rsvg-convert (common on Linux)
  const cmd = `rsvg-convert -w ${size} -h ${size} "${svgPath}" -o "${pngPath}"`;
  execSync(cmd, { stdio: 'inherit' });
}

function generateWithImageMagick(svgPath, pngPath, size) {
  // ImageMagick convert (cross-platform)
  const cmd = `magick convert -background none -resize ${size}x${size} "${svgPath}" "${pngPath}"`;
  execSync(cmd, { stdio: 'inherit' });
}

function generateWithCairoSvg(svgPath, pngPath, size) {
  // CairoSVG (Python, cross-platform)
  const cmd = `cairosvg "${svgPath}" -o "${pngPath}" --output-width ${size} --output-height ${size}`;
  execSync(cmd, { stdio: 'inherit' });
}

async function generateWithSharp() {
  try {
    const sharp = require('sharp');
    console.log('✅ Using Sharp for icon generation\n');
    
    const svgBuffer = fs.readFileSync(SVG_SOURCE);
    
    for (const size of ICON_SIZES) {
      const outputPath = path.join(ICONS_DIR, `icon-${size}x${size}.png`);
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      console.log(`  ✓ icon-${size}x${size}.png`);
    }
    
    // Generate maskable icons
    const maskableSizes = [192, 512];
    for (const size of maskableSizes) {
      const maskableSvg = path.join(ICONS_DIR, 'icon-maskable.svg');
      const svgSrc = fs.existsSync(maskableSvg) ? maskableSvg : SVG_SOURCE;
      const outputPath = path.join(ICONS_DIR, `icon-maskable-${size}x${size}.png`);
      await sharp(fs.readFileSync(svgSrc))
        .resize(size, size)
        .png()
        .toFile(outputPath);
      console.log(`  ✓ icon-maskable-${size}x${size}.png`);
    }
    
    // Apple touch icon
    await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toFile(path.join(ICONS_DIR, 'apple-touch-icon.png'));
    console.log('  ✓ apple-touch-icon.png');
    
    return true;
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      console.log('⚠️  Sharp not installed, trying system tools...\n');
      return false;
    }
    throw err;
  }
}

async function generateWithSystemTools() {
  const platform = detectPlatform();
  
  // Detect available tools
  const tools = {
    inkscape: checkCommand('inkscape'),
    rsvg: checkCommand('rsvg-convert'),
    magick: checkCommand('magick'),
    cairosvg: checkCommand('cairosvg')
  };
  
  console.log('Available tools:', tools);
  
  let generateFn;
  
  if (tools.inkscape) {
    console.log('✅ Using Inkscape\n');
    generateFn = generateWithInkscape;
  } else if (tools.rsvg) {
    console.log('✅ Using rsvg-convert\n');
    generateFn = generateWithRsvg;
  } else if (tools.magick) {
    console.log('✅ Using ImageMagick\n');
    generateFn = generateWithImageMagick;
  } else if (tools.cairosvg) {
    console.log('✅ Using CairoSVG\n');
    generateFn = generateWithCairoSvg;
  } else {
    console.error(`
❌ No SVG conversion tool found!

Please install one of the following:

  Windows:
    - npm install sharp (recommended)
    - choco install inkscape
    - choco install imagemagick

  macOS:
    - npm install sharp (recommended)
    - brew install inkscape
    - brew install librsvg
    - brew install imagemagick

  Linux:
    - npm install sharp (recommended)
    - sudo apt install inkscape
    - sudo apt install librsvg2-bin
    - sudo apt install imagemagick
    - pip install cairosvg

Then run this script again.
    `);
    process.exit(1);
  }
  
  // Generate icons
  for (const size of ICON_SIZES) {
    const outputPath = path.join(ICONS_DIR, `icon-${size}x${size}.png`);
    console.log(`  Generating icon-${size}x${size}.png...`);
    generateFn(SVG_SOURCE, outputPath, size);
  }
  
  // Generate maskable icons
  const maskableSvg = path.join(ICONS_DIR, 'icon-maskable.svg');
  const maskableSrc = fs.existsSync(maskableSvg) ? maskableSvg : SVG_SOURCE;
  
  for (const size of [192, 512]) {
    const outputPath = path.join(ICONS_DIR, `icon-maskable-${size}x${size}.png`);
    console.log(`  Generating icon-maskable-${size}x${size}.png...`);
    generateFn(maskableSrc, outputPath, size);
  }
}

async function main() {
  console.log('🎨 PWA Icon Generator\n');
  console.log('═'.repeat(40) + '\n');
  
  // Ensure icons directory exists
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }
  
  // Check if source SVG exists
  if (!fs.existsSync(SVG_SOURCE)) {
    console.error('❌ Source SVG not found:', SVG_SOURCE);
    console.log('\nPlease ensure icons/icon.svg exists.');
    process.exit(1);
  }
  
  // Try Sharp first, then system tools
  const sharpSuccess = await generateWithSharp();
  
  if (!sharpSuccess) {
    await generateWithSystemTools();
  }
  
  console.log('\n' + '═'.repeat(40));
  console.log('✅ Icon generation complete!');
  console.log(`📁 Output: ${ICONS_DIR}`);
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
