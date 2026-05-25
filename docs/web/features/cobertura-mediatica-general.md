# Cobertura mediática general

> Archivos clave: [`schemas/cobertura-mediatica.schema.json`](../../../schemas/cobertura-mediatica.schema.json) · [`src/content.config.ts`](../../../src/content.config.ts) (collection `coberturaMediatica`) · [`.agents/skills/rastrear-cobertura/SKILL.md`](../../../.agents/skills/rastrear-cobertura/SKILL.md) · directorio `content/cobertura-mediatica/` (vacío en main hasta primer poblado real). · Relacionada con [`composicion-fuentes-citadas.md`](composicion-fuentes-citadas.md).

## Qué hace

Construye un corpus separado de noticias publicadas sobre un caso para analizar volumen, distribución temporal y composición por medios. **No reutiliza** los `Documento` que respaldan Hechos; ese corpus es probatorio y vive en `content/documentos/`. La cobertura mediática general es otra investigación: una muestra sistemática rastreada, deduplicada y archivada que mide cómo se ha hablado públicamente del caso.

## Para qué sirve

Permite estudiar cómo se ha cubierto públicamente un caso más allá de las fuentes que presuntamente.org cita para sostener Hechos. Es la base real para un futuro barómetro de cobertura o sesgo mediático.

Internamente también sirve como autocontrol: si una ficha tiene mucho corpus probatorio pero ningún rastreo de cobertura general, el `estado_ficha` lo declara `pendiente` y el lector lo sabe.

## Cómo funciona

### Modelo

Entidad nueva con schema en [`schemas/cobertura-mediatica.schema.json`](../../../schemas/cobertura-mediatica.schema.json):

- **Una entrada YAML por caso**: `content/cobertura-mediatica/<slug-caso>.yaml`. Estructura: `caso_id` + `fecha_rastreo` + `metodologia{}` + `estado` + `noticias[]`.
- **Metodología declarada**: `terminos_busqueda[]`, `ventanas_temporales[]`, `fuentes_buscadas[]`, `criterios_inclusion`, `criterios_exclusion`, `notas`. Sirve para que el lector entienda los límites del rastreo.
- **Estado del rastreo**: enum `pendiente | parcial | completo` espejando el badge correspondiente del [`estado-ficha-caso.md`](estado-ficha-caso.md) (`cobertura_mediatica_general`).
- **Noticias**: cada item lleva `url`, `medio_id` (apunta a `Organizacion` con `tipo: medio_comunicacion`), `titular` literal, `fecha_publicacion`, `autor` opcional, `resumen` neutro, `url_archivo` (snapshot archive.org), `tipo_pieza` (enum cerrado de 11 formatos), `relevancia_editorial` (enum), `pieza_referenciada_id` (para dedup de republicaciones), `menciones[]` (titular/lead/cuerpo/destacado/pie_foto), `fecha_rastreo`, `notas`.
- **No clasifica orientación editorial del medio.** Esa decisión vive (cuando exista) en `Organizacion.orientacion_editorial`, fuera del scope de esta entidad y de esta skill. La feature hermana [`composicion-fuentes-citadas.md`](composicion-fuentes-citadas.md) será la que use esa clasificación.

### Skill productora

[`/rastrear-cobertura <slug-caso>`](../../../.agents/skills/rastrear-cobertura/SKILL.md) v0 — pensada para correr en sub-agente paralelo en un git worktree dedicado. La skill diseña los términos a partir del propio caso, declara las ventanas, busca con `WebSearch` por fuente, archiva en `web.archive.org`, deduplica republicaciones marcando `pieza_referenciada_id`, tipifica con el enum cerrado, y al cerrar actualiza el `estado_ficha.cobertura_mediatica_general` del Caso.

### Próximo paso

Una vez existan corpus poblados en al menos un caso piloto, los posibles renders en UI:

- Línea de tiempo de cobertura por caso (densidad por mes, picos coincidiendo con hitos jurisdiccionales).
- Tabla por medio con conteo, último titular y `relevancia_editorial` agregado.
- Vista comparativa "cobertura citada por presuntamente.org" vs "cobertura general rastreada" — útil para la auto-evaluación editorial.

## Estado actual

