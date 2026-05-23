---
name: revisar-caso
description: Auditoría editorial cualitativa por LLM de un caso ya fichado en el inventario presuntamente.org. Cubre el hueco entre `pnpm validate` (schema mecánico) y la revisión humana final del maintainer aplicando las 10 reglas P del doc 02 + los principios irrenunciables de AGENTS.md sobre presunción de inocencia, neutralidad y trazabilidad. Output clasificado en BLOQUEANTE / SUGERENCIA / OK, sin auto-fix. Trigger cuando el usuario pide "revisa el caso X", "audita la ficha de Y", "revisa esta PR de un caso", "haz una pasada editorial sobre Z" o invoca `/revisar-caso <slug>` directamente; también para auto-revisión antes de pushear PRs grandes o ante PR externa de contribuyente.
---

# Skill `revisar-caso` — v0

## Propósito

Pasar una auditoría editorial cualitativa sobre un caso ya fichado, leyendo todos los YAMLs del caso y produciendo un informe en markdown con los hallazgos clasificados en tres niveles. **No toca código ni datos**: sólo señala, el maintainer decide.

La skill cubre exclusivamente la **capa B** del diseño de cuatro capas documentado en `ROADMAP.md` §"Después de Fase 1, antes de Fase 2":

- **Capa A — Schema / V-rules mecánicas** → ya cubierta por `pnpm validate`. Esta skill no la duplica; si la capa A falla, el caso no debería siquiera llegar a revisión editorial.
- **Capa B — Auditoría editorial cualitativa (esta skill).** Reglas P-01..P-10 del doc 02 + principios §4 y §5 de `AGENTS.md` que no son chequeables con AJV porque requieren leer texto.
- **Capa C — Verificación externa de fuentes** → diferida a v2+.
- **Capa D — Integración con PRs externas** → invocación manual con `gh pr checkout <num>` + `/revisar-caso <slug>` en local. Misma skill sirve para auto-revisión y para PR externa.

Versión `v0`: deliberadamente mínima, checklist de 8 chequeos. La skill se moldea con la experiencia tras cada uso real (`AGENTS.md` §"Skills locales"), añadiendo guardarraíles a la sección Histórico cuando aparezcan falsos positivos o falsos negativos.

## Inputs aceptados

- Slug de un caso ya fichado en `content/casos/<slug>/`. Ej. `/revisar-caso fiscal-general-del-estado`.
- Si no se pasa argumento, listar los casos disponibles y preguntar cuál revisar.
- Si el slug no existe en `content/casos/`, error claro (no inventar).

La skill asume que el caso ya pasa `pnpm validate` (capa A). Si no pasa, recomendar arreglar primero los errores de schema antes de gastar contexto en revisión editorial.

## Proceso

### 1. Carga del caso

Leer en disco todos los YAMLs del caso:

- `content/casos/<slug>/caso.yaml` — raíz.
- `content/casos/<slug>/NOTES.md` — anotaciones internas (no se publican pero pueden contener pistas útiles para entender decisiones del fichaje).
- `content/casos/<slug>/hitos/*.yaml`.
- `content/casos/<slug>/hechos/*.yaml`.
- `content/casos/<slug>/roles/*.yaml`.

Resolver las referencias cruzadas a colecciones globales:

- `content/personas/<id>.yaml` para cada `sujeto_id` con `sujeto_tipo: persona`.
- `content/organizaciones/<id>.yaml` para cada `sujeto_id` con `sujeto_tipo: organizacion` y para `organo_judicial_id`, `productor_organizacion_id`, etc.
- `content/documentos/<id>.yaml` para cada `documento_principal_id`, `documentos_relacionados[]`, `documentos_respaldo[].documento_id`.
- `content/delitos/<id>.yaml` para cada `delitos_atribuidos[]`.

Si una referencia no resuelve (`getEntry` devuelve null), anotar como hallazgo `BLOQUEANTE` y seguir — no abortar la revisión.

### 2. Aplicación de la checklist

Aplicar los 8 chequeos de la §"Checklist v0" sobre el material cargado. Cada hallazgo se acumula con:

- `nivel`: `BLOQUEANTE` (debe arreglarse antes de publicar / mergear) · `SUGERENCIA` (mejora editorial recomendable, no bloquea) · `OK` (chequeo pasado limpiamente — se reporta sólo en el resumen final, no como entrada individual).
- `chequeo`: nombre corto del chequeo (CH1..CH8).
- `localizacion`: archivo + campo (`content/casos/X/hechos/Y.yaml → enunciado`).
- `evidencia`: cita literal del fragmento problemático (si aplica).
- `razon`: explicación breve de por qué se marca.
- `accion_sugerida`: qué cambio resolvería el hallazgo (sin aplicarlo).

### 3. Output

