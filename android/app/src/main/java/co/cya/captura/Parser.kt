package co.cya.captura

/**
 * Deteccion provisional del monto. No conoce todavia como escribe cada banco:
 * su trabajo es dar una primera lectura para poder comparar contra el texto
 * crudo y, con eso, escribir despues los parsers de verdad.
 */
object Parser {

    /** "$45.000", "$ 45.000,50", "COP 1.250.000". */
    private val CON_SIMBOLO = Regex("""(?:\$|COP|cop)\s*([0-9][0-9.,]*[0-9]|[0-9])""")

    /** "45.000" suelto, con al menos un grupo de miles para no confundir fechas. */
    private val SOLO_MILES = Regex("""\b([0-9]{1,3}(?:\.[0-9]{3})+(?:,[0-9]{1,2})?)\b""")

    fun monto(texto: String): Long? {
        val bruto = CON_SIMBOLO.find(texto)?.groupValues?.get(1)
            ?: SOLO_MILES.find(texto)?.groupValues?.get(1)
            ?: return null
        return normalizar(bruto)
    }

    /** En Colombia el punto separa miles y la coma los decimales. */
    private fun normalizar(bruto: String): Long? {
        val entero = bruto.substringBefore(',').replace(".", "")
        if (entero.isEmpty() || !entero.all(Char::isDigit)) return null
        return entero.toLongOrNull()
    }
}
