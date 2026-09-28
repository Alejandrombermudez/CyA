import { useMemo, useState } from 'react'
import type { Entrenos, SerieHecha } from '../datos/rutina'
import { SEMANA, rutinaDe } from '../datos/rutina'

const DIAS_CORTOS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']
const mesLargo = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' })
const diaLargo = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })

/** "2026-09-28" en hora local, sin que UTC corra el día. */
function aISO(f: Date): string {
  const m = String(f.getMonth() + 1).padStart(2, '0')
  const d = String(f.getDate()).padStart(2, '0')
  return `${f.getFullYear()}-${m}-${d}`
}

const deISO = (iso: string) => {
  const [a, m, d] = iso.split('-').map(Number)
  return new Date(a, m - 1, d)
}

/** Lunes = 0, para que la grilla arranque en lunes. */
const columnaDe = (f: Date) => (f.getDay() + 6) % 7

/** Primer número del rango: "6-8" -> 6, "30-45 s" -> 30. */
const topeBajo = (reps: string) => Number.parseInt(reps, 10) || 0

type Estado = 'completo' | 'parcial' | 'pendiente' | 'descanso'

function estadoDe(iso: string, entrenos: Entrenos): Estado {
  const rutina = rutinaDe(deISO(iso))
  if (!rutina) return 'descanso'

  const dia = entrenos[iso]
  if (!dia) return 'pendiente'

  let hechas = 0
  let totales = 0
  for (const ej of rutina.ejercicios) {
    totales += ej.series
    hechas += (dia[ej.nombre] ?? []).filter(Boolean).length
  }
  if (hechas === 0) return 'pendiente'
  return hechas >= totales ? 'completo' : 'parcial'
}

/** Último peso registrado para ese ejercicio antes de la fecha dada. */
function ultimoPeso(entrenos: Entrenos, ejercicio: string, antesDe: string): number | null {
  const fechas = Object.keys(entrenos)
    .filter((f) => f < antesDe)
    .sort()
    .reverse()

  for (const f of fechas) {
    const ultima = entrenos[f]?.[ejercicio]?.filter(Boolean).at(-1)
    if (ultima) return ultima.peso
  }
  return null
}

function FilaSerie({
  indice,
  guardada,
  pesoSugerido,
  repsSugeridas,
  onMarcar,
}: {
  indice: number
  guardada: SerieHecha | null
  pesoSugerido: number
  repsSugeridas: number
  onMarcar: (valor: SerieHecha | null) => void
}) {
  const [peso, setPeso] = useState(guardada?.peso ?? pesoSugerido)
  const [reps, setReps] = useState(guardada?.reps ?? repsSugeridas)
  const hecha = guardada !== null

  function editar(nuevoPeso: number, nuevasReps: number) {
    setPeso(nuevoPeso)
    setReps(nuevasReps)
    // Si la serie ya estaba marcada, corregir los números la actualiza.
    if (hecha) onMarcar({ peso: nuevoPeso, reps: nuevasReps })
  }

  return (
    <div className={`serie${hecha ? ' is-hecha' : ''}`}>
      <button
        type="button"
        className="serie__check"
        onClick={() => onMarcar(hecha ? null : { peso, reps })}
        aria-pressed={hecha}
        aria-label={`Serie ${indice + 1}${hecha ? ', hecha' : ''}`}
      >
        {hecha ? '✓' : indice + 1}
      </button>

      <input
        className="serie__campo"
        inputMode="decimal"
        value={peso || ''}
        placeholder="0"
        onChange={(e) => editar(Number(e.target.value.replace(',', '.')) || 0, reps)}
        aria-label={`Peso de la serie ${indice + 1} en kilos`}
      />
      <span className="serie__unidad">kg</span>
      <span className="serie__por">×</span>
      <input
        className="serie__campo"
        inputMode="numeric"
        value={reps || ''}
        placeholder="0"
        onChange={(e) => editar(peso, Number(e.target.value.replace(/\D/g, '')) || 0)}
        aria-label={`Repeticiones de la serie ${indice + 1}`}
      />
      <span className="serie__unidad">reps</span>
    </div>
  )
}

