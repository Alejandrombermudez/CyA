package co.cya.captura

import android.content.Context
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import org.json.JSONArray
import org.json.JSONObject
import java.io.File

/**
 * Guarda las capturas en un archivo de lineas JSON dentro del almacenamiento
 * privado de la app. Sin base de datos: el volumen es chico y asi el log se
 * puede exportar tal cual.
 */
object Almacen {
    private const val ARCHIVO = "capturas.jsonl"
    private const val MAXIMO = 2000

    private val _capturas = MutableStateFlow<List<Captura>>(emptyList())
    val capturas: StateFlow<List<Captura>> = _capturas.asStateFlow()

    private var cargado = false

    private fun archivo(ctx: Context) = File(ctx.filesDir, ARCHIVO)

    @Synchronized
    fun cargar(ctx: Context) {
        if (cargado) return
        val f = archivo(ctx)
        _capturas.value = if (!f.exists()) {
            emptyList()
        } else {
            f.readLines()
                .mapNotNull { linea -> runCatching { Captura.deJson(JSONObject(linea)) }.getOrNull() }
                .sortedByDescending { it.cuando }
        }
        cargado = true
    }

    @Synchronized
    fun agregar(ctx: Context, captura: Captura) {
        cargar(ctx)
        if (_capturas.value.any { it.id == captura.id }) return
        runCatching { archivo(ctx).appendText(captura.aJson().toString() + "\n") }
        _capturas.value = (listOf(captura) + _capturas.value).take(MAXIMO)
    }

    @Synchronized
    fun limpiar(ctx: Context) {
        archivo(ctx).delete()
        _capturas.value = emptyList()
    }

    /** Copia legible del log en cacheDir, lista para compartir. */
    fun exportar(ctx: Context): File {
        val raiz = JSONArray()
        _capturas.value.forEach { raiz.put(it.aJson()) }
        val destino = File(ctx.cacheDir, "capturas-cya.json")
        destino.writeText(raiz.toString(2))
        return destino
    }
}
