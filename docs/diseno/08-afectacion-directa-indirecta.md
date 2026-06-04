# 08 — Afectación directa / indirecta

> Decisión editorial cerrada el 2026-05-27. Canon vinculante para todo el inventario. Soporte vivo en [`docs/web/features/afectacion-directa-indirecta.md`](../web/features/afectacion-directa-indirecta.md). Implementado en [`schemas/vinculo-institucional.schema.json`](../../schemas/vinculo-institucional.schema.json). Sustituye al campo retirado `Caso.partidos_afectados[]`.

## 1. Problema

El inventario necesita responder, para cada caso, a una sola pregunta de lectura rápida:

> ¿Qué organizaciones quedan **alcanzadas** por este procedimiento y a qué profundidad?

Antes de este canon, esa pregunta se respondía con dos modelos paralelos que se contradecían entre sí:

- **`Caso.partidos_afectados[]`** — declaración explícita con un enum de 6 valores donde una sola etiqueta (`querella_o_acusacion_popular_del_partido`) mezclaba "afectación editorial" con "papel procesal proactivo". Un partido que actúa como acusación popular no está afectado: está acusando.
- **Derivación de "Organización afectada" en `/casos`** — usaba la prioridad `entidad_investigada → perjudicado → acusación`. La tercera prioridad pintaba la acusación popular como "afectada" con `RolBadge` engañoso, produciendo el bug visual de Kitchen mostrando "Podemos · ACUSACIÓN POPULAR" como organización afectada.

La raíz del problema es semántica: **afectación no equivale a papel procesal**. Una persona o entidad puede participar formalmente en un procedimiento (como acusación, defensa, instructor, fiscal o perito) sin estar afectada por su resultado.

## 2. Lo que rechazamos hacer

- **Mezclar afectación con papel procesal.** Acusación popular, defensa, juzgado instructor, fiscalía y unidades policiales investigadoras no se pintan como "afectadas". Aparecen en otro bloque etiquetado como participación procesal.
- **Inferir afectación a partir de militancia histórica o simpatía ideológica.** Un cargo orgánico de hace 15 años en un partido X no convierte al partido X en afectado por un caso donde aparece la persona como investigada hoy por actos personales.
- **Inferir afectación por vínculo familiar lejano o difuso.** La pareja sentimental sí; el cuñado del primo no.
- **Inferir afectación transitiva.** Que el investigado pertenezca a una asociación cultural que un día recibió subvención del partido X no afecta al partido X.
- **Multiplicar niveles intermedios.** Dos niveles bastan: directa e indirecta. Cualquier intento de añadir "moderadamente afectada" o "tangencialmente alcanzada" reintroduce el ruido que este canon viene a quitar.
- **Promover afectación al rango de juicio público.** "Afectada indirectamente" describe contexto institucional, no culpabilidad ni complicidad. El lenguaje del UI lo refleja: "alcanza", "salpica", "afecta indirectamente" — nunca "responsable", "cómplice", "implicada políticamente".

## 3. Taxonomía

Una sola dimensión con tres valores exhaustivos y mutuamente excluyentes:

| Nivel | Significado | Quién entra |
|---|---|---|
| **directa** | Sujeto procesal pasivo, víctima oficial, ámbito administrativo del que emana el acto investigado, o partido cuya caja es el objeto del procedimiento. | Persona jurídica investigada; perjudicado institucional declarado por el procedimiento; Ministerio/Consejería desde cuyo ámbito orgánico se atribuyen los actos; norma habilitante cuando subyace causalmente al hecho investigado; partido cuya caja, financiación o contabilidad es el objeto del procedimiento (regla 7). |
| **indirecta** | Institución a la que el caso "salpica" por dependencia política, familiar o de cargo, sin ser sujeto procesal ni víctima. | Partido del cargo investigado; partido del cónyuge o pareja sentimental del investigado; partido del gobierno responsable del acto investigado; ente del que depende un investigado sin que el ente sea sujeto procesal. |
| **no afectada (papel procesal)** | Participa formalmente en el procedimiento, pero no sufre afectación editorial. No se modela como afectación. | Acusación popular constituida; defensa; juzgado instructor; fiscalía; peritos; unidades policiales investigadoras. |

El tercer valor no se modela como "afectación = ninguna": se modela **no marcando** `nivel_afectacion` en el vínculo correspondiente. El vínculo sigue existiendo (acusación popular se documenta), pero no aparece en el bloque editorial de "organizaciones afectadas".