export default function Entrenamiento({
  hoy,
  entrenos,
  onMarcarSerie,
}: {
  hoy: Date
  entrenos: Entrenos
  onMarcarSerie: (
    fecha: string,
    ejercicio: string,
    indice: number,
    valor: SerieHecha | null,
    totalSeries: number,
  ) => void
}) {
  const hoyISO = aISO(hoy)
  const [seleccionada, setSeleccionada] = useState(hoyISO)
  const [mesVisible, setMesVisible] = useState(() => new Date(hoy.getFullYear(), hoy.getMonth(), 1))
  const [abierto, setAbierto] = useState<string | null>(null)

  const rutina = rutinaDe(deISO(seleccionada))
  const registro = entrenos[seleccionada] ?? {}

  const celdas = useMemo(() => {
    const primero = new Date(mesVisible.getFullYear(), mesVisible.getMonth(), 1)
    const dias = new Date(mesVisible.getFullYear(), mesVisible.getMonth() + 1, 0).getDate()
    return [
      ...Array.from({ length: columnaDe(primero) }, () => null),
      ...Array.from(
        { length: dias },
        (_, i) => new Date(mesVisible.getFullYear(), mesVisible.getMonth(), i + 1),
      ),
    ]
  }, [mesVisible])

  /** Sesiones seguidas sin fallar, mirando hacia atrás desde hoy. */
  const racha = useMemo(() => {
    let cuenta = 0
    const cursor = new Date(hoy)
    for (let i = 0; i < 180; i++) {
      const iso = aISO(cursor)
      const estado = estadoDe(iso, entrenos)
      if (estado === 'completo' || estado === 'parcial') cuenta++
      // Hoy todavía se puede entrenar, así que no corta la racha.
      else if (estado === 'pendiente' && iso !== hoyISO) break
      cursor.setDate(cursor.getDate() - 1)
    }
    return cuenta
  }, [entrenos, hoy, hoyISO])

  const mover = (delta: number) =>
    setMesVisible((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1))

  return (
    <section className="pagina">
      <div className="resumen">
        <p className="resumen__etiqueta">Racha de entrenamientos</p>
        <p className="resumen__cifra">
          {racha} {racha === 1 ? 'sesión' : 'sesiones'}
        </p>
        <p className="resumen__pie">
          Lunes y jueves pierna · martes y viernes torso · miércoles y fin de semana, descanso
        </p>
      </div>

      <div className="calendario">
        <div className="calendario__barra">
          <button type="button" onClick={() => mover(-1)} aria-label="Mes anterior">
            ‹
          </button>
          <span>{mesLargo.format(mesVisible)}</span>
          <button type="button" onClick={() => mover(1)} aria-label="Mes siguiente">
            ›
          </button>
        </div>

        <div className="calendario__grilla">
          {DIAS_CORTOS.map((d) => (
            <span className="calendario__cabecera" key={d}>
              {d}
            </span>
          ))}

          {celdas.map((f, i) => {
            if (!f) return <span key={`hueco-${i}`} />
            const iso = aISO(f)
            const estado = estadoDe(iso, entrenos)
            const tipo = SEMANA[f.getDay()]
            const clases = [
              'dia',
              `dia--${estado}`,
              tipo?.startsWith('pierna') ? 'dia--pierna' : tipo ? 'dia--torso' : '',
              iso === seleccionada ? 'is-elegido' : '',
              iso === hoyISO ? 'is-hoy' : '',
            ]

            return (
              <button
                key={iso}
                type="button"
                className={clases.filter(Boolean).join(' ')}
                onClick={() => {
                  setSeleccionada(iso)
                  setAbierto(null)
                }}
                aria-label={`${diaLargo.format(f)}, ${estado}`}
                aria-current={iso === hoyISO ? 'date' : undefined}
              >
                {f.getDate()}
              </button>
            )
          })}
        </div>

        <div className="leyenda">
          <span>
            <i className="pastilla pastilla--pierna" /> Pierna
          </span>
          <span>
            <i className="pastilla pastilla--torso" /> Torso
          </span>
          <span>
            <i className="pastilla pastilla--hecho" /> Hecho
          </span>
        </div>
      </div>

      <h2 className="seccion">
        {diaLargo.format(deISO(seleccionada))}
        {rutina && <span>{rutina.nombre}</span>}
      </h2>

      {!rutina ? (
        <p className="vacio">
          Día de descanso. El músculo crece mientras descansás, no en el gimnasio: dormí bien y comé
          suficiente proteína.
        </p>
      ) : (
        <>
          <p className="foco">{rutina.foco}</p>
          <p className="aviso">
            Calentá 5 minutos de bici o caminadora y hacé 2 series suaves del primer ejercicio antes
            de la primera serie real.
          </p>

          {rutina.ejercicios.map((ej) => {
            const series = registro[ej.nombre] ?? []
            const hechas = series.filter(Boolean).length
            const previo = ultimoPeso(entrenos, ej.nombre, seleccionada)
            const estaAbierto = abierto === ej.nombre

            return (
              <div className={`ejercicio${hechas >= ej.series ? ' is-completo' : ''}`} key={ej.nombre}>
                <button
                  type="button"
                  className="ejercicio__cabecera"
                  onClick={() => setAbierto(estaAbierto ? null : ej.nombre)}
                  aria-expanded={estaAbierto}
                >
                  <span className="ejercicio__nombre">{ej.nombre}</span>
                  <span className="ejercicio__meta">
                    {ej.series} × {ej.reps} · RIR {ej.rir} · {ej.descanso}
                  </span>
                  <span className="ejercicio__progreso">
                    {hechas}/{ej.series}
                  </span>
                </button>

                {estaAbierto && (
                  <div className="ejercicio__cuerpo">
                    {ej.nota && <p className="ejercicio__nota">{ej.nota}</p>}
                    {previo !== null && (
                      <p className="ejercicio__nota">La última vez levantaste {previo} kg.</p>
                    )}
                    {Array.from({ length: ej.series }, (_, i) => (
                      <FilaSerie
                        key={i}
                        indice={i}
                        guardada={series[i] ?? null}
                        pesoSugerido={previo ?? 0}
                        repsSugeridas={topeBajo(ej.reps)}
                        onMarcar={(valor) => onMarcarSerie(seleccionada, ej.nombre, i, valor, ej.series)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          <p className="aviso aviso--suave">
            Cuando completes el tope del rango en todas las series con el RIR objetivo, subí el peso:
            2,5 kg en tren superior y 5 kg en tren inferior.
          </p>
        </>
      )}
    </section>
  )
}
