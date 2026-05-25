# Estado de la ficha de caso

> Archivos clave: [`schemas/caso.schema.json`](../../../schemas/caso.schema.json) (`estado_ficha` + `estado_publicacion` ampliado a 7 valores) · [`src/content.config.ts`](../../../src/content.config.ts) · [`src/components/EstadoFichaBadge.astro`](../../../src/components/EstadoFichaBadge.astro) (badge de chequeo individual) · [`src/components/EstadoPublicacionBadge.astro`](../../../src/components/EstadoPublicacionBadge.astro) (badge de estado global) · [`src/components/pages/PgCasoDetalle.astro`](../../../src/components/pages/PgCasoDetalle.astro) (flip de la masthead) · [`src/components/pages/PgCasos.astro`](../../../src/components/pages/PgCasos.astro) (columna "Estado ficha" + fila bloqueada en producción) · [`src/pages/casos/[slug].astro`](../../../src/pages/casos/[slug].astro) (filtro `getStaticPaths` en producción).

## Qué hace

Tres piezas integradas:

1. **Estado global** de la ficha por enum `estado_publicacion` con 7 valores que cubren el ciclo de vida editorial completo (`pendiente`, `borrador`, `beta_publica`, `en_revision`, `publicado`, `retirado_temporalmente`, `retirado_definitivamente`). Determina la visibilidad pública: en producción los `pendiente`/`borrador` no generan ruta pero siguen apareciendo como fila gris no clickable en `/casos`.
2. **Estado de la ficha** por chequeos: campo `estado_ficha` con 10 chequeos discretos (`completo` / `parcial` / `pendiente` / `no_aplica`) sobre cronología, roles, primarios, hechos, fuentes, las 4 features transversales del Bloque D y la revisión editorial.
3. **Flip de la masthead** del caso: la cabecera se voltea como una página desde el grupo superior `EstadoPublicacionBadge` + botón secundario `Ver detalles de desarrollo`, revelando en el reverso los 10 chequeos y "Cómo se ha redactado esta ficha".

## Para qué sirve

- Que el lector vea **a un golpe** si una ficha es publicable, en qué estado de desarrollo está y por qué.
- Que no confunda "esto no aparece en la web" con "esto no existe en el procedimiento".
- Que el lector pueda profundizar en el detalle del estado sin sacar el contenido del caso de la cabecera (flip).
- Que la lista pública de casos sea honesta: incluye casos en cola que aún no son accesibles, sin esconderlos.

## Cómo funciona

### Modelo

**Campo `estado_publicacion`** (ya existía con 5 valores, ampliado a 7 el 2026-05-25):

| Valor | Visibilidad en producción | Badge UI | Notas |
|---|---|---|---|
| `pendiente` | Listado en `/casos`, fila gris no clickable. Ruta `/casos/<slug>` no se genera. | gris desaturado | Caso en cola, sin trabajo iniciado. |
| `borrador` | Igual que `pendiente`. | navy outlined | Esqueleto en desarrollo activo. |
| `beta_publica` | Accesible. Badge visible en la ficha y en `/casos`. | mostaza | Publicable con cosillas / huecos menores. |
| `en_revision` | Accesible. | mostaza dashed | Uso ocasional, revisión interna pre-publicación. |
| `publicado` | Accesible. | verde acreditado | Ficha al máximo de lo que el producto sabe hacer hoy. |
| `retirado_temporalmente` / `retirado_definitivamente` | Pendiente decidir comportamiento al primer retiro real. | granate | Fuera de scope esta sesión. |

