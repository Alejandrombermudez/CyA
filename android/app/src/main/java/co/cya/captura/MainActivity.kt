package co.cya.captura

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.core.content.FileProvider
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

private val CO = Locale("es", "CO")
private val PESOS: NumberFormat = NumberFormat.getInstance(CO)
private val RELOJ = SimpleDateFormat("d MMM HH:mm", CO)

private enum class Pantalla { CAPTURAS, APPS }

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Prefs.iniciar(this)
        Almacen.cargar(this)

        setContent {
            MaterialTheme(colorScheme = if (isSystemInDarkTheme()) darkColorScheme() else lightColorScheme()) {
                Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
                    Raiz()
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun Raiz() {
    val ctx = LocalContext.current
    var pantalla by remember { mutableStateOf(Pantalla.CAPTURAS) }
    var confirmarBorrado by remember { mutableStateOf(false) }

    val capturas by Almacen.capturas.collectAsStateWithLifecycle()
    val acceso = accesoVigilado(ctx)

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        if (pantalla == Pantalla.CAPTURAS) "Capturas (${capturas.size})" else "Qué apps vigilar",
                        fontWeight = FontWeight.SemiBold,
                    )
                },
                actions = {
                    if (pantalla == Pantalla.CAPTURAS) {
                        if (capturas.isNotEmpty()) {
                            TextButton(onClick = { compartir(ctx) }) { Text("Exportar") }
                            TextButton(onClick = { confirmarBorrado = true }) { Text("Borrar") }
                        }
                        TextButton(onClick = { pantalla = Pantalla.APPS }) { Text("Apps") }
                    } else {
                        TextButton(onClick = { pantalla = Pantalla.CAPTURAS }) { Text("Listo") }
                    }
                },
            )
        },
    ) { relleno ->
        Column(Modifier.padding(relleno).fillMaxSize()) {
            if (!acceso) BannerAcceso(ctx)

            when (pantalla) {
                Pantalla.CAPTURAS -> ListaCapturas(capturas) { pantalla = Pantalla.APPS }
                Pantalla.APPS -> ListaApps(ctx)
            }
        }
    }

    if (confirmarBorrado) {
        AlertDialog(
            onDismissRequest = { confirmarBorrado = false },
            title = { Text("¿Borrar todo el log?") },
            text = { Text("Se eliminan las ${capturas.size} capturas guardadas. No se puede deshacer.") },
            confirmButton = {
                TextButton(onClick = {
                    Almacen.limpiar(ctx)
                    confirmarBorrado = false
                }) { Text("Borrar") }
            },
            dismissButton = {
                TextButton(onClick = { confirmarBorrado = false }) { Text("Cancelar") }
            },
        )
    }
}

@Composable
private fun BannerAcceso(ctx: Context) {
    Card(
        modifier = Modifier.fillMaxWidth().padding(14.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer),
    ) {
        Column(Modifier.padding(16.dp)) {
            Text("Falta el permiso", fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(6.dp))
            Text(
                "Sin acceso a las notificaciones la app no puede leer nada. Se activa una sola vez.",
                style = MaterialTheme.typography.bodySmall,
            )
            TextButton(onClick = {
                ctx.startActivity(Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS))
            }) { Text("Dar acceso") }
        }
    }
}

