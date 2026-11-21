// Builds public/templates/membre-base.png from the designer's membre.png by
// erasing the "MEMBRE" word inside the blue banner, so the app can write the
// member's role there instead. Re-run after replacing membre.png:
//   node scripts/make-template-base.cjs
const sharp = require('sharp')
const path = require('path')

const SRC = path.join(__dirname, '../public/templates/membre.png')
const OUT = path.join(__dirname, '../public/templates/membre-base.png')

// Rectangle covering the word, strictly inside the banner's white border
// (2508px space). Must stay in sync with roleText in src/config/templates.ts.
const BOX = { x0: 1170, x1: 1970, y0: 1608, y1: 1740 }
// Columns averaged on each side to sample the clean banner gradient
const SAMPLE = 6

;(async () => {
  const { data, info } = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const W = info.width
  const px = (x, y, c) => data[(y * W + x) * 3 + c]

  const out = Buffer.from(data)
  for (let y = BOX.y0; y <= BOX.y1; y++) {
    // Mean colour just outside the box on the left and right of this row
    const left = [0, 0, 0]
    const right = [0, 0, 0]
    for (let k = 1; k <= SAMPLE; k++) {
      for (let c = 0; c < 3; c++) {
        left[c] += px(BOX.x0 - k, y, c) / SAMPLE
        right[c] += px(BOX.x1 + k, y, c) / SAMPLE
      }
    }
    // The banner gradient is smooth, so a horizontal blend rebuilds it
    for (let x = BOX.x0; x <= BOX.x1; x++) {
      const t = (x - BOX.x0) / (BOX.x1 - BOX.x0)
      for (let c = 0; c < 3; c++) {
        out[(y * W + x) * 3 + c] = Math.round(left[c] * (1 - t) + right[c] * t)
      }
    }
  }

  const info2 = await sharp(out, { raw: { width: W, height: info.height, channels: 3 } })
    .png({ compressionLevel: 9, adaptiveFiltering: true, palette: false })
    .toFile(OUT)
  console.log(`wrote ${path.relative(process.cwd(), OUT)} (${info2.size} bytes)`)
})()
