# Fases y bloques cerrados

Resumen histórico de fases, lotes y bloques que ya no necesitan ocupar espacio en `ROADMAP.md`.

## Fase 0 - Scaffolding

Estado: cerrada funcionalmente, pendiente de publicación pública bajo dominio.

- Astro 5 + Open Props.
- Schemas JSON iniciales.
- CI y validación local.
- `AGENTS.md` como guía operativa.
- Licencias AGPL-3.0 y CC BY-SA 4.0.
- Estructura `content/`, `schemas/`, `scripts/`, `src/`, `docs/diseno/`.
- Dominio y canales de correo cerrados después, pero la publicación pública sigue como backlog operativo.

## Fase 1.0 - Integración del design system

Estado: cerrada.

### Lote 1 - Tokens, chrome y split landing/catálogo

- `colors_and_type.css` portado a `src/styles/global.css`.
- `PresuntamenteLogo.astro`.
- `BaseLayout.astro` rehecho con chrome ministerial.
- Rutas `/` y `/casos` separadas en wrappers mínimos + componentes `Pg*`.
- Estructura `/src/pages/cat/` preparada.

### Lote 2 - Content Collections + YAML real

- Collections `casos`, `personas`, `organizaciones`, `documentos`, `delitos`, `glosario`, `hitos`, `hechos`, `roles`, `relaciones`.
- Zod schemas mínimos con `.passthrough()`.
- `/casos` conectado a datos reales.
- Filtros de catálogo activados con vanilla JS.

### Lote 3 - Ficha de caso

- `PgCasoDetalle` implementado.
- Componentes compartidos: `SectionH`, badges, `CalGlyph`, `Cite`, `OrgGlyph`, cards, `Hito`, `Hecho`, `DocumentoCard`.
- Ficha en secciones: resumen, estado procesal, personas, organizaciones, cronología, hechos, biblioteca y cómo se ha redactado.

### Lote 4 - Resto de páginas

- `/personas` y `/personas/[slug]`.
- `/organizaciones` y `/organizaciones/[slug]`.
- `/biblioteca`.
- `/sobre`.
- Estructura catalana paralela.

### Lote 5 - Validación final + Pagefind

- Pagefind integrado.
- `data-pagefind-body` en `<main>`.
- Página `/buscar`.
- Header con buscador.
- Build `astro build && pagefind --site dist`.

## Fase 1 - MVP Plus Ultra

Estado: cerrada para MVP, con pendientes futuros condicionados a nuevos primarios.

- Schemas principales cerrados con reglas V mecánicas.
- Skill `incorporar-hito` v0 y posterior v1.
- Caso Plus Ultra arrancado:
  - Caso raíz.
  - Personas y organizaciones principales.
  - Roles iniciales.
  - Hitos y hechos principales.
  - Delitos aplicables.
  - Documentos N4 y primarios cuando estuvieron disponibles.
- Página `/aviso-legal`.
- Página `/rectificar`.
- `NOTES.md` por caso como anotación interna.

## Entre Fase 1 y Fase 2

Estado: cerrado.

- Skill `investigar-caso` v0.
- Issue templates.
- `CODEOWNERS` placeholder.
- `LEGAL.md` raíz como índice corto.
- `/sobre` ampliada con glosario del modelo.
- Skill `revisar-caso` v0, luego v1.
- RichProse v1:
  - dinero abreviado
  - diccionario de organizaciones
  - diccionario de personas
  - diccionario de delitos
  - escape hatch
  - exclusiones anti autoenlace
- Catálogo `/delitos`.

## Fase 2 - Crecer a 5-6 casos vivos

Estado: en marcha, pero los primeros seis casos publicables están entregados.

### Begoña Gómez

- PR1: arranque con patrón `investigado -> desimputado`.
- PR2: acusaciones populares, UCM perjudicada y ampliación de hitos.
- PR3: Juan José Güemes, nuevos hitos 2025-2026 y `escrito_conclusiones_provisionales`.
- Pasada posterior: vínculos institucionales iniciales.
- Pendientes: primarios no publicados, hito software >500.000 euros, resoluciones nuevas y hallazgos de cobertura.

### González Amador

- PR1: fraude fiscal y falsedad documental sobre Maxwell Cremona.
- PR2: pieza Quirón.
- PR3: BOE N1, cambio de juez, encomienda UCO, Maxwell Cremona como persona jurídica procesada y administración desleal.
- Pendientes: auto AP Madrid 7-nov, informe UCO, conexiones adicionales.

### Fiscal General del Estado

- PR1: caso con sentencia firme y relación con González Amador.
- PR2: primarios descargados y promoción de hechos acreditados.
- PR3: tribunal completo y hechos acreditados adicionales.
- Primer caso con condena firme del inventario.

### Kitchen

- PR1: pieza Kitchen, caso raíz autónomo y cadena triple de Cospedal.
- PR2: Ignacio López del Hierro y Sergio Ríos.
- Pendientes: otros agentes procesados, apertura juicio oral y URLs N4 específicas.

### Lezo

- PR1 a PR7 entregados.
- Caso multi-pieza con golf, Inassa, Emissao, Navalcarnero, archivo Ruiz-Gallardón y ático Estepona como caso conexo.
- Pendientes: sentencia Inassa, señalamiento Navalcarnero, procesados/desimputados menores.

## Bloques pre-launch cerrados

### Bloque A - Casos equilibrados

- Kitchen incorporado.
- Lezo incorporado.
- Convención de primarios descargados aplicada retrospectivamente.

### Bloque B - Revisión editorial LLM

- `revisar-caso` implementada y probada.
- Primera auditoría sobre 6 casos.
- Bloqueantes y sugerencias críticas resueltos.

### Bloque E - Higiene técnica

- Favicon.
- 404.
- Sitemap.
- Robots.
- Meta tags.
- Cloudflare Web Analytics.

## Features cerradas con ficha propia

- [`../web/pages/cifras.md`](../web/pages/cifras.md)
- [`../web/pages/aportar.md`](../web/pages/aportar.md)
- [`../web/pages/404.md`](../web/pages/404.md)
- [`../web/features/feed-rss-atom.md`](../web/features/feed-rss-atom.md)
- [`../web/features/og-images.md`](../web/features/og-images.md)
- [`../web/features/timeline-visual.md`](../web/features/timeline-visual.md)
- [`../web/features/aporte-editorial.md`](../web/features/aporte-editorial.md)
- [`../web/features/sintesis-caso.md`](../web/features/sintesis-caso.md)
- [`../web/features/estado-ficha-caso.md`](../web/features/estado-ficha-caso.md)
- [`../web/features/higiene-tecnica.md`](../web/features/higiene-tecnica.md)
