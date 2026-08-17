import { SALUDOS, type Periodo } from '../theme/themes'

const fechaLarga = new Intl.DateTimeFormat('es-CO', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

export default function Bienvenida({
  ahora,
  periodo,
  onIrAIngresos,
}: {
  ahora: Date
  periodo: Periodo
  onIrAIngresos: () => void
}) {
  return (
    <section className="pagina pagina--centrada">
      <p className="home__greeting">{SALUDOS[periodo]}</p>
      <p className="home__date">{fechaLarga.format(ahora)}</p>

      <button type="button" className="pista" onClick={onIrAIngresos}>
        Deslizá para ver los ingresos <span aria-hidden="true">→</span>
      </button>
    </section>
  )
}
