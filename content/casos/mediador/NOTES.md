# Notas internas — Caso Mediador

Esqueleto mínimo creado el 2026-05-29 (solo para aparecer "en cola" en `/casos`). Pendiente al documentar el caso:

- **Revisar/completar el órgano `juzgado-instruccion-4-santa-cruz-tenerife`** (creado como esqueleto): falta `organo_superior_id` (AP de Santa Cruz de Tenerife / TSJ de Canarias, aún no fichados); revisar `ambito_territorial` (puse `provincial`, quizá `local` por ser juzgado de partido); ampliar `descripcion_corta` y, si procede, titular.
- Verificar `numero_procedimiento` (no localizado públicamente) y `fecha_apertura` (2022-01-01 es aproximado).
- `origen_denuncia` quedó como `otro` (investigación policial, sin encaje exacto en el enum).
- Pieza separada con sentencia de 1ª instancia: modelar aparte si procede.
