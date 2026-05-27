# Higiene técnica pre-launch

**Entregada:** 2026-05-25 (Bloque E)
**Alcance:** favicon multi-tamaño · sitemap.xml autogenerado · robots.txt · Cloudflare Web Analytics

## Qué hace

Infraestructura de SEO e identidad técnica que es invisible cuando funciona y llamativa cuando falta. Agrupa cuatro elementos independientes pero de naturaleza similar: identificación del sitio en el navegador (favicon), indexación por motores de búsqueda (sitemap + robots.txt) y analítica privada (Cloudflare Web Analytics).

## Piezas técnicas

### Favicon multi-tamaño

Tres formatos complementarios servidos desde `/public/`:

| Fichero | Tamaño | Uso |
|---|---|---|
| `favicon.ico` | 32×32 (ICO) | Navegadores legacy, pestañas |
| `favicon-32x32.png` | 32×32 PNG | Chrome, Firefox modernos |
| `icon.svg` | SVG vectorial | Navegadores que soportan SVG favicon (Chrome 80+, Firefox 41+) |
| `apple-touch-icon.png` | 180×180 PNG | iOS Safari al añadir a pantalla de inicio |

Todos generados desde `/public/branding/logo.png` (1254×1254 RGBA) con `sips` + ImageMagick `magick`. El `apple-touch-icon` usa **fondo blanco** (`-background white -extent 180x180`): iOS muestra el icono como tile cuadrado al añadir a pantalla de inicio; el isotipo transparente necesita un fondo opaco y el blanco encaja con el bloque de marca del header y con la mayoría de wallpapers claros en iPhone.

El `icon.svg` es un wrapper `viewBox="0 0 32 32"` con el PNG 32×32 embebido en base64 (sin referencia externa ni fondo opaco).

Los `<link>` activos en `BaseLayout.astro`: PNG 32×32 → SVG (sin `.ico` en el `<head>`: ImageMagick corrompe el alpha al convertir; el fichero `/favicon.ico` sigue en `/public/` por peticiones directas del navegador, generado con `sips` + `magick` desde el PNG limpio) → apple-touch-icon.

### sitemap.xml

Generado por `@astrojs/sitemap` (integración oficial de Astro). Configurado en `astro.config.mjs`. Genera automáticamente `sitemap-index.xml` + `sitemap-0.xml` con todas las rutas estáticas del build.

- **167 URLs** en el build de 2026-05-25 (7 casos + personas + organizaciones + delitos + páginas institucionales).
- La URL del sitemap está declarada en `robots.txt`: `Sitemap: https://presuntamente.org/sitemap-index.xml`.
- No se necesita configuración manual de exclusiones: las rutas privadas o de build (`/og/`, `/_astro/`) no son páginas Astro, así que el integración no las incluye.

### robots.txt

Fichero estático en `/public/robots.txt`. Política actual: indexación abierta a todos los bots.

```
User-agent: *
Allow: /

Sitemap: https://presuntamente.org/sitemap-index.xml
```

Decisión deliberada no restringir nada en el lanzamiento: el proyecto tiene como misión la máxima difusión del inventario; bloquear bots iría en contra del principio 1 ("reducir desinformación"). Si en el futuro hay razón para bloquear algún crawler abusivo, se añaden entradas específicas por `User-agent`.

### Cloudflare Web Analytics

Script de analítica añadido a `BaseLayout.astro` condicionado a la variable de entorno `CF_ANALYTICS_TOKEN`:

```astro
{import.meta.env.CF_ANALYTICS_TOKEN && (
  <script defer src="https://static.cloudflareinsights.com/beacon.min.js"
    data-cf-beacon={`{"token":"${import.meta.env.CF_ANALYTICS_TOKEN}"}`}></script>
)}
```

- **Sin cookies, sin fingerprinting**: Cloudflare Web Analytics cumple RGPD sin banner de consentimiento.
- **Cero impacto en dev**: si `CF_ANALYTICS_TOKEN` no está en el entorno de build, el script no se emite.
- **Alternativa sin código**: Cloudflare Pages también puede inyectar el script automáticamente desde el panel (toggle "Web Analytics" en el proyecto de Pages), sin necesitar el token en el repo. Ambas opciones son compatibles; se recomienda usar el toggle del panel en producción para no tener el token en el repo ni en las variables de entorno del CI.

## Estado actual

Todo entregado y build verde. 168 páginas + `sitemap-index.xml` + `sitemap-0.xml` (167 URLs) + `robots.txt` + `404.html` + los 4 ficheros de favicon. Cloudflare Web Analytics está activado desde el panel de Pages; no hace falta `CF_ANALYTICS_TOKEN` en el repo.

## Decisiones editoriales y aprendizajes

- **ICO generado con ImageMagick `magick` (no con `convert` que está deprecado en IM v7)**: diferencia sutil pero puede romper scripts CI en sistemas con IM v7.
- **`pnpm add` en el worktree, no en main**: el worktree tiene su propio `package.json` separado; `pnpm add` en el directorio del worktree modifica sólo ese `package.json`, no el del repo principal. Al hacer cherry-pick o merge a main hay que asegurarse de que el `package.json` de main también recibe la nueva dependencia.
- **SVG mascarable con fondo declarado**: sin el `<rect fill="#1a2a4a"/>` el SVG mascarable en Android quedaría con fondo blanco y el escudo transparente se vería mal.
- **Favicon en pestaña: transparencia y formatos (2026-05-26)**: (1) `favicon.ico` generado con ImageMagick desde PNG transparente dejó px con alpha=0 y RGB≠0 → Chrome los pinta negro; se retira del `<head>` (PNG+SVG bastan). (2) `icon.svg` con `<image href="/branding/logo.png">` no carga en contexto favicon — el PNG va embebido en base64. (3) El resize con filtro por defecto (Lanczos) corrompe el alpha al 32×32; **`sips -z 32 32`** (o `magick -filter point`) preserva transparencia. (4) Fondo en favicon de pestaña descartado: el isotipo va sin cuadrado. (5) **`apple-touch-icon`**: el navy del Bloque E se sustituye por blanco (2026-05-26, feedback maintainer) — mismo criterio que la caja de marca del header, no la banda navy del chrome.

## Pendientes operativos

- [x] Activar Cloudflare Web Analytics. **Hecho 2026-05-26** vía toggle del proyecto Pages, sin `CF_ANALYTICS_TOKEN`.
- [ ] Verificar que el sitemap está indexado en Google Search Console y Bing Webmaster Tools tras el lanzamiento.
- [ ] Considerar si el `sitemap-0.xml` debe excluir páginas de bajo valor editorial (`/buscar`, `/og/*`) — hoy el integrador las incluye porque son rutas Astro válidas. Se puede añadir `filter` en la config de `@astrojs/sitemap`.
