# Feature — Importe presuntamente atribuido

> **Estado: modelo de datos implementado (2026-05-29). UI pendiente en sesión aparte.** Fases 1 (schema + tipos + doc 01) y 2 (backfill editorial de los casos) hechas. Las fases 3-5 (ficha de caso, gráficas en `/graficas`, titular en la home) las hace la sesión de UI cuando se mergee. Decidido por el maintainer el 2026-05-28: cerrar primero gráficas/UI base y modelar el dinero en una sesión/worktree aparte.

Trackear **cuánto dinero** se atribuye en cada caso —y por persona y por organización— y mostrarlo en las fichas y en [`/graficas`](../pages/graficas.md). El maintainer lo considera "lo que más puede interesar a la gente". También es lo más delicado editorialmente: un número de euros mal presentado afirma culpabilidad. Por eso se modela con cuidado: cada euro cuelga de un `Hecho` con su estado epistémico, su nivel de fuente y su documento.

## Estado actual (qué hay y qué falta)

- **Modelado como dato en el `Hecho`** (hecho 2026-05-29): campos `importe`, `importe_moneda`, `importe_alcance`, `importe_naturaleza`, `importe_nota` en [`schemas/hecho.schema.json`](../../../schemas/hecho.schema.json), [`src/content.config.ts`](../../../src/content.config.ts) y [`docs/diseno/01-modelo-de-datos.md`](../../diseno/01-modelo-de-datos.md) §2.6 (enums `ImporteAlcance`/`ImporteNaturaleza`, reglas V-22 y V-23). 17 Hechos poblados en 7 casos; ya es **sumable y filtrable**.
- **Pendiente (sesión UI):** consumir el dato en la ficha de caso (bloque "cifras del caso" trazado), en `/graficas` (treemap/ranking con toggle firme/abierto + CSV/JSON) y, en su día, en el titular de la home.
- [`Money.astro`](../../../src/components/Money.astro) sigue siendo un chip de texto inline para prosa (`amount: string`); es presentación, no dato. `Caso.resumen_cifras` y `sintesis_caso.cifras_clave` siguen como texto libre (titular legible). La cifra estructurada vive en los Hechos.
- La idea ya estaba esbozada como "Vista B" en [`cifras.md`](../pages/cifras.md) (sección "Ideas futuras"), incluida la tensión con la presunción de inocencia.

## Modelado (implementado: en el `Hecho`)

El importe vive en cada **`Hecho`**, no en el `Caso` suelto, para que **herede** lo que el proyecto ya hace bien: estado epistémico, nivel de fuente N1–N4 y documentos de respaldo. Así cada euro es trazable a un hecho concreto con su grado de prueba.

Campos en el `Hecho` ([`schemas/hecho.schema.json`](../../../schemas/hecho.schema.json) + [`src/content.config.ts`](../../../src/content.config.ts) + [doc 01 §2.6](../../diseno/01-modelo-de-datos.md)):

- `importe`: `number` — cantidad en la unidad de `importe_moneda`. Normalizada (sin separadores de miles, punto decimal). Si está presente, exige `importe_alcance` (V-22, schema-enforced vía `if/then`).
- `importe_moneda`: `string` — código ISO 4217, por defecto `"EUR"`. Las cifras en otra divisa (dólares en operaciones internacionales) **no** se estructuran: el importe estructurado es siempre la cifra editorialmente relevante en euros y la divisa original se anota en `importe_nota`.
- `importe_alcance`: `enum` — **clave para no duplicar al sumar**:
  - `total_caso` — cifra global del perjuicio/objeto del caso o de una de sus piezas. Sumable entre sí.
  - `componente` — partida que desglosa un total ya contabilizado, o cifra meramente citada / no acumulable (petición de pena no firme, ofrecimiento no percibido, importe de un hecho exculpatorio). **Nunca se suma.**
  - `individual` — importe atribuido nominalmente a una persona/organización. Alimenta la vista por persona; sólo suma al total del caso si no hay ningún `total_caso`.
