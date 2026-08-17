package co.cya.captura

import org.json.JSONObject

/** Una notificacion capturada, tal como llego, mas el monto que se le adivino. */
data class Captura(
    val id: String,
    val paquete: String,
    val app: String,
    val titulo: String,
    val texto: String,
    val cuando: Long,
    val monto: Long?,
) {
    fun aJson(): JSONObject = JSONObject().apply {
        put("id", id)
        put("paquete", paquete)
        put("app", app)
        put("titulo", titulo)
        put("texto", texto)
        put("cuando", cuando)
        put("monto", monto ?: JSONObject.NULL)
    }

    companion object {
        /**
         * Los bancos reeditan la misma notificacion varias veces. Agrupar por
         * contenido y minuto evita guardarla repetida sin perder dos compras
         * distintas del mismo valor en momentos distintos.
         */
        fun idDe(paquete: String, titulo: String, texto: String, cuando: Long): String =
            "$paquete|$titulo|$texto|${cuando / 60_000}".hashCode().toString()

        fun deJson(o: JSONObject) = Captura(
            id = o.getString("id"),
            paquete = o.optString("paquete"),
            app = o.optString("app"),
            titulo = o.optString("titulo"),
            texto = o.optString("texto"),
            cuando = o.getLong("cuando"),
            monto = if (o.isNull("monto")) null else o.getLong("monto"),
        )
    }
}
