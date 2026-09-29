import { useMemo, useState } from 'react'
import type { Ejercicio, Entrenos, Medida, SerieHecha, Variante } from '../datos/rutina'
import { SEMANA, rutinaDe } from '../datos/rutina'
import { historial, sugerir, type SesionPrevia } from '../datos/progresion'

const DIAS_CORTOS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']
const mesLargo = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' })
const diaLargo = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
const diaCorto = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'short' })

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

const conSeries = (entrenos: Entrenos, fecha: string, id: string) =>
  (entrenos[fecha]?.[id] ?? []).some(Boolean)

/**
 * Con qué variante se hizo (o se va a hacer) un ejercicio ese día: lo que eligió,
 * lo que ya registró, lo último que usó, o la preferida.
 */
function varianteElegida(
  ej: Ejercicio,
  fecha: string,
  entrenos: Entrenos,
  elecciones: Record<string, string>,
): Variante {
  const explicita = ej.variantes.find((v) => v.id === elecciones[`${fecha}|${ej.id}`])
  if (explicita) return explicita

  const registrada = ej.variantes.find((v) => conSeries(entrenos, fecha, v.id))
  if (registrada) return registrada

  const anteriores = Object.keys(entrenos)
    .filter((f) => f < fecha)
    .sort()
    .reverse()
  for (const f of anteriores) {
    const usada = ej.variantes.find((v) => conSeries(entrenos, f, v.id))
    if (usada) return usada
  }

  return ej.variantes[0]
}

type Estado = 'completo' | 'parcial' | 'pendiente' | 'descanso'

function estadoDe(iso: string, entrenos: Entrenos, elecciones: Record<string, string>): Estado {
  const rutina = rutinaDe(deISO(iso))
  if (!rutina) return 'descanso'
  if (!entrenos[iso]) return 'pendiente'

  let hechas = 0
  let totales = 0
  for (const ej of rutina.ejercicios) {
    const variante = varianteElegida(ej, iso, entrenos, elecciones)
    totales += ej.series
    hechas += (entrenos[iso][variante.id] ?? []).filter(Boolean).length
  }
  if (hechas === 0) return 'pendiente'
  return hechas >= totales ? 'completo' : 'parcial'
}

/** Cómo se lee una sesión anterior según cómo se mide el ejercicio. */
function resumirAnterior(previa: SesionPrevia, medida: Medida) {
  const numeros = previa.series.map((s) => s.reps).join(' · ')
  if (medida === 'tiempo') return { carga: null, detalle: `${numeros} s` }
  if (medida === 'corporal') {
    return {
      carga: previa.peso > 0 ? `+${previa.peso} kg` : 'peso corporal',
      detalle: `${numeros} reps`,
    }
  }
  return { carga: `${previa.peso} kg`, detalle: `${numeros} reps` }
}

function FilaSerie({
  indice,
  medida,
  guardada,
  pesoSugerido,
  repsSugeridas,
  onMarcar,
}: {
  indice: number
  medida: Medida
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

  const campoPeso = (etiqueta: string) => (
    <>
      <input
        className="serie__campo"
        inputMode="decimal"
        value={peso || ''}
        placeholder="0"
        onChange={(e) => editar(Number(e.target.value.replace(',', '.')) || 0, reps)}
        aria-label={`${etiqueta} de la serie ${indice + 1}`}
      />
      <span className="serie__unidad">kg</span>
    </>
  )

  const campoReps = (unidad: string, etiqueta: string) => (
    <>
      <input
        className="serie__campo"
        inputMode="numeric"
        value={reps || ''}
        placeholder="0"
        onChange={(e) => editar(peso, Number(e.target.value.replace(/\D/g, '')) || 0)}
        aria-label={`${etiqueta} de la serie ${indice + 1}`}
      />
      <span className="serie__unidad">{unidad}</span>
    </>
  )

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

      {medida === 'peso' && (
        <>
          {campoPeso('Peso')}
          <span className="serie__por">×</span>
          {campoReps('reps', 'Repeticiones')}
        </>
      )}

      {medida === 'corporal' && (
        <>
          {campoReps('reps', 'Repeticiones')}
          <span className="serie__por">+</span>
          {campoPeso('Lastre')}
        </>
      )}

      {medida === 'tiempo' && campoReps('segundos', 'Segundos')}
    </div>
  )
}

