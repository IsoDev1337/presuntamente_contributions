# Arquitectura técnica propuesta

**Estado:** borrador 1.0 · 2026-05-21
**Alcance:** stack candidato razonado para construir presuntamente.org. Sin código. Decisiones de alto nivel.
**Asume:** docs 01-04 cerrados.

---

## 0. Requisitos consolidados

De los documentos anteriores, lo que la arquitectura debe satisfacer:

1. **Contenido canónico en Git, validado por CI** (decisión editorial).
2. **Modelo de datos estructurado** (doc 01) — YAML por entidad con validación.
3. **Sitio público estático** o semi-estático, SEO óptimo, mobile-first (doc 02).
4. **Visualizaciones**: cronología, swimlane de roles, mini-grafo de conexiones (doc 02 §3).
5. **Búsqueda full-text** (doc 02 §5).
6. **Sin backend complejo en MVP** — un static site con search-client es suficiente.
7. **Mecanismo de rectificación** vía issue/formulario (doc 04 §6).
8. **Watcher pipeline** para detección de cambios (doc 03 §2).
9. **Panel de admin** protegido (doc 03 §6).
10. **Hosting de coste razonable y self-hostable** si hace falta.

---

## 1. Componentes y stack propuesto

### 1.1 Repositorio canónico y modelo

- **Git + GitHub** como sustrato.
- **Contenido**: ficheros YAML por entidad bajo `/content/` con layout jerárquico (`/content/casos/`, `/content/personas/`, etc.).
- **Validación**: **JSON Schema** generado desde el modelo del doc 01, ejecutado en **CI con GitHub Actions** en cada PR. Validaciones de unicidad de referencias, ciclos en `caso_padre_id`, coherencia de Fases vs Hitos, y todas las V-01 a V-21 automatizables.
- Reglas no automatizables (`redaccion_neutra_revisada`, `nivel_relevancia_editorial`) se enforce vía CODEOWNERS + review checklist en el template de PR.

### 1.2 Generación del sitio (SSG)

Tres opciones razonables. Recomendación primero.

**Opción recomendada: Astro.**
- Excelente para sitios content-driven. Output estático por defecto. Soporte de "islas" para visualizaciones interactivas (cronología, swimlane, grafo) usando React, Vue o Svelte sólo donde se necesite.
- Markdown + collections + content schemas nativos — encaja con YAML canónico.
- Mobile-first, SEO out of the box, soporte de View Transitions.
- Comunidad activa, buenos ejemplos para sitios documentales.
- Curva de aprendizaje suave viniendo de cualquier stack JS moderno.

**Alternativa A: Next.js.**
- Más conocido, más pesado para este caso de uso (no necesitamos SSR ni API routes para casi nada).
- Output estático posible con `output: 'export'`, pero menos natural.
- Justificable si más adelante se necesita SSR para personalización (improbable aquí).

**Alternativa B: Eleventy (11ty).**
- Mínimo, casi sin runtime JS. Excelente performance.
- Menos flexibilidad para visualizaciones interactivas; habría que añadir JS aparte.
- Buena opción para reducir surface JS al máximo.

**Por qué Astro y no las otras:** el equilibrio interactividad/peso es justo el que necesitamos. La cronología y el grafo serán JS interactivo; el resto puede ser HTML estático puro. Astro permite ambos sin sobre-ingeniería.

### 1.3 Almacén derivado / índice de búsqueda

- En el `build` del SSG, los YAML se proyectan a:
  - **JSON ligero** por entidad consumido por la página.
  - **Índice de búsqueda** generado por **Pagefind**, 100% client-side. Pagefind tiene mejor performance para sitios documentales y soporte multiidioma; alternativa Lunr si surge alguna incompatibilidad.
- **No hay base de datos en producción** en MVP. El "DB" es el conjunto de YAMLs y el índice derivado.
- Si crece, considerar SQLite generado en build como índice secundario para queries complejas (todavía sin servidor).

### 1.4 Visualizaciones

- **Cronología**: SVG generado en cliente con componente ligero (visx, Observable Plot o propio). Fallback textual obligatorio (doc 02 P-06).
- **Swimlane de roles**: SVG simple, componente React/Svelte propio (~100 líneas). Fallback lista vertical.
- **Mini-grafo de conexiones**: para grafos pequeños (decenas de nodos), SVG con D3-force o componente similar. Para grafos grandes (Gürtel cuando llegue) considerar Cytoscape.js. Versión textual obligatoria.

### 1.5 Watchers / pipeline de detección

- **Scripts en Python o Node.js** ejecutados en **GitHub Actions con cron** (schedule). Salida: issues abiertos en el repo o entradas en fichero `signals.yaml` que el maintainer revisa.
- Watcher de CENDOJ: scraping respetando robots.txt y rate limit.
- Watcher de CGPJ Sala de prensa: parser de RSS.
- Watcher de prensa: RSS + filtros por términos.
- Coste: GitHub Actions con cron es gratuito hasta cierto volumen; nuestro caso encaja.

### 1.6 Panel de admin

- Página estática `/admin/` generada en build, accesible sólo con basic auth a nivel CDN (Cloudflare Pages access rules o equivalente).
- Datos que muestra: lo descrito en doc 03 §6, todo computable desde los YAML.
- Sin login complejo, sin backend.

### 1.7 Hosting

Tres opciones razonables:

