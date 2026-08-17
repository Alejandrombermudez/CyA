import { pesos, sumar } from '../dinero'
import type { Datos, Gasto } from '../datos/almacen'

const mesLargo = new Intl.DateTimeFormat('es-CO', { month: 'long' })
const diaLargo = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'short' })

/** "2026-08-16" -> Date local, sin que UTC corra el dia. */
const aFecha = (iso: string) => {
  const [a, m, d] = iso.split('-').map(Number)
  return new Date(a, m - 1, d)
}

export default function Gastos({
  gastos,
  libre,
  personas,
  onBorrar,
  onAnotar,
}: {
  gastos: Gasto[]
  libre: number
  personas: Datos['personas']
  onBorrar: (id: string) => void
  onAnotar: () => void
}) {
  const gastado = sumar(gastos)
  const queda = libre - gastado

  const porDia = gastos.reduce<Record<string, Gasto[]>>((mapa, g) => {
    ;(mapa[g.fecha] ??= []).push(g)
    return mapa
  }, {})
  const dias = Object.keys(porDia).sort().reverse()

  return (
    <section className="pagina">
      <div className="resumen">
        <p className="resumen__etiqueta">Gastado en {mesLargo.format(new Date())}</p>
        <p className="resumen__cifra">{pesos(gastado)}</p>
        <p className="resumen__pie">
          {queda >= 0 ? 'Queda ' : 'Te pasaste por '}
          <strong>{pesos(Math.abs(queda))}</strong> de lo libre
        </p>
      </div>

      {dias.length === 0 ? (
        <p className="vacio">
          Todavía no anotaste nada este mes. Tocá el botón de abajo para el primero.
        </p>
      ) : (
        dias.map((dia) => (
          <div key={dia}>
            <h2 className="seccion">
              {diaLargo.format(aFecha(dia))} <span>{pesos(sumar(porDia[dia]))}</span>
            </h2>
            {porDia[dia].map((g) => (
              <div className="gasto" key={g.id}>
                <div className="gasto__texto">
                  <p className="gasto__desc">{g.descripcion || 'Sin descripción'}</p>
                  <p className="gasto__quien">{personas[g.quien]}</p>
                </div>
                <p className="gasto__monto">{pesos(g.monto)}</p>
                <button
                  type="button"
                  className="linea__borrar"
                  onClick={() => onBorrar(g.id)}
                  aria-label={`Borrar gasto de ${pesos(g.monto)}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ))
      )}

      <button type="button" className="fab" onClick={onAnotar} aria-label="Anotar un gasto">
        +
      </button>
    </section>
  )
}
