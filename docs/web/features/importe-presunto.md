# Feature (PROYECTO, sin empezar) — Importe presuntamente atribuido

> **Estado: brief para ejecutar en otra sesión.** Nada implementado. Decidido por el maintainer el 2026-05-28: cerrar primero gráficas/UI y dejar el dinero escrito como proyecto. Esta ficha es el punto de partida ejecutable.

Trackear **cuánto dinero** se atribuye en cada caso —y por persona y por organización— y mostrarlo en las fichas y en [`/graficas`](../pages/graficas.md). El maintainer lo considera "lo que más puede interesar a la gente". También es lo más delicado editorialmente: un número de euros mal presentado afirma culpabilidad. Por eso se diseña con cuidado antes de tocar datos.

## Estado actual (qué hay y qué falta)

- **No está modelado como dato.** [`Money.astro`](../../../src/components/Money.astro) es sólo un chip de texto inline (`amount: string`, p. ej. "53,5 M€") que usa `RichProse` en prosa. `Caso.resumen_cifras` es texto libre. **Nada es sumable ni filtrable.**
- La idea ya estaba esbozada como "Vista B" en [`cifras.md`](../pages/cifras.md) (sección "Ideas futuras"), incluida la tensión con la presunción de inocencia.

## Modelado propuesto (recomendado: en el `Hecho`)

El importe vive en cada **`Hecho`**, no en el `Caso` suelto, para que **herede** lo que el proyecto ya hace bien: estado epistémico, nivel de fuente N1–N4 y documentos de respaldo. Así cada euro es trazable a un hecho concreto con su grado de prueba.

Campos nuevos en el `Hecho` (formalizar en [`docs/diseno/01-modelo-de-datos.md`](../../diseno/01-modelo-de-datos.md), `schemas/hecho.schema.json` y `src/content.config.ts`):

- `importe`: `number` — cantidad en la unidad de `importe_moneda`. Normalizada (sin separadores).
- `importe_moneda`: `string` — por defecto `"EUR"`.
- `importe_alcance`: `enum` — **clave para no duplicar al sumar**:
  - `total_caso` — la cifra global del perjuicio/objeto del caso (la "titular").
  - `componente` — una partida que forma parte de un total ya contabilizado (NO se suma con el total).
  - `individual` — importe atribuido a una persona/organización concreta dentro del caso.
- `importe_nota`: `string` opcional — matiz ("según escrito de acusación", "perjuicio cuantificado por la UCM", etc.).

Hereda del propio `Hecho` (ya existentes): `tipo` (acreditado / investigado / atribuido…), `nivel_fuente_efectivo` (N1–N4), `documentos_respaldo`, `personas_implicadas`, `organizaciones_implicadas`, `vigencia`.

### Agregaciones derivadas (gratis con este modelado)

- **Por caso** — la cifra `total_caso` (o suma de `individual` si no hay total), con su estado epistémico y nivel.
- **Por persona** — suma de importes `individual` de hechos donde la persona está implicada **y tiene rol formal** (guardarraíl de presunción de inocencia: nunca personas sin rol procesal).
- **Por organización** — análogo, vía `organizaciones_implicadas`.

## Guardarraíles innegociables

Heredados de [`AGENTS.md`](../../../AGENTS.md) (principios irrenunciables) y [`cifras.md`](../pages/cifras.md):

1. **Lenguaje.** Nunca "robó / defraudó / se apropió". Sí: *"importe presuntamente atribuido en procedimiento abierto"*, *"perjuicio cuantificado en sentencia firme"*. La versión correcta es menos pegadiza; se acepta.
2. **Estado + nivel siempre visibles** junto a cada número. Un importe de sentencia firme (acreditado, N1) ≠ uno de un escrito de acusación (atribuido, N3) ≠ uno de prensa (N4).
3. **Toggle "solo sentencias firmes" vs "procedimientos abiertos".** Sin él, el sumatorio se lee como "dinero realmente robado".
4. **Sin doble conteo.** `importe_alcance` evita sumar un total y sus partes. Revisión obligatoria al backfillear.
5. **Representatividad.** Mostrar "X de Y casos tienen importe cuantificado". Si la cobertura es parcial, el agregado global engaña (mismo principio que el bloque de partidos, hoy diferido).
6. **Moneda e inflación.** v1 nominal en euros, con nota. Ajuste por inflación (casos de los 90 vs 2024) = decisión abierta, probablemente v1.x.

## Fases de ejecución sugeridas

1. **Schema + tipos.** Campos en `hecho.schema.json` + `content.config.ts` + doc 01. (Archivos calientes: coordinar.)
2. **Backfill editorial** de los ~7 casos publicables (el agente redacta diffs, el maintainer revisa). Extraer importes del texto libre / chips `<Money>` a campos estructurados con su estado y fuente.
3. **Ficha de caso.** Bloque "cifras del caso" estructurado y trazado (cada importe enlaza a su hecho/documento).
4. **Gráficas en `/graficas`.** Treemap/ranking por caso · persona · organización, con el toggle firme/abierto, disclaimers y datos descargables (CSV/JSON). Reutiliza el sistema de charts ([`visualizaciones-graficas.md`](visualizaciones-graficas.md)).
5. **Titular en la home.** Sustituir/ampliar el teaser actual del hero (hoy "casos por fase") por el titular de dinero, una vez el dato sea representativo y el copy esté firmado.

## Decisiones abiertas (resolver antes de implementar)

- Mecanismo exacto de dedup (`importe_alcance`) vs casos con varias piezas/perjuicios solapados.
- Modelo de vínculo persona↔partido **en el momento del hecho** si se cruza dinero con partidos (no trivial; ver [`cifras.md`](../pages/cifras.md) punto 5 de "Vista B").
- Snapshot histórico mensual si se quiere comparativa temporal del importe agregado.
- Firma editorial del copy + disclaimers (estilo Bloque C) antes de publicar: sería la cara del sitio al compartirlo.

## Cómo arrancar la sesión

`/incorporar-hito` y `/actualizar-caso` ya leen autos con importes; el backfill puede apoyarse en ellas. Empezar por el schema (fase 1) acordando los campos exactos con el maintainer, luego un caso piloto (p. ej. Plus Ultra: préstamo FASEE de 53 M€, dato limpio y N1/N2) para validar el modelo punta a punta antes de backfillear el resto.