@Composable
private fun ListaCapturas(capturas: List<Captura>, irAApps: () -> Unit) {
    if (capturas.isEmpty()) {
        Box(Modifier.fillMaxSize().padding(32.dp), contentAlignment = Alignment.Center) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("Todavía no hay capturas", fontWeight = FontWeight.SemiBold)
                Spacer(Modifier.height(8.dp))
                Text(
                    "Elegí qué apps vigilar y dejá que llegue una notificación de compra.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                TextButton(onClick = irAApps) { Text("Elegir apps") }
            }
        }
        return
    }

    LazyColumn(Modifier.fillMaxSize()) {
        items(capturas, key = { it.id }) { c ->
            Column(Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 12.dp)) {
                Row(
                    Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Text(
                        c.app,
                        style = MaterialTheme.typography.labelLarge,
                        color = MaterialTheme.colorScheme.primary,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.weight(1f),
                    )
                    Text(
                        RELOJ.format(Date(c.cuando)),
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }

                Text(
                    if (c.monto != null) "$ ${PESOS.format(c.monto)}" else "sin monto detectado",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Light,
                    color = if (c.monto != null) {
                        MaterialTheme.colorScheme.onSurface
                    } else {
                        MaterialTheme.colorScheme.onSurfaceVariant
                    },
                )

                if (c.titulo.isNotBlank()) {
                    Text(c.titulo, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Medium)
                }
                if (c.texto.isNotBlank()) {
                    Text(
                        c.texto,
                        style = MaterialTheme.typography.bodySmall,
                        fontFamily = FontFamily.Monospace,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
            HorizontalDivider()
        }
    }
}

@Composable
private fun ListaApps(ctx: Context) {
    val vigiladas by Prefs.vigiladas.collectAsStateWithLifecycle()
    val vistas by Prefs.vistas.collectAsStateWithLifecycle()
    val todas = remember { Apps.instaladas(ctx) }
    var busqueda by remember { mutableStateOf("") }

    // Primero las que ya notificaron y las sugeridas: son las que interesan.
    val ordenadas = remember(todas, vistas, busqueda) {
        todas
            .filter { busqueda.isBlank() || it.nombre.contains(busqueda, true) || it.paquete.contains(busqueda, true) }
            .sortedWith(
                compareByDescending<AppInfo> { it.paquete in vistas }
                    .thenByDescending { Apps.esSugerida(it) }
                    .thenBy { it.nombre.lowercase() },
            )
    }

    Column(Modifier.fillMaxSize()) {
        OutlinedTextField(
            value = busqueda,
            onValueChange = { busqueda = it },
            label = { Text("Buscar app") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
        )

        LazyColumn(Modifier.fillMaxSize()) {
            items(ordenadas, key = { it.paquete }) { app ->
                val marcada = app.paquete in vigiladas
                Row(
                    Modifier
                        .fillMaxWidth()
                        .clickable { Prefs.alternar(ctx, app.paquete) }
                        .padding(horizontal = 16.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Column(Modifier.weight(1f)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(app.nombre, fontWeight = FontWeight.Medium, maxLines = 1, overflow = TextOverflow.Ellipsis)
                            if (app.paquete in vistas) {
                                Spacer(Modifier.width(8.dp))
                                Etiqueta("ya notificó")
                            } else if (Apps.esSugerida(app)) {
                                Spacer(Modifier.width(8.dp))
                                Etiqueta("sugerida")
                            }
                        }
                        Text(
                            app.paquete,
                            style = MaterialTheme.typography.labelSmall,
                            fontFamily = FontFamily.Monospace,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                        )
                    }
                    Switch(checked = marcada, onCheckedChange = { Prefs.alternar(ctx, app.paquete) })
                }
                HorizontalDivider()
            }
        }
    }
}

@Composable
private fun Etiqueta(texto: String) {
    Box(
        Modifier
            .background(MaterialTheme.colorScheme.secondaryContainer, RoundedCornerShape(6.dp))
            .padding(horizontal = 6.dp, vertical = 1.dp),
    ) {
        Text(
            texto,
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSecondaryContainer,
        )
    }
}

/** Relee el permiso cada vez que se vuelve a la app desde Ajustes. */
@Composable
private fun accesoVigilado(ctx: Context): Boolean {
    var acceso by remember { mutableStateOf(Apps.tieneAccesoNotificaciones(ctx)) }
    val dueno = LocalLifecycleOwner.current

    DisposableEffect(dueno) {
        val observador = LifecycleEventObserver { _, evento ->
            if (evento == Lifecycle.Event.ON_RESUME) acceso = Apps.tieneAccesoNotificaciones(ctx)
        }
        dueno.lifecycle.addObserver(observador)
        onDispose { dueno.lifecycle.removeObserver(observador) }
    }
    return acceso
}

private fun compartir(ctx: Context) {
    val archivo = Almacen.exportar(ctx)
    val uri = FileProvider.getUriForFile(ctx, "${ctx.packageName}.archivos", archivo)
    val envio = Intent(Intent.ACTION_SEND).apply {
        type = "application/json"
        putExtra(Intent.EXTRA_STREAM, uri)
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
    }
    ctx.startActivity(Intent.createChooser(envio, "Exportar capturas"))
}