Informe en markdown impreso al final del turno del agente, con esta estructura:

```markdown
# Revisión editorial — caso `<slug>`

Fecha: YYYY-MM-DD
Skill: revisar-caso v0
Material revisado: <N> hitos, <N> hechos, <N> roles, <N> personas, <N> orgs, <N> docs.

## Resumen

- Bloqueantes: N
- Sugerencias: N
- Chequeos pasados limpiamente: lista de CHx OK.

## Bloqueantes

### CHx — <título del chequeo>
- **Dónde**: `content/casos/X/hechos/Y.yaml → enunciado`
- **Evidencia**: «<cita literal>»
- **Razón**: …
- **Acción sugerida**: …

(repetir por hallazgo)

## Sugerencias

(mismo formato)

## Chequeos pasados limpiamente

- CH1, CH4, CH5, CH7.
```

Si el caso es grande y la lista de hallazgos amenaza con desbordar el contexto, agrupar varios hallazgos del mismo chequeo bajo un único bloque con sub-bullets por localización.

## Checklist v0

Los 8 chequeos del bullet del ROADMAP. Cada uno con qué busca, dónde lo busca y cómo clasifica.

### CH1 — Verbos prohibidos en Hechos no acreditados

**Regla**: en `Hecho.enunciado` con `tipo ∈ {investigado, atribuido, no_concluyente}`, no deben aparecer verbos que afirmen autoría sin sentencia firme: `robó`, `estafó`, `se apropió`, `desvió`, `cobró comisiones`, `blanqueó`, `defraudó`, `es culpable`, `ha cometido`, `cometió`, `delinquió`, `corrompió`, `sobornó`, `compró voluntades`, `recibió sobornos` — en cualquier forma personal (pasado, presente, perfecto).

**Excepción**: si la frase está dentro de comillas literales y se identifica como cita textual de fuente (ej. `«según el informe UCO "X cobró comisiones de Y"»`), no es hallazgo — es atribución a la fuente, no afirmación del proyecto.

**Verbos preferidos** (no se penalizan): `se investiga`, `se atribuye`, `consta en el auto X que`, `la acusación sostiene que`, `el instructor considera indiciariamente que`, `presuntamente`, `según el informe X`.

**Clasificación**: `BLOQUEANTE`.

**Referencia**: doc 04 §3 + AGENTS.md §"Principios irrenunciables" §4 + doc 02 P-09.

### CH2 — Lenguaje activo afirmativo sobre personas sin condena firme

**Regla**: si en cualquier prosa (`Caso.resumen_ejecutivo`, `Caso.descripcion_corta`, `Caso.resumen_cifras`, `Hito.descripcion`, `Hecho.enunciado`, `Persona.biografia_corta`) se afirma que una persona X **hizo** una conducta delictiva en activo afirmativo (no atribuido, no condicional), tiene que cumplirse al menos una de:

- X tiene `RolEnCaso.rol = condenado_firme` en el caso revisado.
- Existe un `Hecho.tipo = acreditado` en el caso que respalda esa afirmación con `personas_implicadas` incluyendo a X.

Si no se cumple ninguna, hallazgo. Típico falso positivo: descripciones de hitos cuya prosa contextual narra hechos investigados como si estuvieran probados.

**Clasificación**: `BLOQUEANTE` cuando la afirmación atribuye conducta tipificada penalmente; `SUGERENCIA` cuando es genérica ("X mintió") sin tipificación.

**Referencia**: doc 02 P-01 + AGENTS.md §"Principios irrenunciables" §1 y §4.

### CH3 — Hechos con respaldo sólo N4 que no son `atribuido` ni `investigado`

**Regla**: si un `Hecho` tiene `tipo ∈ {acreditado, exculpatorio, desmentido}` pero TODOS sus `documentos_respaldo[].documento_id` apuntan a `Documento.nivel_fuente = 4` (cobertura periodística), es hallazgo. Las categorías epistémicas "fuertes" (acreditado, exculpatorio, desmentido) requieren al menos un documento N1-N3 de respaldo; N4 sólo es aceptable como complemento cruzado para `atribuido` / `investigado` (V-13).

**Excepción**: `Hecho.tipo = no_concluyente` puede tener sólo N4 (el propio tipo señala incertidumbre).

**Clasificación**: `BLOQUEANTE` cuando `tipo = acreditado`; `SUGERENCIA` cuando `tipo ∈ {exculpatorio, desmentido}` (el modelo lo permite pero conviene reforzar respaldo).

**Referencia**: doc 01 V-13 cualitativa.

### CH4 — Personas privadas mencionadas sin rol formal en el procedimiento

**Regla**: si una `Persona` aparece nominalmente (por `nombre_completo` o `nombres_alternativos`) en alguna prosa del caso (`Caso.resumen_*`, `Hito.descripcion`, `Hecho.enunciado`) y se cumple TODO:

