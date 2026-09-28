import { useEffect, useRef, type ReactNode } from 'react'

/** Si un viaje pedido no llega en este tiempo, se deja de esperarlo. */
const PLAZO_VIAJE_MS = 1000

/** Cuanto tiene que estar quieto el carril para dar la pagina por asentada. */
const QUIETO_MS = 90

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
  const quieto = useRef<ReturnType<typeof setTimeout>>(undefined)
  const plazo = useRef<ReturnType<typeof setTimeout>>(undefined)

  /** Pagina hacia la que viaja el carril por un pedido de afuera (los puntos). */
  const enCamino = useRef<number | null>(null)

  /** Pagina que acaba de informar el propio carril. */
  const informada = useRef<number | null>(null)

  function informar() {
    const el = carril.current
    if (!el || el.clientWidth === 0) return
    const indice = Math.round(el.scrollLeft / el.clientWidth)

    // Durante un viaje pedido, las posiciones intermedias no cuentan: si no,
    // una pausa a mitad de camino haria volver el carril al origen.
    if (enCamino.current !== null) {
      if (indice !== enCamino.current) return
      terminarViaje()
    }

    informada.current = indice
    onCambio(indice)
  }

  function terminarViaje() {
    enCamino.current = null
    clearTimeout(plazo.current)
  }

  useEffect(() => {
    // Si el cambio lo informo el propio carril, moverlo peleria con el dedo
    // que lo esta arrastrando. La marca se consume aca para que no quede vieja.
    const vieneDelCarril = informada.current === pagina
    informada.current = null
    if (vieneDelCarril) return

    const el = carril.current
    if (!el) return
    const destino = pagina * el.clientWidth
    if (Math.abs(el.scrollLeft - destino) <= 4) return

    enCamino.current = pagina
    clearTimeout(plazo.current)
    plazo.current = setTimeout(() => {
      enCamino.current = null
      informar()
    }, PLAZO_VIAJE_MS)
    el.scrollTo({ left: destino, behavior: 'smooth' })
  }, [pagina])

  useEffect(
    () => () => {
      clearTimeout(quieto.current)
      clearTimeout(plazo.current)
    },
    [],
  )

  function alDesplazar() {
    clearTimeout(quieto.current)
    quieto.current = setTimeout(informar, QUIETO_MS)
  }

  return (
    <div
      className="pager"
      ref={carril}
      onScroll={alDesplazar}
      // Si la persona agarra el carril a mitad de un viaje, manda ella.
      onPointerDown={terminarViaje}
      onWheel={terminarViaje}
    >
      {children}
    </div>
  )
}