**Base entregada en main el 2026-05-25.** Schema canónico + collection en `content/cobertura-mediatica/` + skill `/rastrear-cobertura` v0 + ficha actualizada. **Datos vacíos** — los poblará un sub-agente paralelo lanzado por el maintainer con la skill, en un git worktree aislado. Render en UI pendiente de la primera oleada de datos reales.

## Decisiones editoriales y aprendizajes

- **Es otra investigación, no un derivado automático.** Buscar "todas las noticias" exige metodología, ventanas temporales, deduplicación y criterios de inclusión.
- **"Todas" es una promesa peligrosa.** El schema obliga a `terminos_busqueda` y `ventanas_temporales`; nunca se afirmará "todas las noticias publicadas", siempre "muestra sistemática rastreada en estas ventanas".
- **Separar corpus judicial de corpus mediático.** Los `Documento` que respaldan `Hecho` siguen en `content/documentos/`; la cobertura general no debe inflar artificialmente la biblioteca probatoria.
- **La métrica debe evitar convertir ausencia de cobertura en intención.** Que un medio no cubra algo puede significar agenda, falta de recursos, paywall, duplicación de agencia, baja relevancia editorial o error de rastreo. La nota metodológica lo declarará explícitamente.
- **Republicaciones de agencia marcadas con `pieza_referenciada_id` + `tipo_pieza: pieza_agencia`.** Esto evita inflar el conteo confundiendo 12 copias del mismo suelto EFE con 12 piezas independientes.
- **Archivado obligatorio en archive.org.** Mismo principio V-13. Excepción: piezas tras paywall duro que archive.org no captura; se anota la limitación y se decide caso a caso con el maintainer.
- **Resumen neutral.** Verbos prohibidos del P-09 vetados también en este corpus. El resumen es un resumen, no un titular alternativo.
- **No usar el corpus para inferir hechos jurisdiccionales.** Si el rastreo descubre algo no modelado todavía, se anota en `NOTES.md` del caso para que la sesión principal lo evalúe con `/incorporar-hito` o `/investigar-caso`.
- **No sustituye a fuentes primarias.** Una ficha puede estar completa judicialmente aunque su cobertura mediática general no esté analizada — son dimensiones distintas del `estado_ficha`.

## Ideas futuras

### v1 pre-launch

- Probar el flujo en un caso piloto con cobertura abundante (begona-gomez o lezo son candidatos por volumen y transversalidad).
- Mostrar en `Estado de la ficha` el estado del rastreo — **ya cableado**, el campo `estado_ficha.cobertura_mediatica_general` existe.
- Mini-bloque "Cobertura mediática general" en la ficha de caso linkando al corpus por separado.

### v1.x

- Página o sección por caso con picos de cobertura por fecha.
- Agregado global por medio y por caso.
- Comparativa entre cobertura citada por presuntamente.org y cobertura general rastreada.

### Sin compromiso

- Integrar APIs externas de búsqueda si aportan trazabilidad y coste razonable.
- Medir prominencia aproximada cuando existan datos fiables (portada, newsletter, editorial, pieza de agencia ampliada).
- Detección de hilos en X verificados o newsletters de periodistas con valor de cobertura.

## Pendientes operativos

- [x] Decidir ubicación canónica del corpus. **Decisión 2026-05-25**: `content/cobertura-mediatica/<slug>.yaml` (uno por caso, no anidado en `content/casos/`).
- [x] Diseñar schema mínimo de noticia rastreada. **Decisión 2026-05-25**: 14 campos por noticia con `tipo_pieza` enum cerrado de 11 valores.
- [x] Crear skill `/rastrear-cobertura`. **Entregada v0** el 2026-05-25.
- [x] Definir política de archivo para noticias que no respaldan hechos. **Decisión 2026-05-25**: archive.org obligatorio; paywall duro decidido caso a caso con el maintainer.
- [ ] Decidir si "sesgo mediático" se usa sólo internamente o también como copy público. Posponer hasta que la feature hermana [`composicion-fuentes-citadas.md`](composicion-fuentes-citadas.md) esté entregada — ambas comparten metodología y conviene cerrar el copy a la vez.
- [ ] Poblar el primer caso piloto con `/rastrear-cobertura <slug>` lanzado en sub-agente paralelo.
- [ ] Diseñar el render en UI cuando exista corpus.
