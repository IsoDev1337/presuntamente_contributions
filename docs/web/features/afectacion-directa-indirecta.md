# Afectación directa / indirecta — fusión del modelo

> Refactorización editorial estructural pendiente. Toca: `schemas/vinculo-institucional.schema.json`, `schemas/caso.schema.json`, `src/content.config.ts`, datos en `content/`, UI en `PgCasos.astro` + `PgCasoDetalle.astro`, skill `/documentar-vinculos`. Relacionada con [`partidos-afectados.md`](partidos-afectados.md) y [`vinculos-institucionales.md`](vinculos-institucionales.md).

## El problema que resuelve

Hoy coexisten dos modelos que se contradicen en el concepto de "afectación":

- **`Caso.partidos_afectados[].tipo_afectacion`** — enum de 6 valores donde `querella_o_acusacion_popular_del_partido` mezcla "afectación" con "papel procesal proactivo". Un partido que actúa como acusación popular **no está afectado**, está participando activamente como acusador.
- **Derivación de "Organización afectada" en `/casos`** — usa la prioridad `entidad_investigada_en_caso → perjudicado_institucional_en_caso → acusacion_institucional_en_caso`. La tercera prioridad es el mismo error: pinta la acusación popular como "afectada" con un RolBadge engañoso.

Ejemplo donde el bug se ve a simple vista (Kitchen, 2026-05-27): columna "Organización afectada" muestra "Podemos · ACUSACIÓN POPULAR" (Podemos no está afectado, está acusando) + columna "Partidos afectados" muestra PSOE y Podemos como acusación popular (igual de mal).

## La taxonomía que se va a aplicar

Una sola dimensión con tres niveles, exhaustiva y mutuamente excluyente:

| Nivel | Significado | Quién entra |
|---|---|---|
| **directa** | Sujeto procesal pasivo o víctima oficial del acto investigado. | Persona jurídica investigada (Plus Ultra), perjudicado institucional declarado (UCM, Hacienda Pública, Ministerio del Interior cuando es el ámbito del que emana el acto), BOE/norma habilitante. |
| **indirecta** | Institución a la que el caso le "salpica" por dependencia política, familiar o de cargo, sin ser sujeto procesal. | Partido del cargo investigado o de la pareja del investigado; partido del gobierno responsable del acto investigado; ente del que depende un investigado. |
| **no afectada (papel procesal)** | Participa formalmente en el procedimiento pero no sufre afectación. | Acusación popular, defensa, juzgado instructor, fiscalía, peritos, unidades policiales investigadoras. |

## Las 6 reglas editoriales acordadas (2026-05-27)

Decididas por el maintainer para resolver fronteras antes de modelar:

1. **Gobierno responsable del acto = indirecta.** El gobierno tomó la decisión pero no es persona jurídica investigada; el sujeto procesal es la empresa beneficiaria. La "directa" se reserva para el caso en que se imputara al partido como tal.
2. **Pareja sentimental de cargo público → partido del cargo = indirecta.** Reputacionalmente salpica al partido, pero el investigado es persona privada. Indirecta lo refleja sin sobre-imputar.
3. **Esposa del presidente del Gobierno → partido del cónyuge = indirecta.** Mismo principio que (2); coherencia entre casos.
4. **Ministerio cuyo titular ordena el acto irregular = directa para el Ministerio, indirecta para el partido titular.** El ámbito del que emana el acto es directa; el partido al que pertenece el cargo es indirecta.
5. **Acusación popular constituida por un partido = NO afectada (papel procesal).** Es trabajo procesal voluntario, no afectación. Justo el bug que se está arreglando.
6. **Nombramiento por gobierno X de cargo con autonomía formal (ej. FGE) = NO afectada del gobierno X.** La autonomía formal existe; salvo que el caso cuestione el nombramiento (no es así, lo cuestionado son actos personales del nombrado), el partido del gobierno que nombró no se afecta.

## Recalificación esperada de los 6 casos publicables

Antes del refactor, estado a recalibrar con la taxonomía nueva. Esto es lo que el maintainer ha confirmado en frío:

- **Plus Ultra**: Plus Ultra S.A. = directa. PSOE = indirecta (regla 1). Podemos = indirecta (regla 1, coalición de gobierno). Zapatero/militancia histórica → descartar como "afectación" (no encaja en directa ni indirecta; era una entrada débil con `militancia_o_cargo_organico_relevante` poco justificable).
- **Begoña Gómez**: UCM = directa (perjudicado institucional). PSOE = indirecta (regla 3).
- **González Amador**: Hacienda Pública / AEAT = directa. Maxwell Cremona S.L. = directa (persona jurídica investigada). PP = indirecta (regla 2). PSOE y Más Madrid = no afectadas (regla 5).
- **FGE**: ningún partido afectado (regla 6). FGE como organismo no se modela como "directa" porque el sujeto es persona física (García Ortiz); la institución FGE no es ni víctima ni investigada. Cabe revisar si se modela como "directa" reputacionalmente, decisión editorial fina.
- **Kitchen**: Ministerio del Interior = directa (regla 4). PP = indirecta (regla 4, partido titular del ministerio en los hechos). PSOE y Podemos = no afectadas (regla 5).
- **Lezo**: PP = indirecta (regla 1, gobiernos PP-CAM 2003-2017 + cargos PP imputados). Canal Isabel II = directa (persona jurídica investigada).

## Plan de ejecución

### Fase 1 — Doc canónico

Crear `docs/diseno/08-afectacion-directa-indirecta.md` con:

