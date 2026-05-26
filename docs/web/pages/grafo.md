# Página `/grafo`

> Estado: entregada v1 inicial el 2026-05-26. Feature transversal: [`grafo-relaciones-caso.md`](../features/grafo-relaciones-caso.md).

## Qué muestra

Explorador de conexiones y relaciones del inventario. Abre en modo inventario completo y permite cambiar a foco por caso, persona, organización o documento. Muestra grafo interactivo y tabla textual equivalente de las aristas visibles.

## Estado actual

- Ruta: `/grafo`.
- Entrada en navegación principal: **Conexiones** (ruta `/grafo`).
- Título de página / H1: **Explorador de Conexiones**; eyebrow: **Grafo de conexiones y relaciones**.
- Modo inicial: inventario completo, sin foco.
- Filtros: foco, entidad, profundidad, layout, tipo de relación y tipo de nodo.
- Superficie full-screen con controles flotantes, panel de detalle flotante y tabla textual activable.
- Controles diferenciados: centrar/recentrar con icono, relaciones como toggle simple y detalle con modo persistente `No mostrar detalle`.
- Slider `Separación de nodos` dentro del bloque `Nodos`, para abrir el layout y despejar nodos con muchas conexiones.
- Enlaces profundos desde fichas (CTA unificado con icono de grafo):
  - Caso, persona y organización: `Ver en grafo de conexiones` ([`GraphConexionesLink.astro`](../../../src/components/GraphConexionesLink.astro)).
- Dataset derivado desde YAML en build mediante `src/lib/grafo.ts`.
- Selectores propios sobre `<select>` nativo para evitar controles del navegador y mantener el estilo administrativo.
- Búsqueda interna en selectores largos, especialmente el selector de foco.
- Popovers de ayuda junto a los filtros de tipo de relación para explicar las categorías del modelo.
- Aristas agregadas por pareja de nodos para evitar líneas duplicadas entre las mismas entidades.
- Zoom de rueda con sensibilidad alta para exploración rápida del lienzo.

## Decisiones de diseño

- **Convención de copy (2026-05-26):** ver tabla en [`grafo-relaciones-caso.md`](../features/grafo-relaciones-caso.md#convención-de-copy). La ruta técnica sigue siendo `/grafo`; el vocabulario visible prioriza «conexiones» frente a «grafo» en nav y CTAs.
- Estética de red tipo Obsidian adaptada al sitio: nodos circulares, física animada y paneles flotantes.
- Sin paleta arcoíris. Los colores separan familias de entidad/relación, no partidos ni culpabilidad.
- Layout por defecto `cose` como modo "Red viva"; `breadthfirst` queda como modo de lectura por profundidad.
- El arrastre en modo "Red viva" desplaza vecinos cercanos, pero no recalcula el layout completo al soltar para evitar movimientos aleatorios.
- Documentos desactivados por defecto para reducir ruido visual.

## Ideas futuras

- Añadir filtro por rol procesal concreto.
- Añadir filtro por nivel de fuente documental.
- Añadir vista "camino entre dos entidades".
- Enlazar desde `/biblioteca` a vistas con foco `documento`.
- Añadir un modo visual alternativo con física live / posible 3D sobre el mismo dataset, sin retirar la vista actual.

## Pendientes operativos

- [ ] Prueba visual desktop/mobile.
- [ ] Ajustar densidad de labels si Lezo o futuros macrocasos saturan la vista.
