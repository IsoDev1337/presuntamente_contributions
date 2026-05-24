# OG images (social cards) auto-generadas

> Pipeline: [`src/lib/og.ts`](../../../src/lib/og.ts) (satori + resvg) · Endpoints: [`src/pages/og/default.png.ts`](../../../src/pages/og/default.png.ts) · [`src/pages/og/casos/[slug].png.ts`](../../../src/pages/og/casos/[slug].png.ts) · [`src/pages/og/personas/[slug].png.ts`](../../../src/pages/og/personas/[slug].png.ts) · [`src/pages/og/organizaciones/[slug].png.ts`](../../../src/pages/og/organizaciones/[slug].png.ts) · Cableado de meta tags: [`src/layouts/BaseLayout.astro`](../../../src/layouts/BaseLayout.astro) · Fuentes embebidas: [`src/lib/og-fonts/`](../../../src/lib/og-fonts/)

## Qué hace

Genera al hacer `pnpm build` una imagen PNG 1200×630 por cada caso, persona y organización del inventario (más una imagen por defecto para el resto del sitio) con la identidad ministerial del proyecto, y la sirve como `og:image` / `twitter:image` para que los previews de X, WhatsApp, Telegram, LinkedIn, Slack, Facebook y Discord muestren una tarjeta institucional al compartir un link.

## Para qué sirve

**Caso de uso primario**: cuando un periodista o un visitante comparte un link del sitio en X o en un grupo de WhatsApp, el preview que aparece debajo del mensaje deja de ser un favicon pixelado o la nada y pasa a ser una tarjeta institucional con el escudo, el wordmark, el nombre del caso o persona, el badge de fase, el último hito y las cifras del caso. El click-through y la legitimidad percibida suben significativamente.

**Caso de uso secundario**: señal de "esto está cuidado". Junto con el feed RSS/Atom, el aviso legal sustantivo y la trazabilidad por documento, son los detalles técnicos que distinguen un proyecto editorial serio de un blog improvisado a la hora de evaluar si se cita o no.

## Cómo funciona

- [`src/lib/og.ts`](../../../src/lib/og.ts) expone:
  - **`renderOgDefault({ title, subtitle, stats })`** — card del inventario.
  - **`renderOgCaso({ nombreMediatico, nombreOficial, fase, ultimoHito, stats })`** — card de un caso.
  - **`renderOgPersona({ nombreCompleto, subtitulo, rolActualLabel, rolActualColor, stats })`** — card de una persona, con badge del rol procesal activo más reciente coloreado según F-estado.
  - **`renderOgOrganizacion({ nombre, tipoLabel, descripcionCorta, stats })`** — card de una organización.
  - Todas devuelven `Buffer` con el PNG 1200×630 listo para servir.
- Helper interno `chrome()` construye la composición compartida (banda navy 54px + filete mostaza 3px + bloque blanco con escudo + wordmark + tag de tipo + body + footer de cifras).
- Pipeline de render: `satori` parsea el árbol de VNodes (sin React, sin JSX — VNodes construidos a mano con un helper `el()` de 3 líneas) con las fuentes Lato Regular/Bold/Black embebidas como `Buffer`, produce SVG con texto vectorizado, y `@resvg/resvg-js` lo rasteriza a PNG. Todo en build, sin browser ni runtime de Node en producción.
- Cuatro endpoints Astro estáticos invocan los helpers y devuelven el PNG con `Cache-Control: public, max-age=31536000, immutable`. Los dinámicos (`[slug].png.ts`) hacen `getStaticPaths` sobre la collection correspondiente y filtran las collections de hitos/roles/documentos para calcular las cifras de cada entidad con el mismo criterio que la página Pg* equivalente.
- [`BaseLayout.astro`](../../../src/layouts/BaseLayout.astro) acepta dos props nuevas:
  - `ogImage?: string` — path absoluto del PNG (por defecto `/og/default.png`).
  - `ogType?: 'website' | 'article'` — `website` para listados y páginas estructurales, `article` para fichas.
  Emite el bloque completo de meta tags: `og:site_name`, `og:type`, `og:title`, `og:description`, `og:url`, `og:image` (+ `:width` 1200, `:height` 630, `:type` image/png), `og:locale` y los cuatro `twitter:*` equivalentes con `twitter:card=summary_large_image`. También `<link rel="canonical">`. La `description` se aplana (reemplaza `\s+` por ` `) y se trunca a 220 caracteres con elipsis antes de pintar, porque los block scalars YAML traen saltos de línea internos que X corta y Facebook renderiza como espacios extra.
- Los tres `Pg*Detalle` pasan `ogImage={\`/og/<tipo>/${data.id}.png\`}` y `ogType="article"` al `BaseLayout`. El resto del sitio hereda el default sin tener que tocar nada.

