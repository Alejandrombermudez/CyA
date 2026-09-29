import type { Ejercicio, Entrenos, SerieHecha, Variante } from './rutina'

export type SesionPrevia = {
  fecha: string
  series: SerieHecha[]
  /** El peso con el que se hizo el grueso de las series. En los de tiempo, 0. */
  peso: number
}

/** Cuántas sesiones seguidas con el mismo peso cuentan como estancarse. */
const SESIONES_ESTANCADO = 3

/** O, si entrenás ese ejercicio una vez por semana, dos semanas. */
const DIAS_ESTANCADO = 14

/** Cuántos segundos sumar cuando un isométrico ya llega al tope. */
const SALTO_SEGUNDOS = 10

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

/** Sesiones anteriores de esa variante, de la más reciente a la más vieja. */
export function historial(entrenos: Entrenos, varianteId: string, antesDe: string): SesionPrevia[] {
  return Object.keys(entrenos)
    .filter((f) => f < antesDe)
    .sort()
    .reverse()
    .map((fecha) => {
      const series = (entrenos[fecha]?.[varianteId] ?? []).filter(Boolean) as SerieHecha[]
      return { fecha, series, peso: pesoPrincipal(series) }
    })
    .filter((s) => s.series.length > 0)
}

export type Sugerencia = {
  /** Kilos a usar, o lastre si es a peso corporal. null en los de tiempo. */
  peso: number | null
  /** Repeticiones o segundos con los que prellenar. null = usar el rango. */
  reps: number | null
  texto: string
  tipo: 'subir' | 'mantener' | 'bajar'
}

const dias = (desde: string, hasta: string) =>
  Math.round((Date.parse(hasta) - Date.parse(desde)) / 86_400_000)

/** Progresión de un isométrico: no hay peso, se aguanta más tiempo. */
function sugerirTiempo(ej: Ejercicio, previas: SesionPrevia[]): Sugerencia {
  const ultima = previas[0]
  const { max } = rango(ej.reps)
  const mejor = Math.max(...ultima.series.map((s) => s.reps))
  const completo = ultima.series.length >= ej.series

  if (completo && ultima.series.every((s) => s.reps >= max)) {
    return {
      peso: null,
      reps: mejor + SALTO_SEGUNDOS,
      tipo: 'subir',
      texto: `Aguantaste ${max} s en las ${ej.series} series. Probá ${
        mejor + SALTO_SEGUNDOS
      } s o pasá a una variante más difícil.`,
    }
  }

  return {
    peso: null,
    reps: max,
    tipo: 'mantener',
    texto: `La última vez llegaste a ${mejor} s. Apuntá a ${max} s en las ${ej.series} series.`,
  }
}

/**
 * Doble progresión: primero se suben repeticiones dentro del rango y, cuando se
 * llega al tope en todas las series, se sube el peso. Si el peso se queda
 * quieto demasiado tiempo, se fuerza el salto igual.
 */
export function sugerir(
  ej: Ejercicio,
  variante: Variante,
  previas: SesionPrevia[],
  hoy: string,
): Sugerencia | null {
  if (previas.length === 0) return null
  if (variante.medida === 'tiempo') return sugerirTiempo(ej, previas)
  if (variante.incremento === 0) return null

  const ultima = previas[0]
  const { min, max } = rango(ej.reps)
  const lastre = variante.medida === 'corporal'
  const subido = ultima.peso + variante.incremento

  const nombrar = (kg: number) => (lastre ? `${kg} kg de lastre` : `${kg} kg`)

  if (ultima.series.length >= ej.series && ultima.series.every((s) => s.reps >= max)) {
    return {
      peso: subido,
      reps: null,
      tipo: 'subir',
      texto: `Cerraste las ${ej.series} series en ${max} repeticiones. ${
        lastre ? 'Colgate' : 'Subí a'
      } ${nombrar(subido)} y volvé a ${min}.`,
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
      peso: subido,
      reps: null,
      tipo: 'subir',
      texto: `Llevás ${seguidas} ${seguidas === 1 ? 'sesión' : 'sesiones'} con ${nombrar(
        ultima.peso,
      )}. Subí aunque bajen las repeticiones.`,
    }
  }

  const flojas = ultima.series.filter((s) => s.reps < min).length
  if (flojas > ultima.series.length / 2) {
    return {
      peso: Math.max(0, ultima.peso - variante.incremento),
      reps: null,
      tipo: 'bajar',
      texto: `La última vez no llegaste a ${min} repeticiones. Bajá el peso y hacelo limpio.`,
    }
  }

  return {
    peso: ultima.peso,
    reps: null,
    tipo: 'mantener',
    texto: `${lastre ? 'Mismo lastre' : 'Mismo peso'}, apuntando a ${max} repeticiones en las ${
      ej.series
    } series.`,
  }
}
