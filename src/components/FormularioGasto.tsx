import { useEffect, useState } from 'react'
import { aNumero, miles } from '../dinero'
import type { Datos, Gasto } from '../datos/almacen'
import { hoyISO } from '../dinero'

export default function FormularioGasto({
  personas,
  onGuardar,
  onCerrar,
}: {
  personas: Datos['personas']
  onGuardar: (gasto: Omit<Gasto, 'id'>) => void
  onCerrar: () => void
}) {
  const [monto, setMonto] = useState(0)
  const [descripcion, setDescripcion] = useState('')
  const [quien, setQuien] = useState<'a' | 'b'>('b')
  const [fecha, setFecha] = useState(hoyISO)

  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar()
    }
    window.addEventListener('keydown', alTeclear)
    return () => window.removeEventListener('keydown', alTeclear)
  }, [onCerrar])

  function guardar() {
    if (monto <= 0) return
    onGuardar({ monto, descripcion: descripcion.trim(), quien, fecha })
    onCerrar()
  }

  return (
    <div className="sheet-wrap" role="dialog" aria-modal="true" aria-label="Anotar un gasto">
      <div className="sheet__backdrop" onClick={onCerrar} role="presentation" />

      <div className="sheet">
        <div className="sheet__handle" aria-hidden="true" />
        <h2 className="sheet__titulo">Anotar un gasto</h2>

        <input
          className="monto-grande"
          inputMode="numeric"
          autoFocus
          value={monto ? miles(monto) : ''}
          placeholder="0"
          onChange={(e) => setMonto(aNumero(e.target.value))}
          aria-label="Monto"
        />

        <input
          className="campo"
          value={descripcion}
          placeholder="¿En qué fue?"
          onChange={(e) => setDescripcion(e.target.value)}
          aria-label="Descripción"
        />

        <p className="campo__etiqueta">Quién pagó</p>
        <div className="quien">
          {(['a', 'b'] as const).map((k) => (
            <button
              key={k}
              type="button"
              className={`quien__opcion${quien === k ? ' is-activa' : ''}`}
              onClick={() => setQuien(k)}
            >
              {personas[k] || (k === 'a' ? 'Ella' : 'Él')}
            </button>
          ))}
        </div>

        <p className="campo__etiqueta">Cuándo</p>
        <input
          className="campo"
          type="date"
          value={fecha}
          max={hoyISO()}
          onChange={(e) => setFecha(e.target.value)}
          aria-label="Fecha"
        />

        <button type="button" className="sheet__cerrar" onClick={guardar} disabled={monto <= 0}>
          Guardar
        </button>
      </div>
    </div>
  )
}
