# Enlaces de apartado (copiar enlace)

> Archivos clave: `src/components/AnchorLink.astro` · `src/layouts/BaseLayout.astro` (script global + inyección) · `src/styles/global.css` (`.anchor-link`)

## Qué hace

Añade un botón discreto de "copiar enlace" en las cabeceras de sección de cualquier página y en los bloques enlazables de la ficha de caso (hitos, personas, organizaciones y documentos de la biblioteca). Al pulsarlo, copia la URL absoluta con el hash del apartado al portapapeles y la refleja en la barra de direcciones, sin saltar de posición.

## Para qué sirve

Permite compartir un enlace que aterriza directamente en el apartado, hito, persona, organización o documento concreto, en vez de en lo alto de la página. La URL compartida usa el ancla estable de cada bloque (la misma que consume el feed RSS y el drill-down de `/graficas`), así que el destinatario cae exactamente donde se le quería llevar, con el destello mostaza de `:target` para ubicarlo.

## Cómo funciona

- **Componente `AnchorLink.astro`**: botón `.anchor-link` con icono de cadena (Feather "link") y `data-anchor="<id>"`. Sin estilos scoped — todo en `global.css` para que las anclas inyectadas por JS compartan los mismos estilos.
- **Cabeceras**: el script de `BaseLayout` inyecta un `.anchor-link` tras el `<h2>` de cada `.sec-h[id]` del `<main>` (las cabeceras de sección que ya alimentan el `PageToc`). Cubre las 16 páginas Pg* porque todas usan `SectionH`/`FichaTocSection`.
- **Cards e hitos**: renderizados en servidor. `Hito` lo trae si tiene `id`; `PersonaCard`, `OrgCard` y `DocumentoCard` aceptan una prop opcional `anchorId` que activa el botón (y, en persona/organización, fija el `id` propio de la card). En `PgCasoDetalle` se pasan `persona-<id>`, `org-<id>` y `doc-<id>`; el ancla de documento sigue viviendo en el wrapper `#doc-<id>` que ya consumen las citas de `RichProse`.
- **Handler delegado** (`BaseLayout`): un único listener sobre `document` para `.anchor-link[data-anchor]`. Hace `history.replaceState` del hash (sin salto ni inundar el history), copia la URL con `navigator.clipboard.writeText`, marca `data-copied` ~1,5 s (burbuja "Copiado") y anuncia en una región `aria-live`. El click-to-top del `.sec-h` ignora clicks sobre `<button>`, así que el icono no dispara el scroll-to-top.

## Estado actual

Entregado 2026-05-29. Cabeceras en todas las páginas; hitos, personas, organizaciones y documentos en la ficha de caso. Revelado al pasar el ratón o enfocar (siempre visible en táctil); en documentos va integrado en la columna de enlaces persistente. Verificado en runtime: 8/8 cabeceras inyectadas, 59 botones server-rendered en una ficha, URL actualizada sin salto, sin errores de consola. Si el portapapeles falla (contexto sin foco/permiso) cae a "Enlace en la barra de direcciones" — la URL queda igualmente reflejada.

## Decisiones editoriales y aprendizajes

- **Icono al pasar, no click en toda la cabecera/card** (decisión del maintainer, 2026-05-29): clicar el cuerpo entero para cambiar la URL se descartó por el riesgo de compartir un enlace por un clic accidental. El botón explícito es la única afordancia que copia.
- **Ancla canónica con prefijo**: `#hito-<id>`, `#persona-<id>`, `#org-<id>`, `#doc-<id>`. Misma convención que el feed RSS y el drill-down de `/graficas` — ver [`visualizaciones-graficas.md`](visualizaciones-graficas.md). Generar `#<id>` a secas no resuelve.
- **Estilos globales, no scoped**: las cabeceras se anclan por JS; sus botones no heredarían el `<style>` de un componente Astro.

## Ideas futuras

### Sin compromiso

- Extender el icono a sub-cabeceras `h3[id]` (p. ej. "Picos rastreados" en cobertura). Hoy sólo `.sec-h[id]` para evitar `<button>` dentro de `<hN>` (modelo de contenido) y acotar el alcance.
- Botón equivalente en las cards de hechos (hoy tienen ancla `#hecho-<id>` pero sin botón; el drill-down de `/graficas` ya enlaza ahí).

## Pendientes operativos

- [ ] Confirmar visualmente el hover-reveal y el copiado en un navegador real con foco (clipboard + burbuja "Copiado").
