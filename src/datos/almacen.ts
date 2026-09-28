import { useCallback, useEffect, useState } from 'react'
import { claveMes, hoyISO } from '../dinero'
import type { Entrenos, SerieHecha } from './rutina'

export type Movimiento = { id: string; nombre: string; monto: number }

export type Gasto = {
  id: string
  monto: number
  descripcion: string
  /** 'a' o 'b', las dos personas de personas{} */
  quien: 'a' | 'b'
  fecha: string
}

export type Datos = {
  version: number
  personas: { a: string; b: string }
  ingresos: Movimiento[]
  fijos: Movimiento[]
  gastos: Gasto[]
  entrenos: Entrenos
}

const CLAVE = 'cya:datos'

/**
 * Arranca con los numeros reales que nos paso. Todo es editable desde la app,
 * asi que esto es solo el punto de partida.
 */
export const INICIAL: Datos = {
  version: 1,
  personas: { a: 'C', b: 'A' },
  ingresos: [{ id: 'sueldo', nombre: 'Sueldo', monto: 5_000_000 }],
  fijos: [
    { id: 'arriendo', nombre: 'Arriendo', monto: 1_450_000 },
    { id: 'administracion', nombre: 'Administración', monto: 287_000 },
    { id: 'moto', nombre: 'Crédito moto', monto: 700_000 },
  ],
  gastos: [],
  entrenos: {},
}

const nuevoId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`

function leer(): Datos {
  try {
    const crudo = localStorage.getItem(CLAVE)
    if (!crudo) return INICIAL
    const guardado = JSON.parse(crudo) as Partial<Datos>
    return {
      version: guardado.version ?? INICIAL.version,
      personas: { ...INICIAL.personas, ...guardado.personas },
      ingresos: guardado.ingresos ?? INICIAL.ingresos,
      fijos: guardado.fijos ?? INICIAL.fijos,
      gastos: guardado.gastos ?? [],
      entrenos: guardado.entrenos ?? {},
    }
  } catch {
    return INICIAL
  }
}

/**
 * Todo vive en localStorage. Para el volumen de dos personas (unos cientos de
 * registros al ano) sobra, y deja el respaldo como un JSON legible.
 */
export function useDatos() {
  const [datos, setDatos] = useState<Datos>(leer)

  useEffect(() => {
    localStorage.setItem(CLAVE, JSON.stringify(datos))
  }, [datos])

  const agregarGasto = useCallback((gasto: Omit<Gasto, 'id'>) => {
    setDatos((d) => ({ ...d, gastos: [{ ...gasto, id: nuevoId() }, ...d.gastos] }))
  }, [])

  const borrarGasto = useCallback((id: string) => {
    setDatos((d) => ({ ...d, gastos: d.gastos.filter((g) => g.id !== id) }))
  }, [])

  type ListaEditable = 'ingresos' | 'fijos'

  const agregarLinea = useCallback((lista: ListaEditable) => {
    setDatos((d) => ({ ...d, [lista]: [...d[lista], { id: nuevoId(), nombre: '', monto: 0 }] }))
  }, [])

  const cambiarLinea = useCallback((lista: ListaEditable, id: string, parcial: Partial<Movimiento>) => {
    setDatos((d) => ({
      ...d,
      [lista]: d[lista].map((m) => (m.id === id ? { ...m, ...parcial } : m)),
    }))
  }, [])

  const borrarLinea = useCallback((lista: ListaEditable, id: string) => {
    setDatos((d) => ({ ...d, [lista]: d[lista].filter((m) => m.id !== id) }))
  }, [])

  const cambiarPersonas = useCallback((parcial: Partial<Datos['personas']>) => {
    setDatos((d) => ({ ...d, personas: { ...d.personas, ...parcial } }))
  }, [])

  /** Marca (o desmarca con null) una serie de un ejercicio en una fecha. */
  const marcarSerie = useCallback(
    (fecha: string, ejercicio: string, indice: number, valor: SerieHecha | null, totalSeries: number) => {
      setDatos((d) => {
        const dia = { ...(d.entrenos[fecha] ?? {}) }
        const series = [...(dia[ejercicio] ?? Array<SerieHecha | null>(totalSeries).fill(null))]
        series[indice] = valor
        dia[ejercicio] = series
        return { ...d, entrenos: { ...d.entrenos, [fecha]: dia } }
      })
    },
    [],
  )

  const gastosDelMes = useCallback(
    (mes = claveMes(hoyISO())) => datos.gastos.filter((g) => claveMes(g.fecha) === mes),
    [datos.gastos],
  )

  return {
    datos,
    agregarGasto,
    borrarGasto,
    agregarLinea,
    cambiarLinea,
    borrarLinea,
    cambiarPersonas,
    marcarSerie,
    gastosDelMes,
  }
}
