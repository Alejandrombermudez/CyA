# CyA

Nuestra app de gastos. Privada, local y sin cuentas.

## Cómo correrla

```bash
npm install
npm run dev
```

Abre en `http://localhost:5173`. En el celular, con la misma wifi, se entra por la
dirección de red que imprime Vite.

## Comandos

| Comando         | Qué hace                                                              |
| --------------- | --------------------------------------------------------------------- |
| `npm run dev`   | Servidor de desarrollo.                                               |
| `npm run build` | Chequeo de tipos y build de producción en `dist/`.                    |
| `npm run icons` | Regenera los iconos y la foto de bienvenida desde `src/assets/foto.jpeg`. |

## Apariencia

El tema cambia solo según la hora: **día** (blanco y gris, 6–12), **tarde**
(marrón y verde, 12–19) y **noche** (negro, 19–6). Tocando la foto de la esquina
superior izquierda se abren las opciones: dejarlo automático, fijar uno de los
tres, o armar uno propio eligiendo fondo y acento con controles RGB. La
preferencia queda guardada en el dispositivo.

Para mover el encuadre de la foto en el icono, se ajusta `FOCUS` en
[`scripts/generate-icons.mjs`](scripts/generate-icons.mjs) y se corre `npm run icons`.

## Estado

Paso 1: identidad, bienvenida, PWA instalable y temas. El registro de gastos
todavía no está hecho.