- `Persona.es_figura_publica = false`.
- No tiene ningún `RolEnCaso` activo o pasado en el caso.
- No es familiar imputado (cubierto por rol).

Es hallazgo. La excepción de doc 04 §11 sólo cubre figuras públicas y personas con rol procesal formal.

**Clasificación**: `BLOQUEANTE`.

**Referencia**: AGENTS.md §"Principios irrenunciables" §5 + doc 02 P-07 + doc 04 §11 + V-17.

### CH5 — Hitos sin Documento N1-N2 de respaldo

**Regla**: cada `Hito` con `tipo` jurisdiccional (`querella`, `denuncia`, `auto_imputacion`, `auto_procesamiento`, `auto_apertura_juicio_oral`, `sentencia_*`, `desimputacion`, `sobreseimiento_*`, `archivo_*`, `cambio_organo`, `recurso_*`, `firmeza`) debería tener `documento_principal_id` apuntando a un `Documento` con `nivel_fuente ∈ {1, 2}`.

Si el `documento_principal_id` es N3 o N4, hallazgo `SUGERENCIA` (puede ser legítimo cuando el auto no está en CENDOJ — patrón ya aceptado en Plus Ultra PR2, Begoña PR1, González Amador — pero conviene revisar si existe N1 sobrevenido).

Si el `documento_principal_id` directamente no existe (Hito jurisdiccional sin documento principal), hallazgo `BLOQUEANTE` (V-14 ya lo debería bloquear en capa A, pero por si la regla está laxa para algún tipo).

**Excepción**: tipos no jurisdiccionales (`comparecencia_congreso`, `publicacion_investigacion_periodistica`, `operacion_policial`, `escrito_conclusiones_provisionales`) admiten respaldo N3-N4 sin penalización.

**Referencia**: doc 01 V-14 + lección reaplicada de Plus Ultra / Begoña / González Amador.

### CH6 — Incoherencia de fechas entre Hito y Documento citado

**Regla**: para cada `Hito`, comprobar:

- `Hito.fecha` no es **posterior** a `Documento.fecha_publicacion` del `documento_principal_id` (excepción razonable: el documento que documenta el hito puede tener fecha posterior si retroage — patrón ya aceptado).
- `Hito.fecha` no es **anterior en más de 5 años** a `Documento.fecha_publicacion` del `documento_principal_id` (sospechoso: el documento está demasiado lejos en el tiempo del hito).
- `Documento.fecha_documento` (cuando exista distinta de `fecha_publicacion`) es coherente con el hito.

**Clasificación**: `SUGERENCIA` por defecto (las incoherencias suelen ser tipos legítimos de la propia realidad procesal, pero merece comprobación humana).

**Referencia**: principio §1 de AGENTS.md (trazabilidad) y lección Begoña PR3 sobre `fecha_documento` vs `fecha_publicacion`.

### CH7 — Ausencia de `corregido_por` cuando un Hecho posterior rebate uno anterior

**Regla**: si existen dos `Hecho` en el caso A y B donde:

- B es cronológicamente posterior a A (por la fecha del `Hito` que los respalda o por `fecha_publicacion` del documento).
- A y B tratan sobre el mismo nudo factual (heurística: solapan `personas_implicadas` significativamente y/o B aporta `tipo = exculpatorio | desmentido | acreditado` sobre el mismo enunciado que A dejó como `atribuido | investigado`).
- A no tiene `corregido_por: B` (ni `vigencia: superado`).

Es hallazgo. La detección de "mismo nudo factual" es heurística: marcar como `SUGERENCIA` y dejar que el maintainer decida si procede el `corregido_por` o son hechos distintos.

**Clasificación**: `SUGERENCIA` (la heurística genera falsos positivos; nunca `BLOQUEANTE` en v0).

**Referencia**: doc 01 V-04, V-05 + AGENTS.md §"Principios irrenunciables" §6 ("nunca borres información; corrige con `corregido_por`").

### CH8 — Tono "cuota política" o sectario

**Regla**: en cualquier prosa del caso, no debe aparecer:

- Lista negra de adjetivos editoriales del doc 02 P-09: `escándalo`, `trama`, `mafia`, `casta`, `chiringuito`, `cloaca`, `tinglado`, `pesebre`, `enchufismo`, `paniaguados`. Excepción: dentro de comillas literales de fuente identificada.
- Calificativos peyorativos no neutros sobre actores políticos: `corruptos`, `delincuentes`, `mafiosos`, `chorizos`, `caraduras` referidos a personas o partidos.
- Asimetría de tratamiento detectable: si el caso afecta a una formación política, frases que sólo se aplicarían a esa formación y no a su simétrica de signo contrario (heurística: presencia simultánea de adjetivos valorativos + identificadores partidistas en la misma oración).
- Lenguaje editorial valorativo en titulares de hito o resumen ejecutivo (`grave`, `gravísimo`, `inaceptable`, `imperdonable`, `vergonzoso`, `clamoroso`).