## Estado actual

**143 PNGs generados en build** (versión actual, irá creciendo con el inventario):

- 1 default (`/og/default.png`) usado por inicio, /casos, /personas, /organizaciones, /biblioteca, /delitos, /cifras, /sobre, /aviso-legal, /buscar, /rectificar y la página 404 cuando exista.
- 7 cards de caso (uno por entrada en `/content/casos/`).
- 73 cards de persona (una por entrada en `/content/personas/`).
- 62 cards de organización (una por entrada en `/content/organizaciones/`).

**Cifras por tipo de card**:

- **Default**: `casos · personas · organizaciones · documentos` (totales del inventario).
- **Caso**: `procesados · hitos · documentos`. La cifra "procesados" cuenta personas únicas con rol procesal del lado acusado (`imputacion_activa` o `condenado` según `rolGrupo()` de `lib/labels.ts`), no jueces / fiscales / acusación popular — la card vende el caso por su carga procesal contra personas físicas.
- **Persona**: `casos · roles totales`. Badge del rol activo más reciente (o último cerrado si no hay activos) coloreado según F-estado (DESIGN.md §2bis).
- **Organización**: `casos · documentos producidos` (la segunda cifra se omite si es 0).

**Tipografía embebida**: Lato Regular (400), Bold (700), Black (900) bajo licencia SIL OFL 1.1. Lato es el primer fallback humanista declarado en el `font-sans` del sitio (ver DESIGN.md §3), así que las OG cards mantienen continuidad tipográfica con lo que se ve en pantalla. Los TTFs viven en `src/lib/og-fonts/` con `OFL.txt` y se consumen sólo en build — no se sirven al navegador.

**Composición visual**:

- Banda navy `--color-accent` 54px + filete mostaza `--color-accent-secondary` 3px (doble trim ministerial del header del sitio).
- Bloque blanco con padding 40px/56px y borde inferior fino.
- Header del bloque: escudo (`/public/branding/logo.png` cargado como data URL base64) 64×64 + wordmark "presuntamente.org" navy 30px bold + subtítulo institucional 13px muted + tag identificador (INVENTARIO / CASO / PERSONA / ORGANIZACIÓN) en cápsula gris a la derecha.
- Body específico del tipo.
- Footer del bloque: línea de cifras separadas por `·`.

## Decisiones editoriales y aprendizajes

### Por qué satori + resvg y no astro-og-canvas / canvaskit-wasm

`satori` da control completo del layout con un subset de CSS familiar (flexbox), produce SVG con texto vectorizado (legibilidad perfecta a cualquier zoom de preview) y permite embeber fuentes como `Buffer` sin depender del fontconfig del sistema, lo que evita bugs distintos entre el portátil del maintainer y la CI. `@resvg/resvg-js` rasteriza ese SVG con un binding Rust pequeño y rápido. `astro-og-canvas` simplifica el setup pero arrastra `canvaskit-wasm` (~6 MB) y trabaja con un canvas imperativo menos predecible. La diferencia de tamaño y de mantenimiento compensa.

### Por qué VNodes a mano sin JSX/React

Satori acepta cualquier árbol `{ type, props: { style, children } }` y no exige React. Añadir `@types/react` + setup de JSX a un proyecto Astro que hoy no tiene React es coste innecesario para una capa de build interna. El helper local `el(type, props, children)` ocupa tres líneas y deja el código de las cards igual de legible que un JSX simple.

### Por qué tipografía Lato y no la fuente del sitio (Gill Sans)

Gill Sans es la tipografía institucional canónica del Gobierno de España (DESIGN.md §3) pero es comercial (Monotype / Adobe Fonts) y no se puede redistribuir embebida. Lato es el primer fallback humanista abierto declarado en el stack `font-sans`, así que un visitante con Lato instalada (o cargada de Google Fonts) ya ve el sitio en Lato. Las OG cards la usan también — continuidad visual perfecta para esos visitantes y aproximación humanista cercana para el resto.

### Por qué cifras distintas en cada tipo (no las mismas en todas)

La OG card es un anzuelo de medio segundo: tiene que vender la entidad por su dimensión más fuerte. En un caso, lo que enseña gravedad es "cuántas personas hay imputadas + cuántos hitos + cuántos documentos respalda esto". En una persona, "cuántos casos arrastra + cuántos roles ha acumulado". En una organización, "cuántos casos involucra + cuántos documentos ha producido". Forzar las cuatro mismas cifras en todas las cards dilatería la lectura.

### Por qué excluyo jueces / fiscales / acusación popular del conteo "procesados" en la card de Caso

