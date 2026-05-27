# BOE y boletines oficiales

Boletines oficiales del Estado y de las Comunidades Autónomas. Titulares: Agencia Estatal Boletín Oficial del Estado (BOE), gobiernos autonómicos. Ámbito: publicación oficial de leyes, reales decretos, acuerdos, resoluciones, nombramientos, ceses, sanciones y disposiciones administrativas con eficacia jurídica.

## Qué hay aquí

- **Disposiciones generales** — leyes, leyes orgánicas, reales decretos-ley, reales decretos, órdenes ministeriales.
- **Nombramientos, ceses y situaciones administrativas** — magistrados, fiscales, altos cargos.
- **Acuerdos del CGPJ publicados en BOE** — convocatorias, jubilaciones forzosas, destinos por concursos de traslado.
- **Anuncios y sanciones de organismos reguladores** (CNMC, CNMV, AEAT, Banco de España) cuando se publican en BOE.

Tipo del schema: `boletin_oficial`. N1 (lista blanca: `boe.es`, autonómicos cuando aplique).

## Patrones de URL estables — BOE estatal

Cada disposición tiene un **identificador único** `BOE-A-YYYY-XXXXX`. Tres endpoints estables para el mismo documento:

| Recurso | URL |
|---|---|
| PDF de la disposición | `https://www.boe.es/boe/dias/YYYY/MM/DD/pdfs/BOE-A-YYYY-XXXXX.pdf` |
| TXT navegable | `https://www.boe.es/diario_boe/txt.php?id=BOE-A-YYYY-XXXXX` |
| XML estructurado | `https://www.boe.es/diario_boe/xml.php?id=BOE-A-YYYY-XXXXX` |

La fecha del path del PDF (`/dias/YYYY/MM/DD/`) es la **fecha de publicación del BOE**, **no** la fecha de la disposición. Diferencia típica: 1-15 días.

**Recomendación**: descargar siempre PDF + XML. El XML trae los campos estructurados (`fecha_publicacion`, `departamento`, `epigrafe`, `titulo`) que permiten cumplimentar el `Documento` sin parsear el PDF.

**Ejemplo**:
```bash
# RD 527/2017 (BOE-A-2017-5738) — concurso de traslados que destina a Eloy Velasco a la Sala de Apelación de la AN
curl -L "https://www.boe.es/boe/dias/2017/05/24/pdfs/BOE-A-2017-5738.pdf" \
     -o /public/documentos/lezo/boe-rd527-vacante-velasco-jci6.pdf
curl -L "https://www.boe.es/diario_boe/xml.php?id=BOE-A-2017-5738" \
     -o /public/documentos/lezo/boe-rd527-vacante-velasco-jci6.xml
shasum -a 256 /public/documentos/lezo/boe-rd527-vacante-velasco-jci6.*
```

Sin sesión, sin cookies, sin captcha.

## Endpoints de búsqueda — BOE estatal

### Buscador general

GET a `https://www.boe.es/buscar/legislacion.php` o `https://www.boe.es/buscar/doc.php` con parámetros de query string. **Pendiente de catalogar exhaustivamente**.

### Sumario del BOE de un día

JSON estable:
```
https://www.boe.es/datosabiertos/api/boe/sumario/YYYYMMDD
```

Devuelve el sumario completo del BOE de ese día con todas las disposiciones, sus identificadores, secciones, departamentos y enlaces. Útil para barrer un rango de fechas en busca de disposiciones relacionadas con un caso.

### API datos abiertos

`https://www.boe.es/datosabiertos/` — endpoints REST con datos estructurados (sumarios, tablas anexas, índices). Pendiente de catalogar.

## Cobertura temporal real

| Recurso | Cobertura |
|---|---|
| Sumario y disposiciones | Desde el primer número del BOE (1936). PDFs digitalizados retroactivamente. Cobertura completa. |
| XML estructurado | Desde 2003 con formato consistente; anteriores tienen XML pero con menos campos. |

## Filtros y trampas

- **`fecha_documento` ≠ `fecha_publicacion`**: confusión recurrente. La fecha del acto administrativo (RD, Acuerdo, Orden) suele estar antes que la fecha de publicación en BOE. Al cumplimentar un `Documento`:
  - `fecha_documento` = fecha del acto (la que aparece en el título del RD: "Real Decreto 527/2017, de 22 de mayo").
  - `fecha_publicacion` = fecha del BOE (la del campo `<fecha_publicacion>` del XML, o la del path del PDF).

  Verificado el 2026-05-23 (caso González Amador) y el 2026-05-27 (caso Lezo): dos BOE preexistentes en el repo tenían la fecha del acto administrativo en `fecha_publicacion` en lugar de la del BOE.