- `importe_naturaleza`: `enum` opcional (añadido sobre el brief original) — qué representa la cifra (`perjuicio`, `objeto_contrato`, `fondo_publico_concedido`, `comision_ilicita`, `cobro_indebido`, `multa_penal`, `responsabilidad_civil`, `gasto_publico_cuestionado`, `otro`). Evita que el futuro treemap sume cifras incomparables (un préstamo concedido ≠ un perjuicio cuantificado ≠ una multa penal).
- `importe_nota`: `string` opcional — origen de la cifra, desglose, divisa original, o por qué no acumula.

Hereda del propio `Hecho` (ya existentes): `tipo` (acreditado / investigado / atribuido…), `nivel_fuente_efectivo` (N1–N4), `documentos_respaldo`, `personas_implicadas`, `organizaciones_implicadas`, `vigencia`.

### Agregaciones derivadas (la UI las computa desde los Hechos)

- **Por caso** — Σ(`importe` con `alcance = total_caso`); si no hay ninguno, Σ(`individual`). Los `componente` nunca suman. Mostrar siempre estado epistémico + nivel.
- **Por persona** — suma de importes `individual` de hechos donde la persona está implicada **y tiene rol formal** (guardarraíl de presunción de inocencia: nunca personas sin rol procesal).
- **Por organización** — análogo, vía `organizaciones_implicadas`.
- Los Hechos `exculpatorio` / `desmentido` se excluyen de los totales atribuidos.

### Qué se pobló (backfill 2026-05-29)

17 Hechos en 7 casos. Decisiones de dedup tomadas (V-23, revisión editorial):

| Caso | Importe estructurado | Alcance · naturaleza | Nota de dedup |
|------|----------------------|----------------------|----------------|
| Plus Ultra | 53 M€ | total_caso · fondo_publico_concedido | El hecho `pu-rescate-cauces-irregulares` repite el mismo préstamo: **no se estructura** para no duplicar. |
| Begoña Gómez | 113.509,32 € | total_caso · perjuicio | El hecho de coste del software lleva la misma cifra como `componente` (desglose 108.765,79 € + 4.743,53 €): no acumula. |
| FGE | 7.200 € + 10.000 € | individual · multa_penal / responsabilidad_civil | Sin `total_caso` (caso de revelación de secretos): el total del caso = suma de los dos individuales (17.200 €, condena firme). |
| González Amador | 350.951 € + 1,9 M€ | total_caso · perjuicio / objeto_contrato | Multa pedida (>600.000 €) = `individual` (no firme, no suma al caso). Comisión Quirón 500.000 € = `componente` (ya dentro del 1,9 M€). |
| Leire Díez | 700.000 € + 188.000 € | total_caso · comision_ilicita / cobro_indebido | Ofrecimiento de 50.000 € = `componente` (no percibido, no acumula). |
| Lezo | 19 M€ + 9,6 M€ + 1,8 M€ + 3 M€ | total_caso · responsabilidad_civil / perjuicio / comision_ilicita | Cuatro piezas distintas, sin solape → suman. Cifras en USD (73 M, 30 M, 2,5 M) y reparto 5,5 M€ van en `importe_nota`, no estructuradas. |
| ático-estepona | 770.000 € | componente · objeto_contrato | Hecho `exculpatorio` (sobreseído): cifra conservada por trazabilidad, no acumula. |

**Casos sin importe estructurado:** **Kitchen** — los autos/cobertura citados no cuantifican una cifra concreta de fondos reservados; no se inventa (refuerza el guardarraíl de representatividad: la UI debe mostrar "X de Y casos con importe cuantificado").

## Guardarraíles innegociables

Heredados de [`AGENTS.md`](../../../AGENTS.md) (principios irrenunciables) y [`cifras.md`](../pages/cifras.md):

