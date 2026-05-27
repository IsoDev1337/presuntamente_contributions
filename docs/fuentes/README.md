# Catálogo de fuentes oficiales

> Documentación operativa de los portales públicos de los que el inventario descarga documentos primarios. **Conocimiento técnico, vivo, ampliable** — cada sesión que descubre un endpoint nuevo, una trampa o un código no documentado lo anota aquí.

## Para qué sirve este catálogo

El proyecto modela cada `Documento` con `url_canonica` y, cuando aplica la convención de "Documentos primarios descargados" ([AGENTS.md](../../AGENTS.md#documentos-primarios-descargados-a-publicdocumentos)), también con `ruta_local` + `hash_sha256` apuntando a una copia íntegra del PDF/XML/HTML servida desde `/public/documentos/<caso>/`.

Para que ese flujo sea repetible y auditable, **cada agente que entra al repo necesita saber**:

- Dónde vive cada tipo de documento (qué portal, qué sección).
- Qué URL tiene estabilidad real (algunas URLs públicas son sesiones efímeras y no sirven como `url_canonica`).
- Cómo se busca: endpoints AJAX, formularios POST, parámetros, autenticación implícita por `JSESSIONID`.
- Qué cobertura temporal **real** tiene cada buscador (no la declarada — algunos sólo indexan los últimos años aunque digan lo contrario).
- Qué filtros del formulario **filtran de verdad** y cuáles son cosméticos.
- Qué fuentes hay que rechazar por imposibilidad de auditar cadena de custodia (Wuolah, Scribd, blogs personales).

Esto vive **fuera de las skills** porque lo consumen varias (`investigar-caso`, `incorporar-hito`, `rastrear-cobertura`) y porque va a crecer mucho. Las skills enlazan aquí; este catálogo no decide nada editorialmente.

## Índice

- [`poder-judicial.md`](poder-judicial.md) — CENDOJ, acuerdos del CGPJ (Comisión Permanente y otras), notas de prensa de la Oficina de Comunicación del CGPJ / TS / AN.
- [`boe-y-boletines-oficiales.md`](boe-y-boletines-oficiales.md) — BOE estatal, DOGC, BOJA, BOPV, BOCM, BORM, DOG, BON, DOCV, DOE, BOCYL, BOIB, BOC, BOCM(elilla), BOCCE. *(pendiente catalogar todos)*.
- [`fiscalia.md`](fiscalia.md) — `fiscal.es`. *(pendiente catalogar)*.
- [`tribunal-constitucional.md`](tribunal-constitucional.md) — `tribunalconstitucional.es`. *(pendiente catalogar)*.
- [`organismos-economicos.md`](organismos-economicos.md) — AEAT, CNMV, CNMC, Tribunal de Cuentas, AIReF, Banco de España, SEPI. *(pendiente catalogar)*.
- [`legislativo.md`](legislativo.md) — Congreso de los Diputados, Senado, Defensor del Pueblo. *(pendiente catalogar)*.
- [`archivos-y-mirrors.md`](archivos-y-mirrors.md) — archive.org, archive.ph, mirrors periodísticos auditables, criterios para descartar mirrors anónimos. *(pendiente catalogar)*.

Los items marcados *(pendiente catalogar)* son placeholders del backlog "Sesión de ingeniería inversa de portales del Estado" del [`ROADMAP.md`](../../ROADMAP.md). Al cerrar cada uno, retirar la marca y rellenar.

## Plantilla mínima por ficha

Cada fichero del catálogo sigue esta estructura para que la lectura sea predecible:

```markdown
# Nombre del portal o familia

URL raíz · titular institucional · ámbito de competencia.

## Qué hay aquí

Tipos de documentos que vive en este portal y que el inventario consume (sentencias, autos, BOE, notas, informes, etc.). Para cada tipo, qué `Documento.tipo` del schema le corresponde.

## Patrones de URL estables

Por tipo de documento, URL canónica que se puede usar como `url_canonica` sin riesgo de caducidad. Incluir endpoints alternativos (TXT/XML/PDF) cuando existan.

## Endpoints de búsqueda

POST/GET descubiertos, parámetros, autenticación implícita, ejemplos `curl` mínimos para reproducir.

## Cobertura temporal real

Qué años indexa de verdad el buscador (≠ qué dice el portal que indexa). Comprobado año a año cuando aplique.

## Filtros y trampas

Campos del formulario que filtran de verdad vs cosméticos. Filtros silenciosos. Códigos numéricos opacos descubiertos. Formato exacto de fechas. Encoding de caracteres especiales (eñes, acentos).

## Cómo verificar que funciona

Caso conocido del inventario contra el que probar la búsqueda y obtener resultado esperado. Si falla la verificación, el portal cambió: actualizar la ficha.

## Cuándo NO usar este portal

Situaciones en que el portal no sirve aunque parezca apropiado (cobertura recortada, anonimización agresiva, autenticación de parte, etc.). Y qué hacer en cada caso (modelar como N4 cruzado + `pendiente_primario`, esperar a que llegue al TS, pedir copia formal, etc.).

## Histórico de descubrimientos

Una línea por sesión que añadió o corrigió algo aquí. Fecha, qué se descubrió y de qué se aprendió.
```

## Convenciones de catálogo

1. **Una URL canónica auditable, o nada.** No documentamos URLs que requieran sesión personal, captcha humano o autenticación de parte. Si un portal sólo es accesible así, decirlo y dejar el documento como `pendiente_primario` hasta que aparezca por vía abierta.

2. **Reproducible con `curl`.** Si un endpoint requiere cookies de navegador, decirlo explícito y dejar la receta para extraerlas. La sesión `JSESSIONID` que devuelve un GET inicial a la home del portal suele bastar.

3. **Comprobado, no presunto.** Cada patrón se valida contra un caso conocido del inventario antes de añadirse. Si no se ha verificado, marcarlo como *(no verificado)* y registrar el riesgo.

4. **No declarativo: instructivo.** El catálogo no dice "el BOE publica los Reales Decretos"; dice "el PDF estable del RD 527/2017 está en `https://www.boe.es/boe/dias/2017/05/24/pdfs/BOE-A-2017-5738.pdf` y se descarga así". El "qué publica" lo da por hecho.

5. **Trampas y filtros silenciosos son tan importantes como los endpoints.** Que `VALUESCOMUNIDAD=13` no filtre realmente por Madrid en CENDOJ es información operativa crítica: si no se documenta, el siguiente agente perderá una sesión entera persiguiéndola.

6. **Si un campo del formulario se queda obsoleto o el endpoint cambia**, **no se borra el histórico**: se marca como deprecado con fecha y se añade el nuevo. Esto permite auditar por qué un descubrimiento previo dejó de funcionar.

## Cómo ampliar el catálogo

- **Cuando un agente descubre un endpoint, una trampa o un código nuevo**: anotarlo en la ficha del portal correspondiente *en la misma sesión*, junto al cambio que lo provocó. No dejar el aprendizaje sólo en `NOTES.md` del caso ni sólo en `ROADMAP.md`.
- **Cuando un portal no existe todavía en el catálogo y el caso lo necesita**: crear la ficha mínima (qué hay, patrones de URL, una verificación) aunque sea breve. Es mejor un esbozo que nada.
- **Cuando se descubre que un filtro o endpoint **dejó de funcionar**: marcar la sección con `> ⚠ Verificado roto el YYYY-MM-DD` y, si se puede, documentar el endpoint nuevo. Si no, dejar el aviso para la próxima sesión.

## Cómo lo consume el resto del repo

- Las skills [`investigar-caso`](../../.agents/skills/investigar-caso/SKILL.md) e [`incorporar-hito`](../../.agents/skills/incorporar-hito/SKILL.md) referencian directamente cada ficha de este catálogo en lugar de mantener su propio mini-catálogo.
- [`AGENTS.md`](../../AGENTS.md) enlaza este directorio desde la sección "Documentos primarios descargados".
- Eventuales scripts en `scripts/` pueden hardcodear los endpoints documentados aquí siempre que un comentario apunte a la ficha origen, de modo que cuando el endpoint cambie y la ficha se marque como rota, el script se actualice en la misma pasada.
