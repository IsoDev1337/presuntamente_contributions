# Explorador de conexiones y relaciones

> Archivos clave: [`src/lib/grafo.ts`](../../../src/lib/grafo.ts) · [`GrafoRelaciones.astro`](../../../src/components/GrafoRelaciones.astro) · [`GraphConexionesLink.astro`](../../../src/components/GraphConexionesLink.astro) · [`PgGrafo.astro`](../../../src/components/pages/PgGrafo.astro) · [`src/scripts/grafo-relaciones.ts`](../../../src/scripts/grafo-relaciones.ts) · [`docs/web/pages/grafo.md`](../pages/grafo.md) · Depende de [`vinculos-institucionales.md`](vinculos-institucionales.md)

## Qué hace

Página `/grafo` con el **Explorador de Conexiones**: grafo visual y tabla textual de relaciones del inventario. Abre en modo **inventario completo**, sin foco, y permite fijar un foco (`caso`, `persona`, `organizacion` o `documento`), elegir profundidad 1-3 y filtrar tipos de nodo/arista. Las fichas de caso, persona y organización enlazan con el CTA unificado «Ver en grafo de conexiones».

## Para qué sirve

Ayuda a entender conexiones complejas sin convertir la ficha en una pantalla saturada. El objetivo no es sugerir culpabilidad por cercanía visual, sino exponer relaciones explícitas del modelo: rol procesal, vínculo institucional, conexión entre casos o respaldo documental.

## Cómo funciona

- `src/lib/grafo.ts` deriva un `GraphPayload` desde las collections YAML.
- `GrafoRelaciones.astro` renderiza una superficie full-screen tipo red, controles flotantes, panel de detalle flotante, leyenda y tabla textual equivalente activable.
- `src/scripts/grafo-relaciones.ts` monta Cytoscape en cliente, aplica BFS por profundidad, sincroniza query params y actualiza tabla/panel de detalle.
- Los selects del panel son controles propios generados sobre `<select>` nativo para mantener accesibilidad/form state y evitar la UI nativa del navegador. En listas largas incorporan búsqueda interna.
- Los tipos de relación tienen ayudas contextuales en popover para explicar qué significa `procesal`, `institucional`, `caso_caso` y `documental` sin obligar al lector a conocer el modelo interno.
- El panel de detalle distingue cierre puntual (`Cerrar detalle`) de preferencia de exploración (`No mostrar detalle`): con la preferencia activa, los clicks siguen resaltando el grafo pero no abren el panel.
- La visualización deduplica aristas por pareja de nodos: si A y B tienen varias relaciones modeladas, se dibuja una sola línea agregada para no ensuciar la lectura. La tabla textual muestra esa misma agregación visible.
- El control `Separación de nodos`, dentro del bloque `Nodos`, recalcula el layout aumentando repulsión y longitud de arista, con refuerzo en nodos de mayor grado para despejar centros neurálgicos.
- En modo "Red viva", el arrastre de un nodo desplaza suavemente vecinos de primer y segundo grado para dar sensación de malla sin recalcular aleatoriamente todo el layout al soltar.
- URL compartible global: `/grafo?focus=inventario&layout=cose`.
- URL compartible con foco: `/grafo?focus=caso&id=begona-gomez&depth=2&layout=cose`.
- Los casos `pendiente`, `borrador` o retirados quedan fuera del dataset del grafo para que esqueletos editoriales no contaminen la vista pública.
- Nodos v1: caso, persona, organización, documento.
- Aristas v1: `procesal`, `institucional`, `caso_caso`, `documental`.
- Layouts v1: `cose` como modo "Red viva" por defecto y `breadthfirst` para lectura por profundidad.

La fuente de verdad es el modelo de datos, no un dibujo manual. Si una arista no puede derivarse o documentarse, no aparece.

## Estado actual

**Entregada en v1 inicial el 2026-05-26.** Página `/grafo`, nav **Conexiones**, CTAs desde fichas, modo inventario completo, paneles flotantes y tabla textual. Copy unificado el 2026-05-26 (ver «Convención de copy»). Cytoscape.js en producción.

## Convención de copy

La ruta y el slug interno siguen siendo `/grafo` y `grafo_relaciones`. El vocabulario visible separa **entrada corta** (nav), **nombre de la herramienta** (H1) y **formato** (eyebrow):

| Superficie | Texto canónico | Implementación |
|---|---|---|
| Nav principal | Conexiones | `BaseLayout.astro` → `navEntries` |
| Breadcrumb `/grafo` | Conexiones | `PgGrafo.astro` |
| `<title>` / OG | Explorador de Conexiones | `PgGrafo.astro` → `strings.title` |
| Eyebrow del panel | Grafo de conexiones y relaciones | `GrafoRelaciones.astro` |
| H1 del panel | Explorador de Conexiones | `GrafoRelaciones.astro` |
| CTA desde fichas | Ver en grafo de conexiones | `GraphConexionesLink.astro` |
| Chequeo estado ficha | Conexiones y relaciones | `PgCasoDetalle.astro` → `grafo_relaciones` |

