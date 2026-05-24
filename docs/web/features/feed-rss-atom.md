# Feed RSS / Atom de hitos

> Endpoints: [`src/pages/feed.xml.ts`](../../../src/pages/feed.xml.ts) (Atom 1.0) · [`src/pages/rss.xml.ts`](../../../src/pages/rss.xml.ts) (RSS 2.0) · Helpers: [`src/lib/feed.ts`](../../../src/lib/feed.ts) · Ancla por hito: [`src/components/Hito.astro`](../../../src/components/Hito.astro) · Autodiscovery + footer: [`src/layouts/BaseLayout.astro`](../../../src/layouts/BaseLayout.astro)

## Qué hace

Publica los hitos más recientes del inventario completo en dos formatos sindicados estándar (`/feed.xml` Atom 1.0, `/rss.xml` RSS 2.0) para que cualquier lector RSS / agregador de noticias pueda suscribirse y recibir las novedades automáticamente.

## Para qué sirve

**Audiencia primaria**: periodistas que cubren corrupción. En lugar de tener que acordarse de visitar el sitio, se suscriben una vez y reciben en su lector cada nuevo hito (imputación, auto de procesamiento, sentencia firme, dimisión, etc.) con un click que les lleva al hito concreto dentro de la ficha del caso.

**Función secundaria**: señal de seriedad institucional. BOE, CIS, CGPJ, Tribunal Supremo… los sitios oficiales españoles publican feeds; el clickbait normalmente no. Marca diferencia.

## Cómo funciona

- Helper compartido [`getFeedItems`](../../../src/lib/feed.ts) hace `getCollection('hitos')` + `getCollection('casos')`, ordena por `fecha` descendente, limita a `FEED_LIMIT = 50` y devuelve estructuras `FeedItem` listas para serializar.
- Dos endpoints Astro estáticos consumen ese helper:
  - [`feed.xml.ts`](../../../src/pages/feed.xml.ts) — Atom 1.0 (`application/atom+xml`). Variante moderna preferida.
  - [`rss.xml.ts`](../../../src/pages/rss.xml.ts) — RSS 2.0 (`application/rss+xml`). Coexiste por compatibilidad con lectores antiguos y muchos clientes de mail/RSS que sólo entienden RSS.
  - Misma fuente de datos, distinta serialización XML.
- El componente [`Hito.astro`](../../../src/components/Hito.astro) renderiza `id="hito-<slug>"` en el contenedor de cada item de la timeline (prop opcional `id`). Esto da ancla estable para el deep-link del feed (`/casos/<slug>#hito-<id>`) y activa el flash visual `:target` existente (DESIGN.md §5).
- En `<head>` de [`BaseLayout.astro`](../../../src/layouts/BaseLayout.astro): dos `<link rel="alternate">` para autodiscovery. Cualquier lector RSS que apunte a una página del sitio detecta ambos feeds automáticamente.
- En el footer: nueva columna "Suscribirse" con los dos enlaces visibles. Grid del footer pasa de 4 → 5 columnas en desktop y a 3 cols en breakpoint intermedio (≤1080px), manteniendo 2 cols en mobile.

## Estado actual

- 50 hitos por feed (cubre ~3-6 meses al ritmo actual).
- Cada item con:
  - `title` prefijado `[Caso · Tipo procesal] Título del hito` para que un lector entienda contexto sin abrir el enlace.
  - `link` a `/casos/<slug>#hito-<hito-id>` — deep-link al hito concreto en la cronología.
  - `id` / `guid` con esquema Tag URI (RFC 4151): `tag:presuntamente.org,YYYY-MM-DD:hito/<slug>`. Estable e independiente de la URL.
  - `published` / `updated` / `pubDate` a partir de `Hito.fecha`, fijando mediodía UTC del día.
  - `category` con el `tipo` del hito y otra con `caso_id` / nombre mediático.
  - `summary` / `description` con la `Hito.descripcion` aplanada a texto plano, truncada a 600 caracteres. Si el hito no tiene `descripcion`, se usa `titulo`.
- Sin filtro por `estado_publicacion` (el resto del sitio tampoco filtra hoy).
- Sin variante catalana todavía (`// TODO i18n` en `feed.ts`).

## Decisiones editoriales y aprendizajes

### Por qué dos formatos en lugar de uno

