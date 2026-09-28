import type { Ejercicio, Entrenos, SerieHecha } from './rutina'

export type SesionPrevia = {
  fecha: string
  series: SerieHecha[]
  /** El peso con el que se hizo el grueso de las series. */
  peso: number
}

/** Cuántas sesiones seguidas con el mismo peso cuentan como estancarse. */
const SESIONES_ESTANCADO = 3

/** O, si entrenás ese ejercicio una vez por semana, dos semanas. */
const DIAS_ESTANCADO = 14

/** Los dos números del rango: "6-8" -> {min: 6, max: 8}. */
export function rango(reps: string) {
  const n = reps.match(/\d+/g)?.map(Number) ?? []
  return { min: n[0] ?? 0, max: n[1] ?? n[0] ?? 0 }
}

/** El peso que más se repite en la sesión; ante empate, el mayor. */
function pesoPrincipal(series: SerieHecha[]): number {
  const cuenta = new Map<number, number>()
  for (const s of series) cuenta.set(s.peso, (cuenta.get(s.peso) ?? 0) + 1)

  let elegido = 0
  let veces = 0
  for (const [peso, n] of cuenta) {
    if (n > veces || (n === veces && peso > elegido)) {
      elegido = peso
      veces = n
    }
  }
  return elegido
}

/** Sesiones anteriores de ese ejercicio, de la más reciente a la más vieja. */
export function historial(entrenos: Entrenos, ejercicio: string, antesDe: string): SesionPrevia[] {
  return Object.keys(entrenos)
    .filter((f) => f < antesDe)
    .sort()
    .reverse()
    .map((fecha) => {
      const series = (entrenos[fecha]?.[ejercicio] ?? []).filter(Boolean) as SerieHecha[]
      return { fecha, series, peso: pesoPrincipal(series) }
    })
    .filter((s) => s.series.length > 0)
}

export type Sugerencia = {
  peso: number
  texto: string
  tipo: 'subir' | 'mantener' | 'bajar'
}

const dias = (desde: string, hasta: string) =>
  Math.round((Date.parse(hasta) - Date.parse(desde)) / 86_400_000)

/**
 * Doble progresión: primero se suben repeticiones dentro del rango y, cuando se
 * llega al tope en todas las series, se sube el peso. Si el peso se queda
 * quieto demasiado tiempo, se fuerza el salto igual.
 */
export function sugerir(ej: Ejercicio, previas: SesionPrevia[], hoy: string): Sugerencia | null {
  if (ej.incremento === 0 || previas.length === 0) return null

  const ultima = previas[0]
  const { min, max } = rango(ej.reps)

  const completo = ultima.series.length >= ej.series
  if (completo && ultima.series.every((s) => s.reps >= max)) {
    return {
      peso: ultima.peso + ej.incremento,
      tipo: 'subir',
      texto: `Cerraste las ${ej.series} series en ${max} repeticiones. Subí a ${
        ultima.peso + ej.incremento
      } kg y volvé a ${min}.`,
    }
  }

  let seguidas = 0
  for (const s of previas) {
    if (s.peso !== ultima.peso) break
    seguidas++
  }
  const primera = previas[seguidas - 1]

  if (seguidas >= SESIONES_ESTANCADO || dias(primera.fecha, hoy) >= DIAS_ESTANCADO) {
    return {
      peso: ultima.peso + ej.incremento,
      tipo: 'subir',
      texto: `Llevás ${seguidas} ${
        seguidas === 1 ? 'sesión' : 'sesiones'
      } con ${ultima.peso} kg. Subí el peso aunque bajen las repeticiones.`,
    }
  }

  const flojas = ultima.series.filter((s) => s.reps < min).length
  if (flojas > ultima.series.length / 2) {
    return {
      peso: Math.max(0, ultima.peso - ej.incremento),
      tipo: 'bajar',
      texto: `La última vez no llegaste a ${min} repeticiones. Bajá el peso y hacelo limpio.`,
    }
  }

  return {
    peso: ultima.peso,
    tipo: 'mantener',
    texto: `Mismo peso, apuntando a ${max} repeticiones en las ${ej.series} series.`,
  }
}
