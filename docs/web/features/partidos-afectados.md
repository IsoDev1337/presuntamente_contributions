# Partidos afectados por caso

> Archivos clave: [`schemas/caso.schema.json`](../../../schemas/caso.schema.json) (campo `partidos_afectados`) · [`src/content.config.ts`](../../../src/content.config.ts) (Zod) · `src/components/pages/PgCasoDetalle.astro` (bloque «Partidos afectados» dentro de «Estado procesal actual») · `src/components/pages/PgCasos.astro` (columna «Partidos afectados»). Relacionada con [`vinculos-institucionales.md`](vinculos-institucionales.md).

## Qué hace

Declara, caso a caso, qué partidos políticos quedan "alcanzados" editorialmente por el procedimiento — más allá de la existencia o no de imputaciones procesales contra cargos del partido. Es un campo del editor, no derivado automáticamente del repositorio.

## Para qué sirve

Que un lector pueda escanear el listado de casos y ver, sin entrar a la ficha, **qué siglas toca cada caso**. Sirve a la pregunta natural de la audiencia ("¿esto es del PSOE, del PP, de Vox?") sin reducir el caso a una etiqueta partidista ni inferir bandos.

Internamente sirve también como autocontrol: si un caso queda con `partidos_afectados: []`, el editor reconoce que el caso no alcanza directamente a ningún partido (puede pasar — un caso autonómico o municipal puede no encajar en partidos nacionales).

## Cómo funciona

### Modelo

Campo nuevo en `Caso` (decisión 2026-05-26):

```yaml
partidos_afectados:
  - partido_id: psoe
    tipo_afectacion: vinculo_familiar_directo_con_dirigente
    justificacion: >-
      La investigada es cónyuge del presidente del Gobierno, secretario general
      del PSOE en el momento de los hechos.
```

- **`partido_id`** (obligatorio): slug de una `Organizacion` con `tipo: partido_politico`. Validación referencial implícita por convención (no FK estricta en AJV).
- **`tipo_afectacion`** (obligatorio): enum cerrado.
  - `imputacion_a_cargo_del_partido` — un cargo del partido figura como sujeto procesal del caso.
  - `gobierno_responsable_del_acto_investigado` — el partido lidera el gobierno (nacional, autonómico, local) bajo el que se produjo el acto investigado.
  - `vinculo_familiar_directo_con_dirigente` — el investigado tiene vínculo familiar directo con un cargo público o dirigente del partido (figura pública).
  - `militancia_o_cargo_organico_relevante` — el investigado tiene militancia activa o cargo orgánico en el partido en el momento de los hechos.
  - `querella_o_acusacion_popular_del_partido` — el partido figura como denunciante o acusación popular constituida.
  - `otro` — cualquier otra vinculación documentada con justificación.
- **`justificacion`** (obligatorio): frase corta y neutra describiendo por qué el caso alcanza al partido en este eje. **Sin inferencias políticas.** Ejemplos válidos: "Acusación popular personada", "Cónyuge del presidente del Gobierno"; ejemplos prohibidos: "Caso típico de corrupción socialista", "El PP siempre se ve salpicado por…".

### UI

- **Listado /casos**: columna «Partidos afectados» con `PartidoBadge` por partido, clicable a la página del partido. Deduplicado por `partido_id` cuando el mismo partido tiene varias entradas con `tipo_afectacion` distinto (la justificación detallada vive en la ficha del caso, no en el chip).
- **PgCasoDetalle**: bloque dentro de «Estado procesal actual», antes de «Instituciones alcanzadas». Cada partido en una fila con siglas grandes + label del tipo de afectación (versalitas, muted) + justificación literal. El `border-left` y el color de la sigla los marca el `data-partido` con los tokens de `--color-partido-<slug>-*` (sin meter el chip dentro del bloque editorial — el color identifica, no se anida caja en caja).
- **Landing**: el preview de "Casos destacados" muestra `PartidoBadge` en modo `asLink={false}` (la card destacada ya envuelve un `<a>`, evita anidar enlaces).

### Mantenimiento

El campo lo rellena el maintainer al cerrar la primera versión publicable de un caso. No hay skill automática que lo derive — es decisión editorial. Cuando se modele un caso nuevo, valorar si encaja alguno de los seis `tipo_afectacion` y justificar; si no, dejar vacío.

## Estado actual

**Schema + UI + 6 casos publicables poblados (2026-05-26 tarde-noche, sprint extendido).**

- `begona-gomez`: PSOE · `vinculo_familiar_directo_con_dirigente`.
- `gonzalez-amador`: PP · `vinculo_familiar_directo_con_dirigente` + PSOE/Más Madrid · `querella_o_acusacion_popular_del_partido`.
- `plus-ultra`: PSOE × 2 (`gobierno_responsable_del_acto_investigado` por la aprobación del préstamo FASEE en mar 2021 + `militancia_o_cargo_organico_relevante` por Zapatero como ex Secretario General, vínculo histórico no activo en 2021) · Podemos `gobierno_responsable_del_acto_investigado` por la coalición.
- `fiscal-general-del-estado`: PSOE · `gobierno_responsable_del_acto_investigado` por la designación de García Ortiz.
- `kitchen`: PP × 2 (`gobierno_responsable_del_acto_investigado` por Min. Interior 2013-2015 + `imputacion_a_cargo_del_partido` por Fernández Díaz y Martínez Vázquez) · PSOE y Podemos · `querella_o_acusacion_popular_del_partido` por personación.
- `lezo`: PP × 2 (`gobierno_responsable_del_acto_investigado` por Canal Isabel II en gobiernos PP-CAM 2003-2017 + `imputacion_a_cargo_del_partido` por Ignacio González, Calvo Poch y Bravo Rivera).

