# Página /cifras

> Componente: [`src/components/pages/PgCifras.astro`](../../../src/components/pages/PgCifras.astro) · Wrapper: [`src/pages/cifras/index.astro`](../../../src/pages/cifras/index.astro)

Dashboard agregado del inventario. Origen en el Bloque D "Features de enganche para v1" del ROADMAP. Entregada en main el 2026-05-24.

## Estado actual

Dashboard estático 100% derivado del build, sin filtros ni JS dinámico. Nueve secciones numeradas (`<SectionH>`) más un sello institucional inicial con el volumen agregado.

- **Sello inicial** — 8 cifras grandes (casos · personas · organizaciones · documentos · hitos · hechos · roles · delitos).
- **Sección 1: Estado procesal de las personas** — 4 KPIs (imputados activos · condenados firme · desimputados vigentes · personas multi-caso) + distribución de asignaciones de rol con `RolBadge`.
- **Sección 2: Distribución de casos** — por fase con `PhaseBadge` + ranking de casos por densidad documental (hitos / implicados activos / documentos), ordenado por hitos ↓.
- **Sección 3: Documentos y fuentes** — 4 KPIs (total · primarios descargados con SHA-256 · cobertura archive.org · % N4 archivado) + distribuciones por nivel (con `LevelBadge`) y por tipo.
- **Sección 4: Hechos y carga editorial** — grid 2-col: por estado epistémico (con `EpistemicBadge`) y por vigencia (incluye conteo de `corregido_por`).
- **Sección 5: Hitos del inventario** — 4 KPIs (total · últimos 12 meses · jurisdiccionales · políticos+mediáticos) + último hito linkado a la ficha + top 10 tipos.
- **Sección 6: Organizaciones citadas** — por tipo.
- **Sección 7: Delitos catalogados y atribuidos** — por familia + top 8 atribuciones en roles (linkado a `/delitos/<slug>`).
- **Sección 8: Conexiones y referencias auxiliares** — total de `RelacionEntreCasos` + total de entradas de glosario.
- **Sección 9: Notas metodológicas** — definiciones operativas, recordatorio de presunción de inocencia, links a páginas de documentación completa.

CTA "Ver todas las cifras →" en el pie del sello del hero de `PgInicio` (puente desde la portada).

Wrapper `.cifras-head` agrupa `page-id` + `sello` en un único item de grid para evitar el hueco que el `PageToc` (con `grid-row: 1 / -1`) introducía en la primera fila cuando el primer hijo era de poca altura.

## Ideas futuras

### Refactor mayor — dos vistas separadas (propuesta 2026-05-24)

El feedback del maintainer al cerrar la v1 sintetiza el problema: **las cifras de inventariado actuales son interesantes para periodistas, contribuyentes y auditores editoriales del proyecto, pero no le interesan al ciudadano medio**. Lo que enganchaba a la gente sería ver cifras y gráficos del estilo "dinero presuntamente desviado", "personas con más importe atribuido", "comparativa por partido". La idea para la siguiente iteración mayor:

- **Vista A — Inventario** (la actual): meta-cifras del proyecto, fases procesales, niveles de fuente, carga editorial, ranking por densidad documental. Audiencia: maintainer + periodistas + contribuyentes. Es la "memoria del proyecto".
- **Vista B — Para la gente** (nueva): cifras y gráficos centrados en el impacto social presunto. Audiencia: visitante general que entra desde X / WhatsApp. Es el gancho narrativo.

Toggle visible en lo alto de la página (con la vista B como default si se confirma que es la principal expectativa al entrar). Manteniendo la misma URL `/cifras` o separando en `/cifras` (B) y `/cifras/inventario` (A).

#### Bocetos de la Vista B — "para la gente"

Cifras candidatas a explorar:

- **Importe total presuntamente atribuido en procedimientos abiertos** — agregación del importe atribuido por la acusación / instrucción en cada caso. Necesita campo nuevo `importe_presunto_perjuicio` en `Hecho` o en `Caso` (no existe hoy — el campo `resumen_cifras` es texto libre). **Proyecto con brief ejecutable** (modelado en `Hecho`, guardarraíles, fases): [`importe-presunto.md`](../features/importe-presunto.md).
- **Top personas por importe presuntamente atribuido en causa abierta** — ranking de personas con rol procesal activo ordenadas por importe asociado a los Hechos de los casos en que figuran. Sólo personas con rol formal (ver AGENTS.md — "Principios irrenunciables", punto sobre no exposición innecesaria de personas privadas).
- **Distribución por organización política** — partidos, ex-cargos por partido, dinero atribuido a procedimientos donde aparecen miembros activos o pasados. Requiere modelar la **vinculación formal persona ↔ partido en el momento de los hechos** (no la simpatía percibida) — campo nuevo en `Persona` o tabla intermedia `MilitanciaPartido` con `desde`, `hasta`, `cargo`. Pendiente decidir.
- **Timeline de incoaciones por año** — gráfico de barras con número de Hitos `imputacion` / `auto_procesamiento` por año.
- **Sankey de transiciones procesales** — flujo `investigado → procesado → condenado_firme | absuelto | desimputado`. Visualiza cuántos llegan a sentencia firme vs cuántos se archivan.
- **Treemap de familias de delito** — proporción de delitos catalogados por familia.
- **Tiempo medio de instrucción** — desde el primer Hito hasta `apertura_juicio_oral` o `archivo_*`. Métrica de eficacia jurisdiccional, no de culpabilidad.

#### Decisiones editoriales pendientes (importante — afectan al modelado)

Esta vista tiene **tensiones graves con los principios irrenunciables** ([`AGENTS.md`](../../../AGENTS.md)) que conviene resolver ANTES de empezar a implementar, no a mitad de camino:

