import { useRef, useState } from 'react'
import type { Datos } from '../datos/almacen'
import { armar, leerRespaldo, nombreArchivo, resumir, type Resumen } from '../datos/respaldo'

type Pendiente = { datos: Datos; resumen: Resumen }

function frase(r: Resumen) {
  const partes = [
    `${r.gastos} ${r.gastos === 1 ? 'gasto' : 'gastos'}`,
    `${r.diasEntrenados} ${r.diasEntrenados === 1 ? 'día entrenado' : 'días entrenados'}`,
    `${r.seriesRegistradas} ${r.seriesRegistradas === 1 ? 'serie' : 'series'}`,
  ]
  return partes.join(' · ')
}

export default function Respaldo({
  datos,
  onImportar,
}: {
  datos: Datos
  onImportar: (datos: Datos) => void
}) {
  const [aviso, setAviso] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pendiente, setPendiente] = useState<Pendiente | null>(null)
  const archivo = useRef<HTMLInputElement>(null)

  const resumen = resumir(datos)

  function descargar(json: string, nombre: string) {
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = nombre
    enlace.click()
    URL.revokeObjectURL(url)
  }

  async function compartir() {
    setError(null)
    const json = armar(datos)
    const nombre = nombreArchivo()

    try {
      const adjunto = new File([json], nombre, { type: 'application/json' })
      // En el celular abre la hoja de compartir de Android, con WhatsApp incluido.
      if (navigator.canShare?.({ files: [adjunto] })) {
        await navigator.share({ files: [adjunto], title: 'Respaldo CyA' })
        setAviso('Respaldo compartido.')
        return
      }
    } catch (e) {
      // Si cancelás la hoja de compartir no es un error que valga la pena mostrar.
      if (e instanceof DOMException && e.name === 'AbortError') return
    }

    descargar(json, nombre)
    setAviso(`Descargado como ${nombre}`)
  }

  async function copiar() {
    setError(null)
    try {
      await navigator.clipboard.writeText(armar(datos))
      setAviso('Copiado. Ya lo podés pegar donde quieras.')
    } catch {
      setError('El navegador no dejó copiar. Usá el botón de compartir.')
    }
  }

  async function elegido(lista: FileList | null) {
    setAviso(null)
    setError(null)
    const f = lista?.[0]
    if (!f) return

    const lectura = leerRespaldo(await f.text())
    if (!lectura.ok) {
      setError(lectura.error)
      return
    }
    setPendiente({ datos: lectura.datos, resumen: lectura.resumen })
  }

  function confirmar() {
    if (!pendiente) return
    onImportar(pendiente.datos)
    setPendiente(null)
    setAviso('Respaldo importado.')
  }

  return (
    <div className="respaldo">
      <p className="editores__nota">
        Tus datos viven solo en este dispositivo. El respaldo sirve para guardarlos, pasarlos a otro
        teléfono o mandárselos a alguien. Ahora mismo: {frase(resumen)}.
      </p>

      <div className="respaldo__botones">
        <button type="button" className="boton boton--principal" onClick={compartir}>
          Compartir respaldo
        </button>
        <button type="button" className="boton" onClick={copiar}>
          Copiar como texto
        </button>
        <button type="button" className="boton" onClick={() => archivo.current?.click()}>
          Importar respaldo
        </button>
      </div>

      <input
        ref={archivo}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          void elegido(e.target.files)
          e.target.value = ''
        }}
      />

      {pendiente && (
        <div className="respaldo__confirmar">
          <p>
            El archivo trae {frase(pendiente.resumen)}. Importarlo <strong>reemplaza</strong> todo lo
            que tenés ahora en este dispositivo.
          </p>
          <div className="respaldo__botones">
            <button type="button" className="boton boton--principal" onClick={confirmar}>
              Reemplazar
            </button>
            <button type="button" className="boton" onClick={() => setPendiente(null)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {aviso && <p className="respaldo__aviso">{aviso}</p>}
      {error && <p className="respaldo__aviso respaldo__aviso--error">{error}</p>}
    </div>
  )
}