Reglas:

- **Nav:** sustantivo corto, sin «grafo» (jerga técnica).
- **CTA:** «Ver **en** grafo…» — indica que abre la vista exploradora, no que el caso *es* un grafo.
- **H1 vs eyebrow:** el H1 nombra la herramienta; el eyebrow describe el formato (grafo + qué modela).
- **No mezclar** «relaciones» y «conexiones» en la misma frase salvo en el eyebrow, donde ambos conceptos conviven.

## Decisiones editoriales y aprendizajes

- **El grafo global sí entra, pero como explorador filtrado.** La idea inicial era empezar por un grafo local por caso. La versión entregada usa una página general porque permite enlaces profundos desde caso/persona/organización sin duplicar componentes.
- **Visual más tipo Obsidian, pero sin conspiracionismo.** La primera versión encajonada en bloque administrativo resultaba demasiado plana. La revisión usa superficie full-screen, nodos circulares, física animada y paneles flotantes, pero mantiene navy institucional, grises y mostaza estructural; sin líneas rojas ni paleta arcoíris.
- **La profundidad es semántica de navegación, no de responsabilidad.** Depth 2 significa "vecinos de vecinos", no mayor implicación.
- **La tabla textual no es opcional.** Mantiene equivalencia P-06 y sirve para auditar las relaciones visibles.
- **Inventario completo por defecto.** La página debe servir para ver el mapa general, no sólo vistas prefiltradas desde fichas.
- **Documentos ocultos por defecto.** Las aristas documentales existen, pero no se muestran en el preset inicial porque saturan rápido. El lector puede activarlas.
- **Los tipos de relación necesitan explicación in situ.** "Procesal", "institucional" o "documental" son categorías del modelo; el lector no tiene por qué conocerlas. La UI incorpora popovers breves junto a cada filtro.
- **Detalle no debe forzar el flujo de exploración.** El lector puede cerrar el detalle de la selección actual o activar "No mostrar detalle" para navegar por la red sólo con resaltados visuales.
- **Los hubs necesitan aire configurable.** En la vista inventario completo algunos casos u organizaciones acumulan muchas aristas; el slider de separación permite abrir la red sin convertirlo en un modo visual distinto.
- **Cytoscape no es un motor de física live completo.** Su `cose` calcula y anima layouts, pero no mantiene una simulación continua tipo Obsidian. Para aproximarlo sin migrar librería se añade arrastre local de vecinos; si se exige física live real, conviene evaluar `d3-force` o una capa de simulación específica.

## Ideas futuras

### v1.x

- Filtro por rol procesal concreto.
- Filtro por nivel mínimo de fuente en aristas documentales.
- Colorear aristas procesales según el rol formal en el caso (`investigado`, `procesado`, `acusado`, `condenado_no_firme`, `condenado_firme`, `absuelto`, `desimputado`), reutilizando la paleta F-estado y manteniendo presunción de inocencia: el color comunica estado procesal documentado, no culpabilidad.
- Filtro por gravedad procesal / fase del rol: cautelar, procesamiento, acusación, condena no firme, condena firme, cierre favorable.
- Leyenda específica para aristas procesales cuando se active el coloreado por rol, separada de la leyenda de tipos de nodo.
- Modo de atenuación por rol: mostrar todas las conexiones pero bajar opacidad de las que no coinciden con el rol/fase seleccionada.
- Agregación de aristas con roles mixtos entre los mismos nodos: decidir si prima el rol más reciente, el más grave, o si se muestra un indicador compuesto en el panel de detalle.
- Modo "camino entre dos nodos".
- Export SVG/PNG para prensa.
- Deep links desde documentos de biblioteca hacia `/grafo?focus=documento`.
- Modo visual alternativo con simulación live (`d3-force`, WebGL/Sigma o capa Three.js si aporta valor) sobre el mismo `GraphPayload`, sin sustituir la vista Cytoscape v1.

### Sin compromiso

- Sustituir Cytoscape por Sigma.js + Graphology si el inventario crece a miles de nodos y WebGL compensa la complejidad adicional.

## Pendientes operativos

- [x] Decidir librería o SVG propio generado en build. **Cytoscape.js**.
- [x] Definir formato interno de nodos/aristas.
- [x] Añadir página global `/grafo`.
- [x] Añadir modo inventario completo sin foco.
- [x] Pasar la UI a superficie full-screen con paneles flotantes.
- [x] Añadir enlaces desde fichas de caso, persona y organización.
- [x] Mantener alternativa textual.
- [ ] Verificar con navegador local desktop/mobile que el grafo no sale vacío ni solapa texto.
- [x] Unificar microcopy nav / página / CTAs (2026-05-26).