- Las 3 definiciones de nivel.
- Las 6 reglas editoriales con justificación.
- La recalificación esperada de los 6 casos publicables como ejemplos.
- Una sección "Qué NO es afectación" listando los casos típicos de error: acusación popular, defensa, nombramiento histórico de cargo con autonomía formal, militancia antigua sin cargo activo, vínculo familiar lejano.

### Fase 2 — Schema

Opción preferida: **fusionar `Caso.partidos_afectados[]` dentro de `VinculoInstitucional`** + nuevo campo `nivel_afectacion`.

- Añadir a `VinculoInstitucional`: `nivel_afectacion: 'directa' | 'indirecta' | null`. `null` cuando la naturaleza del vínculo es procesal (acusación popular, defensa, perito), no afectación.
- Reglas de coherencia en `scripts/validate.mjs` (nuevas V-rules):
  - `naturaleza = entidad_investigada_en_caso | perjudicado_institucional_en_caso | norma_habilitante_del_acto` ⇒ `nivel_afectacion` obligatorio, valor esperado `directa`.
  - `naturaleza = acusacion_institucional_en_caso | defensa_en_caso | perito_en_caso` ⇒ `nivel_afectacion` obligatorio, valor esperado `null`.
  - `naturaleza` que represente partido / ministerio salpicado por cargo o vínculo familiar ⇒ `nivel_afectacion = indirecta`. Esto exige añadir una naturaleza nueva tipo `partido_del_cargo_investigado_en_caso` o reutilizar `cargo_organico_en_partido` con un flag.
- Retirar `Caso.partidos_afectados[]` del schema una vez migrados los datos. La justificación que hoy vive en `partidos_afectados[].justificacion` se mueve al `documentos_respaldo[].pasaje` o a un nuevo campo `justificacion_afectacion` del vínculo.

Opción alternativa (descartada salvo objeción): mantener `Caso.partidos_afectados[]` y añadirle `nivel_afectacion`. Más fácil pero deja la duplicidad conceptual sin resolver.

### Fase 3 — Datos

Recalificar los 6 casos publicables conforme a la sección "Recalificación esperada" de arriba. Pasada caso a caso, con `pnpm validate` entre cada uno.

Cuidado con los esqueletos `pendiente` (26 casos): no tocarlos en esta sesión; quedan sin `nivel_afectacion` y se rellenan cuando se publiquen.

### Fase 4 — UI

- **`/casos`**: fusionar columnas "Organización afectada" + "Partidos afectados" en una sola "**Organizaciones afectadas**". Render: lista vertical compacta con (a) directas arriba con `RolBadge` apropiado, (b) indirectas debajo con `PartidoBadge` cuando son partidos o nombre llano cuando son otras orgs. Si no hay indirectas, la columna sólo muestra directas. Dedupe natural por `organizacion_id`.
- **`PgCasoDetalle.astro`**:
  - Eliminar la sección actual "Partidos afectados" de la cabecera (su contenido se reparte entre indirectas y no-afectadas).
  - Reformular "Instituciones alcanzadas" → "**Organizaciones afectadas**" con dos sub-bloques: "Directa" y "Indirecta". Cada org con su `justificacion_afectacion`.
  - En el bloque "Organizaciones implicadas" (que ya existe), dividir visualmente en **Afectadas** (directa + indirecta) y **No afectadas** (acusación popular, defensa, instructor, fiscalía, peritos).
- **Home**: el preview de casos destacados sigue mostrando partidos, pero ahora vienen de las indirectas, no del campo retirado.

### Fase 5 — Skill `/documentar-vinculos`

Adaptar la rama "modo caso" para que pida `nivel_afectacion` al crear un vínculo, con valor sugerido derivado de la naturaleza. Mantener auto-detect: si la naturaleza es claramente procesal (acusación popular, defensa), sugerir `null` directamente sin preguntar.

### Fase 6 — Pasada de `/revisar-caso`

Tras el refactor de datos, lanzar `/revisar-caso` sobre los 6 publicables para detectar incoherencias residuales: vínculos donde la justificación de afectación contradice el `nivel_afectacion`, casos donde quedan "afectadas" pintadas que no deberían serlo, partidos perdidos en la migración.

### Fase 7 — Cierre

Marcar `[x]` en ROADMAP, archivar `Caso.partidos_afectados[]` del schema (versión `archivado_2026_*` o sustitución limpia), actualizar fichas `partidos-afectados.md` + `vinculos-institucionales.md` + `casos.md` + `inicio.md` con la nueva realidad.

## Decisiones que el agente no debe tomar solo

- Si en la recalificación aparece un caso fronterizo no cubierto por las 6 reglas (ej. partido extranjero salpicado, asociación cultural con vínculo difuso), **pregunta al maintainer**.
- Si la fusión de schema rompe más cosas de las previstas (V-rules existentes, contenido de aportes, OG images), **propón fase intermedia** en lugar de forzar el cambio.
- La retirada de `Caso.partidos_afectados[]` del schema es **el último paso**: hacerla sólo cuando los datos estén migrados y la UI los lea desde el nuevo modelo.

## Estado actual

Pendiente. Sesión dedicada futura. Esta ficha es el brief.

## Pendientes operativos

- [ ] Fase 1: doc canónico `docs/diseno/08-afectacion-directa-indirecta.md`.
- [ ] Fase 2: schema (`VinculoInstitucional.nivel_afectacion` + V-rules).
- [ ] Fase 3: recalificación de los 6 casos publicables.
- [ ] Fase 4: UI (`/casos` columna fusionada, `PgCasoDetalle` reformulado).
- [ ] Fase 5: skill `/documentar-vinculos` adaptada.
- [ ] Fase 6: pasada `/revisar-caso` post-refactor.
- [ ] Fase 7: cierre (schema, fichas, ROADMAP).
