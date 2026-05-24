# Fichas por feature transversal

Una ficha por **feature transversal** del sitio: cosas que no son una página concreta sino capacidades que cruzan varias páginas o sirven a un caso de uso completo (feed sindicado, búsqueda full-text, sistema de citaciones inline, sistema de badges, archivado automático en archive.org, generación de social cards, etc.).

Es el equivalente a [`docs/web/pages/`](../pages/) pero para features. Una página corresponde a una ruta del sitio (`/cifras`, `/casos`, `/aviso-legal`); una feature corresponde a una capacidad (`feed-rss-atom`, `pagefind-busqueda`, `richprose-citaciones`, `archive-org-pre-commit`).

Cada ficha recoge:

- **Qué hace** — descripción operativa en una frase.
- **Para qué sirve** — caso de uso y audiencia objetivo.
- **Cómo funciona** — piezas técnicas implicadas (archivos, endpoints, hooks, componentes).
- **Estado actual** — qué hay implementado hoy, alcance y límites.
- **Decisiones editoriales y aprendizajes** — porqués no obvios, lecciones de implementación.
- **Ideas futuras** — propuestas concretas (con o sin compromiso).
- **Pendientes operativos** — TODO menores que no merecen su propio bullet en `ROADMAP.md`.

Sirve para descargar el `ROADMAP.md` global y las páginas Pg* de detalle de implementación: lo específico de una feature vive aquí; el `ROADMAP.md` sólo lleva los hitos transversales y el estado del proyecto.

## Convención de nombres

`<slug-kebab-case>.md`. El slug describe la capacidad, no el archivo de código. Ejemplos:

- `feed-rss-atom.md`
- `pagefind-busqueda.md`
- `richprose-citaciones.md`
- `archive-org-pre-commit.md`
- `og-images-auto.md`

## Cuándo crear una ficha

Cuando aterriza en main una feature **transversal** (no exclusiva de una página) que tenga sustancia suficiente para necesitar contexto que no esté en el código o en el commit. Si la feature cabe en una página concreta, se documenta en `docs/web/pages/<ruta>.md` y aquí no toca.

Norma operativa: **siempre que se entrega o se modifica una feature transversal, actualizar la ficha**. Si la feature aún no tiene ficha, crearla en el mismo commit que entrega la feature. Es parte del cierre de sesión, no opcional.

## Plantilla mínima

```markdown
# <Nombre legible de la feature>

> Archivos clave: `path/a/fichero.ts` · `path/a/otro.astro`

## Qué hace

(una frase)

## Para qué sirve

(audiencia + caso de uso)

## Cómo funciona

(piezas técnicas, flujo de datos)

## Estado actual

(qué hay, qué cubre, qué deja fuera)

## Decisiones editoriales y aprendizajes

(porqués no obvios)

## Ideas futuras

### v1.x — comprometido

### Sin compromiso

## Pendientes operativos

- [ ] …
```
