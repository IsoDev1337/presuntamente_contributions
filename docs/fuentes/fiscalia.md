# Fiscalía General del Estado (`fiscal.es`)

> **Estado: pendiente de ingeniería inversa.** Placeholder del backlog "Sesión de ingeniería inversa de portales del Estado" ([`ROADMAP.md`](../../ROADMAP.md)).

Portal del Ministerio Fiscal. Titular: Fiscalía General del Estado. Ámbito: doctrina, instrucciones, circulares, memorias anuales, comunicados de la Oficina de Comunicación.

## Qué se sabe a fecha 2026-05-27

- **Sí publican**: memorias anuales, disposiciones generales (Instrucciones, Circulares, Consultas), notas de prensa de la Oficina de Comunicación.
- **No publican**: escritos procesales concretos (denuncias, querellas, recursos, escritos de conclusiones). Verificado al cumplimentar el documento `escrito-fiscalia-recurso-ap-bg-2026-04-21` (caso Begoña Gómez): la URL canónica de un escrito de Fiscalía sobre un recurso de apelación no existe en `fiscal.es`. La práctica de la institución es publicar memorias anuales y disposiciones generales, no escritos procesales individuales.
- Implicación editorial: si un hito depende de un escrito de Fiscalía, modelar como N3 `filtrado_verificado` con mirror periodístico identificable o N4 cruzado por al menos 4 líneas editoriales (cumple V-13). No perder tiempo buscando en `fiscal.es`.

## Pendiente de catalogar

- Patrones de URL estables para memorias anuales (`/fiscal/PA_WebApp_SGNTJ_NFIS/...`).
- Endpoint de búsqueda interna del portal (si existe).
- Cobertura temporal real del archivo de notas de prensa.
- Patrón de URL de las Instrucciones y Circulares de la FGE (numeración secuencial por año).
