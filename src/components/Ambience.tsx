/**
 * Fondo de la app: degradado del tema mas dos manchas de color que se mueven
 * muy despacio y un grano tenue encima, para que no sea un tono plano.
 */
export default function Ambience() {
  return (
    <div className="ambience" aria-hidden="true">
      <span className="ambience__blob ambience__blob--1" />
      <span className="ambience__blob ambience__blob--2" />
      <span className="ambience__grain" />
    </div>
  )
}