En **dev local** todas las rutas se generan (filtro condicionado por `import.meta.env.PROD`) para que el maintainer y los agentes paralelos puedan iterar sobre fichas en construcción. La definición canónica del enum + reglas de visibilidad vive en [doc 01 — "Enums y catálogos"](../../diseno/01-modelo-de-datos.md#enums-y-catálogos) y los criterios de transición entre estados están en [doc 06 — "Estados de ciclo de vida por ficha de caso"](../../diseno/06-roadmap-por-fases.md#estados-de-ciclo-de-vida-por-ficha-de-caso).

**Campo `estado_ficha`** (nuevo el 2026-05-25): object con 10 chequeos requeridos + `notas` libre + `fecha_actualizacion`. Cada chequeo toma uno de cuatro valores:

- `completo` — trabajado y revisado.
- `parcial` — hay algo pero falta cerrar (justificar en `notas`).
- `pendiente` — aún no trabajado.
- `no_aplica` — el chequeo no procede para este caso (justificar en `notas`).

Lista cerrada de los 10 chequeos:

1. `cronologia`
2. `roles_procesales`
3. `documentos_primarios`
4. `hechos_modelados`
5. `fuentes_cruzadas`
6. `composicion_fuentes_citadas` (feature [`composicion-fuentes-citadas.md`](composicion-fuentes-citadas.md))
7. `vinculos_institucionales` (feature [`vinculos-institucionales.md`](vinculos-institucionales.md))
8. `grafo_relaciones` (feature [`grafo-relaciones-caso.md`](grafo-relaciones-caso.md))
9. `cobertura_mediatica_general` (feature [`cobertura-mediatica-general.md`](cobertura-mediatica-general.md))
10. `revision_editorial` (skill [`revisar-caso`](../../../.agents/skills/revisar-caso/SKILL.md))

### UI: flip de la masthead

La cabecera de cada ficha de caso es un **contenedor flippeable** con dos caras del mismo tamaño visual:

- **Cara A** ("Ficha de caso"): nombre mediático, nombre oficial, alias, grid con `Fase actual` / `Órgano judicial` / `Nº procedimiento` / `Último hito`. Es la cara por defecto.
- **Cara B** ("Sobre la ficha"): page-id "SOBRE LA FICHA", título "Estado de esta ficha", intro explicando que habla del trabajo del inventario y no del procedimiento judicial, grid con los 10 chequeos del `estado_ficha`, `notas` y `fecha_actualizacion`. Debajo, separado por la línea mostaza propia del proyecto, el bloque "Cómo se ha redactado esta ficha" con `ultima_revision_editorial`, `nivel_relevancia_editorial` y enlace a `/rectificar`.

**Control de flip**: la parte superior derecha de la masthead muestra primero el `EstadoPublicacionBadge` en tamaño normal y, a su lado, un botón secundario (`Ver detalles de desarrollo` / `Volver`) sin uppercase ni peso negro. Se descartó la esquina doblada porque en pantalla no comunicaba con claridad qué hacía, y el texto vigente habla explícitamente del estado editorial/de trabajo de la ficha, no del estado jurídico del caso. El `aria-label` amplía "desarrollo" como "desarrollo editorial de esta ficha" para lectores de pantalla. Al pulsar se voltea toda la cabecera con animación CSS 3D real (`perspective` + `rotateY 180deg`), 750ms con curva suave. Tecla `Esc` cierra el reverso.

**Altura dinámica**: el wrapper `.ficha-flip__inner` adapta su `min-height` al alto de la cara visible (no al máximo de ambas) para evitar huecos blancos. Se mide con `ResizeObserver` y se transiciona en 450ms, algo más rápido que el flip de 750ms, para que la altura termine antes de la rotación.

**Reduce-motion**: con `prefers-reduced-motion: reduce`, la transición se desactiva y el cambio entre caras es instantáneo.

### UI: columna "Estado ficha" en `/casos`

Nueva columna entre "Fase" y "Órgano" que muestra el `estado_publicacion` con `EstadoPublicacionBadge` compacto. En producción, las filas con `estado_publicacion in {pendiente, borrador}` reciben la clase `is-blocked`: fondo gris, color desaturado, link interno reemplazado por `<span class="c-blocked">` con `aria-disabled="true"` (no clickable). En dev local nada se bloquea para que el maintainer pueda trabajar.

### Componente reusable `EstadoPublicacionBadge`

Astro `.astro` con estilos scoped, 7 estados + variante `compact` para tablas. Dot pequeño + label, sin glyph decorativo (alineado con la convención de [AGENTS.md — "Convención de referencias y citas"](../../../AGENTS.md#convención-de-referencias-y-citas) punto 4). Dark mode resuelto vía `@media (prefers-color-scheme: dark)` con foregrounds claros (`#9ec5a7` verde, `--color-accent-secondary` mostaza, `--color-accent` azul, `#e0a4a4` granate). No usa `data-theme`.

### Componente reusable `EstadoFichaBadge`

Mismo patrón pero para los 4 estados del chequeo individual. Vive sólo en la cara B del flip (no se renderiza en otras páginas).

## Estado actual

**Entregado en main el 2026-05-25.** Schema + collection + dos componentes + flip 3D + columna en `/casos` + filtro en `getStaticPaths` + poblado de los 7 casos publicables (atico-estepona, begona-gomez, fiscal-general-del-estado, gonzalez-amador, kitchen, lezo, plus-ultra).

**Fix 2026-05-25**: el comportamiento JS del flip se mueve al script global de `BaseLayout.astro` con delegación de eventos y reinicialización en `astro:page-load`. Motivo: con `ClientRouter`, al entrar por navegación interna en una ficha de caso el botón podía quedar sin listener hasta recargar la página. En la misma pasada se sustituye la esquina doblada por un control `badge + botón discreto`. La cara B deja de usar `inset: 0` y se mide por su altura natural para evitar el bucle `ResizeObserver` → `min-height` → `scrollHeight` que hacía crecer lentamente el reverso.

**Ajuste visual 2026-05-25**: la grid de metadatos de la cara A pasa de columnas igualadas a una grid explícita `Fase | Órgano flexible | Nº procedimiento`, con `Último hito` ocupando toda la fila inferior. Así el badge de fase no reserva una columna artificialmente ancha, pero la línea de metadatos sigue ocupando todo el ancho útil.

**Ajuste tipográfico 2026-05-25**: el grupo de acción del flip abandona el patrón `uppercase + 800` y el título del reverso baja a peso `600`. El badge de publicación vuelve al tamaño normal y el botón se trata como acción secundaria, para que la jerarquía sea `estado visible` primero, `detalles de desarrollo` después.

**Ajuste de composición 2026-05-25**: la intro de la cara B deja de limitarse a `60ch` y pasa a ocupar todo el ancho disponible. En este reverso la descripción funciona como explicación de estado, no como lede largo de lectura, y el panel ya tiene suficiente estructura debajo.

**Migración al nuevo enum** (2026-05-25):

- atico-estepona → `borrador` (esqueleto inicial, en producción no genera ruta).
- 6 del Bloque A (plus-ultra, begona-gomez, fiscal-general-del-estado, gonzalez-amador, kitchen, lezo) → `beta_publica`.
- Cualquier caso futuro empieza en `pendiente`.

`pnpm validate` 508+ OK tras la pasada, `pnpm build` verde con 168 páginas (atico-estepona NO genera ruta en producción, sólo 6 de 7 casos generan página).

## Decisiones editoriales y aprendizajes

- **El estado global lo decide el maintainer, no se deriva del `estado_ficha`.** Las 4 features transversales del Bloque D que están `pendiente` en `estado_ficha` son features del producto, no fallas del caso — un caso puede estar `publicado` aunque sus chequeos de vínculos/grafo/composición/cobertura sigan en `pendiente` mientras esas features no estén entregadas para todos los casos.
- **`pendiente` es honestidad pública, no penalización.** Listar un caso como `pendiente` antes de tocarlo dice "este procedimiento está en cola"; ocultarlo hasta tenerlo listo daría falsa impresión de que el inventario es exhaustivo.
- **`beta_publica` declara la imperfección por su nombre.** Mejor que "casi publicado" o un porcentaje arbitrario — la palabra "beta" comunica al lector que la ficha es accesible y útil, y que puede tener cosillas.
- **La incompletitud debe verse.** En un inventario vivo, ocultar los huecos genera más desconfianza que admitirlos. El badge `pendiente` dentro del `estado_ficha` no es nota a la baja — es un compromiso público de seguir trabajando.
- **Evitar barras porcentuales falsas.** "Esta ficha está al 80%" parece objetivo pero depende de pesos arbitrarios. Mejor checks discretos con metodología pública.
- **Hablar de la ficha, no del caso.** La cara B del flip se titula deliberadamente "Estado de esta ficha", no "Estado del caso", para no confundirla con `fase_actual` ni con `estado_publicacion` jurídico.
- **El estado manda; el botón acompaña.** La esquina doblada era una metáfora atractiva, pero no se entendía como acción. La versión vigente pone primero el badge de publicación y deja el botón `Ver detalles de desarrollo` como acción secundaria, sin tratamiento de banner.
- **Animación 3D real, no crossfade.** Primera implementación fue crossfade + leve `rotateX`, descartada por el maintainer: "no me gusta, parece que se da la vuelta a una página". El flip 3D real con perspective + `rotateY` requiere medir alturas con JS porque las dos caras tienen contenido distinto.
- **Sintesis del caso vive fuera del flip.** Una iteración intermedia metió la síntesis dentro de la cara A; descartada por el maintainer ("fatal eh como has fusionado ambos"). La síntesis vuelve a ser sección independiente debajo de la masthead con su línea mostaza separadora.
- **`.ficha-mast` hereda una animación global `fade-up` que rompía el `rotateY`.** Aprendizaje técnico: con `animation-fill-mode: both`, los keyframes mantienen su `transform` final y machacan cualquier `transform` propio que el componente intente aplicar. Solución: `animation: none` en `.ficha-flip__face`.
- **Con `ClientRouter`, los listeners de UI deben sobrevivir al swap de página.** El flip no puede depender de un script local de `PgCasoDetalle` que sólo corre tras recarga completa; el patrón correcto en este sitio es el mismo que menús, filas clicables y TOC: listener delegado desde `BaseLayout.astro` + init idempotente en `astro:page-load`.
- **Documentación en doc 01 + doc 06.** El enum `EstadoPublicacion` y la regla de visibilidad en producción tienen su definición canónica en [doc 01 — "Enums y catálogos"](../../diseno/01-modelo-de-datos.md#enums-y-catálogos); el encaje del ciclo de vida con las fases del proyecto vive en [doc 06 — "Estados de ciclo de vida por ficha de caso"](../../diseno/06-roadmap-por-fases.md#estados-de-ciclo-de-vida-por-ficha-de-caso). Esto significa que cualquier nuevo enum value en el futuro debe actualizar las tres ubicaciones (schema, doc 01, doc 06) además de esta ficha.

## Ideas futuras

### v1 pre-launch

- Indicador agregado en la home o en `/cifras`: "N fichas `pendiente` · M `borrador` · K `beta_publica` · J `publicado`" para que el lector tenga la foto del inventario sin entrar caso a caso.
- Filtro en `/casos` por `estado_publicacion` (ya tenemos badge, falta el select).
- Tooltip al hover sobre el badge en la tabla mostrando la `notas` del `estado_ficha`.
- Filtrado retirado_* en producción cuando ocurra el primer retiro.

### v1.x

- Vista interna `/cifras#estado-fichas` con cruce ficha × check para priorizar trabajo pendiente.
- Snapshot histórico mensual del `estado_ficha` por caso (cómo ha evolucionado).
- Export del estado global + `estado_ficha` como feed JSON para consumidores externos.
- Variante del patrón `badge + Ver detalles de desarrollo` en otras páginas (`/personas/<slug>`, `/organizaciones/<slug>`) cuando tenga sentido editorial.

### Sin compromiso

- Animación de "pasar de página" más sofisticada (efecto curl con SVG o WebGL). El flip 3D actual cumple, no es urgente.
- "Estado de la ficha" exportable como widget embebible.

## Pendientes operativos

- [x] Decidir si los checks viven en `caso.yaml` o en fichero auxiliar. **Decisión 2026-05-25**: en `caso.yaml`.
- [x] Definir qué checks son obligatorios pre-launch. **Decisión 2026-05-25**: schema exige los 10 cuando `estado_ficha` está presente; el campo en sí es opcional.
- [x] Decidir copy exacto. **Decisión 2026-05-25**: "Estado de esta ficha" (no "del caso") + intro explícita en la cara B.
- [x] Ampliar `estado_publicacion` para reflejar el ciclo de vida editorial completo. **Decisión 2026-05-25**: 7 valores con `pendiente` y `beta_publica` nuevos.
- [x] Mecanismo de visibilidad en producción. **Decisión 2026-05-25**: filtro en `getStaticPaths` + fila bloqueada en `/casos`.
- [x] Rediseño del bloque "Estado de esta ficha" para no añadir una sección más al body. **Decisión 2026-05-25**: flip de la masthead.
- [x] Bajar la decisión del enum + visibilidad a `docs/diseno/`. **Hecho 2026-05-25**: doc 01 + doc 06 actualizados.
- [x] Corregir el primer click del flip al entrar por navegación interna con `ClientRouter`. **Hecho 2026-05-25**: listener delegado en `BaseLayout.astro` + `astro:page-load`.
- [x] Sustituir la esquina doblada por el patrón `EstadoPublicacionBadge` + botón discreto y separar la cara B de la síntesis externa. **Hecho 2026-05-25** por feedback de claridad visual y overflow aparente.
- [ ] Hacer que `pnpm validate` detecte estados incoherentes obvios (p. ej. `cobertura_mediatica_general: completo` cuando no existe `content/cobertura-mediatica/<caso>.yaml`). Diferido a una iteración cuando haya datos reales en todas las collections.
- [ ] Verificar dark mode del flip completo tras la iteración del 2026-05-25.
- [ ] Verificar render mobile del flip con el botón textual a ancho completo.
- [ ] Decidir comportamiento exacto de `retirado_*` en producción cuando ocurra el primer retiro real.
