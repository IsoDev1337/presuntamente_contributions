# Archivos y mirrors auditables

Servicios de archivado de páginas web y criterios editoriales para aceptar mirrors periodísticos como respaldo de documentos primarios cuando el órgano emisor no publica el documento directamente.

## archive.org (Wayback Machine)

URL raíz: `https://web.archive.org/`.

### Patrones de URL estables

Snapshot canónico de una URL en un momento concreto:

```
https://web.archive.org/web/<YYYYMMDDHHMMSS>/<URL-original>
```

Ejemplo:
```
https://web.archive.org/web/20251001063924/https://www.libertaddigital.com/espana/politica/2025-10-01/la-uco-certifica-que-la-asesora-de-begona-gomez-era-empleada-publica-nivel-26-adscrita-al-gabinete-de-la-presidencia-7302179/
```

Esta es la URL que va a `Documento.url_archivo` para fuentes N4.

### Endpoint de archivado

POST a `https://web.archive.org/save/<URL>` con `User-Agent` válido. Endpoint anónimo, sin autenticación, cuota ~8 000 capturas/día por IP.

El script `scripts/archivar-n4.mjs` del repo gestiona el archivado en lote. Comandos: `pnpm archive:dry`, `pnpm archive:catchup`, `pnpm archive:catchup -- --caso=<slug>`, `pnpm archive:catchup -- --limit=N`.

Detalle operativo en [`docs/web/features/archive-org-pre-commit.md`](../web/features/archive-org-pre-commit.md).

### Cuándo usar

- **Obligatorio**: para todo `Documento` con `nivel_fuente: 4` (cobertura periodística). El campo `url_archivo` no puede quedar vacío en un documento N4 listo para publicar.
- **Recomendado**: para documentos N3 (institucionales no jurisdiccionales) si la URL canónica está en un dominio inestable.

### Cuándo NO usar

- No archivar URLs N1 oficiales del propio órgano emisor (BOE, CGPJ, etc.) — el archivado canónico es la copia local servida desde `/public/documentos/`, con `hash_sha256`. Si el dominio oficial cae, el documento se preserva por su `hash_sha256`, no por el snapshot de archive.org.

## archive.ph (archive.today)

URL raíz: `https://archive.ph/`. Servicio hermano de archive.org con políticas algo distintas (a veces archiva contenidos que Wayback rechaza por robots.txt). **Pendiente de catalogar** en detalle.

## Mirrors periodísticos auditables

Cuando el órgano emisor no publica el documento (típico: autos de instrucción de JI ordinarios) y un medio sí lo reproduce íntegro, puede modelarse como N3 `filtrado_verificado` siempre que se cumpla la **convención de procedencia auditable** de [`AGENTS.md`](../../AGENTS.md#documentos-primarios-descargados-a-publicdocumentos).

### Criterios para aceptar un mirror

| Criterio | Aceptable | No aceptable |
|---|---|---|
| Autoría de la pieza | Firma editorial identificable (medio con redacción + autor o "Redacción de <medio>") | Anónimo, "Equipo de…" sin sigla, alias sin identificar |
| Incrustación del documento | PDF nativo en el dominio del medio (e.g. `eldiario.es`, `infobae.com`, `confidencial.com`) | Re-subido a Wuolah, Scribd, Issuu, Calaméo, blogs personales, repositorios universitarios anónimos |
| Línea editorial | Cualquiera (siempre que se cruce con segunda línea distinta) | Plataformas sin línea editorial verificable |
| Triangulación | Segundo mirror del mismo documento en línea editorial distinta cuando sea posible | Mirror único sin posibilidad de cruce |

### Mirrors conocidos por medio

Medios con PDF nativo embebido habitualmente:
- `eldiario.es` (varias secciones, especialmente Investigación).
- `infobae.com` (sección "España", "documentos").
- `elconfidencial.com` (no siempre, depende de la pieza).
- `theobjective.com` (especialmente para piezas largas de investigación).
- `publico.es` (frecuente para querellas y escritos de parte).
- `confilegal.com` (especializado jurídico, suele aportar PDFs).
- `iustel.com` (especializado jurídico, pero algunos PDFs están detrás de paywall — verificar `estado_acceso` antes de modelar).

### Mirrors NO aceptables

- **Wuolah** (`wuolah.com`): plataforma de apuntes universitarios. El subidor es anónimo, no audita fidelidad. **Convención del repo**: no descargar. Si un documento sólo está accesible por Wuolah, anotar `pendiente_primario` en `NOTES.md` del caso y esperar a fuente oficial. Precedente: barrido retrospectivo del caso Begoña Gómez del 2026-05-23 descartó un mirror Wuolah del auto AP Madrid del 13-may-2025.
- **Scribd, Issuu, Calaméo, Slideshare**: mismo criterio. Sin redacción editorial verificable.
- **Blogs personales y repositorios universitarios anónimos**: no audita la cadena de custodia.

### Mirrors aceptables sólo con segundo respaldo

- `politicalwatch.es` (cuando la app esté operativa): repositorio activista de pieza pública. Aceptable si se cruza con segundo mirror.
- Repositorios universitarios identificados con autoría (no anónimos): aceptable para informes y papers académicos firmados, no para autos jurisdiccionales filtrados.

## Cómo decidir entre N1, N2, N3, N4

Diagrama de decisión cuando localizas un documento:

1. **¿URL canónica del propio órgano emisor en lista blanca?** → **N1**. Descargar al árbol con `ruta_local` + `hash_sha256`.
2. **¿Documento oficial (UCO, UDEF, Fiscalía) fuera de lista blanca o sin URL pero accesible vía mirror auditable?** → **N2**.
3. **¿Documento de parte (querella, escrito defensa) o sentencia TS no localizada en CENDOJ pero accesible íntegra en mirror periodístico identificable, con triangulación si es posible?** → **N3** `filtrado_verificado`. Documentar verificación cruzada en `nivel_fuente_justificacion`.
4. **¿Cobertura periodística de un evento procesal?** → **N4**. Exigir `url_archivo` (archive.org) y respaldo cruzado por al menos otra línea editorial (V-13).

## Histórico de descubrimientos

- **2026-05-22** — PR2 del caso FGE. Documentada la convención de "mirror auditable" en AGENTS.md tras barrido de fuentes para sentencias TS no localizadas en CENDOJ. Aceptación de mirrors periodísticos identificables con triangulación; rechazo explícito de Wuolah y similares.
- **2026-05-23** — Caso Begoña Gómez (barrido retrospectivo). Descartado mirror Wuolah del auto AP Madrid del 13-may-2025 sobre desimputación Goyache; principio aplicado: imposibilidad de auditar cadena de custodia. Reforzada la norma en NOTES.md del caso.
