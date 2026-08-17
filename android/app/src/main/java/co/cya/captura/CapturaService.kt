package co.cya.captura

import android.app.Notification
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification

class CapturaService : NotificationListenerService() {

    override fun onCreate() {
        super.onCreate()
        Prefs.iniciar(this)
        Almacen.cargar(this)
    }

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        val paquete = sbn.packageName
        if (paquete == packageName) return

        // Se anota que la app notifico aunque no se vigile, para poder
        // ofrecerla en la lista sin haber guardado nada de su contenido.
        Prefs.registrarVisto(this, paquete)
        if (!Prefs.estaVigilada(this, paquete)) return

        val extras = sbn.notification.extras
        val titulo = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString().orEmpty()

        // Preferir el texto largo: el corto suele venir recortado con "...".
        val texto = listOfNotNull(
            extras.getCharSequence(Notification.EXTRA_BIG_TEXT)?.toString(),
            extras.getCharSequence(Notification.EXTRA_TEXT)?.toString(),
        ).maxByOrNull { it.length }.orEmpty()

        if (titulo.isBlank() && texto.isBlank()) return

        val cuando = if (sbn.postTime > 0) sbn.postTime else System.currentTimeMillis()

        Almacen.agregar(
            this,
            Captura(
                id = Captura.idDe(paquete, titulo, texto, cuando),
                paquete = paquete,
                app = Apps.nombre(this, paquete),
                titulo = titulo,
                texto = texto,
                cuando = cuando,
                monto = Parser.monto("$titulo $texto"),
            ),
        )
    }
}
