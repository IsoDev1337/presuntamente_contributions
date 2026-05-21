---
name: investigar-caso
description: Arranca un caso nuevo en el inventario presuntamente.org desde un nombre mediático, una URL de prensa o un brief breve del maintainer. Localiza el órgano titular, las personas con rol formal y los hitos clave; genera el esqueleto YAML inicial (Caso + 1-2 Hitos + Documentos respaldo + 1-3 Roles + Hechos derivados) listo para PR. Trigger cuando el usuario pide "investiga el caso X", "arranca un caso nuevo sobre Y", "ficha el caso Z", o pasa un brief de un procedimiento sin slug.
---

# Skill `investigar-caso` — v0

## Propósito

Tomar un brief, un nombre mediático o una URL de prensa de un procedimiento judicial relevante y producir un borrador inicial de PR que incorpore al inventario:

1. La ficha de `Caso` raíz (`/content/casos/<slug>/caso.yaml`).
2. Las `Persona`s mínimas con rol formal en el procedimiento (`/content/personas/<slug>.yaml`).
3. Las `Organizacion`es del aparato procesal: órgano judicial titular, fiscalía, acusación popular, organismo público afectado, empresa investigada si aplica.
4. Los `Documento`s primarios localizados durante la investigación (con `url_canonica` y nivel de fuente).
5. Los primeros `Hito`s: querella/denuncia inicial, operación policial si la hubo, cambio_organo si lo hubo, auto de imputación más reciente.
6. Los primeros `Hecho`s (típicamente `atribuido` y `investigado`; nunca `acreditado` automático).
7. Los `RolEnCaso` mínimos para los implicados con condición formal vigente.

Versión `v0`: deliberadamente mínima. La skill se moldea con la experiencia tras cada caso (`AGENTS.md` §"Skills locales").

## Inputs aceptados

- Nombre mediático del caso (ej. "caso Begoña Gómez", "caso Koldo").
- URL de un reportaje de prensa o de una nota CGPJ que sirva de punto de partida.
- Brief breve del maintainer con datos preliminares (probablemente desactualizados o parciales — ver guardarraíl §"Tensión brief vs realidad procesal").

Si el input es ambiguo (puede referirse a varios procedimientos), preguntar antes de empezar a buscar.

## Proceso

### 1. Identificación del procedimiento

Buscar con `WebSearch` y `WebFetch`:

- **Nombre oficial** del procedimiento (`Diligencias Previas <nº>`, `Procedimiento Abreviado <nº>`, `Sumario <nº>`).
- **Órgano titular actual** (Juzgado de Instrucción nº X de <localidad>, Juzgado Central de Instrucción nº Y, Tribunal Supremo, etc.).
- **Magistrado instructor / ponente** identificable.
- **Fecha de apertura** del procedimiento (lo más aproximada posible).
- **Origen** (querella, denuncia, oficio judicial, cooperación internacional, comparecencia Congreso).

Si el órgano titular ha cambiado durante el procedimiento (típico de causas grandes), identificar el órgano actual y modelar el `cambio_organo` como Hito posterior al inicial.

### 2. Identificación de implicados

Localizar **sólo personas con rol procesal formal**: investigados, procesados, acusados, condenados, absueltos, desimputados, denunciantes formales, juez instructor, fiscal.

**No incluir** en la ficha inicial:
- Personas mencionadas en prensa sin rol procesal formal.
- Familiares no implicados (doc 04 §11).
- Comentaristas, analistas, terceros que opinan.
- Sospechosos identificados sólo por iniciales en notas oficiales (respeta la anonimización del propio órgano hasta que se publique el levantamiento).

Si el procedimiento tiene una persona privada (no figura pública) con rol formal, marca para review humano antes de incluirla — V-17 + doc 04 §11.

### 3. Localización de documentos primarios

Para cada hito candidato, buscar el documento de mayor nivel de fuente disponible:

- **N1 — preferido**: sentencia, auto, BOE, nota oficial CGPJ. URL canónica en lista blanca `DominiosOficiales` (doc 01 §3): `poderjudicial.es`, `cendoj.es`, `boe.es`, `congreso.es`, `senado.es`, `fiscal.es`, `tcu.es`, `airef.es`, `defensordelpueblo.es`, `tribunalconstitucional.es`, `cgpj.es`, subdominios `.gob.es`, organismos públicos con personalidad jurídica propia (SEPI, AEAT, CNMV, etc.).
- **N2**: informe UCO/UDEF (a veces filtrado, a veces oficial), escrito de Fiscalía, nota institucional fuera de lista blanca.
- **N3**: documento de parte, institucional no jurisdiccional, pericial de parte. Querella publicada íntegra por un medio identificable cuenta como N3 (filtrado_verificado).
- **N4**: cobertura periodística. Aceptable como soporte SI cumple V-13: al menos otra fuente en línea editorial distinta que cruce el hecho.

Si un hito relevante NO tiene N1 disponible (típico en operaciones policiales o cambios de órgano cuando el auto aún no ha aparecido en CENDOJ), modelar con N4 como `documento_principal_id` + uno o más `documentos_relacionados` en distintas líneas editoriales. Anotar en `NOTES.md` del caso como pendiente para una pasada futura cuando aparezca el documento oficial.

### 4. Generación del esqueleto

Producir los YAMLs en disco bajo:

- `content/casos/<slug>/caso.yaml` — raíz del caso.
- `content/casos/<slug>/NOTES.md` — anotaciones internas con decisiones tomadas, fuentes consultadas, discrepancias con el brief.
- `content/personas/<slug>.yaml` — una por cada Persona nueva no existente ya.
- `content/organizaciones/<slug>.yaml` — una por cada Organización nueva no existente ya (incluidos medios cuando se usen como `productor_organizacion_id`).
- `content/documentos/<slug>.yaml` — uno por cada Documento citado.
- `content/casos/<slug>/hitos/<slug>.yaml` — los primeros hitos.
- `content/casos/<slug>/hechos/<slug>.yaml` — los primeros hechos.
- `content/casos/<slug>/roles/<slug>.yaml` — los primeros roles.

Y propone commits coherentes (una idea por commit, en español imperativo presente, ver `AGENTS.md` §"Commits").

## Guardarraíles obligatorios

1. **Tensión brief vs realidad procesal en casos vivos.** Cuando el brief del usuario está desactualizado respecto a la realidad procesal (nuevo auto publicado, cambio de órgano reciente, persona imputada después del brief), respetar el brief, documentar la discrepancia en `NOTES.md` del caso + `ROADMAP.md → Decisiones pendientes`, y deferir al maintainer. NO improvisar ni asumir luz verde sobre incorporar la novedad.

2. **NUNCA inventes datos.** Si no tienes fuente verificable para un dato, déjalo vacío con comentario YAML inline `# LLM-incierto: <razón>` y repórtalo en el resumen final. No completes "lo que parece probable".

3. **NUNCA asignes `Hecho.tipo = acreditado` automáticamente.** Sólo `investigado`, `atribuido` o `no_concluyente`. Marcar `acreditado` requiere sentencia firme + review humano explícito (V-04).

4. **Lenguaje del doc 04 §3 obligatorio:**
   - Verbos prohibidos: "robó", "estafó", "se apropió", "es culpable", "ha cometido".
   - Verbos preferidos: "se investiga", "se atribuye", "consta en el auto X que…", "la acusación sostiene que…", "el instructor considera indiciariamente que…".
   - Final explícito de presunción de inocencia en notas de roles activos.

5. **Anonimización del órgano se respeta.** Si una nota oficial identifica a un sospechoso con iniciales, no crear `Persona` con nombre completo aunque la prensa lo haya identificado. Esperar al levantamiento formal.

6. **Familiares no implicados quedan fuera** salvo que un auto les atribuya rol procesal formal. Doc 04 §11.

7. **Cobertura editorial sin cuota política.** Si el caso afecta a una formación política, no editorializar; aplicar exactamente la misma estructura, badges y tono que a cualquier otro caso. Doc 02 §"Principios de la ficha" P-10.

8. **NUNCA `git push`.** El agente acumula commits locales; el push lo decide el maintainer (`AGENTS.md` §"Workflow de rama y PRs", norma reforzada el 2026-05-21).

## Output esperado

Mensaje final al usuario con:

1. Slug del caso creado y URL relativa de la ficha (`/casos/<slug>`).
2. Lista de ficheros creados.
3. Resumen del estado de cuotas mínimas (Persona: 2-4 esperadas en PR inicial, Hito: 2-3, Hecho: 2-3, etc.) y cuáles cumple.
4. Lista de campos `LLM-incierto` que requieren input humano.
5. Validaciones del modelo: cuáles pasan, cuáles bloquean.
6. Lista de pendientes para PR2+: archive.org mirrors, documentos oficiales esperados, decisiones editoriales pendientes.
7. Recordatorio de **no haber hecho push** y de qué commits quedan locales esperando al maintainer.

## Iteración

Tras cada caso real arrancado con esta skill, añadir aquí una entrada en `## Histórico` con:

- Slug del caso.
- Fecha.
- Decisiones editoriales no triviales que se tomaron.
- Lecciones aprendidas que conviene templatizar.

## Histórico

### Plus Ultra (2026-05-21) — caso bautismo (no usó la skill formalmente)

El caso Plus Ultra se arrancó manualmente antes de que existiera esta skill, en sesión directa con el maintainer. Lecciones que han informado la v0:

- **Lista blanca de dominios oficiales se amplía caso a caso.** Plus Ultra añadió `sepi.es` cuando el primer documento N1 fue una nota institucional de la SEPI. Cuando un caso introduce un organismo público no previsto, anotar en la lista blanca + decisión en NOTES.md.
- **Decisiones del brief vs auto judicial.** El brief no incluía a Zapatero como investigado; un auto del 19-may-2026 sí lo hizo. La decisión fue respetar el brief, documentar la discrepancia, y deferir. Patrón válido para futuros casos.
- **Hitos sin documento N1 disponible son aceptables** con cruce N4 (cobertura periodística en dos líneas editoriales distintas), siempre que se anote como pendiente la sustitución por documento oficial cuando aparezca. Cumple V-13.
- **Implícitos del modelado**: `hito_origen_id` siempre obligatorio en la práctica para todos los RolEnCaso (aunque V-10 sólo lo exija para condenado); medios como Organizacion `tipo=medio_comunicacion` cuando se usan como `productor_organizacion_id`; mapeo de operación policial → `tipo=imputacion`.