- **Metadatos del PDF**: campo `Author` revela el órgano emisor real. Para BOE estatal: `CONSEJO GENERAL DEL PODER JUDICIAL` cuando es un acuerdo del CGPJ, `MINISTERIO DE JUSTICIA` cuando es un RD del ministerio, etc. Producción típica: `eBOE` como Creator + `Adobe PDF Library 10.0.1` como Producer.

## Boletines autonómicos

*(Pendiente catalogar exhaustivamente.)* Inventario de boletines a documentar cuando aparezca un caso que los necesite:

| CCAA | Boletín | Web |
|---|---|---|
| Andalucía | BOJA | `juntadeandalucia.es/boja` |
| Aragón | BOA | `boa.aragon.es` |
| Asturias | BOPA | `sede.asturias.es` |
| Baleares | BOIB | `caib.es/boib` |
| Canarias | BOC | `gobiernodecanarias.org/boc` |
| Cantabria | BOC | `boc.cantabria.es` |
| Castilla y León | BOCYL | `bocyl.jcyl.es` |
| Castilla-La Mancha | DOCM | `docm.castillalamancha.es` |
| Cataluña | DOGC | `portaldogc.gencat.cat` |
| Comunidad Valenciana | DOGV | `dogv.gva.es` |
| Extremadura | DOE | `doe.juntaex.es` |
| Galicia | DOG | `xunta.gal/dog` |
| La Rioja | BOR | `web.larioja.org/bor` |
| Madrid | BOCM | `bocm.es` |
| Murcia | BORM | `borm.es` |
| Navarra | BON | `navarra.es/bon` |
| País Vasco | BOPV | `euskadi.eus/bopv` |
| Ceuta | BOCCE | `ceuta.es` |
| Melilla | BOME | `melilla.es` |

**Lección operativa pendiente de verificar**: el BOCM ya se ha consumido en el caso `lezo` (acuerdos CCAA de Madrid) con descarga directa por URL canónica. Verificar y documentar el patrón antes de añadir el siguiente.

## Cómo verificar que funciona

**Test 1 (PDF estable BOE)**: GET a `https://www.boe.es/boe/dias/2017/05/24/pdfs/BOE-A-2017-5738.pdf` debe devolver 200 con `Content-Type: application/pdf` y 183 024 bytes. Hash SHA-256: `7c50efe0fc0600118789b35e743d6ed030bd1827da120e43d92db0a06766d798`.

**Test 2 (XML estructurado)**: GET a `https://www.boe.es/diario_boe/xml.php?id=BOE-A-2017-5738` debe devolver 200 con `Content-Type: application/xml; charset=ISO-8859-15` y contener `<fecha_publicacion>20170524</fecha_publicacion>`.

## Cuándo NO usar este portal

- **Para disposiciones de menos de 24h**: el BOE publica el documento del día con un ligero retraso (madrugada del mismo día). Si el caso necesita un BOE recién aprobado, comprobar primero el sumario del día con el endpoint de datos abiertos.

- **Para escritos procesales**: nunca van al BOE. Buscar en CENDOJ ([poder-judicial.md](poder-judicial.md)) o en el portal del órgano emisor.

## Histórico de descubrimientos

- **2026-05-22** — PR2 del caso FGE. Establecida la convención de "documentos primarios descargados" con BOE como caso paradigmático. Endpoints estables `boe.es/boe/dias/YYYY/MM/DD/pdfs/BOE-A-YYYY-XXXXX.pdf` y `boe.es/diario_boe/{txt,pdf,xml}.php?id=BOE-A-YYYY-XXXXX` documentados en AGENTS.md.

- **2026-05-23** — Caso González Amador. Detectado que dos BOE preexistentes tenían `fecha_publicacion` confundida con la fecha del acto administrativo. Corregido cruzando contra `<fecha_publicacion>` del XML BOE. Lección incorporada a la sección "Filtros y trampas".

- **2026-05-27 (noche, 3)** — Caso Lezo. Descargado el RD 527/2017 (BOE-A-2017-5738) como segundo respaldo N1 del hito de cambio de juez Velasco → García-Castellón. Verificado patrón de URL canónica BOE estatal contra el caso. Hash SHA-256 del PDF servido al árbol catalogado para uso futuro en este documento.
