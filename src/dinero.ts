const MILES = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 })

/** 1450000 -> "$ 1.450.000" */
export const pesos = (n: number) => `$ ${MILES.format(Math.round(n))}`

/** 1450000 -> "1.450.000" (para inputs, sin simbolo) */
export const miles = (n: number) => MILES.format(Math.round(n))

/** Lee lo que el usuario escribio quedandose solo con los digitos. */
export function aNumero(texto: string): number {
  const digitos = texto.replace(/\D/g, '')
  return digitos ? Number(digitos) : 0
}

export const sumar = (lista: { monto: number }[]) => lista.reduce((t, x) => t + x.monto, 0)

/** Clave "2026-08" para agrupar por mes. */
export const claveMes = (fecha: Date | string) =>
  (typeof fecha === 'string' ? fecha : fecha.toISOString().slice(0, 10)).slice(0, 7)

/** Fecha de hoy en formato "2026-08-16", en hora local y no UTC. */
export function hoyISO(): string {
  const d = new Date()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}
