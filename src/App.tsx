import { useState } from 'react'
import Ambience from './components/Ambience'
import FormularioGasto from './components/FormularioGasto'
import Pager from './components/Pager'
import SettingsSheet from './components/SettingsSheet'
import Splash from './components/Splash'
import TopBar from './components/TopBar'
import { useDatos } from './datos/almacen'
import { sumar } from './dinero'
import Bienvenida from './paginas/Bienvenida'
import Entrenamiento from './paginas/Entrenamiento'
import Gastos from './paginas/Gastos'
import Ingresos from './paginas/Ingresos'
import { useAhora, useTheme } from './theme/useTheme'

const PAGINAS = ['Bienvenida', 'Ingresos', 'Gastos', 'Entrenamiento']
const PAGINA_GASTOS = 2

export default function App() {
  const [bienvenida, setBienvenida] = useState(true)
  const [opciones, setOpciones] = useState(false)
  const [anotando, setAnotando] = useState(false)
  const [pagina, setPagina] = useState(0)

  const ahora = useAhora()
  const { ajustes, periodo, cambiarModo, cambiarCustom } = useTheme(ahora)
  const datos = useDatos()

  const libre = sumar(datos.datos.ingresos) - sumar(datos.datos.fijos)
  const gastosDelMes = datos.gastosDelMes()
  const gastado = sumar(gastosDelMes)

  return (
    <>
      <Ambience />

      {bienvenida && <Splash onDone={() => setBienvenida(false)} />}

      <div className="app" aria-hidden={bienvenida}>
        <TopBar ahora={ahora} onAbrirOpciones={() => setOpciones(true)} />

        <Pager pagina={pagina} onCambio={setPagina}>
          <Bienvenida
            ahora={ahora}
            periodo={periodo}
            libre={libre}
            gastado={gastado}
            onIr={setPagina}
          />

          <Ingresos
            ingresos={datos.datos.ingresos}
            fijos={datos.datos.fijos}
            onCambiarLinea={datos.cambiarLinea}
            onBorrarLinea={datos.borrarLinea}
            onAgregarLinea={datos.agregarLinea}
          />

          <Gastos
            gastos={gastosDelMes}
            libre={libre}
            personas={datos.datos.personas}
            onBorrar={datos.borrarGasto}
          />

          <Entrenamiento
            hoy={ahora}
            entrenos={datos.datos.entrenos}
            onMarcarSerie={datos.marcarSerie}
          />
        </Pager>

        {/* Fuera del carril: con position fixed dentro de una pagina se veia en todas. */}
        {pagina === PAGINA_GASTOS && (
          <button type="button" className="fab" onClick={() => setAnotando(true)} aria-label="Anotar un gasto">
            +
          </button>
        )}

        <nav className="puntos" aria-label="Páginas">
          <span className="puntos__nombre">{PAGINAS[pagina]}</span>
          <span className="puntos__fila">
            {PAGINAS.map((nombre, i) => (
              <button
                key={nombre}
                type="button"
                className={`punto${i === pagina ? ' is-activo' : ''}`}
                onClick={() => setPagina(i)}
                aria-label={nombre}
                aria-current={i === pagina}
              />
            ))}
          </span>
        </nav>
      </div>

      {opciones && (
        <SettingsSheet
          ajustes={ajustes}
          periodo={periodo}
          personas={datos.datos.personas}
          onModo={cambiarModo}
          onCustom={cambiarCustom}
          onPersonas={datos.cambiarPersonas}
          onCerrar={() => setOpciones(false)}
        />
      )}

      {anotando && (
        <FormularioGasto
          personas={datos.datos.personas}
          onGuardar={datos.agregarGasto}
          onCerrar={() => setAnotando(false)}
        />
      )}
    </>
  )
}