1. **Lenguaje.** Nunca "robó / defraudó / se apropió". Sí: *"importe presuntamente atribuido en procedimiento abierto"*, *"perjuicio cuantificado en sentencia firme"*. La versión correcta es menos pegadiza; se acepta.
2. **Estado + nivel siempre visibles** junto a cada número. Un importe de sentencia firme (acreditado, N1) ≠ uno de un escrito de acusación (atribuido, N3) ≠ uno de prensa (N4).
3. **Toggle "solo sentencias firmes" vs "procedimientos abiertos".** Sin él, el sumatorio se lee como "dinero realmente robado".
4. **Sin doble conteo.** `importe_alcance` evita sumar un total y sus partes. Revisión obligatoria al backfillear.
5. **Representatividad.** Mostrar "X de Y casos tienen importe cuantificado". Si la cobertura es parcial, el agregado global engaña (mismo principio que el bloque de partidos, hoy diferido).
6. **Moneda e inflación.** v1 nominal en euros, con nota. Ajuste por inflación (casos de los 90 vs 2024) = decisión abierta, probablemente v1.x.

## Fases de ejecución

1. **Schema + tipos.** `[x]` (2026-05-29) Campos en `hecho.schema.json` (con `if/then` para V-22) + `content.config.ts` + doc 01 (§2.6, enums, V-22/V-23, parking lot 3 cerrado).
2. **Backfill editorial.** `[x]` (2026-05-29) 17 Hechos en 7 casos, con dedup por caso (tabla arriba). `pnpm validate` 787 OK, 0 errores.
3. **Ficha de caso.** `[ ]` (sesión UI) Bloque "cifras del caso" estructurado y trazado (cada importe enlaza a su hecho/documento). Mostrar estado epistémico + nivel junto a cada cifra.
4. **Gráficas en `/graficas`.** `[ ]` (sesión UI) Treemap/ranking por caso · persona · organización, con el toggle firme/abierto, disclaimers y datos descargables (CSV/JSON). Reutiliza el sistema de charts ([`visualizaciones-graficas.md`](visualizaciones-graficas.md)). Computar agregaciones con las reglas de arriba (excluir `componente`; excluir `exculpatorio`/`desmentido`; respetar `importe_naturaleza` para no sumar incomparables).
5. **Titular en la home.** `[ ]` (sesión UI) Sustituir/ampliar el teaser actual del hero (hoy "casos por fase") por el titular de dinero, una vez el dato sea representativo y el copy esté firmado.

## Decisiones abiertas

- **Dedup (`importe_alcance`) vs casos multi-pieza.** `[x]` Resuelto: cada pieza con perjuicio/objeto diferenciado es un `total_caso` (suman sin solape); las partidas que desglosan un total y las cifras repetidas en dos hechos van como `componente`; las peticiones de pena y los importes individuales como `individual`. Reglas en [doc 01 §2.6](../../diseno/01-modelo-de-datos.md) (V-23). El backfill aplicó esto caso a caso (tabla "Qué se pobló").
- Modelo de vínculo persona↔partido **en el momento del hecho** si se cruza dinero con partidos (no trivial; ver [`cifras.md`](../pages/cifras.md) punto 5 de "Vista B"). **Abierto.**
- Snapshot histórico mensual si se quiere comparativa temporal del importe agregado. **Abierto.**
- Ajuste por inflación (casos de los 90/2000 vs 2024) — hoy v1 nominal en euros con nota. **Abierto, probablemente v1.x.**
- Firma editorial del copy + disclaimers (estilo Bloque C) antes de publicar el agregado: sería la cara del sitio al compartirlo. **Abierto (sesión UI).**

## Cómo sigue la sesión de UI

El dato ya está modelado y poblado: la sesión de UI consume `getCollection('hechos')` y filtra por `importe != null`. Para los agregados, aplicar las reglas de "Agregaciones derivadas" (excluir `componente`, excluir `exculpatorio`/`desmentido`, agrupar/colorear por `importe_naturaleza` para no sumar incomparables) y respetar los guardarraíles innegociables (estado + nivel visibles, toggle firme/abierto, representatividad "X de Y casos"). Caso piloto limpio para validar el render punta a punta: Plus Ultra (53 M€, N1, `total_caso`). Para nuevos casos, `/incorporar-hito` y `/actualizar-caso` deben rellenar los campos `importe*` al leer autos con cifras.
