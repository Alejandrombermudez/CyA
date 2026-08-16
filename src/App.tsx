import { useState } from 'react'
import Ambience from './components/Ambience'
import SettingsSheet from './components/SettingsSheet'
import Splash from './components/Splash'
import TopBar from './components/TopBar'
import { SALUDOS } from './theme/themes'
import { useAhora, useTheme } from './theme/useTheme'

const fechaLarga = new Intl.DateTimeFormat('es-CO', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

export default function App() {
  const [bienvenida, setBienvenida] = useState(true)
  const [opciones, setOpciones] = useState(false)

  const ahora = useAhora()
  const { ajustes, periodo, cambiarModo, cambiarCustom } = useTheme(ahora)

  return (
    <>
      <Ambience />

      {bienvenida && <Splash onDone={() => setBienvenida(false)} />}

      <div className="app" aria-hidden={bienvenida}>
        <TopBar ahora={ahora} onAbrirOpciones={() => setOpciones(true)} />

        <main className="home">
          <p className="home__greeting">{SALUDOS[periodo]}</p>
          <p className="home__date">{fechaLarga.format(ahora)}</p>

          <section className="card card--empty">
            <p className="card__title">Todavía no hay nada registrado</p>
            <p className="card__body">
              La app ya está instalada y funciona sin internet. El siguiente paso es
              definir qué queremos anotar: gastos, ingresos, presupuestos, fijos.
            </p>
          </section>
        </main>
      </div>

      {opciones && (
        <SettingsSheet
          ajustes={ajustes}
          periodo={periodo}
          onModo={cambiarModo}
          onCustom={cambiarCustom}
          onCerrar={() => setOpciones(false)}
        />
      )}
    </>
  )
}
