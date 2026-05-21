# Roadmap por fases

**Estado:** borrador 1.0 · 2026-05-21
**Alcance:** división de la implementación en fases ejecutables. Estimaciones de esfuerzo (broad strokes) y criterios de salida.
**Asume:** docs 01-05 cerrados.

---

## Fase 0 — Preparación (semana 1-2)

**Objetivo:** infraestructura básica del proyecto operativa.

Entregables:
- Compra del dominio `presuntamente.org` (registrador con whois privacy: Cloudflare Registrar o Gandi).
- Repo público en GitHub `davidchicano/presuntamente` (existe, sólo añadir contenido).
- Estructura de carpetas conforme al modelo:
  - `/content/casos/`, `/content/personas/`, `/content/organizaciones/`, `/content/documentos/`, `/content/delitos/`.
  - `/schemas/` con JSON Schemas derivados del modelo.
  - `/scripts/` para validaciones, watchers, builds.
- `CONTRIBUTING.md` con guía editorial detallada.
- `CODEOWNERS` con tu nombre como único maintainer.
- Templates de issue: rectificación, sugerencia de fuente, sugerencia de hito.
- Aviso legal borrador en `LEGAL.md` (texto del doc 04 §8).
- Setup de CI: GitHub Actions ejecutando validaciones del modelo (V-01..V-21 automatizables).
- Setup de Cloudflare Pages apuntando al repo, build vacío sirviendo "página en construcción".

**Criterio de salida:** hay dominio accesible que dice "en construcción", repo con CI verde sobre 0 entidades, y un email `rectificacion@presuntamente.org` operativo.

**Esfuerzo estimado:** 1-2 fines de semana.

---

## Fase 1 — MVP con un caso: Plus Ultra (semana 3-7)

**Objetivo:** un caso completamente fichado, con todas las secciones del doc 02 renderizadas correctamente.

**Caso elegido: Plus Ultra.** Razones:
- Acotado (no es macrocausa con piezas múltiples).
- Hitos recientes (imputación 19 may 2026).
- Permite ejercitar discrepancia fiscalía vs acusación popular.
- Suficientes documentos públicos.
- Sin sentencia firme aún, ejercita el lenguaje de presunción de inocencia.

Entregables:
- YAMLs completos del caso Plus Ultra:
  - 1 `Caso` (sin piezas hijas, plano).
  - 4-8 `Persona` implicadas (figuras públicas + algún privado si aplica).
  - 5-10 `Organizacion` (juzgado, fiscalía, partidos como querellantes, SEPI, Plus Ultra empresa, Manos Limpias).
  - 8-15 `RolEnCaso`.
  - 8-15 `Hito`.
  - 15-25 `Hecho` (acreditados, investigados, contrapuestos, exculpatorios si aplica).
  - 10-20 `Documento`.
- 1 `Delito` mínimo (catálogo de referencia con los aplicables).
- Plantilla Astro de ficha de caso renderizando todas las secciones del doc 02.
- Componentes para: cronología vertical, lista de personas con micro-swimlane, Hechos clasificados por tipo, biblioteca de documentos.
- Pagefind indexando el caso.
- Página principal con listado básico (un solo caso).
- Aviso legal completo en `/aviso-legal` y rectificación funcional en `/rectificar`.
- Branding visual mínimo viable (puede ser placeholder gov-retro inicial; cierre con skill design en paralelo).

**Criterio de salida:** la ficha de Plus Ultra es publicable y un lector frío sale entendiendo el caso con todas las garantías editoriales del doc 02. Una persona ajena al proyecto la revisa y no encuentra afirmaciones sin fuente.

**Esfuerzo estimado:** 4-6 fines de semana.

---

## Fase 2 — Crecer a 5-6 casos vivos (semana 8-16)

**Objetivo:** validar el modelo y la operativa contra casos diversos.

Casos a inventariar (en este orden):

1. **Begoña Gómez** — testea trayectoria persona con desimputaciones, AP que corrige, múltiples piezas internas.
2. **Koldo / Mascarillas / Ábalos** — testea macrocausa con piezas (`Caso` recursivo), múltiples investigados, comparecencias en Senado.
3. **Santos Cerdán** — testea conexión `derivado_de` con Koldo.
4. **González Amador** — testea pendiente de juicio, fraude fiscal, conexión con FGE.
5. **Fiscal General / García Ortiz** — testea sentencia firme reciente, conexión con caso previo.

Entregables:
- YAMLs de los 5 casos.
- Validación del modelo en producción: si algún `Hecho` o `Hito` no encaja, retroalimenta el modelo y se actualiza el schema (con doc 01 actualizado y versionado).
- Mejoras de UI según se descubren casos: visualización de conexiones entre casos (Koldo → Cerdán; Amador → FGE).
- Página principal con listado real, filtros básicos.
- Generación de Open Graph cards para compartir social.

**Criterio de salida:** 6 casos en producción, navegables, citables, sin validaciones rotas en main. Modelo confirmado o ajustado.

**Esfuerzo estimado:** 6-10 semanas trabajando fines de semana.

---

## Fase 3 — Visualización de conexiones + watchers (semana 17-22)

**Objetivo:** introducir grafo y automatización de detección de cambios.

