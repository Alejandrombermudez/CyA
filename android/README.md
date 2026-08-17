# CyA Captura

App compañera de Android para [CyA](../README.md). Lee las notificaciones de las
apps que vos elijas (Nequi, Davivienda, Mensajes…) y guarda cada una con el monto
que logra detectar.

## Qué hace y qué no

Esta primera versión **solo captura y muestra**. No manda nada a la app web
todavía, y eso es a propósito: no sabemos cómo redacta cada banco sus
notificaciones, así que primero hay que ver textos reales. Con el log exportado
se escriben después los parsers de verdad.

La app **no tiene permiso de internet**. Lo capturado no puede salir del
teléfono salvo que vos lo compartas a mano con el botón *Exportar*.

## Instalar

Con el teléfono conectado por USB y la depuración USB activada:

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

Si `adb` no está en el PATH, está en `%LOCALAPPDATA%\Android\Sdk\platform-tools`.
También sirve copiar el APK al teléfono y abrirlo desde el explorador de archivos.

## Poner a andar

1. Abrir **CyA Captura**.
2. Tocar **Dar acceso** en el aviso rojo → activar la app en la lista de acceso a
   notificaciones. Android va a advertir que podrá leer notificaciones: es
   justamente lo que necesita.
3. Ir a **Apps** y prender las que traen movimientos. Las que ya notificaron
   aparecen primero marcadas como *ya notificó*, y las de bancos como *sugerida*.
4. Usar el teléfono normal unos días.
5. Volver, revisar la lista y tocar **Exportar** para sacar el JSON.

## Compilar

```bash
cd android && ./gradlew assembleDebug
```

Necesita el SDK de Android (la ruta va en `local.properties`) y un JDK 17 o
superior. El que trae Android Studio en `jbr/` sirve.

## Estructura

| Archivo | Rol |
| --- | --- |
| `CapturaService.kt` | Escucha las notificaciones y filtra por app elegida. |
| `Parser.kt` | Detección provisional del monto en pesos. |
| `Almacen.kt` | Log en JSON por líneas, en el almacenamiento privado. |
| `Prefs.kt` | Qué apps se vigilan y cuáles han notificado. |
| `MainActivity.kt` | Las dos pantallas: capturas y selección de apps. |
