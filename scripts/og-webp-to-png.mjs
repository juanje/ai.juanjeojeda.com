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

const AUTHOR = "Juanje Ojeda"

const htmlFiles = files.filter((f) => f.endsWith(".html"))
for (const html of htmlFiles) {
  const filePath = join(publicDir, html)
  let content = await readFile(filePath, "utf-8")

  content = content.replaceAll("-og-image.webp", "-og-image.png").replaceAll("image/webp", "image/png")

  const isIndex = html === "index.html"
  if (!isIndex) {
    content = content.replace(
      '<meta property="og:type" content="website"/>',
      '<meta property="og:type" content="article"/>',
    )
    content = content.replace(
      '<meta name="description"',
      `<meta property="article:author" content="${AUTHOR}"/><meta name="author" content="${AUTHOR}"/><meta name="description"`,
    )
  }

  await writeFile(filePath, content)
  console.log(`  Patched ${html}${isIndex ? "" : " (article + author)"}`)
}

console.log(`Done. Converted ${webpFiles.length} OG images, patched ${htmlFiles.length} HTML files.`)