## 4. Las 7 reglas editoriales

Decididas por el maintainer el 2026-05-27 antes de modelar (reglas 1-6). La **regla 7** se añadió el 2026-06-04 por decisión editorial explícita del maintainer (caso Leire Díez como detonante). Resuelven fronteras frecuentes; añadir una octava requiere decisión editorial explícita.

### Regla 1 — Gobierno responsable del acto = indirecta del partido titular

El gobierno que adoptó la decisión investigada **no es sujeto procesal**: el sujeto procesal típico es la empresa beneficiaria, el funcionario firmante, o la persona jurídica investigada. El partido (o coalición) que encabezaba el gobierno queda alcanzado de forma indirecta, no directa.

> "Directa" se reserva para el caso, hoy hipotético, en que se imputara al partido como tal por la vía del art. 31 bis CP.

**Ejemplo aplicado**: Plus Ultra — el Consejo de Ministros que autorizó el préstamo del FASEE era el gobierno de coalición PSOE/Podemos. PSOE y Podemos quedan **indirectos**. La persona jurídica investigada Plus Ultra S.A. queda **directa**.

### Regla 2 — Pareja sentimental de cargo público → partido del cargo = indirecta

Cuando el investigado es pareja sentimental no casada de un cargo público electo o designado, el partido de ese cargo queda reputacionalmente salpicado, pero el investigado es persona privada actuando por sí misma. La afectación es **indirecta**, no directa.

**Ejemplo aplicado**: González Amador — el investigado es pareja sentimental de la presidenta de la Comunidad de Madrid, militante del PP. PP queda **indirecto**.

### Regla 3 — Cónyuge de cargo público → partido del cargo = indirecta

Mismo criterio que la regla 2, aplicado a matrimonio formal. La afectación sigue siendo indirecta; el matrimonio no eleva el grado.

**Ejemplo aplicado**: Begoña Gómez — la investigada es esposa del presidente del Gobierno, secretario general del PSOE en el momento de los hechos. PSOE queda **indirecto**.

### Regla 4 — Ministerio/Consejería titular del acto = directa para el ámbito + indirecta para el partido titular

Cuando el acto irregular emana del ámbito orgánico de un Ministerio o Consejería autonómica, ese ámbito administrativo queda **directo** (la actividad se atribuye a su perímetro institucional). El partido al que pertenece el titular político del ministerio en los hechos queda **indirecto**.

**Ejemplo aplicado**: Kitchen — la operación parapolicial se atribuye al Ministerio del Interior (2013-2015). Ministerio del Interior queda **directo**; PP, partido del Gobierno titular del ministerio, queda **indirecto**.

### Regla 5 — Acusación popular constituida por un partido = NO afectada

Personarse como acusación popular es **trabajo procesal voluntario**, no afectación. El partido elige actuar; no le ocurre el caso. Aparece en el bloque de "Participación procesal" (acusación popular), no en el de "Organizaciones afectadas".

**Ejemplo aplicado**: González Amador — PSOE y Más Madrid se personaron como acusación popular. No quedan afectados; aparecen como acusación popular en el bloque procesal.

### Regla 6 — Nombramiento por gobierno X de cargo con autonomía formal = NO afectada del gobierno X

Cuando un cargo con autonomía orgánica formal (Fiscal General del Estado, magistrados, presidente de organismo regulador) es nombrado por un gobierno y posteriormente se le investiga por **actos personales suyos** —no por los del nombramiento—, el partido que encabezaba el gobierno que lo nombró **no queda afectado**. La autonomía formal del cargo es lo que impide la transitividad.

> Esta regla decae si lo que se investigara fuera el propio nombramiento (prevaricación en el nombramiento, p. ej.).

**Ejemplo aplicado**: Fiscal General del Estado — los hechos investigados se atribuyen al FGE en ejercicio de su cargo, no al gobierno que lo nombró. PSOE, partido del gobierno que lo designó, **no queda afectado**.

### Regla 7 — Partido cuya caja o financiación es objeto del procedimiento = directa

Cuando lo que se investiga es la **propia caja, financiación o contabilidad de un partido** —financiación irregular, caja b, comisiones que afluyen al partido, fondos del partido usados como instrumento del delito—, el partido queda **directo**, aunque no se le haya imputado como persona jurídica por la vía del art. 31 bis CP. Lo que dispara la afectación directa no es que un cargo del partido esté investigado (eso es la regla 2, indirecta), sino que **el dinero o la contabilidad del partido es el objeto material del procedimiento**.

