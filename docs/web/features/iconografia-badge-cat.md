# Iconografía funcional en `badge--cat`

> Archivos clave: `src/components/CategoryBadge.astro` · `src/styles/global.css` (`.badge--cat-*`) · `src/components/NaturalezaBadge.astro` (paralelo, sin icono)

## Qué hace

Añade un icono Lucide identificativo dentro del badge de categoría (tipo de organización, tipo de hito, tipo de pieza de cobertura mediática, familia de delito) para que el lector reconozca de un vistazo a qué familia pertenece la entidad antes de leer el label.

## Para qué sirve

Acelera el escaneo visual de listados densos: `/organizaciones`, `/delitos`, cobertura mediática del caso y timeline de hitos. El icono no aporta información que no esté en el label, pero reduce el coste cognitivo de identificar la familia (judicial / política / mediática / financiera / etc.). Audiencia: lector general que llega a una ficha de caso por primera vez.

## Cómo funciona

- **Componente único** `src/components/CategoryBadge.astro` envuelve toda la familia `badge--cat`. API:
  ```astro
  <CategoryBadge kind="org|hito|cobertura|delito" tipo="<slug>" familia?="<override>" label="<texto>" size?="sm|md" title?="..." />
  ```
- **Iconos Lucide inlineados como SVG strings** dentro del componente. Se copian de `node_modules/lucide-static/icons/<name>.svg` y se inyectan via `set:html` dentro del `<span class="badge badge--cat">`. Esto evita imports en runtime y mantiene el bundle final con sólo los iconos que realmente usamos (11 hoy).
- `lucide-static` queda como `devDependency` para tener disponible la fuente de los SVG (referencia/copy-paste futuro). En tiempo de ejecución no se importa nada del paquete.
- El SVG hereda `currentColor`, así que el color del icono coincide automáticamente con el color del texto del badge (que ya estaba diferenciado por subfamilia en `global.css`).
- Tamaño: 13px regular, 11px en `size="sm"`. Ajuste óptico vertical de `+0.5px` para alinear con la x-height del label.
- **Mapeo `tipo → icono`** explícito en tres tablas internas (`ORG_ICON`, `HITO_FAMILIA_ICON`, `COBERTURA_TIPO_ICON`, `DELITO_FAMILIA_ICON`). Si el tipo no está en la tabla, el badge se renderiza sin icono (degradado gracioso).

### Mapeo actual

| Origen | Slug del tipo | Icono Lucide |
|--------|---------------|--------------|
| `Organizacion.tipo` | `juzgado` | `gavel` |
| | `tribunal` | `gavel` |
| | `fiscalia` | `scale` |
| | `partido_politico` | `flag` |
| | `empresa` | `building-2` |
| | `asociacion_acusacion_popular` | `users` |
| | `organismo_publico` | `landmark` |
| | `policia_judicial_unidad` | `shield` |
| | `medio_comunicacion` | `newspaper` |
| | `sindicato` | `users` |
| | `fundacion` | `users` |
| | `entidad_financiera` | `banknote` |
| | `consultora` | `briefcase` |
| | `otra` | (sin icono) |
| `Hito` familia derivada | `jurisdiccional` | `gavel` |
| | `politico` | `landmark` |
| | `mediatico` | `newspaper` |
| `cobertura_mediatica.tipo_pieza` | `tv_radio` | `radio` |
| | resto (`noticia`, `reportaje`, `editorial`, `opinion`…) | `newspaper` |
| `Delito.familia` | todas | `scale` |

### Lugares de uso

- `src/components/Hito.astro` (timeline de caso).
- `src/components/CoberturaMediaticaTable.astro` (cobertura mediática general).
- `src/components/pages/PgOrganizaciones.astro` (columna Tipo).
- `src/components/pages/PgDelitos.astro` (columna Familia).

## Estado actual

- Componente `CategoryBadge.astro` desplegado en los 4 sitios de uso.
- `NaturalezaBadge.astro` **conserva su propia paleta y no usa iconos** — los tipos de naturaleza editorial (`generalista_politico`, `verificacion`, `confesional`, `especializado_juridico`, etc.) no tienen un icono Lucide obviamente identificativo y meter algo a la fuerza añadiría ruido sin información. Se mantiene la decisión "color + label" para esta variante.
- El `badge--cat` "genérico" usado en `src/scripts/conexiones.ts` (tabla textual del grafo) **no usa CategoryBadge** porque se renderiza vía `innerHTML` en cliente sobre etiquetas de arista (`EDGE_LABEL`), no sobre tipos de entidad. El icono no aplica.
- `lucide-static@1.16.0` añadido como `devDependency`.

## Decisiones editoriales y aprendizajes

- **Iconos funcionales, no decorativos.** AGENTS.md retiró el set de glyphs decorativos (signo de sección, doble daga, etc.) el 2026-05-25. La excepción aquí es explícita: estos SVG **identifican la familia** (cumplen función informativa), no son ornamentales. El maintainer aprobó la incorporación el 2026-05-26.
- **Lucide, no Heroicons / Phosphor / Material.** Lucide es ISC, mantenido, fork comunitario de Feather; el trazo fino combina bien con la atmósfera gov-retro sobria del sitio. No usar pesos visuales más densos.
- **`lucide-static` (no `lucide` runtime).** Se inlinean los SVG en el componente directamente. Evita una dependencia de runtime, evita un bundle JS sólo para iconos, y permite que el HTML estático del build contenga los iconos directamente (SEO + render sin JS).
- **El icono identifica familia, no sub-especialidad.** Todos los órganos judiciales superiores (`tribunal` AP, AN, TS, TSJ, TC) comparten `gavel`; los juzgados de instrucción también. No se distingue entre Audiencia Provincial y Tribunal Supremo con iconos distintos: el label ya lo hace, y multiplicar iconos por sub-categoría judicial inflaría el set sin ganancia informativa real.
- **No subir pesos tipográficos.** El badge sigue en `font-weight: 600`, alineado con la norma AGENTS.md "Tipografía y pesos visuales".
- **`currentColor` por defecto.** El icono toma el color del texto del badge. Esto preserva la diferenciación por subfamilia (color del border-left + texto + ahora icono coloreado igual que el texto). No se introducen nuevos tokens de color.

## Ideas futuras

### Sin compromiso

- **Icono para `otra` o fallback `circle-help`** si en el futuro se quiere que todos los tipos lleven icono. Hoy preferimos el degradado gracioso (sin icono) para `otra` y para tipos no mapeados.
- **Iconos dentro de los nodos del grafo Cytoscape** (no del badge HTML — eso es trabajo aparte, ver `explorador-conexiones.md`). Si se aborda, reutilizar el mismo mapeo `tipo → icono` exportándolo desde `CategoryBadge.astro` para evitar divergencia.
- **Icono para `entidad_investigada_en_caso` u otras naturalezas de `VinculoInstitucional`** si se llega a renderizar como badge. Hoy no aplica.
- **Modo "icon-only"** (`size="icon"`) para columnas muy estrechas donde el label estorbe. Posible v1.x si llegamos a mostrar tablas comprimidas en mobile.

## Pendientes operativos

- [ ] Sincronizar con `DESIGN.md` cuando el maintainer haga la próxima pasada por la sección "Sistema de badges" — la mención actual a "border-left + glyph propio" en Hito.astro era anterior a la decisión 2026-05-25 de retirar glyphs decorativos; ahora el patrón canónico es `border-left + icono funcional Lucide opcional via CategoryBadge`.
