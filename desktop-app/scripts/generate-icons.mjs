import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { PNG } from 'pngjs'
import pngToIco from 'png-to-ico'

const ROOT = path.resolve(import.meta.dirname, '..')
const SOURCE = path.resolve(ROOT, '../logo-1254x1254px-圆角279-6.png')
const OUT = path.join(ROOT, 'resources/icons')
const ICONSET = path.join(OUT, 'icon.iconset')

// 给源图添加内边距（macOS 标准图标内容约占画布 80%）
function addPadding(inputPath, outputPath, fraction = 0.1) {
  const img = PNG.sync.read(fs.readFileSync(inputPath))
  const padX = Math.round(img.width * fraction)
  const padY = Math.round(img.height * fraction)
  const newWidth = img.width + padX * 2
  const newHeight = img.height + padY * 2

  const out = new PNG({ width: newWidth, height: newHeight })
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const srcIdx = (img.width * y + x) << 2
      const dstIdx = (newWidth * (y + padY) + (x + padX)) << 2
      out.data[dstIdx] = img.data[srcIdx]
      out.data[dstIdx + 1] = img.data[srcIdx + 1]
      out.data[dstIdx + 2] = img.data[srcIdx + 2]
      out.data[dstIdx + 3] = img.data[srcIdx + 3]
    }
  }

  fs.writeFileSync(outputPath, PNG.sync.write(out))
}

// Step 1: Create output directory
fs.mkdirSync(OUT, { recursive: true })

// Step 2: Create padded source
const paddedSource = path.join(OUT, '_padded-source.png')
console.log('Adding padding to source image...')
addPadding(SOURCE, paddedSource, 0.1)

// Step 3: Generate app icon sizes from padded source
const sizes = [16, 32, 48, 64, 128, 256, 512, 1024]
console.log('Generating app icon sizes...')
for (const size of sizes) {
  execSync(`sips -z ${size} ${size} "${paddedSource}" --out "${OUT}/icon-${size}x${size}.png"`, {
    stdio: 'inherit',
  })
}

// Step 3b: Generate tray icon sizes from original source (no padding)
console.log('Generating tray icon sizes...')
execSync(`sips -z 16 16 "${SOURCE}" --out "${OUT}/tray-icon.png"`, { stdio: 'inherit' })
execSync(`sips -z 44 44 "${SOURCE}" --out "${OUT}/tray-icon-mac.png"`, { stdio: 'inherit' })
execSync(`sips -z 32 32 "${SOURCE}" --out "${OUT}/favicon.png"`, { stdio: 'inherit' })

// Step 4: Build .icns using iconutil
console.log('Building .icns...')
fs.mkdirSync(ICONSET, { recursive: true })
const iconsetMapping = {
  'icon_16x16.png': 'icon-16x16.png',
  'icon_16x16@2x.png': 'icon-32x32.png',
  'icon_32x32.png': 'icon-32x32.png',
  'icon_32x32@2x.png': 'icon-64x64.png',
  'icon_128x128.png': 'icon-128x128.png',
  'icon_128x128@2x.png': 'icon-256x256.png',
  'icon_256x256.png': 'icon-256x256.png',
  'icon_256x256@2x.png': 'icon-512x512.png',
  'icon_512x512.png': 'icon-512x512.png',
  'icon_512x512@2x.png': 'icon-1024x1024.png',
}
for (const [dest, src] of Object.entries(iconsetMapping)) {
  fs.copyFileSync(path.join(OUT, src), path.join(ICONSET, dest))
}
execSync(`iconutil -c icns "${ICONSET}" -o "${OUT}/icon.icns"`)
fs.rmSync(ICONSET, { recursive: true })

// Step 5: Build .ico
console.log('Building .ico...')
const icoBuf = await pngToIco(fs.readFileSync(path.join(OUT, 'icon-256x256.png')))
fs.writeFileSync(path.join(OUT, 'icon.ico'), icoBuf)

// Step 6: Copy final named files
console.log('Copying final files...')
fs.copyFileSync(path.join(OUT, 'icon-512x512.png'), path.join(OUT, 'icon.png'))

// Step 7: Clean up intermediate files
for (const size of sizes) {
  fs.unlinkSync(path.join(OUT, `icon-${size}x${size}.png`))
}
fs.unlinkSync(paddedSource)

console.log('\nDone! Generated files in resources/icons/:')
for (const file of fs.readdirSync(OUT)) {
  const stat = fs.statSync(path.join(OUT, file))
  console.log(`  ${file} (${(stat.size / 1024).toFixed(1)} KB)`)
}
