# Poder legislativo y Defensor del Pueblo

> **Estado: pendiente de ingeniería inversa.** Placeholder del backlog "Sesión de ingeniería inversa de portales del Estado" ([`ROADMAP.md`](../../ROADMAP.md)).

Portales del poder legislativo del Estado y del Defensor del Pueblo. Titulares: Congreso de los Diputados, Senado, Defensor del Pueblo (Alta Comisionada de las Cortes Generales).

## Inventario de portales

| Institución | Web | Qué interesa |
|---|---|---|
| Congreso de los Diputados | `congreso.es` | Diarios de sesiones, comparecencias en comisiones de investigación, iniciativas legislativas, BOCG (Boletín Oficial de las Cortes Generales) |
| Senado | `senado.es` | Diarios de sesiones, BOCG, iniciativas |
| Defensor del Pueblo | `defensordelpueblo.es` | Informes anuales, recomendaciones, resoluciones, quejas presentadas |

Tipos del schema relevantes: `acta_congreso`, `acta_senado`, `video_comparecencia_congreso`. N1 por dominios en lista blanca.

## Pendiente de catalogar para cada uno

- Patrones de URL estables del Diario de Sesiones (`/public_oficiales/L<NUM>/CONG/DS/...`).
- Patrones de URL estables del BOCG (numeración secuencial por legislatura).
- Patrones de URL estables del archivo audiovisual del Congreso (vídeos de comparecencias en Pleno y Comisiones).
- Patrones de URL del Defensor del Pueblo (informes anuales y resoluciones individuales).
- Endpoint de búsqueda interna en cada portal.
- Cobertura temporal real.

## Casos del inventario que lo necesitan

- **Begoña Gómez**: testifical del presidente del Gobierno Pedro Sánchez en el JI nº 41 (no es comparecencia parlamentaria, pero las comparecencias del Gobierno en el Congreso sobre el caso podrían interesar).
- **Plus Ultra**: comparecencias en Comisión de Investigación del Senado sobre el rescate Plus Ultra (cuando se constituyó la comisión).
- **Casos pendientes con comisiones de investigación** abiertas (Koldo, etc.): el Diario de Sesiones y los vídeos de comparecencia son N1 directos para modelar `Hito(tipo=comparecencia_congreso)`.