1. **Lenguaje. Presunción de inocencia en el lenguaje.** "Dinero robado" o "top personas que más han robado" son frases prohibidas para hechos no acreditados. La versión éticamente compatible es más fea pero correcta: *"importe presuntamente desviado según el escrito de acusación"*, *"personas con mayor importe atribuido en procedimientos abiertos"*, *"partidos cuyos miembros con rol formal acumulan mayor importe atribuido"*. Decidir el vocabulario canónico antes de implementar y testarlo con la skill `revisar-caso`. Aceptar que la versión correcta es menos pegadiza — esa es la línea ética del proyecto. Ver [AGENTS.md → "Principios irrenunciables"](AGENTS.md#principios-irrenunciables).

2. **Etiquetado del importe. Cita siempre.** Cada importe agregado debe poderse trazar al Hecho/Documento que lo afirma. Modelar `importe_presunto_perjuicio` como propiedad del `Hecho` (no del `Caso`) para que se herede el sistema de niveles de fuente N1–N4 ya existente. Un importe respaldado por sentencia firme (N1) cuenta distinto a uno respaldado sólo por una acusación popular (N3) o por cobertura periodística (N4). Ver [AGENTS.md → "Principios irrenunciables"](AGENTS.md#principios-irrenunciables).

3. **"Top partidos". Principio de tratamiento sin cuota política.** Cualquier ranking por partido será leído como sesgo por unos y como confirmación por otros, independientemente de la metodología. Tres mitigaciones a aplicar conjuntamente:
   - **Metodología visible y citable** en la propia ficha (cómo se cuenta cada caso, qué requisitos hay para vincular a un partido, cómo se tratan los ex-militantes).
   - **Disclaimers explícitos** sobre lo que el ranking **no** mide: no mide proporción de militantes corruptos vs honestos, no mide tasa per cápita, no implica responsabilidad institucional del partido. Sólo agrega importes presuntamente atribuidos en causas donde aparecen miembros con rol formal.
   - **Datos brutos descargables** (CSV o JSON) para que cualquiera pueda rehacer las cuentas.
   - Anotar el principio: si el dataset no es lo suficientemente diverso (p.ej. tenemos 5 casos PSOE-relacionados y 1 PP-relacionado), **no publicar el ranking** hasta que la cobertura sea representativa. El ranking sesgado por cobertura es peor que no tener ranking. Ver Bloque A del ROADMAP que ya ataca este problema metiendo Kitchen y Lezo antes del lanzamiento.

4. **Filtro temporal y de estado procesal.** Toggle entre "todos los procedimientos abiertos" y "sólo sentencias firmes". Es crucial: sin él, la vista parece afirmar que la suma de presuntos es dinero real desviado.

5. **Modelado prerequisito.** Antes de tocar la vista, decidir:
   - `Hecho.importe_presunto_perjuicio: number | null` + `Hecho.importe_unidad: "€" | "USD" | ...` + el patrón ya conocido de `niveles_fuente` heredado.
   - Modelo de vinculación persona↔partido en el momento del hecho (no es trivial: Cospedal era PP en Kitchen pero su rol procesal es personal, no del partido; idem Begoña Gómez con PSOE).
   - Snapshot histórico mensual para poder hacer la comparativa temporal sin perder el dato cada build.

6. **Si la vista B se acaba implementando, vivirá la decisión editorial de TODA la presentación pública del sitio.** Sería el cara visible cuando alguien comparte el sitio en X. El maintainer + revisión humana del Bloque C deberían firmar copy y disclaimers explícitamente antes de publicar.

### Sin compromiso — más pequeño

- **Comparativa temporal** — comparar las cifras actuales con la foto del mes pasado / hace un año. Requiere snapshot histórico (no lo guardamos hoy; cada build recalcula). Si interesa, generar un dump JSON al final del build y commitear a una carpeta `data/snapshots/YYYY-MM.json`. Mismo prerequisito que la Vista B punto 5.
- **Filtro por caso en la Vista A** — cifras agregadas restringidas a uno o varios casos seleccionados (querystring `?caso=plus-ultra,kitchen`). Útil cuando el inventario crezca a 20+ casos y la vista global se sature.
- **Cifras de cobertura mediática** — agregaciones específicas para preparar el barómetro de sesgo del Bloque D: % de N4 por orientación editorial de la organización productora. Requiere antes el campo `orientacion_editorial` en el schema de Organización (decisión pendiente del propio Bloque D).
- **Sparkline de actividad** — micro-gráficos inline en cada fila del ranking de casos mostrando ritmo de hitos a lo largo del tiempo.
- **Ranking de personas más expuestas mediáticamente** — top de personas por número de Hitos en los que aparecen como afectadas. Tensión con el principio de no exposición innecesaria de personas privadas (ver AGENTS.md — "Principios irrenunciables"): solo personas con rol formal procesal.

### Decisión de implementación (cuando llegue)

Antes de añadir cualquier librería de charts pesada (D3 / observable-plot / nivo / chart.js), evaluar si los gráficos previstos se pueden hacer con **SVG inline generado en build sin runtime JS** — alcanza para barras, sparklines, sankeys sencillos y treemaps básicos. Mantener el sitio estático y ligero es coherente con el espíritu del proyecto. Si llega un caso (mapa coroplético interactivo, sankey complejo con tooltips) que exige runtime JS, evaluar entonces.

## Aprendizajes y decisiones editoriales

- **Lenguaje cuidadoso en los KPIs** — `Investigados / procesados / acusados activos` se agrupa en un único KPI porque el agregado bruto "67 imputados" es engañoso cuando una misma persona acumula tres roles consecutivos en el mismo caso. Se cuentan personas únicas, no asignaciones de rol.
- **Notas metodológicas en la sección 9** — bajan el riesgo de citas descontextualizadas de las cifras (un periodista podría leer "27 investigados activos" y escribir "hay 27 corruptos" — esa sección corta esa lectura explícitamente).
- **Sin emojis ni iconos extra** — la página usa estrictamente los badges existentes (`PhaseBadge`, `LevelBadge`, `RolBadge`, `EpistemicBadge`) para no introducir un nuevo dialecto visual.
- **Sin filtros / sin JS reactivo** — la página es 100% generada en build. Esto la hace cacheable y rápida; cualquier dinamismo futuro debería pesarse contra ese trade-off.

## Pendientes operativos

- [ ] Repaso de copy en la revisión humana pre-launch del Bloque C (el sub del `page-id` menciona "/content/", quizá demasiado técnico para visitante general).
- [ ] Entrar automáticamente al `sitemap.xml` cuando se active la integración del Bloque E.
- [ ] Revisar si conviene un OG image específico de `/cifras` con las 4 cifras grandes del sello (Bloque D `Social cards`).
