# Fuentes embebidas para OG images

Estos TTFs los consume `src/lib/og.ts` (build time) para renderizar las OG images con `satori` + `@resvg/resvg-js`. **No** se sirven al navegador — el sitio carga sus fuentes desde Google Fonts (ver `BaseLayout.astro`). Aquí viven sólo porque satori necesita los bytes del fichero TTF en disco para generar el SVG con texto vectorizado.

- `Lato-Regular.ttf` (400) — texto base.
- `Lato-Bold.ttf` (700) — énfasis y titulares medios.
- `Lato-Black.ttf` (900) — display, identificador grande de la entidad.
- `OFL.txt` — SIL Open Font License 1.1 (Copyright 2010-2014 tyPoland Lukasz Dziedzic).

Lato sustituye a la Gill Sans institucional canónica del proyecto ([DESIGN.md → "Typography Rules"](../../../DESIGN.md#3-typography-rules)) porque Gill Sans es comercial y no podemos redistribuirla. Es el primer fallback humanista declarado en el stack `font-sans` del sitio, así que las OG images mantienen continuidad tipográfica con lo que el visitante ve en pantalla.
