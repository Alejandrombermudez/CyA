// Genera los iconos de la PWA y la imagen de la bienvenida a partir de la foto.
// Uso: npm run icons
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = join(root, 'src', 'assets', 'foto.jpeg')
const ICONS_DIR = join(root, 'public', 'icons')
const ASSETS_DIR = join(root, 'src', 'assets')
const RES_DIR = join(root, 'android', 'app', 'src', 'main', 'res')

// Densidades de Android: el icono legacy y el foreground del adaptativo, que
// mide 108dp con solo los 72dp centrales garantizados (de ahi el 66%).
const DENSIDADES = [
  { nombre: 'mdpi', legacy: 48, foreground: 108 },
  { nombre: 'hdpi', legacy: 72, foreground: 162 },
  { nombre: 'xhdpi', legacy: 96, foreground: 216 },
  { nombre: 'xxhdpi', legacy: 144, foreground: 324 },
  { nombre: 'xxxhdpi', legacy: 192, foreground: 432 },
]

// Encuadre del icono: centro y tamano del recorte cuadrado, en fracciones de la
// foto original. Subir `cy` baja el recorte; subir `size` aleja la camara.
const FOCUS = { cx: 0.51, cy: 0.355, size: 0.8 }

// Fondo calido para el icono maskable y el apple-touch (no admiten transparencia).
const BACKDROP = { r: 26, g: 18, b: 16, alpha: 1 }

/** Recorte cuadrado centrado en FOCUS, siempre dentro de los limites de la foto. */
function squareCrop(width, height) {
  const side = Math.round(Math.min(width, height) * FOCUS.size)
  const left = Math.round(FOCUS.cx * width - side / 2)
  const top = Math.round(FOCUS.cy * height - side / 2)
  return {
    width: side,
    height: side,
    left: Math.max(0, Math.min(left, width - side)),
    top: Math.max(0, Math.min(top, height - side)),
  }
}

await mkdir(ICONS_DIR, { recursive: true })

const meta = await sharp(SOURCE).metadata()
console.log(`Foto original: ${meta.width}x${meta.height}`)

const crop = squareCrop(meta.width, meta.height)
console.log(`Recorte cuadrado: ${crop.width}px desde (${crop.left}, ${crop.top})`)

/** La foto recortada en cuadrado, lista para redimensionar. */
const square = () => sharp(SOURCE).extract(crop)

// Iconos normales: la foto llena todo el cuadrado.
for (const size of [192, 512]) {
  await square().resize(size, size).png().toFile(join(ICONS_DIR, `icon-${size}.png`))
}

// Iconos maskable: Android recorta hasta un 20% del borde, asi que la foto va
// al 80% del lienzo sobre el fondo calido para que nunca corte las caras.
for (const size of [192, 512]) {
  const inner = Math.round(size * 0.8)
  const offset = Math.round((size - inner) / 2)
  await sharp({
    create: { width: size, height: size, channels: 4, background: BACKDROP },
  })
    .composite([{ input: await square().resize(inner, inner).png().toBuffer(), top: offset, left: offset }])
    .png()
    .toFile(join(ICONS_DIR, `maskable-${size}.png`))
}

await square().resize(180, 180).flatten({ background: BACKDROP }).png()
  .toFile(join(ICONS_DIR, 'apple-touch-icon-180.png'))
await square().resize(32, 32).png().toFile(join(ICONS_DIR, 'favicon-32.png'))

// Version liviana de la foto para la pantalla de bienvenida (se muestra en circulo).
await square().resize(720, 720).webp({ quality: 82 }).toFile(join(ASSETS_DIR, 'foto-splash.webp'))

// Iconos de la app compañera de Android, con el mismo recorte.
for (const { nombre, legacy, foreground } of DENSIDADES) {
  const dir = join(RES_DIR, `mipmap-${nombre}`)
  await mkdir(dir, { recursive: true })

  const plano = await square().resize(legacy, legacy).png().toBuffer()
  await sharp(plano).toFile(join(dir, 'ic_launcher.png'))
  await sharp(plano).toFile(join(dir, 'ic_launcher_round.png'))

  const interior = Math.round(foreground * 0.66)
  const margen = Math.round((foreground - interior) / 2)
  await sharp({
    create: { width: foreground, height: foreground, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: await square().resize(interior, interior).png().toBuffer(), top: margen, left: margen }])
    .png()
    .toFile(join(dir, 'ic_launcher_foreground.png'))
}

console.log('Listo: iconos en public/icons, foto-splash.webp en src/assets y mipmaps en android/')
