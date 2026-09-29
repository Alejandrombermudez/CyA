import type { Datos } from './almacen'

/** Envoltorio del archivo, para poder reconocerlo al importar. */
export type Respaldo = {
  app: 'CyA'
  formato: number
  exportado: string
  datos: Datos
}

export type Resumen = {
  gastos: number
  ingresos: number
  fijos: number
  diasEntrenados: number
  seriesRegistradas: number
}

const FORMATO = 1

export function resumir(datos: Datos): Resumen {
  const dias = Object.keys(datos.entrenos ?? {})
  let series = 0
  for (const dia of dias) {
    for (const lista of Object.values(datos.entrenos[dia] ?? {})) {
      series += lista.filter(Boolean).length
    }
  }
  return {
    gastos: datos.gastos?.length ?? 0,
    ingresos: datos.ingresos?.length ?? 0,
    fijos: datos.fijos?.length ?? 0,
    diasEntrenados: dias.filter((d) => Object.keys(datos.entrenos[d] ?? {}).length > 0).length,
    seriesRegistradas: series,
  }
}

export function armar(datos: Datos): string {
  const respaldo: Respaldo = {
    app: 'CyA',
    formato: FORMATO,
    exportado: new Date().toISOString(),
    datos,
  }
  return JSON.stringify(respaldo, null, 2)
}

export function nombreArchivo(fecha = new Date()): string {
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `cya-respaldo-${fecha.getFullYear()}-${m}-${d}.json`
}

export type Lectura =
  | { ok: true; datos: Datos; resumen: Resumen }
  | { ok: false; error: string }

/** Acepta el archivo con envoltorio o unos datos sueltos, por si acaso. */
export function leerRespaldo(texto: string): Lectura {
  let crudo: unknown
  try {
    crudo = JSON.parse(texto)
  } catch {
    return { ok: false, error: 'El archivo no es un JSON válido.' }
  }

  if (typeof crudo !== 'object' || crudo === null) {
    return { ok: false, error: 'El archivo está vacío o no tiene el formato esperado.' }
  }

  const envoltorio = crudo as Partial<Respaldo>
  const posibles = (envoltorio.app === 'CyA' ? envoltorio.datos : crudo) as Partial<Datos> | undefined

  if (!posibles || typeof posibles !== 'object') {
    return { ok: false, error: 'No encontré los datos dentro del archivo.' }
  }
  if (!Array.isArray(posibles.gastos) && !posibles.entrenos && !Array.isArray(posibles.ingresos)) {
    return { ok: false, error: 'Esto no parece un respaldo de CyA.' }
  }

  const datos: Datos = {
    version: posibles.version ?? 1,
    personas: { a: 'C', b: 'A', ...posibles.personas },
    ingresos: posibles.ingresos ?? [],
    fijos: posibles.fijos ?? [],
    gastos: posibles.gastos ?? [],
    entrenos: posibles.entrenos ?? {},
  }

  return { ok: true, datos, resumen: resumir(datos) }
}
