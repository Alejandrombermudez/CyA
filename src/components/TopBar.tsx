import foto from '../assets/foto-splash.webp'

const horaCorta = new Intl.DateTimeFormat('es-CO', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

/** Separa "3:47" de "p. m." para poder darles tamanos distintos. */
function partirHora(fecha: Date) {
  const partes = horaCorta.formatToParts(fecha)
  const corte = partes.findIndex((p) => p.type === 'dayPeriod')
  if (corte === -1) return { hhmm: horaCorta.format(fecha), ampm: '' }
  return {
    hhmm: partes.slice(0, corte).map((p) => p.value).join('').trim(),
    ampm: partes[corte].value,
  }
}

export default function TopBar({ ahora, onAbrirOpciones }: { ahora: Date; onAbrirOpciones: () => void }) {
  const { hhmm, ampm } = partirHora(ahora)

  return (
    <header className="topbar">
      <button
        type="button"
        className="topbar__id"
        onClick={onAbrirOpciones}
        aria-label="Abrir opciones de apariencia"
      >
        <img className="topbar__avatar" src={foto} alt="" width={44} height={44} />
        <span className="topbar__name">CyA</span>
      </button>

      <time className="topbar__clock" dateTime={ahora.toISOString()}>
        <span className="topbar__hhmm">{hhmm}</span>
        {ampm && <span className="topbar__ampm">{ampm}</span>}
      </time>
    </header>
  )
}
