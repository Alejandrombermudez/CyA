import { darken, esOscuro, lighten, mixHex } from './color'

export type Periodo = 'dia' | 'tarde' | 'noche'
export type Modo = 'auto' | Periodo | 'custom'

export type Paleta = {
  bg: string
  bgDeep: string
  surface: string
  border: string
  text: string
  textSoft: string
  accent: string
  accentSoft: string
  /** Manchas de color del fondo animado. */
  glow1: string
  glow2: string
  scheme: 'light' | 'dark'
}

/** Franjas horarias. Coinciden con el saludo: días / tardes / noches. */
export function periodoDeHora(hora: number): Periodo {
  if (hora >= 6 && hora < 12) return 'dia'
  if (hora < 19) return 'tarde'
  return 'noche'
}

export const SALUDOS: Record<Periodo, string> = {
  dia: 'Buenos días',
  tarde: 'Buenas tardes',
  noche: 'Buenas noches',
}

export const NOMBRES: Record<Periodo, string> = {
  dia: 'Día',
  tarde: 'Tarde',
  noche: 'Noche',
}

/** Mañana: blanco y gris, luz limpia. */
const DIA: Paleta = {
  bg: '#f6f7f9',
  bgDeep: '#e6eaee',
  surface: '#ffffff',
  border: '#dee3e9',
  text: '#1f242a',
  textSoft: '#6d7883',
  accent: '#5a7183',
  accentSoft: '#a8bcc9',
  glow1: '#c7d6e2',
  glow2: '#eceff2',
  scheme: 'light',
}

/** Tarde: la madera del techo y el verde de la camiseta. */
const TARDE: Paleta = {
  bg: '#efe4d6',
  bgDeep: '#dccbb4',
  surface: '#fbf5ed',
  border: '#dcc9b2',
  text: '#33261b',
  textSoft: '#7c6857',
  accent: '#8c5a34',
  accentSoft: '#c9a077',
  glow1: '#c98a52',
  glow2: '#93a57c',
  scheme: 'light',
}

/** Noche: negro con un rescoldo tibio. */
const NOCHE: Paleta = {
  bg: '#0d0c0e',
  bgDeep: '#050506',
  surface: '#191719',
  border: '#2c292d',
  text: '#f2eeee',
  textSoft: '#9a9298',
  accent: '#dc9155',
  accentSoft: '#f0bd8c',
  glow1: '#7a4a2a',
  glow2: '#2f3550',
  scheme: 'dark',
}

export const PRESETS: Record<Periodo, Paleta> = { dia: DIA, tarde: TARDE, noche: NOCHE }

/** Construye una paleta completa a partir de dos colores elegidos a mano. */
export function paletaPersonalizada(base: string, accent: string): Paleta {
  const oscuro = esOscuro(base)
  const text = oscuro ? mixHex('#ffffff', base, 0.06) : mixHex('#14100e', base, 0.06)

  return {
    bg: base,
    bgDeep: darken(base, oscuro ? 0.45 : 0.12),
    surface: oscuro ? lighten(base, 0.07) : mixHex(base, '#ffffff', 0.62),
    border: mixHex(base, text, 0.16),
    text,
    textSoft: mixHex(text, base, 0.42),
    accent,
    accentSoft: oscuro ? lighten(accent, 0.24) : lighten(accent, 0.32),
    glow1: accent,
    glow2: oscuro ? lighten(base, 0.22) : darken(base, 0.18),
    scheme: oscuro ? 'dark' : 'light',
  }
}
