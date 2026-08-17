package co.cya.captura

import android.content.Context
import android.provider.Settings

data class AppInfo(val paquete: String, val nombre: String)

object Apps {

    /** Apps que probablemente traigan movimientos de plata. */
    private val PISTAS = listOf(
        "nequi", "davivienda", "daviplata", "bancolombia", "bbva", "scotiabank",
        "colpatria", "falabella", "lulo", "nubank", "rappi", "banco",
        "messaging", "mensajes", "messages", "sms",
    )

    fun nombre(ctx: Context, paquete: String): String = runCatching {
        val pm = ctx.packageManager
        pm.getApplicationLabel(pm.getApplicationInfo(paquete, 0)).toString()
    }.getOrDefault(paquete)

    fun instaladas(ctx: Context): List<AppInfo> {
        val pm = ctx.packageManager
        return runCatching {
            pm.getInstalledApplications(0)
                .filter { pm.getLaunchIntentForPackage(it.packageName) != null }
                .map { AppInfo(it.packageName, pm.getApplicationLabel(it).toString()) }
                .distinctBy { it.paquete }
                .sortedBy { it.nombre.lowercase() }
        }.getOrDefault(emptyList())
    }

    fun esSugerida(app: AppInfo): Boolean =
        PISTAS.any { app.paquete.contains(it, true) || app.nombre.contains(it, true) }

    /** Si el usuario ya le dio acceso a las notificaciones a esta app. */
    fun tieneAccesoNotificaciones(ctx: Context): Boolean {
        val activos = Settings.Secure.getString(ctx.contentResolver, "enabled_notification_listeners")
        return activos?.split(":")?.any { it.contains(ctx.packageName) } == true
    }
}
