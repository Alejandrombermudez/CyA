package co.cya.captura

import android.content.Context
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/** Que apps se vigilan y cuales han notificado alguna vez. */
object Prefs {
    private const val ARCHIVO = "prefs"
    private const val VIGILADAS = "vigiladas"
    private const val VISTAS = "vistas"

    private val _vigiladas = MutableStateFlow<Set<String>>(emptySet())
    val vigiladas: StateFlow<Set<String>> = _vigiladas.asStateFlow()

    private val _vistas = MutableStateFlow<Set<String>>(emptySet())
    val vistas: StateFlow<Set<String>> = _vistas.asStateFlow()

    private var iniciado = false

    private fun prefs(ctx: Context) = ctx.getSharedPreferences(ARCHIVO, Context.MODE_PRIVATE)

    @Synchronized
    fun iniciar(ctx: Context) {
        if (iniciado) return
        _vigiladas.value = prefs(ctx).getStringSet(VIGILADAS, emptySet()).orEmpty()
        _vistas.value = prefs(ctx).getStringSet(VISTAS, emptySet()).orEmpty()
        iniciado = true
    }

    fun estaVigilada(ctx: Context, paquete: String): Boolean {
        iniciar(ctx)
        return paquete in _vigiladas.value
    }

    @Synchronized
    fun alternar(ctx: Context, paquete: String) {
        iniciar(ctx)
        val nuevo = _vigiladas.value.toMutableSet().apply {
            if (!add(paquete)) remove(paquete)
        }
        _vigiladas.value = nuevo
        prefs(ctx).edit().putStringSet(VIGILADAS, nuevo).apply()
    }

    /** Registra que un paquete notifico, sin guardar el contenido. */
    @Synchronized
    fun registrarVisto(ctx: Context, paquete: String) {
        iniciar(ctx)
        if (paquete in _vistas.value) return
        val nuevo = _vistas.value + paquete
        _vistas.value = nuevo
        prefs(ctx).edit().putStringSet(VISTAS, nuevo).apply()
    }
}
