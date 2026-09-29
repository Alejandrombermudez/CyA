import { useEffect } from 'react'
import { hexToRgb, rgbToHex } from '../theme/color'
import { NOMBRES, PRESETS, type Modo, type Periodo } from '../theme/themes'
import type { Ajustes } from '../theme/useTheme'
import type { Datos } from '../datos/almacen'
import Respaldo from './Respaldo'

const PERIODOS: Periodo[] = ['dia', 'tarde', 'noche']
const CANALES = [
  { clave: 'r', etiqueta: 'R' },
  { clave: 'g', etiqueta: 'G' },
  { clave: 'b', etiqueta: 'B' },
] as const

/** Editor de un color: muestra, selector nativo y los tres canales RGB. */
function EditorColor({
  etiqueta,
  valor,
  onChange,
}: {
  etiqueta: string
  valor: string
  onChange: (hex: string) => void
}) {
  const rgb = hexToRgb(valor)

  return (
    <div className="editor">
      <div className="editor__cabecera">
        <label className="editor__muestra" style={{ background: valor }}>
          <input
            type="color"
            value={valor}
            onChange={(e) => onChange(e.target.value)}
            aria-label={`Elegir ${etiqueta}`}
          />
        </label>
        <div>
          <p className="editor__etiqueta">{etiqueta}</p>
          <p className="editor__hex">{valor.toUpperCase()}</p>
        </div>
      </div>

      {CANALES.map(({ clave, etiqueta: nombre }) => (
        <div className="canal" key={clave}>
          <span className="canal__nombre">{nombre}</span>
          <input
            type="range"
            min={0}
            max={255}
            value={rgb[clave]}
            onChange={(e) => onChange(rgbToHex({ ...rgb, [clave]: Number(e.target.value) }))}
            aria-label={`${etiqueta}, canal ${nombre}`}
          />
          <span className="canal__valor">{rgb[clave]}</span>
        </div>
      ))}
    </div>
  )
}

export default function SettingsSheet({
  ajustes,
  periodo,
  personas,
  datos,
  onImportar,
  onModo,
  onCustom,
  onPersonas,
  onCerrar,
}: {
  ajustes: Ajustes
  periodo: Periodo
  personas: Datos['personas']
  datos: Datos
  onImportar: (datos: Datos) => void
  onModo: (modo: Modo) => void
  onCustom: (parcial: Partial<Ajustes['custom']>) => void
  onPersonas: (parcial: Partial<Datos['personas']>) => void
  onCerrar: () => void
}) {
  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar()
    }
    window.addEventListener('keydown', alTeclear)
    return () => window.removeEventListener('keydown', alTeclear)
  }, [onCerrar])

  return (
    <div className="sheet-wrap" role="dialog" aria-modal="true" aria-label="Opciones de apariencia">
      <div className="sheet__backdrop" onClick={onCerrar} role="presentation" />

      <div className="sheet">
        <div className="sheet__handle" aria-hidden="true" />

        <h2 className="sheet__titulo">Nosotros</h2>
        <div className="nombres">
          <input
            className="campo"
            value={personas.a}
            placeholder="Ella"
            onChange={(e) => onPersonas({ a: e.target.value })}
            aria-label="Nombre de la primera persona"
          />
          <input
            className="campo"
            value={personas.b}
            placeholder="Él"
            onChange={(e) => onPersonas({ b: e.target.value })}
            aria-label="Nombre de la segunda persona"
          />
        </div>
        <p className="editores__nota">Son los nombres que aparecen al elegir quién pagó un gasto.</p>

        <h2 className="sheet__titulo sheet__titulo--separado">Apariencia</h2>

        <div className="opciones">
          <button
            type="button"
            className={`opcion opcion--auto${ajustes.modo === 'auto' ? ' is-activa' : ''}`}
            onClick={() => onModo('auto')}
          >
            <span className="opcion__muestras" aria-hidden="true">
              {PERIODOS.map((p) => (
                <i key={p} style={{ background: PRESETS[p].bg }} />
              ))}
            </span>
            <span className="opcion__nombre">Automático</span>
            <span className="opcion__pie">Ahora: {NOMBRES[periodo].toLowerCase()}</span>
          </button>

          {PERIODOS.map((p) => (
            <button
              key={p}
              type="button"
              className={`opcion${ajustes.modo === p ? ' is-activa' : ''}`}
              onClick={() => onModo(p)}
            >
              <span
                className="opcion__muestra"
                aria-hidden="true"
                style={{
                  background: `linear-gradient(135deg, ${PRESETS[p].bg}, ${PRESETS[p].bgDeep} 55%, ${PRESETS[p].accent})`,
                }}
              />
              <span className="opcion__nombre">{NOMBRES[p]}</span>
            </button>
          ))}

          <button
            type="button"
            className={`opcion${ajustes.modo === 'custom' ? ' is-activa' : ''}`}
            onClick={() => onModo('custom')}
          >
            <span
              className="opcion__muestra"
              aria-hidden="true"
              style={{
                background: `linear-gradient(135deg, ${ajustes.custom.base}, ${ajustes.custom.accent})`,
              }}
            />
            <span className="opcion__nombre">A mi gusto</span>
          </button>
        </div>

        {ajustes.modo === 'custom' && (
          <div className="editores">
            <EditorColor
              etiqueta="Fondo"
              valor={ajustes.custom.base}
              onChange={(hex) => onCustom({ base: hex })}
            />
            <EditorColor
              etiqueta="Acento"
              valor={ajustes.custom.accent}
              onChange={(hex) => onCustom({ accent: hex })}
            />
            <p className="editores__nota">
              El resto de la app (texto, tarjetas, bordes) se calcula a partir de estos dos.
            </p>
          </div>
        )}

        <h2 className="sheet__titulo sheet__titulo--separado">Respaldo</h2>
        <Respaldo datos={datos} onImportar={onImportar} />

        <button type="button" className="sheet__cerrar" onClick={onCerrar}>
          Listo
        </button>
      </div>
    </div>
  )
}