**Clasificación**: `BLOQUEANTE` para adjetivos de la lista negra del P-09 fuera de cita literal; `SUGERENCIA` para asimetría de tratamiento heurística.

**Referencia**: doc 02 P-09 y P-10 + AGENTS.md §"Principios irrenunciables" §3.

## Guardarraíles obligatorios

1. **No auto-fix.** La skill **sólo señala**. Nunca edita YAMLs, nunca abre commits, nunca hace `git add`. Las acciones sugeridas se redactan en prosa para que el maintainer las aplique manualmente. Esto es una norma dura del diseño: el LLM no decide qué se publica.

2. **No `git push`.** El agente que ejecuta la skill no debe hacer push aunque la auditoría salga limpia (`AGENTS.md` §"Workflow de rama y PRs", norma reforzada el 2026-05-21).

3. **Falsos positivos son aceptables.** La capa B asume ruido; mejor sobre-marcar y dejar que el maintainer descarte, que pasar por alto. Si un hallazgo es dudoso, clasificar como `SUGERENCIA` y describir la duda.

4. **No inventar fuentes.** Si la skill cree que falta un respaldo o que existe una versión oficial mejor del documento, **no buscarla en la web** ni proponer URLs concretas — eso es trabajo de `investigar-caso` / `incorporar-hito`. La skill se limita a señalar que el respaldo actual es insuficiente.

5. **No mezclar capas.** Si durante la revisión se detecta un error de schema (capa A) que `pnpm validate` no estaba capturando, anotarlo en el informe pero **no arreglarlo** ni proponer cambios al schema — abrir incidencia separada con el maintainer.

6. **Lectura íntegra del caso, no muestreo.** v0 lee todos los YAMLs del caso. Si el caso es muy grande y el contexto amenaza con desbordarse, **avisar al maintainer** y proponer revisión por bloques (hitos / hechos / roles por separado) en vez de saltarse archivos silenciosamente.

7. **NOTES.md del caso es lectura, no escritura.** La skill puede leer `content/casos/<slug>/NOTES.md` para entender decisiones editoriales previas (por qué tal hecho está como `atribuido` y no `acreditado`, etc.), pero **no debe escribirlo**. Las notas las gestiona el maintainer o la skill `incorporar-hito`.

8. **Carga del contexto antes de aplicar checks.** Antes de empezar a evaluar, leer en orden: `AGENTS.md` §"Principios irrenunciables", `docs/diseno/02-ficha-de-caso.md` §4 (reglas P), y el `NOTES.md` del caso si existe. No saltar este paso aunque parezca redundante con el frontmatter de la skill: las reglas P y los principios pueden haberse afinado desde la última versión de la skill.

## Output esperado

Mensaje final al usuario con:

1. El informe markdown completo (estructura de §"Proceso" §3).
2. Recordatorio explícito de que la skill **no ha tocado ningún archivo** y que las acciones sugeridas requieren intervención manual del maintainer.
3. Si hay hallazgos `BLOQUEANTE`, una nota al final advirtiendo que el caso **no está listo para publicar / mergear** hasta que se resuelvan.
4. Si la skill encontró cosas que no encajan en ninguno de los 8 chequeos pero le parecen relevantes editorialmente, una sección final `## Observaciones fuera de checklist` con esos hallazgos marcados explícitamente como heurísticos. Esta sección alimenta la iteración de la skill (ver §"Iteración").

## Iteración

Tras cada uso real de la skill, añadir una entrada en `## Histórico` con:

- Slug del caso revisado.
- Fecha.
- Resumen cuantitativo de hallazgos (`N bloqueantes, M sugerencias`).
- **Falsos positivos detectados**: chequeos que marcaron algo que el maintainer juzgó correcto. Si el falso positivo se repite, refinar la regla del chequeo en este SKILL.md.
- **Falsos negativos detectados**: cosas que el maintainer encontró mal en revisión humana posterior y que la skill no marcó. Si un patrón se repite, añadir un nuevo chequeo (CH9, CH10...) o ampliar uno existente.
- **Heurísticas que merecen promocionarse**: si la sección `Observaciones fuera de checklist` revela un patrón reincidente, codificarlo como chequeo formal.

La skill sigue el patrón de [`AGENTS.md` §"Skills locales"](../../../AGENTS.md): se moldea con la experiencia, no se diseña perfecta upfront. v0 son 8 chequeos; v1 puede tener 12, v2 puede incorporar la capa C (verificación externa de fuentes) cuando madure.

## Histórico

_(Sin entradas todavía. La primera revisión real con esta skill abrirá esta sección.)_