10 entradas en total, todas con justificación neutra y verificable. Los 6 casos publicables tienen el campo declarado de forma explícita; no quedan casos publicables sin pasada de `partidos_afectados`.

## Decisiones editoriales y aprendizajes

- **Declaración explícita, no derivación.** Aunque el repositorio contiene `VinculoInstitucional` con cargo orgánico de un investigado en un partido, NO inferimos `partidos_afectados` desde ahí: el editor lo declara explícitamente para no producir falsos positivos (un cargo orgánico antiguo en otro partido no implica que el caso alcance a ese partido).
- **No es un campo de responsabilidad política.** Que un caso toque al PSOE no significa "el PSOE es responsable del acto". El tipo de afectación lo precisa: `gobierno_responsable_del_acto_investigado` se aproxima a responsabilidad institucional, pero el resto (vínculo familiar, acusación popular…) son contextos, no atribuciones de culpa.
- **Justificación obligatoria y neutra.** Sin justificación literal y verificable contra fuentes públicas (cobertura cruzada, BOE, manifestación pública del propio investigado), no se rellena. Las justificaciones son auditables por cualquier lector contra documentos del propio inventario.
- **No reemplaza a `VinculoInstitucional`.** Cuando un caso alcanza a un partido por imputación a un cargo orgánico del partido, ambos modelos coexisten: el vínculo cargo_orgánico_partido en `VinculoInstitucional` (con su documento de respaldo), y `partidos_afectados` con `tipo_afectacion: imputacion_a_cargo_del_partido` (con justificación que probablemente cite ese mismo vínculo).
- **Tipos de afectación son ortogonales.** Un mismo caso puede afectar al mismo partido por más de un tipo. En esos casos se modelan **varias entradas** en el array, una por tipo, cada una con su justificación. No promediamos.
- **Color institucional por partido con saturación bajada.** Decidido 2026-05-26 e implementado 2026-05-27 con `PartidoBadge`. Cubre los 7 partidos modelados (PSOE, PP, Vox, Podemos, Sumar, IU, Más Madrid). Cualquier otro `partido_id` cae a fallback gris neutro: no se elige color a ojo. Tokens en `global.css` (`--color-partido-<slug>-{bg,fg,border}`). Detalle de paleta en [`partido-badge.md`](partido-badge.md).
- **Dedupe en listado.** Si un caso tiene el mismo partido en varios `tipo_afectacion` (Plus Ultra: PSOE × 2; Kitchen: PP × 2), el listado muestra un solo chip por partido. La justificación detallada queda en la ficha del caso.
- **Refactor "afectación directa vs indirecta" pendiente.** Decisión 2026-05-27: el enum actual confunde "afectación" con "papel procesal" (`querella_o_acusacion_popular_del_partido` no debería ser "afectación"). El modelo se fusionará con `VinculoInstitucional` bajo una sola dimensión `nivel_afectacion: directa | indirecta | no` en una sesión dedicada futura. Ver [`afectacion-directa-indirecta.md`](afectacion-directa-indirecta.md) para el plan completo.

## Ideas futuras

### v1 pre-launch

- Poblar los 4 casos publicables restantes con `partidos_afectados` (revisión editorial humana, Bloque C).
- Nota metodológica en `/sobre` explicando los seis `tipo_afectacion` y por qué se llaman "afectados" (no "responsables").

### v1.x

- `PartidoBadge` con tokens de color por partido (PSOE, PP, Vox, Podemos, Más Madrid, Sumar, BNG, EH Bildu, Junts, ERC…). Sustituye los chips actuales en /casos, en el bloque de Caso y en la landing.
- Filtro «Partido afectado» en /casos.
- Vista agregada en /cifras: distribución de casos por partido afectado, separada por tipo de afectación (no se mezcla "imputación" con "acusación popular").
- Lectura cruzada con [`vinculos-institucionales.md`](vinculos-institucionales.md): cuando hay imputación a cargo del partido, mostrar el vínculo respaldado.

### Sin compromiso

- Vista temporal: partidos afectados por legislatura o periodo.
- Export del corpus por partido.

## Pendientes operativos

- [x] Diseñar enum de `tipo_afectacion`. **Decisión 2026-05-26**: seis valores cerrados.
- [x] Decidir si el campo es derivado o declarado. **Decisión 2026-05-26**: declarado, justificación obligatoria.
- [x] Entregar UI en PgCasoDetalle y /casos. **Entregado 2026-05-26 (tarde):** bloque dentro de «Estado procesal actual» + columna en listado.
- [x] Poblar al menos dos casos piloto. **Entregado 2026-05-26 (tarde):** `begona-gomez`, `gonzalez-amador`.
- [x] Poblar los 4 casos restantes (`plus-ultra`, `fiscal-general-del-estado`, `kitchen`, `lezo`). **Entregado 2026-05-26 (tarde-noche, sprint extendido).** Detalle por caso en «Estado actual».
- [x] Refactor a `PartidoBadge` con tokens de color por partido. **Entregado 2026-05-27**: 7 partidos modelados con paleta sobria + dedupe en listado + `data-partido` en bloque editorial de la ficha. Detalle en [`partido-badge.md`](partido-badge.md).
- [ ] **Refactor estructural "afectación directa vs indirecta"** — fusión con `VinculoInstitucional`, retirada de `Caso.partidos_afectados[]` o aplanado a `nivel_afectacion`. Sesión dedicada futura. Plan en [`afectacion-directa-indirecta.md`](afectacion-directa-indirecta.md).
