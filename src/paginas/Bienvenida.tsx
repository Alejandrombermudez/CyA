import { pesos } from '../dinero'
import { rutinaDe } from '../datos/rutina'
import { SALUDOS, type Periodo } from '../theme/themes'

const fechaLarga = new Intl.DateTimeFormat('es-CO', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

function Tarjeta({
  titulo,
  valor,
  pie,
  onIr,
}: {
  titulo: string
  valor: string
  pie: string
  onIr: () => void
}) {
  return (
    <button type="button" className="navcard" onClick={onIr}>
      <span className="navcard__titulo">{titulo}</span>
      <span className="navcard__valor">{valor}</span>
      <span className="navcard__pie">{pie}</span>
      <span className="navcard__flecha" aria-hidden="true">
        →
      </span>
    </button>
  )
}

export default function Bienvenida({
  ahora,
  periodo,
  libre,
  gastado,
  onIr,
}: {
  ahora: Date
  periodo: Periodo
  libre: number
  gastado: number
  onIr: (pagina: number) => void
}) {
  const rutina = rutinaDe(ahora)

  return (
    <section className="pagina">
      <p className="home__greeting">{SALUDOS[periodo]}</p>
      <p className="home__date">{fechaLarga.format(ahora)}</p>

      <nav className="navcards" aria-label="Secciones">
        <Tarjeta
          titulo="Ingresos"
          valor={pesos(libre)}
          pie="Queda libre cada mes"
          onIr={() => onIr(1)}
        />
        <Tarjeta
          titulo="Gastos"
          valor={pesos(gastado)}
          pie={gastado > 0 ? `Quedan ${pesos(libre - gastado)}` : 'Nada anotado este mes'}
          onIr={() => onIr(2)}
        />
        <Tarjeta
          titulo="Entrenamiento"
          valor={rutina ? rutina.nombre : 'Descanso'}
          pie={rutina ? rutina.foco : 'Hoy toca descansar'}
          onIr={() => onIr(3)}
        />
      </nav>
    </section>
  )
}
