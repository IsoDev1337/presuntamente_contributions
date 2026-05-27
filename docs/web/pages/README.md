# Backlog y notas por página

Una ficha por página visible del sitio. Cada ficha recoge:

- **Estado actual** — qué hay implementado hoy.
- **Ideas futuras** — propuestas concretas (con o sin compromiso), agrupadas por iteración estimada (v1.1 / v1.x / v2 / sin compromiso).
- **Aprendizajes y decisiones editoriales** — porqués no obvios; lecciones de implementación.
- **Pendientes operativos** — copy a revisar, accesibilidad, etc.

Sirve para descargar el `ROADMAP.md` global: lo específico de una página vive aquí, el roadmap solo lleva los hitos transversales y el estado del proyecto.

**Centralización:** enlaza al canon en lugar de duplicarlo. Ver [AGENTS.md — "Centralización documental"](../../../AGENTS.md#centralización-documental).

Convención de nombres: `<ruta-sin-barra-inicial>.md`. Para la home, `inicio.md`.

Plantilla mínima cuando arranques una ficha nueva:

```markdown
# Página /<ruta>

> Componente: `src/components/pages/Pg<X>.astro` · Wrapper: `src/pages/<ruta>/index.astro`

## Estado actual

(qué hay)

## Ideas futuras

### v1.x — comprometido

### Sin compromiso

## Aprendizajes y decisiones editoriales

## Pendientes operativos
```
