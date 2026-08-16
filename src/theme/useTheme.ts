import { useCallback, useEffect, useMemo, useState } from 'react'
import { rgbTriplet } from './color'
import { PRESETS, paletaPersonalizada, periodoDeHora, type Modo, type Paleta } from './themes'

const CLAVE = 'cya:tema'

export type Ajustes = {
  modo: Modo
  custom: { base: string; accent: string }
}

const POR_DEFECTO: Ajustes = {
  modo: 'auto',
  custom: { base: '#101418', accent: '#dc9155' },
}

function leerAjustes(): Ajustes {
  try {
    const crudo = localStorage.getItem(CLAVE)
    if (!crudo) return POR_DEFECTO
    const guardado = JSON.parse(crudo) as Partial<Ajustes>
    return {
      modo: guardado.modo ?? POR_DEFECTO.modo,
      custom: { ...POR_DEFECTO.custom, ...guardado.custom },
    }
  } catch {
    return POR_DEFECTO
  }
}

/** Fecha que se refresca sola al cambiar el minuto. */
export function useAhora(): Date {
  const [ahora, setAhora] = useState(() => new Date())

  useEffect(() => {
    let intervalo: ReturnType<typeof setInterval>
    // Enganchar con el borde del minuto para no mostrar la hora atrasada.
    const espera = 60_000 - (Date.now() % 60_000)
    const arranque = setTimeout(() => {
      setAhora(new Date())
      intervalo = setInterval(() => setAhora(new Date()), 60_000)
    }, espera)

    return () => {
      clearTimeout(arranque)
      clearInterval(intervalo)
    }
  }, [])

  return ahora
}

export function useTheme(ahora: Date) {
  const [ajustes, setAjustes] = useState<Ajustes>(leerAjustes)

  const periodo = periodoDeHora(ahora.getHours())

  const paleta: Paleta = useMemo(() => {
    if (ajustes.modo === 'auto') return PRESETS[periodo]
    if (ajustes.modo === 'custom') return paletaPersonalizada(ajustes.custom.base, ajustes.custom.accent)
    return PRESETS[ajustes.modo]
  }, [ajustes, periodo])

  useEffect(() => {
    localStorage.setItem(CLAVE, JSON.stringify(ajustes))
  }, [ajustes])

  useEffect(() => {
    const raiz = document.documentElement
    raiz.style.setProperty('--bg', paleta.bg)
    raiz.style.setProperty('--bg-deep', paleta.bgDeep)
    raiz.style.setProperty('--surface', paleta.surface)
    raiz.style.setProperty('--border', paleta.border)
    raiz.style.setProperty('--text', paleta.text)
    raiz.style.setProperty('--text-soft', paleta.textSoft)
    raiz.style.setProperty('--accent', paleta.accent)
    raiz.style.setProperty('--accent-soft', paleta.accentSoft)
    raiz.style.setProperty('--glow-1', rgbTriplet(paleta.glow1))
    raiz.style.setProperty('--glow-2', rgbTriplet(paleta.glow2))
    raiz.style.setProperty('color-scheme', paleta.scheme)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', paleta.bg)
  }, [paleta])

  const cambiarModo = useCallback((modo: Modo) => setAjustes((a) => ({ ...a, modo })), [])

  const cambiarCustom = useCallback(
    (parcial: Partial<Ajustes['custom']>) =>
      setAjustes((a) => ({ ...a, modo: 'custom', custom: { ...a.custom, ...parcial } })),
    [],
  )

  return { ajustes, paleta, periodo, cambiarModo, cambiarCustom }
}
