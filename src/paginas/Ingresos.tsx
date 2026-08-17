import { aNumero, miles, pesos, sumar } from '../dinero'
import type { Movimiento } from '../datos/almacen'

function Linea({
  mov,
  onCambio,
  onBorrar,
}: {
  mov: Movimiento
  onCambio: (parcial: Partial<Movimiento>) => void
  onBorrar: () => void
}) {
  return (
    <div className="linea">
      <input
        className="linea__nombre"
        value={mov.nombre}
        placeholder="Concepto"
        onChange={(e) => onCambio({ nombre: e.target.value })}
        aria-label="Concepto"
      />
      <input
        className="linea__monto"
        inputMode="numeric"
        value={mov.monto ? miles(mov.monto) : ''}
        placeholder="0"
        onChange={(e) => onCambio({ monto: aNumero(e.target.value) })}
        aria-label={`Monto de ${mov.nombre || 'la línea'}`}
      />
      <button
        type="button"
        className="linea__borrar"
        onClick={onBorrar}
        aria-label={`Quitar ${mov.nombre || 'línea'}`}
      >
        ×
      </button>
    </div>
  )
}

export default function Ingresos({
  ingresos,
  fijos,
  onCambiarLinea,
  onBorrarLinea,
  onAgregarLinea,
}: {
  ingresos: Movimiento[]
  fijos: Movimiento[]
  onCambiarLinea: (lista: 'ingresos' | 'fijos', id: string, parcial: Partial<Movimiento>) => void
  onBorrarLinea: (lista: 'ingresos' | 'fijos', id: string) => void
  onAgregarLinea: (lista: 'ingresos' | 'fijos') => void
}) {
  const entra = sumar(ingresos)
  const fijo = sumar(fijos)
  const libre = entra - fijo
  const porcentaje = entra > 0 ? Math.min(100, (fijo / entra) * 100) : 0

  return (
    <section className="pagina">
      <div className="resumen">
        <p className="resumen__etiqueta">Queda libre cada mes</p>
        <p className={`resumen__cifra${libre < 0 ? ' es-negativa' : ''}`}>{pesos(libre)}</p>

        <div className="barra" role="img" aria-label={`Los fijos toman el ${Math.round(porcentaje)}% de lo que entra`}>
          <div className="barra__fijo" style={{ width: `${porcentaje}%` }} />
        </div>
        <p className="resumen__pie">
          Los fijos se llevan el {Math.round(porcentaje)}% de {pesos(entra)}
        </p>
      </div>

      <h2 className="seccion">
        Entra <span>{pesos(entra)}</span>
      </h2>
      {ingresos.map((m) => (
        <Linea
          key={m.id}
          mov={m}
          onCambio={(p) => onCambiarLinea('ingresos', m.id, p)}
          onBorrar={() => onBorrarLinea('ingresos', m.id)}
        />
      ))}
      <button type="button" className="agregar" onClick={() => onAgregarLinea('ingresos')}>
        + Agregar ingreso
      </button>

      <h2 className="seccion">
        Sale fijo <span>{pesos(fijo)}</span>
      </h2>
      {fijos.map((m) => (
        <Linea
          key={m.id}
          mov={m}
          onCambio={(p) => onCambiarLinea('fijos', m.id, p)}
          onBorrar={() => onBorrarLinea('fijos', m.id)}
        />
      ))}
      <button type="button" className="agregar" onClick={() => onAgregarLinea('fijos')}>
        + Agregar gasto fijo
      </button>
    </section>
  )
}
