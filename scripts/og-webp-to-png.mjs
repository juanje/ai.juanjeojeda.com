import sharp from "sharp"
import { readdir, readFile, writeFile, unlink } from "fs/promises"
import { join } from "path"

const publicDir = join(process.cwd(), "public")

const files = await readdir(publicDir)
const webpFiles = files.filter((f) => f.endsWith("-og-image.webp"))

if (webpFiles.length === 0) {
  console.log("No OG WebP images found — skipping conversion.")
  process.exit(0)
}

for (const webp of webpFiles) {
  const png = webp.replace(".webp", ".png")
  await sharp(join(publicDir, webp)).png({ quality: 90 }).toFile(join(publicDir, png))
  await unlink(join(publicDir, webp))
  console.log(`  ${webp} → ${png}`)
}

const htmlFiles = files.filter((f) => f.endsWith(".html"))
for (const html of htmlFiles) {
  const path = join(publicDir, html)
  let content = await readFile(path, "utf-8")
  const updated = content.replaceAll("-og-image.webp", "-og-image.png").replaceAll("image/webp", "image/png")
  if (updated !== content) {
    await writeFile(path, updated)
    console.log(`  Updated meta tags in ${html}`)
  }
}

console.log(`Converted ${webpFiles.length} OG images from WebP to PNG.`)
