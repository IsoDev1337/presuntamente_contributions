# Página `/conexiones`

> Estado: entregada v1 inicial el 2026-05-26; controles de foco multi-entidad y panel responsive ajustados el 2026-05-28. Feature transversal: [`explorador-conexiones.md`](../features/explorador-conexiones.md).

## Qué muestra

Explorador de conexiones y relaciones del inventario. Abre en modo inventario completo y permite cambiar a foco por caso, persona, organización o documento. Muestra grafo interactivo y tabla textual equivalente de las aristas visibles.

## Estado actual

- Ruta: `/conexiones`.
- Entrada en navegación principal: **Conexiones** (ruta `/conexiones`).
- Título de página / H1: **Explorador de Conexiones**; eyebrow: **Grafo de conexiones y relaciones**.
- Modo inicial: inventario completo, sin foco.
- Filtros: vista, foco múltiple por entidad, profundidad, disposición, tipo de relación y tipo de nodo.
- Superficie full-screen con controles flotantes, panel de detalle flotante y tabla textual activable.
- Panel de controles redimensionable en desktop, más transparente cuando no tiene foco/hover y adaptado como panel inferior en móvil.
- Controles diferenciados: centrar/recentrar con icono, relaciones como toggle simple y detalle con modo persistente `No mostrar detalle`.
- Panel de detalle: texto recortado con `…`, `Ver más` debajo y `Cerrar` en fila con el badge de tipo.
- Sliders compactos `Profundidad` y `Separación de nodos`, y selector icónico de disposición orgánica/jerárquica.
- Enlaces profundos desde fichas (CTA unificado con icono de grafo):
  - Caso, persona y organización: `Ver en grafo de conexiones` ([`GraphConexionesLink.astro`](../../../src/components/GraphConexionesLink.astro)).
- Dataset derivado desde YAML en build mediante `src/lib/conexiones.ts`.
- Selectores propios sobre `<select>` nativo para evitar controles del navegador y mantener el estilo administrativo.
- Búsqueda interna en selectores largos, especialmente el selector de foco.
- El foco usa `MultiSelectFilter` para casos, personas, organizaciones y documentos; la URL serializa varios ids separados por coma.
- Popovers de ayuda junto a los filtros de tipo de relación para explicar las categorías del modelo.
- Aristas agregadas por pareja de nodos para evitar líneas duplicadas entre las mismas entidades.
- Zoom de rueda con sensibilidad alta para exploración rápida del lienzo.

## Decisiones de diseño

- **Convención de copy (2026-05-26, revisada 2026-05-27):** ver tabla en [`explorador-conexiones.md`](../features/explorador-conexiones.md#convención-de-copy). El 2026-05-27 se alineó la ruta pública (`/conexiones`) y el campo del schema (`estado_ficha.conexiones`) con el vocabulario visible para evitar la asimetría inicial entre URL, modelo y nav. «Grafo» queda solo como descriptor de formato en H1 y eyebrow.
- Estética de red tipo Obsidian adaptada al sitio: nodos circulares, física animada y paneles flotantes.
- Sin paleta arcoíris. Los colores separan familias de entidad/relación, no partidos ni culpabilidad.
- Layout por defecto `cose` como modo "Red viva"; `breadthfirst` queda como modo de lectura por profundidad.
- El arrastre en modo "Red viva" desplaza vecinos cercanos, pero no recalcula el layout completo al soltar para evitar movimientos aleatorios.
- Documentos desactivados por defecto para reducir ruido visual.
- El control de foco no muestra chips bajo el selector dentro del panel: en esta vista el estado seleccionado ya vive en el trigger y en el resumen minimizado.
- Redimensionar el panel no debe crear scroll horizontal; los controles se redistribuyen por ancho disponible.

## Ideas futuras

- Añadir filtro por rol procesal concreto.
- Añadir filtro por nivel de fuente documental.
- Añadir vista "camino entre dos entidades".
- Enlazar desde `/biblioteca` a vistas con foco `documento`.
- Añadir un modo visual alternativo con física live / posible 3D sobre el mismo dataset, sin retirar la vista actual.

## Pendientes operativos

- [ ] Prueba visual desktop/mobile.
- [x] Ajustar panel móvil, foco múltiple y controles compactos de profundidad/disposición/separación. **Entregado 2026-05-28.**
- [ ] Ajustar densidad de labels si Lezo o futuros macrocasos saturan la vista.