Incluye dos situaciones:

- **Partido condenado como responsable civil a título lucrativo** (partícipe a título lucrativo, art. 122 CP): declarado beneficiario de fondos de origen ilícito y obligado a devolverlos, sin responsabilidad penal. Es sujeto procesal pasivo con consecuencia, normalmente firme.
- **Caja o financiación del partido bajo investigación** aunque no haya (todavía) condena ni imputación de la persona jurídica: las cuentas, la tesorería o la contabilidad del partido son el objeto de las diligencias.

> La regla se distingue de las reglas 1, 2 y 3 (gobierno del acto, pareja, cónyuge): aquéllas describen un partido *salpicado* por quién es el investigado; la regla 7 describe un partido cuyo *propio patrimonio* se investiga. Y se distingue de `entidad_investigada_en_caso`, reservada a la imputación formal de la persona jurídica (art. 31 bis): la regla 7 NO afirma que el partido esté imputado.

Se modela con la naturaleza `caja_partido_objeto_investigacion_en_caso` (`nivel_afectacion: directa`). La `justificacion_afectacion` debe precisar si el partido está o no imputado como persona jurídica y conservar la presunción de inocencia.

**Ejemplo aplicado**: Leire Díez — el auto del JCI nº 5 investiga un mínimo de 188.000 € de fondos del PSOE presuntamente canalizados a una red mediante facturas falsas; la caja federal del partido es objeto de la investigación. PSOE queda **directo**, sin estar imputado como persona jurídica.

## 5. Qué NO es afectación

Lista canónica de situaciones que NO se modelan como `nivel_afectacion`:

- **Acusación popular constituida** por partido, asociación o particular (regla 5).
- **Defensa procesal** ejercida por partido o asociación.
- **Juzgado instructor** que conoce de la causa: es el órgano competente, no afectado.
- **Fiscalía** actuante: ejerce la acción pública, no es afectada.
- **Unidades policiales investigadoras** (UCO, UDEF, BCN equivalente): peritan o instruyen, no son afectadas.
- **Peritos judiciales** designados por las partes o por el órgano.
- **Nombramiento histórico de cargo con autonomía formal** cuando el caso no cuestiona el nombramiento (regla 6).
- **Militancia antigua sin cargo activo en el periodo de los hechos** investigados.
- **Vínculo familiar lejano** (primos, cuñados, parientes no convivientes y sin cargo público).
- **Coincidencia geográfica o de generación** (que el investigado y un dirigente sean del mismo pueblo, promoción universitaria o cohorte sindical).
- **Donación o subvención puntual recibida en el pasado** sin relación causal con los hechos investigados.

Cuando dudes, el principio rector es: **¿el caso le ocurre a esta organización, o esta organización participa en el caso?** Si participa, no es afectación.

## 6. Recalificación de los 6 casos publicables

Esto es el estado canónico tras el refactor del 2026-05-27. Se conserva por trazabilidad y como ejemplo aplicado de las reglas.

### Plus Ultra

- **Directa**: Plus Ultra Líneas Aéreas S.A. (persona jurídica investigada). SEPI (perjudicado institucional declarado).
- **Indirecta**: PSOE (regla 1, gobierno responsable del acto). Podemos (regla 1, coalición de gobierno).
- **No afectada**: Manos Limpias (acusación popular, regla 5).
- **Descartada**: la entrada que vinculaba a PSOE por militancia histórica de Zapatero (`militancia_o_cargo_organico_relevante`). El vínculo histórico es real y se conserva como `cargo_organico_partido`, pero no constituye afectación: en 2021 Zapatero no tenía cargo activo en PSOE ni en Gobierno.

### Begoña Gómez

- **Directa**: Universidad Complutense de Madrid (perjudicado institucional declarado).
- **Indirecta**: PSOE (regla 3, esposa del presidente del Gobierno).
- **No afectada**: Hazte Oír, Iustitia Europa, Manos Limpias, Movimiento de Regeneración Política y Vox (todas acusación popular, regla 5).

### González Amador

- **Directa**: AEAT / Hacienda Pública (perjudicado institucional). Maxwell Cremona S.L. (persona jurídica investigada).
- **Indirecta**: PP (regla 2, pareja sentimental de la presidenta de la Comunidad de Madrid, militante del PP).
- **No afectada**: PSOE y Más Madrid (acusación popular, regla 5).

### Fiscal General del Estado