Entregables:
- Mini-grafo de conexiones entre casos en cada ficha que tenga `RelacionEntreCasos`.
- Página `/grafo` con grafo global de todos los casos y sus conexiones.
- Watchers operativos (GitHub Actions con cron):
  - CENDOJ scraper.
  - CGPJ Sala de prensa parser.
  - Prensa multi-medio (RSS + filtros).
- Bandeja de señales: issues automáticos cuando un watcher detecta algo.
- Panel de admin básico (`/admin/`) con basic auth: bandeja de señales, casos por revisar, V-17 pendientes.
- Pipeline LLM-assisted para extraer Hitos de autos PDF (doc 03 §4) — script local que prepara borradores de PR.

**Criterio de salida:** el maintainer tiene visibilidad de qué cambia sin leer prensa, y los watchers producen señales útiles. Backlog de señales gestionable.

**Esfuerzo estimado:** 4-6 semanas.

---

## Fase 4 — Apertura editorial controlada (semana 23-30)

**Objetivo:** convertir el proyecto en colaborativo sin perder rigor.

Entregables:
- Identificar 2-3 personas de confianza con interés en derecho o periodismo de investigación.
- Añadirlas a `CODEOWNERS` en zonas concretas (ej. casos catalanes → revisor con conocimiento del TSJ Cataluña).
- Establecer protocolo de review: 1 maintainer + 1 reviewer para PRs no triviales.
- Mejorar el template de issue de sugerencia de fuente: que sea utilizable por cualquier ciudadano.
- Publicar la guía editorial completa con ejemplos.
- Casos adicionales que validen el modelo en jurisdicciones distintas:
  - **3% / Pujol** (TSJ Cataluña, lengua cooficial).
  - **ERE Andalucía** (histórico firme, condenas y absoluciones, revisión TC).

**Criterio de salida:** el proyecto puede recibir PRs externos y procesarlos en plazo razonable; >10 casos publicados; al menos 3 maintainers/reviewers activos.

**Esfuerzo estimado:** 6-8 semanas, con componente de comunicación social.

---

## Fase 5 — Evoluciones futuras (post-año 1)

Lista no priorizada, a evaluar en función de tracción:

- **UI web para contribuir** sin saber git: formulario que abre PR por debajo.
- **Multiidioma** (catalán, euskera, gallego; opcionalmente inglés para difusión internacional).
- **API pública** con queries sobre los datos (rate-limited, sin login).
- **Newsletter** con resumen mensual de hitos en casos vivos.
- **Versión PDF imprimible** de fichas y de cronologías.
- **Asociación constituida** (opción C del doc 04 §7) como evolución del responsable legal.
- **Donaciones** vía Open Collective u Open Source Donations a la asociación.
- **Versión móvil dedicada / PWA**.
- **Casos históricos profundos** (Gürtel macrocausa completa, ERE en toda su extensión, Filesa como pieza histórica).

---

## Criterios de decisión por fase

Antes de pasar de una fase a la siguiente, validar:

- Toda CI verde en main.
- Backlog de bandeja de señales < N items (N escala con número de casos, ej. 2× número de casos vivos).
- Cero rectificaciones pendientes con plazo vencido.
- Cero violaciones de V-17 sin acción.
- Performance budget cumplido (<2s LCP en 3G).
- **Tu propio ánimo y disponibilidad para seguir.** Si en Fase 2 ves que se come fines de semana enteros sin compensación, parar a recalibrar antes de Fase 3.

---

## Esfuerzo total estimado (broad strokes)

| Fase | Duración | Esfuerzo aprox. |
|------|----------|------------------|
| 0 — Preparación | 1-2 semanas | 1-2 fines de semana |
| 1 — MVP Plus Ultra | 4-6 semanas | 80-120h |
| 2 — 6 casos vivos | 6-10 semanas | 120-200h |
| 3 — Grafo + watchers | 4-6 semanas | 80-120h |
| 4 — Apertura editorial | 6-8 semanas | 120-160h |

**Total fase 0-4:** 6-9 meses de fines de semana. Asumible para una persona con dedicación de hobby serio.

---

## Decisiones que conviene tomar antes de Fase 1

1. **Confirmar compra del dominio** y registrador.
2. **Decidir stack final**: Astro confirmado (recomendado) o alternativa.
3. **Decidir hosting**: Cloudflare Pages confirmado o alternativa.
4. **Decidir licencia del contenido**: CC BY-SA 4.0 (recomendada) o alternativa.
5. **Identificación del responsable**: opción A confirmada (tú, identificado) — ya alineado con doc 04.
6. **Disclaimer y aviso legal**: borrador del doc 04 §8 revisado idealmente con un abogado antes de lanzar Fase 1.
7. **Branding visual gov-retro**: arrancar plan paralelo con skill design.

---

## Cierre del análisis y diseño

Los 6 documentos de diseño cubren el ciclo completo:

- **01** — Modelo de datos conceptual.
- **02** — Modelo de ficha de caso (UX/contenido).
- **03** — Estrategia de mantenimiento.
- **04** — Riesgos legales y éticos.
- **05** — Arquitectura técnica.
- **06** — Roadmap por fases.

La siguiente acción operativa es:
1. Revisar offline los 6 docs.
2. Confirmar las decisiones listadas en §7 (Decisiones antes de Fase 1).
3. Arrancar Fase 0 cuando estés listo.

En paralelo, abrir plan de branding visual gov-retro con la skill de design.
