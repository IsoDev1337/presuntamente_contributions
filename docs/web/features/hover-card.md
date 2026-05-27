# HoverCard

> Componente: [`src/components/HoverCard.astro`](../../../src/components/HoverCard.astro)

## Qué hace

Muestra un panel flotante al pasar el cursor (o al enfocar con teclado) sobre un trigger, con retardo configurable de apertura y cierre.

## Para qué sirve

Preview de metadatos sin ensuciar listados densos: en `/casos`, cada organización afectada es un chip compacto y el nivel / naturaleza / justificación aparecen en el hover card (`OrgAfectadaChip`).

## Cómo funciona

- Markup: contenedor `[data-hcard]`, trigger `[data-hcard-trigger]`, panel `[data-hcard-content]`.
- Slots Astro: `trigger` y `content`.
- Props: `side` (`top`|`bottom`|`left`|`right`), `align` (`start`|`center`|`end`), `openDelay` (default 120 ms), `closeDelay` (default 180 ms).
- Script singleton (`window.__hcardInited`): posiciona el panel con `position: fixed` para evitar recorte por `.tbl-scroll`; cierra al hacer click fuera; en dispositivos sin hover, tap en el trigger alterna abierto/cerrado.
- Estilo gov-retro: borde fino `--color-accent`, sin radius, sombra ligera — alineado con `MultiSelectFilter` y [`DESIGN.md`](../../../DESIGN.md).

Call-sites actuales:

- [`OrgAfectadaChip.astro`](../../../src/components/OrgAfectadaChip.astro) — columna «Organizaciones afectadas» de [`PgCasos.astro`](../../../src/components/pages/PgCasos.astro).

## Estado actual

Entregado 2026-05-27. Componente base reutilizable + primer consumidor en el listado de casos.

## Decisiones editoriales y aprendizajes

- **Inspiración shadcn, implementación Astro vanilla.** No hay React/Radix en el stack; el comportamiento (delays, posicionamiento, cierre al salir) replica el patrón sin añadir dependencias.
- **`position: fixed` obligatorio en tablas.** Un popover `absolute` dentro de `.tbl-scroll` queda recortado por `overflow-x: auto`.
- **Metadatos fuera del chip.** En la columna de org afectadas, mezclar nombre + `RolBadge` en línea generaba ruido visual; el chip lleva sólo la etiqueta identificativa y el hover card el contexto editorial.

## Ideas futuras

- Reutilizar en fichas de persona/organización para previews de vínculos densos.
- Variante `side="bottom"` en contextos donde el trigger está pegado al borde superior del viewport.

## Pendientes operativos

- [ ] Ninguno.