Atom 1.0 es técnicamente superior (timestamps ISO 8601 obligatorios, `id` distinto de `link`, contenido tipado), pero buena parte del ecosistema de periodistas y agregadores sigue asumiendo RSS 2.0. El coste de mantener ambos es marginal (fuente de datos compartida; el XML cambia en ~30 líneas) y elimina fricción de adopción.

### Por qué exclusivamente "hitos" y no "casos"

Un caso vive años; sus actualizaciones son los hitos. Un feed por casos repetiría el mismo entry cada vez que entrara un hito nuevo. Un feed por hitos da una sola publicación por evento procesal, que es lo que un periodista oncall quiere saber: "hay novedad en X causa".

### Por qué `FEED_LIMIT = 50`

Cubre ~3-6 meses al ritmo actual del inventario (~10-15 hitos nuevos/mes en período activo). Suficiente para que un lector que se suscribe encuentre contexto reciente sin reventar el XML. Si en el futuro se quiere catálogo histórico completo, se puede añadir un endpoint paginado.

### Por qué Tag URI como `id` y no la URL

Permite cambiar la estructura de URLs (p. ej. migrar `/casos/<slug>#hito-<slug>` a `/casos/<slug>/hito/<slug>` cuando un hito merezca ficha propia) sin que los agregadores reciban duplicados. La fecha en el Tag URI es la fecha del hito, no la de generación del feed — el `tagId` es así idempotente.

### Por qué mediodía UTC en los timestamps

Los YAML guardan sólo fecha (`YYYY-MM-DD`), no hora. Cualquier `00:00:00` o `23:59:59` cruzaría día en alguna zona horaria. El mediodía UTC es conservador y consistente.

### Por qué no filtramos por `estado_publicacion`

El resto del sitio (`PgCasos`, `PgCasoDetalle`, etc.) tampoco lo hace hoy, y todo el inventario está en `borrador` durante el MVP. Si en el futuro se activa un gate site-wide por `publicado`, el feed lo hereda sin cambios. Mantener el filtro aquí, sólo, introduciría una divergencia silenciosa.

### Por qué hubo que añadir `id` al componente `Hito.astro`

Antes del feed, la cronología de la ficha del caso no exponía anclas a hitos concretos (sólo a la sección §5 vía `SectionH`). Para que el feed pudiera deep-linkear, se añadió la prop opcional `id` que renderiza `id="hito-<slug>"` en el contenedor del item. Esto activa además el flash visual `:target` (DESIGN.md §5): el lector aterriza con el hito resaltado en mostaza claro durante ~2,6 s — feedback visual inmediato de "estás aquí".

## Ideas futuras

### v1.x — sin compromiso

- **Feed por caso individual** (`/casos/<slug>/feed.xml`) — los periodistas que cubren un caso concreto se suscribirían sólo a sus actualizaciones, sin ruido del resto. Re-usa `getFeedItems` con filtro extra. Coste bajo si se prioriza.
- **Filtro por familia procesal** — feeds dedicados a hitos `jurisdiccionales` / `políticos` / `mediáticos`. Útil si la audiencia se segmenta.
- **WebSub / PubSubHubbub** — notificación push a hubs (Superfeedr, FeedBurner) para que los lectores reciban actualizaciones en segundos en lugar de hacer poll cada hora. Sólo si el volumen lo justifica.
- **Variante catalana** (`/cat/feed.xml`) — pendiente del activado de i18n nativo.

### Sin compromiso

- **Endpoint paginado del histórico completo** — para investigadores reconstruyendo cronologías largas vía feed (improbable: para eso ya está el sitio + Pagefind + repo público).
- **JSON Feed 1.1** (`/feed.json`) — formato moderno paralelo a Atom. Lectores que lo soportan son nicho.

## Pendientes operativos

- [ ] Tras la activación pública del dominio + Cloudflare Pages, verificar el feed en 2-3 lectores reales (Feedly, NetNewsWire, Thunderbird).
- [ ] Cuando se active analítica (Cloudflare Web Analytics, Bloque E del ROADMAP), comprobar el ratio de descargas `/feed.xml` vs `/rss.xml` para decidir si conviene retirar RSS legacy en el futuro.
- [ ] En servidor estático (Cloudflare Pages), añadir `_headers` para forzar `Content-Type: application/atom+xml` / `application/rss+xml` en lugar del `text/xml` por defecto que sirve `astro preview` y posiblemente Pages. No bloqueante (los lectores funcionan con `text/xml`).