**Opción recomendada: Cloudflare Pages + Cloudflare R2** (para PDFs y archivos grandes).
- Gratuito en MVP, escalable, CDN global, soporte de headers para basic auth.
- Buena privacidad por defecto, sin tracking añadido.
- Permite Cloudflare Workers si más adelante se necesita endpoint dinámico (ej. formulario de rectificación con anti-spam).

**Alternativa A: Netlify.**
- Equivalente funcional. Mejor DX en el build local, pero ecosistema menos abierto.
- Coste similar.

**Alternativa B: VPS propio (Hetzner, OVH) con Caddy.**
- Más control, más responsabilidad. Justificable si el sitio crece o si se quiere total independencia de proveedor.
- En MVP, sobre-ingeniería.

**Recomendado:** Cloudflare Pages al inicio, plan de migración a VPS si gana tracción y queremos auto-hospedaje completo.

### 1.8 Dominio y certificado

- **Dominio**: `presuntamente.org` (disponible al inicio del proyecto, pendiente de compra). Registrador con whois privacy: **Cloudflare Registrar** (precio a coste), **Gandi** o **Namecheap**. Cloudflare Registrar es el más simple si ya usamos Cloudflare Pages.
- Recordar: whois privacy NO te exime de identificar al maintainer en el aviso legal (doc 04).
- **Certificado TLS**: gestionado por Cloudflare automáticamente.
- **DNS**: en Cloudflare.

### 1.9 Email

- Buzones: `rectificacion@presuntamente.org`, `contacto@presuntamente.org`.
- Proveedor con privacidad razonable: **ProtonMail** (que ya usas), **Tuta**, **Migadu** (de pago, calidad/precio excelente).
- DKIM/SPF/DMARC configurados para evitar spoofing.

### 1.10 Analítica

- **Plausible** o **Umami** (self-hosted o cloud), sin cookies, GDPR-friendly.
- Nada de Google Analytics. Coherente con la línea de privacidad.
- Métricas a vigilar: páginas más leídas, búsquedas frecuentes, latencia.

---

## 2. Licencias

- **Código del sitio**: AGPL-3.0 (ya elegida).
- **Contenido editorial**: propuesta **CC BY-SA 4.0** — permite reutilización con cita y compartir-igual; alinea con la apertura del proyecto.
- **Documentos almacenados (PDFs de autos, informes)**: la licencia de cada uno es la del documento original; presuntamente sólo los almacena como copia de archivo, citando origen.

---

## 3. Diagrama de alto nivel

```
                    ┌─────────────────────────────────┐
                    │     GitHub Repo (canónico)      │
                    │   /content/*.yaml (modelo doc01)│
                    │   /docs/*       (diseño)        │
                    │   /content/documents/  (PDFs)   │
                    └────────────────┬────────────────┘
                                     │
                          PRs + Actions CI
                                     │
              ┌──────────────────────┼──────────────────────┐
              ▼                      ▼                      ▼
       ┌─────────────┐       ┌───────────────┐      ┌────────────────┐
       │  Validate   │       │  Build (Astro)│      │ Watchers       │
       │  (V-01..21) │       │  → static     │      │ (cron actions) │
       └─────────────┘       │  HTML + JSON  │      │  → issues      │
                             │  + Pagefind   │      └────────────────┘
                             └───────┬───────┘
                                     │
                                     ▼
                             ┌───────────────┐
                             │ Cloudflare    │
                             │ Pages + R2    │
                             └───────┬───────┘
                                     │
                                     ▼
                             ┌───────────────┐
                             │ presuntamente │
                             │     .org      │
                             └───────────────┘
```

---

## 4. Alternativas consideradas y descartadas

- **WordPress / Drupal / CMS PHP**: no se considera. Modelo de datos rígido para fichas estructuradas, riesgo de plugin-hell, hosting más caro, performance peor, anti-línea de "contenido en git".
- **Wiki software (MediaWiki, BookStack)**: ya descartado (decisión editorial doc-conversación).
- **Headless CMS (Strapi, Sanity, Contentful)**: añadiría dependencia de proveedor y separaría contenido del repo. No se necesita para maintainer único.
- **Neo4j / BD de grafo**: descartado en doc 01.
- **PostgreSQL en producción**: no necesario en MVP. Si en algún momento se quiere ofrecer API pública con queries complejas, generar SQLite o Postgres derivado en build.
- **Webflow / Notion publicado**: descartado por falta de control y por no encajar con el modelo en git.

---

## 5. Cuestiones abiertas

1. **CDN provider final**: Cloudflare Pages vs Netlify. Recomendación CFP por privacidad e infraestructura. A confirmar antes de Fase 0.
2. **Anti-spam del formulario de rectificación**: si usamos Cloudflare Workers, hCaptcha o Turnstile son la elección lógica.
3. **Cómo se sirven PDFs grandes**: ¿en R2 con URLs firmadas o públicas? Públicas si el documento es público de origen; firmadas no aporta en MVP.
4. **Backup**: GitHub + mirror en SourceHut o GitLab para evitar single point of failure. Sencillo de configurar.
5. **Performance budget**: <2s LCP en 3G simulada, <100KB JS inicial. Posible con Astro.
6. **Branding visual**: pendiente de diseño con skill `design:design-critique` / `design:design-system` para el look gov-retro. No condiciona la arquitectura.

---

## 6. Siguiente paso

Doc 06 — Roadmap por fases.