export default function Entrenamiento({
  hoy,
  entrenos,
  elecciones,
  onMarcarSerie,
  onElegirVariante,
}: {
  hoy: Date
  entrenos: Entrenos
  elecciones: Record<string, string>
  onMarcarSerie: (
    fecha: string,
    variante: string,
    indice: number,
    valor: SerieHecha | null,
    totalSeries: number,
  ) => void
  onElegirVariante: (fecha: string, ejercicioId: string, varianteId: string) => void
}) {
  const hoyISO = aISO(hoy)
  const [seleccionada, setSeleccionada] = useState(hoyISO)
  const [mesVisible, setMesVisible] = useState(() => new Date(hoy.getFullYear(), hoy.getMonth(), 1))
  const [abierto, setAbierto] = useState<string | null>(null)
  const [cambiando, setCambiando] = useState<string | null>(null)

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
      const estado = estadoDe(iso, entrenos, elecciones)
      if (estado === 'completo' || estado === 'parcial') cuenta++
      // Hoy todavía se puede entrenar, así que no corta la racha.
      else if (estado === 'pendiente' && iso !== hoyISO) break
      cursor.setDate(cursor.getDate() - 1)
    }
    return cuenta
  }, [entrenos, elecciones, hoy, hoyISO])

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
            const estado = estadoDe(iso, entrenos, elecciones)
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
                  setCambiando(null)
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
            const variante = varianteElegida(ej, seleccionada, entrenos, elecciones)
            const series = registro[variante.id] ?? []
            const hechas = series.filter(Boolean).length
            const previas = historial(entrenos, variante.id, seleccionada)
            const anterior = previas[0]
            const sugerencia = sugerir(ej, variante, previas, seleccionada)
            const estaAbierto = abierto === ej.id
            const eligiendo = cambiando === ej.id

            return (
              <div className={`ejercicio${hechas >= ej.series ? ' is-completo' : ''}`} key={ej.id}>
                <button
                  type="button"
                  className="ejercicio__cabecera"
                  onClick={() => {
                    setAbierto(estaAbierto ? null : ej.id)
                    setCambiando(null)
                  }}
                  aria-expanded={estaAbierto}
                >
                  <span className="ejercicio__nombre">{variante.nombre}</span>
                  <span className="ejercicio__meta">
                    {ej.series} × {ej.reps}
                    {ej.rir !== '—' && ` · RIR ${ej.rir}`} · {ej.descanso}
                  </span>
                  <span className="ejercicio__progreso">
                    {hechas}/{ej.series}
                  </span>
                </button>

                {estaAbierto && (
                  <div className="ejercicio__cuerpo">
                    <div className="patron">
                      <span>{ej.patron}</span>
                      <button type="button" onClick={() => setCambiando(eligiendo ? null : ej.id)}>
                        {eligiendo ? 'Cerrar' : 'Cambiar ejercicio'}
                      </button>
                    </div>

                    {eligiendo && (
                      <div className="variantes">
                        {ej.variantes.map((alt) => {
                          const suyas = historial(entrenos, alt.id, seleccionada)[0]
                          return (
                            <button
                              key={alt.id}
                              type="button"
                              className={`variante${alt.id === variante.id ? ' is-activa' : ''}`}
                              onClick={() => {
                                onElegirVariante(seleccionada, ej.id, alt.id)
                                setCambiando(null)
                              }}
                            >
                              <span className="variante__nombre">{alt.nombre}</span>
                              <span className="variante__dato">
                                {suyas
                                  ? resumirAnterior(suyas, alt.medida).carga ??
                                    `${Math.max(...suyas.series.map((s) => s.reps))} s`
                                  : 'sin historial'}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {variante.nota && <p className="ejercicio__nota">{variante.nota}</p>}

                    {anterior ? (
                      <p className="anterior">
                        <span className="anterior__fecha">{diaCorto.format(deISO(anterior.fecha))}</span>
                        {resumirAnterior(anterior, variante.medida).carga && (
                          <span className="anterior__peso">
                            {resumirAnterior(anterior, variante.medida).carga}
                          </span>
                        )}
                        <span className="anterior__reps">
                          {resumirAnterior(anterior, variante.medida).detalle}
                        </span>
                      </p>
                    ) : (
                      <p className="ejercicio__nota">
                        Primera vez con esta variante. Lo que registres queda guardado aparte de las
                        demás, porque los pesos no son comparables entre ellas.
                      </p>
                    )}

                    {sugerencia && (
                      <p className={`sugerencia sugerencia--${sugerencia.tipo}`}>
                        <strong>
                          Hoy:{' '}
                          {sugerencia.peso !== null
                            ? `${sugerencia.peso} kg`
                            : `${sugerencia.reps} s`}
                        </strong>
                        <span>{sugerencia.texto}</span>
                      </p>
                    )}

                    {Array.from({ length: ej.series }, (_, i) => (
                      <FilaSerie
                        key={`${variante.id}-${i}`}
                        indice={i}
                        medida={variante.medida}
                        guardada={series[i] ?? null}
                        pesoSugerido={sugerencia?.peso ?? 0}
                        repsSugeridas={sugerencia?.reps ?? topeBajo(ej.reps)}
                        onMarcar={(valor) =>
                          onMarcarSerie(seleccionada, variante.id, i, valor, ej.series)
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          <p className="aviso aviso--suave">
            El peso lo sugiere la app mirando tus sesiones anteriores <strong>de esa misma
            variante</strong>: 100 kg en la máquina no son 100 kg en barra libre, así que cada una
            lleva su propio historial.
          </p>
        </>
      )}
    </section>
  )
}