- **Directa**: ninguna. Los hechos se atribuyen a actos personales del FGE en ejercicio de su cargo; no hay persona jurídica investigada ni perjudicado institucional formalizado más allá del afectado directo (persona física querellante). La institución FGE no se modela como afectada porque sería un abuso reputacional sin sujeto procesal claro.
- **Indirecta**: ninguna (regla 6).
- **No afectada**: Manos Limpias (acusación popular, regla 5).

### Kitchen

- **Directa**: Ministerio del Interior (regla 4, ámbito administrativo del que emana el acto).
- **Indirecta**: PP (regla 4, partido titular del Ministerio en los hechos, e imputaciones a cargos del PP — Fernández Díaz, Martínez Vázquez).
- **No afectada**: PSOE y Podemos (acusación popular, regla 5).

### Lezo

- **Directa**: Canal de Isabel II (perjudicado institucional declarado en la pieza Inassa y otras).
- **Indirecta**: PP (gobiernos PP en la Comunidad de Madrid 2003-2017 + cargos PP procesados: Ignacio González, Pedro Calvo Poch, Juan Bravo Rivera).
- **No afectada**: Comunidad de Madrid (acusación popular, regla 5).

### Aplicación de la regla 7 (2026-06-04)

Barrido del inventario tras añadir la regla 7. Partidos cuya caja/financiación es objeto del procedimiento, reclasificados a **directa** (`caja_partido_objeto_investigacion_en_caso`):

- **Leire Díez** — PSOE: 188.000 € de fondos del partido presuntamente canalizados a una red; la caja federal es objeto del requerimiento de la UCO. No imputado como persona jurídica.
- **Bárcenas / caja b** — PP: la contabilidad B del partido es el objeto del caso; condenado como responsable civil subsidiario (firme, TS 2024).
- **Gürtel** — PP: condenado partícipe a título lucrativo, 245.492,80 € (firme, TS 2020).
- **Filesa** — PSOE: financiación irregular del partido vía empresas pantalla, objeto de la causa especial 880/1991 (TS).
- **Palau de la Música** — CDC: comiso firme de 6.676.105,58 € de comisiones canalizadas hacia el partido (STS 813/2020).

Revisados y **mantenidos como indirecta** (la caja del partido NO es el objeto; el partido sólo queda salpicado): **Púnica** (la pieza de financiación del PP fue archivada en 2022; el objeto activo son amaños a cargos, no la caja del partido) y **Pujol** (CDC salpicada por ser el partido del investigado, regla 1). Los partidos en `kitchen`, `plus-ultra`, `begona-gomez`, `gonzalez-amador` y `tarjetas-black` siguen siendo indirecta o papel procesal por sus reglas respectivas (1-5).

**Diferido**: **`tres-por-ciento-cataluna`** — la financiación de CDC sí es el objeto del caso, pero el caso está en estado `pendiente` (stub sin hitos ni documentos propios). Aplicar la regla 7 cuando se fiche con sus primarios.

## 7. Modelo de datos

Toda la afectación se modela en `VinculoInstitucional`. El campo `Caso.partidos_afectados[]` queda retirado del schema.

### 7.1 Campo `nivel_afectacion`

```yaml
nivel_afectacion: directa | indirecta   # opcional; ausente = no afectada / vínculo no-afectivo
```

- **Ausente** cuando el vínculo no expresa afectación (cargos, militancias, vínculos familiares no centrales, acusación popular, defensa).
- **`directa`** cuando el vínculo expresa afectación de primer grado (sujeto procesal pasivo, víctima oficial, ámbito administrativo del que emana el acto, norma habilitante).
- **`indirecta`** cuando el vínculo expresa afectación de segundo grado (partido salpicado, ente dependiente, contexto institucional sin sujeto procesal).

### 7.2 Campo `justificacion_afectacion`

```yaml
justificacion_afectacion: |
  Frase neutra que explica por qué el caso alcanza a esta organización en el nivel marcado.
```

Obligatoria cuando `nivel_afectacion` está presente. Sin verbos prohibidos del P-09. Hereda la prosa que vivía en el campo retirado `partidos_afectados[].justificacion`.

### 7.3 Naturalezas nuevas

Se añaden tres naturalezas a `VinculoInstitucional`:

- **`ambito_administrativo_directo_del_acto_en_caso`** — el Ministerio, Consejería u organismo desde cuyo perímetro institucional emana el acto investigado (regla 4). Asocia `nivel_afectacion: directa` obligatorio.
- **`caja_partido_objeto_investigacion_en_caso`** *(regla 7, añadida 2026-06-04)* — partido cuya caja, financiación o contabilidad es el objeto del procedimiento (financiación irregular, caja b, comisiones al partido, responsable civil a título lucrativo), sin que ello implique imputación de la persona jurídica. Asocia `nivel_afectacion: directa` obligatorio.
- **`afectacion_indirecta_en_caso`** — naturaleza polivalente para reflejar afectación de segundo grado (partido del cargo, partido del gobierno responsable, partido del cónyuge, ente dependiente). Asocia `nivel_afectacion: indirecta` obligatorio.

### 7.4 Naturalezas existentes con nivel_afectacion derivable

| Naturaleza | Significado | nivel_afectacion esperado |
|---|---|---|
| `entidad_investigada_en_caso` | Persona jurídica investigada | `directa` |
| `perjudicado_institucional_en_caso` | Víctima institucional formalizada | `directa` |
| `ambito_administrativo_directo_del_acto_en_caso` *(nueva)* | Ministerio/Consejería titular del acto | `directa` |
| `caja_partido_objeto_investigacion_en_caso` *(nueva, regla 7)* | Partido cuya caja/financiación es el objeto del procedimiento | `directa` |
| `afectacion_indirecta_en_caso` *(nueva)* | Partido/ente salpicado sin papel procesal | `indirecta` |
| `acusacion_institucional_en_caso` | Acusación popular constituida | ausente (no afectación) |
| Cualquier `cargo_*`, `nombramiento_por_gobierno`, `vinculo_*` | Cargos, militancia, vínculos personales | ausente por defecto |

### 7.5 Reglas de validación (V-rules)

El validador (`scripts/validate.mjs`) impone, a partir de este canon:

- **V-22**: si `naturaleza ∈ {entidad_investigada_en_caso, perjudicado_institucional_en_caso, ambito_administrativo_directo_del_acto_en_caso, caja_partido_objeto_investigacion_en_caso, afectacion_indirecta_en_caso}`, entonces `relevancia_para_caso_ids` no puede estar vacío, `nivel_afectacion` es obligatorio con valor canónico (`directa` para las cuatro primeras, `indirecta` para `afectacion_indirecta_en_caso`), y `justificacion_afectacion` es obligatoria.
- **V-23**: si `naturaleza == acusacion_institucional_en_caso`, entonces `nivel_afectacion` y `justificacion_afectacion` deben estar ausentes (papel procesal, no afectación).
- **V-24**: para el resto de naturalezas, `nivel_afectacion` y `justificacion_afectacion` deben estar ausentes (evitar afectación rebozada en cargos).

## 8. Lectura en UI

- **Listado `/casos`**: una sola columna "Organizaciones afectadas" con sub-listas "Directa" e "Indirecta" deduplicadas por `organizacion_id`. Los vínculos sin `nivel_afectacion` no aparecen en esta columna.
- **Ficha de caso (`PgCasoDetalle`)**: el bloque previamente titulado "Instituciones alcanzadas" pasa a llamarse "Organizaciones afectadas" y se subdivide en "Directa" e "Indirecta" con `justificacion_afectacion` visible. El bloque "Organizaciones implicadas" del cuerpo de la ficha distingue "Afectadas" (directa + indirecta) y "Participación procesal" (acusación popular y resto sin afectación).
- **Home (`PgInicio`)**: el preview de casos destacados muestra como "Partidos afectados" los vínculos de afectación —**directa (regla 7) o indirecta**— cuyo `sujeto_organizacion_id` es de tipo `partido_politico`. La "organización principal" del preview es la primera afectada **directa que no sea partido** (los partidos van siempre como siglas en los chips, nunca en el slot principal con badge de rol, para no insinuar que el partido es "investigado"). Dedupe obligatorio por `organizacion_id`.

## 9. Cuándo añadir una séptima regla

La taxonomía es exhaustiva pero las fronteras son finitas. Si aparece un caso fronterizo no cubierto por las 7 reglas (partido extranjero salpicado, asociación cultural con vínculo difuso, organismo internacional implicado), el agente que lo encuentre **debe consultar al maintainer** antes de modelar. Las reglas nuevas se incorporan a esta sección, no en la skill ni en el código.

> La **regla 7** (partido cuya caja es objeto del procedimiento → directa) se añadió el 2026-06-04 siguiendo exactamente este cauce: frontera detectada al modelar el caso Leire Díez, consulta y decisión del maintainer, e incorporación al canon antes de aplicarla al resto del inventario.
