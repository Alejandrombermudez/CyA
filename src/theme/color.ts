export type RGB = { r: number; g: number; b: number }

const byte = (n: number) => Math.max(0, Math.min(255, Math.round(n)))

export function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  }
}

export function rgbToHex({ r, g, b }: RGB): string {
  return '#' + [r, g, b].map((v) => byte(v).toString(16).padStart(2, '0')).join('')
}

/** Triplete "r g b" para usar con rgb(var(--x) / 40%) en CSS. */
export function rgbTriplet(hex: string): string {
  const { r, g, b } = hexToRgb(hex)
  return `${byte(r)} ${byte(g)} ${byte(b)}`
}

export function mix(a: RGB, b: RGB, t: number): RGB {
  return { r: a.r + (b.r - a.r) * t, g: a.g + (b.g - a.g) * t, b: a.b + (b.b - a.b) * t }
}

export function mixHex(a: string, b: string, t: number): string {
  return rgbToHex(mix(hexToRgb(a), hexToRgb(b), t))
}

export const lighten = (hex: string, t: number) => mixHex(hex, '#ffffff', t)
export const darken = (hex: string, t: number) => mixHex(hex, '#000000', t)

/** Luminancia relativa sRGB (0 = negro, 1 = blanco). */
export function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex)
  const channel = (v: number) => {
    const s = v / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

export const esOscuro = (hex: string) => luminance(hex) < 0.35