`rolGrupo()` clasifica los 21 roles en 5 grupos. La card cuenta sólo `imputacion_activa` (investigado / procesado / acusado) y `condenado` (no firme + firme), excluyendo `exculpado`, `otros` (denunciantes, querellantes, perjudicados) y `funcional` (jueces, fiscales, abogados). Es la "cifra de presunta carga procesal contra personas físicas" — la única que comunica gravedad del caso de un vistazo. Mezclarlos sería editorialmente engañoso ("13 implicados" suena fuerte si la mitad son jueces).

### Por qué aplanar y truncar `description` a 220 caracteres en las meta tags

Los `descripcion_corta` de los Caso vienen como block scalar YAML (`|`) con saltos de línea internos para que el YAML sea legible. X (Twitter Card) corta `og:description` en el primer `\n` y Facebook los renderiza como espacios dobles. Aplanar con `\s+ → ' '` lo deja como un párrafo. El corte a 220 caracteres queda bajo el límite suave de Twitter Card (~200) y por debajo del corte habitual de WhatsApp; con margen para que la elipsis no caiga en mitad de palabra.

### Por qué `Cache-Control: immutable` en los PNGs

Los PNGs son artefactos de build (regenerados cada `pnpm build`). Cloudflare Pages les pone su propio fingerprint en la URL si fueran assets de `_astro/`, pero estos son rutas estables `/og/<tipo>/<slug>.png` que se sobreescriben en cada deploy. El `immutable` permite a CDN y a navegadores cachear agresivamente entre visitas a la misma versión, asumiendo que cada deploy va a invalidar la edge. Si en el futuro queremos invalidación más quirúrgica, lo recableamos.

### Por qué la card de persona muestra "Figura pública / privada" como subtítulo cuando no hay cargo actual

Las personas con rol procesal cerrado y sin cargo público vigente (ex García Ortiz, ex Cospedal) no tienen `cargo_publico_actual`. El fallback al booleano `es_figura_publica` ya transmite contexto suficiente — "esta persona es relevante para el procedimiento porque era cargo público" vs "esta persona es privada y aparece sólo por el procedimiento". Una versión más elaborada (mostrar cargo histórico en vez de actual) requeriría un campo nuevo en el schema; v1 no lo necesita.

## Ideas futuras

### v1.x — sin compromiso

- **Variante v2 con foto real de la persona** cuando se cierre el bloque "Fotos reales de personas + logos institucionales" del ROADMAP (pendiente de asesoría legal). La card de Persona ganaría una columna izquierda con la foto + el contenido actual a la derecha; la card de Organización lo mismo con el logo institucional. El chrome ministerial y el resto del layout se mantienen idénticos para no romper consistencia.
- **OG card por delito** (`/og/delitos/<slug>.png`) — composición tipográfica con artículo del CP + número de casos donde se atribuye + número de personas con esa imputación. Encajaría con el catálogo `/delitos` existente. Bajo esfuerzo si se hace.
- **OG card por hito individual** (`/og/casos/<slug>/<hito>.png`) — cuando se quiera compartir un hito concreto del feed RSS, no el caso entero. Útil tras el lanzamiento si vemos que la gente comparte enlaces deep `/casos/<slug>#hito-<id>`. Más coste editorial (qué cifras destacar de un único hito).
- **Variante catalana** (`/og/cat/...`) — pendiente del activado de i18n nativo. Las plantillas son ya casi i18n-friendly (sólo cambian las etiquetas "casos / hitos / documentos" y los labels de fase/rol que ya van por `lib/labels.ts`).

### Sin compromiso

- **Card "informe" para investigaciones cruzadas** — composición distinta, formato vertical o portrait, para cuando entre algún long-form que combine varios casos.
- **Generación off-build** vía endpoint dinámico si Cloudflare Pages soporta workers, para regenerar al vuelo cuando se modifique una entidad sin tener que rebuild completo. Hoy con 143 PNGs en ~5s de build el coste es inexistente.

## Pendientes operativos

- [ ] Tras la activación pública del dominio + Cloudflare Pages, verificar el preview real en X (con el Twitter Card Validator), WhatsApp Web, Telegram y LinkedIn. Los validadores aceptan URLs públicas, no `localhost`.
- [ ] Si Cloudflare Pages no respeta el `Cache-Control` del Response, añadir `_headers` con `/og/* Cache-Control: public, max-age=31536000, immutable`. No bloqueante.
- [ ] Cuando se cierre el bloque "Fotos reales" (pendiente legal), evolucionar la card de Persona / Organización a v2 con la foto/logo en columna izquierda. El layout actual está pensado para acomodar esa columna sin rediseño mayor.
- [ ] Considerar añadir `og:image:alt` con texto descriptivo de la card por accesibilidad (algunos clientes lo leen). Hoy el atributo falta.
