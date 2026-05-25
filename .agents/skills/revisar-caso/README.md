# Skill `revisar-caso` — v0

Auditoría editorial cualitativa por LLM de un caso del inventario `presuntamente.org`. Cubre el hueco entre `pnpm validate` (capa schema, mecánica) y la revisión humana final del maintainer.

Sirve para dos usos simultáneos:

- **Auto-revisión** del propio maintainer o de agentes paralelos cuando se trabajan varios casos a la vez sin parar a comprobar todo manualmente.
- **Revisión de PRs externas** de contribuyentes anónimos: `gh pr checkout <num>` en local + `/revisar-caso <slug>` en la working copy de la PR.

No auto-fix. La skill sólo señala con clasificación `BLOQUEANTE` / `SUGERENCIA` / `OK`; la decisión final sigue siendo humana.

Se invoca con `/revisar-caso <slug-del-caso>`.

## Alcance v0

Sólo **capa B** del diseño de cuatro capas (auditoría editorial cualitativa). Las otras tres quedan fuera:

- **Capa A** (schema / V-rules mecánicas) ya está cubierta por `pnpm validate`.
- **Capa C** (verificación externa de fuentes: URLs vivas, contenido del enlace) queda para v2+: es la capa más frágil (falsos positivos por paywall, redirects, cambios de URL).
- **Capa D** (integración con PRs externas) es invocación manual desde el Mac del maintainer (`gh pr checkout` + `/revisar-caso`); no GitHub Action.

Diseño completo en [ROADMAP.md → "Después de Fase 1 — antes de Fase 2"](../../../ROADMAP.md#después-de-fase-1--antes-de-fase-2).

## Documentos de referencia

- Reglas P-01..P-10 anti-desinformación: [doc 02 — "Reglas anti-desinformación en presentación"](../../../docs/diseno/02-ficha-de-caso.md#4-reglas-anti-desinformación-en-presentación).
- Principios irrenunciables (lenguaje, presunción de inocencia, sin cuota política): [AGENTS.md → "Principios irrenunciables"](../../../AGENTS.md#principios-irrenunciables).
- Modelo de datos y reglas V-01..V-21: [`docs/diseno/01-modelo-de-datos.md`](../../../docs/diseno/01-modelo-de-datos.md).
- Guardarraíles de uso de LLM: [doc 03 — "Uso de LLM para diffs revisables"](../../../docs/diseno/03-estrategia-de-mantenimiento.md#4-uso-de-llm-para-diffs-revisables).
