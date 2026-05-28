# Agregadores de descubrimiento (scouting)

> Catálogo de **fuentes secundarias** que sirven para **descubrir casos candidatos**, no para citarlos. Categoría hermana —y opuesta— a los portales de primarios oficiales del resto de este directorio.

## Qué es esto y qué NO es

Un **agregador de descubrimiento** es una web de terceros que compila casos de corrupción a su manera (lista, ranking, base de datos). Sirve para una sola cosa: **detectar casos que aún no tenemos fichados** y meterlos en el embudo de investigación.

> ⚠ **Nunca son fuente citable.** Un agregador secundario **no** puede aparecer en `Documento.url_canonica`, ni respaldar un `Hecho` (`documentos_respaldo[]`), ni fijar un importe, un estado procesal o una atribución. Es exactamente el tipo de fuente no auditable que el catálogo de primarios rechaza (ver [`README.md`](README.md) y [`archivos-y-mirrors.md`](archivos-y-mirrors.md)).

**Flujo correcto:** agregador → sale un nombre de caso candidato → se arranca con [`/investigar-caso`](../../.agents/skills/investigar-caso/SKILL.md) **desde primarios oficiales** ([`docs/fuentes/`](README.md)). Todo dato (personas, roles, fechas, importes, fuentes) se re-verifica; nada se importa del agregador.

**Por qué importa el guardarraíl:** estos agregadores suelen incumplir los principios irrenunciables del proyecto —mezclan imputado/condenado/absuelto sin distinción, atribuyen importes "defraudados" sin sentencia firme, no trazan fuente por hecho con nivel N1-N4—. Copiarlos contaminaría el inventario con su estándar probatorio más bajo. Su valor es el *radar*, no el dato.

---

## casos-aislados.com

URL raíz: `https://casos-aislados.com` · autor: **@Esparroqui** (ciudadano particular, declaradamente no partidista) · ámbito: corrupción en España.

### Qué hay aquí

Inventario de amplitud: ~589 casos, ~8.150 implicados, ~124.000 M€ estimados (cifras propias de la web, mayo 2026). Proyecto hermano del nuestro en misión ("no son casos aislados, es corrupción sistémica"), opuesto en método: ellos van a amplitud superficial; presuntamente va a profundidad trazable. Colaboración abierta vía Telegram; correcciones aceptadas con documento judicial o noticia.

Rutas útiles para barrer candidatos:

- `/tramas.php` — listado completo de casos, orden alfabético.
- `/stats.php` — agregados y rankings (coste por comunidad/partido, top casos por coste).
- `/Caso-por-partido.php?Partido=<nombre>` — casos por formación.
- `/Caso-por-comunidad.php?Comunidad=<nombre>` — casos por comunidad autónoma.
- `/Caso-Aislado.php?Caso=<nombre>&numero=<n>` — ficha de detalle (incluye fotos de implicados).

### Cómo usarlo

Como lista de leads: cruzar su listado contra nuestro catálogo (`content/casos/`) para detectar casos relevantes que nos falten. Cada candidato se re-investiga desde cero con primarios.

### Cómo NO usarlo

- No importar importes (los suyos incluyen cantidades presuntas sin sentencia → choca con *imputación ≠ condena*).
- No copiar su estado judicial (no distingue imputado/condenado/absuelto de forma fiable).
- No tomar su vertebración por **partido** como modelo: presuntamente evita la cuota política por diseño.
- No usar sus **fotos**: las levanta de prensa (riesgo de derechos de autor del fotógrafo, capa independiente del derecho de imagen del personaje público). Ver decisión legal pendiente en [`ROADMAP.md`](../../ROADMAP.md) ("criterio legal antes de fotos reales").

### Solapes ya detectados

- "Caso Ático Estepona" está en su lista y en nuestro repo como borrador (`content/casos/atico-estepona`).

### Histórico de descubrimientos

- **2026-05-28** — Alta de la ficha y de esta categoría de scouting, a raíz del análisis de casos-aislados.com.
