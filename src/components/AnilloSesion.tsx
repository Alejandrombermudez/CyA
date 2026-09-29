import { useEffect, useRef, useState } from 'react'

export type Progreso = { nombre: string; hechas: number; total: number }

const RADIO = 78
const CIRCUNFERENCIA = 2 * Math.PI * RADIO
/** Separación entre segmentos, medida sobre la circunferencia. */
const HUECO = 7

const reloj = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

/** "3 min" -> 180, "90 s" -> 90, "2.5 min" -> 150. */
export function segundosDescanso(texto: string): number {
  const n = Number.parseFloat(texto.replace(',', '.'))
  if (Number.isNaN(n)) return 90
  return /min/i.test(texto) ? Math.round(n * 60) : Math.round(n)
}

export default function AnilloSesion({
  progresos,
  indiceActual,
  etiqueta,
  serieTexto,
  descanso,
  onCompletar,
}: {
  progresos: Progreso[]
  /** null cuando ya no queda nada por hacer. */
  indiceActual: number | null
  etiqueta: string
  serieTexto: string
  descanso: string
  onCompletar: () => void
}) {
  const [restante, setRestante] = useState<number | null>(null)
  const [sonando, setSonando] = useState(false)
  const tic = useRef<ReturnType<typeof setInterval>>(undefined)

  useEffect(() => () => clearInterval(tic.current), [])

  function arrancarDescanso(segundos: number) {
    clearInterval(tic.current)
    setSonando(false)
    setRestante(segundos)
    tic.current = setInterval(() => {
      setRestante((s) => {
        if (s === null) return null
        if (s <= 1) {
          clearInterval(tic.current)
          setSonando(true)
          navigator.vibrate?.([120, 80, 120])
          return 0
        }
        return s - 1
      })
    }, 1000)
  }

  function alTocar() {
    // Durante el descanso, el botón lo salta en vez de registrar otra serie.
    if (restante !== null) {
      clearInterval(tic.current)
      setRestante(null)
      setSonando(false)
      return
    }
    if (indiceActual === null) return
    onCompletar()
    arrancarDescanso(segundosDescanso(descanso))
  }

  const total = progresos.length
  const paso = CIRCUNFERENCIA / Math.max(1, total)
  const largo = Math.max(2, paso - HUECO)
  const terminado = indiceActual === null

  return (
    <div className={`anillo${sonando ? ' is-sonando' : ''}`}>
      <svg viewBox="0 0 200 200" className="anillo__svg" aria-hidden="true">
        <g transform="rotate(-90 100 100)">
          {progresos.map((p, i) => {
            const avance = p.total > 0 ? Math.min(1, p.hechas / p.total) : 0
            const desfase = -(i * paso)
            return (
              <g key={p.nombre + i}>
                <circle
                  className="anillo__pista"
                  cx="100"
                  cy="100"
                  r={RADIO}
                  strokeDasharray={`${largo} ${CIRCUNFERENCIA - largo}`}
                  strokeDashoffset={desfase}
                />
                {avance > 0 && (
                  <circle
                    className="anillo__hecho"
                    cx="100"
                    cy="100"
                    r={RADIO}
                    strokeDasharray={`${largo * avance} ${CIRCUNFERENCIA - largo * avance}`}
                    strokeDashoffset={desfase}
                  />
                )}
                {i === indiceActual && (
                  <circle
                    className="anillo__actual"
                    cx="100"
                    cy="100"
                    r={RADIO}
                    strokeDasharray={`${largo} ${CIRCUNFERENCIA - largo}`}
                    strokeDashoffset={desfase}
                  />
                )}
              </g>
            )
          })}
        </g>
      </svg>

      <button
        type="button"
        className="anillo__centro"
        onClick={alTocar}
        disabled={terminado && restante === null}
        aria-label={
          restante !== null
            ? `Descanso, quedan ${reloj(restante)}. Tocá para saltarlo.`
            : terminado
              ? 'Sesión completa'
              : `${etiqueta}, ${serieTexto}. Tocá cuando termines la serie.`
        }
      >
        {restante !== null ? (
          <>
            <span className="anillo__etiqueta">Descanso</span>
            <span className="anillo__grande">{reloj(restante)}</span>
            <span className="anillo__pie">{sonando ? 'Listo, seguí' : 'Tocá para saltar'}</span>
          </>
        ) : terminado ? (
          <>
            <span className="anillo__grande">✓</span>
            <span className="anillo__pie">Sesión completa</span>
          </>
        ) : (
          <>
            <span className="anillo__etiqueta">{etiqueta}</span>
            <span className="anillo__grande">{serieTexto}</span>
            <span className="anillo__pie">Tocá al terminar</span>
          </>
        )}
      </button>
    </div>
  )
}
