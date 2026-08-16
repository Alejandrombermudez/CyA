import { useEffect, useState } from 'react'
import foto from '../assets/foto-splash.webp'

const HOLD_MS = 2600
const FADE_MS = 700

/** Bienvenida a pantalla completa. Se puede saltar tocando la pantalla. */
export default function Splash({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setLeaving(true), HOLD_MS)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!leaving) return
    const t = setTimeout(onDone, FADE_MS)
    return () => clearTimeout(t)
  }, [leaving, onDone])

  return (
    <div
      className={`splash${leaving ? ' is-leaving' : ''}`}
      onClick={() => setLeaving(true)}
      role="presentation"
    >
      <div className="splash__glow" aria-hidden="true" />

      <div className="splash__hearts" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={`heart heart--${i}`}>
            ♥
          </span>
        ))}
      </div>

      <div className="splash__photo">
        <div className="splash__ring" aria-hidden="true" />
        <img src={foto} alt="Nosotros dos" width={720} height={720} />
      </div>

      <h1 className="splash__title">
        <span className="splash__letter">C</span>
        <span className="splash__letter splash__amp">y</span>
        <span className="splash__letter">A</span>
      </h1>

      <p className="splash__tagline">Por una vida juntos</p>
    </div>
  )
}
