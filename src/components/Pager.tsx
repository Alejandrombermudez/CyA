import { useEffect, useRef, type ReactNode } from 'react'

/**
 * Paginas que se recorren deslizando. Usa scroll horizontal con ajuste por
 * pagina en vez de un gesto propio: asi el arrastre lo maneja el sistema y sale
 * con la misma inercia que el resto del telefono.
 */
export default function Pager({
  pagina,
  onCambio,
  children,
}: {
  pagina: number
  onCambio: (indice: number) => void
  children: ReactNode
}) {
  const carril = useRef<HTMLDivElement>(null)

  // Cuando la pagina cambia desde afuera (los puntos), llevar el carril ahi.
  useEffect(() => {
    const el = carril.current
    if (!el) return
    const destino = pagina * el.clientWidth
    if (Math.abs(el.scrollLeft - destino) > 4) {
      el.scrollTo({ left: destino, behavior: 'smooth' })
    }
  }, [pagina])

  function alDesplazar() {
    const el = carril.current
    if (!el || el.clientWidth === 0) return
    const indice = Math.round(el.scrollLeft / el.clientWidth)
    if (indice !== pagina) onCambio(indice)
  }

  return (
    <div className="pager" ref={carril} onScroll={alDesplazar}>
      {children}
    </div>
  )
}
