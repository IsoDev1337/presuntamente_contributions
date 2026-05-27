# Navegación principal (header)

> Archivos clave: [`src/layouts/BaseLayout.astro`](../../../src/layouts/BaseLayout.astro) (datos `navEntries` + markup desktop/móvil) · [`src/styles/global.css`](../../../src/styles/global.css) (`.site-nav`, `.site-nav-dropdown`, panel móvil)

## Qué hace

Lista las secciones públicas del inventario en el header navy. **Desktop:** Casos (enlace directo) + dos menús desplegables (Inventario · Referencia). **Mobile:** hamburguesa con los mismos clusters y cabeceras. Utilidades a la derecha: Buscar, idioma, Aportar.

## Para qué sirve

Reducir ruido visual en el header cuando el inventario crece (Conexiones, Biblioteca, etc.) sin perder acceso en un clic desde el panel desplegable. Casos sigue siendo destino directo — el núcleo del sitio.

## Cómo funciona

- **`navEntries`**: cinco entradas de primer nivel:
  1. `link` — Casos
  2. `menu` inventario — Personas, Organizaciones, Delitos
  3. `link` — Conexiones (ruta `/conexiones`; copy completo en [`explorador-conexiones.md`](explorador-conexiones.md#convención-de-copy))
  4. `menu` referencia — Biblioteca, Cifras
  5. `link` — Sobre (metainfo; acceso directo)
- **`navGroups`**: misma taxonomía para el panel móvil (cabeceras Inventario / Referencia).
- **Desktop**: triggers reutilizan el listener global de paneles (`aria-controls` + `data-open`). Hover abre en `(hover: hover) and (pointer: fine)` en nav **e idioma**; click alterna en touch. Un solo panel abierto a la vez.
- **Paneles nav**: extensión navy de la columna (tipografía blanca, filete mostaza inferior).
- **Panel idioma**: superficie blanca pegada al trigger (utilidad lateral); mismo hover/click/ESC pero aspecto distinto al nav.
- **Estado activo**: enlace directo por `activeNav`; trigger de menú activo si algún hijo coincide.
- **Tablet (`721–1180px`)**: 2 filas; nav abajo ancho completo con los tres items de primer nivel (sin colapsar a hamburguesa).
- **Mobile (`≤720px`)**: hamburguesa; nav en panel con cabeceras de grupo.

## Estado actual

- **2026-05-26 (b)**: Conexiones y Sobre pasan a enlace directo; Referencia queda solo con Biblioteca + Cifras.
- **2026-05-26**: nav desktop pasa de 8 enlaces planos a menús desplegables + enlaces destacados.
- **2026-05-25 (d)**: hover full-height; nav `max-content` + columna `1fr` empuja utilidades a la derecha (sigue vigente).

## Decisiones editoriales y aprendizajes

- **No hamburguesa en tablet** — el nav debe seguir siendo visible hasta mobile real.
- **Casos fuera del dropdown** — acceso directo al núcleo editorial.
- **Conexiones y Sobre fuera del dropdown** — explorador de relaciones como feature destacada (`/conexiones`); Sobre como metainfo institucional sin enterrarla.
- **Inventario vs Referencia** — entidades modeladas separadas de documentos agregados (biblioteca, cifras).
- **Sin shadcn/Radix en runtime** — el proyecto es Astro estático; el patrón visual (trigger + panel + chevron) se replica con CSS/JS existente.
- **2 filas antes que recortar** — por debajo de 1180px el nav gana fila propia a ancho completo.

## Ideas futuras

- v1.x: descripciones cortas bajo cada ítem del dropdown (p. ej. «Conexiones — relaciones entre actores») si el panel crece más.
- v1.x: indicador de «nuevo» en Conexiones mientras la feature esté en beta pública.

## Pendientes operativos

- [ ] Verificar visualmente en `1280`, `1100`, `900`, `721` y `375` (dropdown hover, click fuera, ESC, item activo).
- [ ] Sincronizar [`SiteChrome.jsx`](../../../.agents/skills/presuntamente-design/ui_kits/web/SiteChrome.jsx) del UI kit si se usa para mocks.
