# NOTES — caso Lezo (tras PR1-PR4)

Anotaciones internas. Excluido del build público.

## Estado consolidado tras los cuatro PRs de la sesión 2026-05-23 / 2026-05-24

Acumulado tras PR1 + PR2 + PR3 + PR4:

- **11 personas fichadas**: Jaime Ignacio González González (procesado
  golf + Emissao + investigado→desimputado Inassa), su hermano Pablo
  Manuel González González (procesado golf), su cuñado Juan José
  Caballero Escudier (procesado golf), el socio José Antonio
  Clemente Marín (procesado golf), el ex director gerente del Canal
  Ildefonso de Miguel Rodríguez (procesado golf), Edmundo Rodríguez
  Sobrino (procesado Emissao + Inassa), Pedro Luis Calvo Poch
  (procesado Inassa), Juan Bravo Rivera (procesado Inassa), Alberto
  Ruiz-Gallardón Jiménez (investigado→desimputado Inassa) más los
  cuatro magistrados (Velasco, García-Castellón, Tardón, Piña) y
  Fernando Andreu como ponente del tribunal.
- **5 organizaciones nuevas**: Canal de Isabel II, Comunidad de
  Madrid, Ayuntamiento de Madrid, Tecnoconcret Proyectos de
  Ingeniería (TCT), Unidad Central Operativa de la Guardia Civil
  (UCO). Tribunal Supremo, Audiencia Nacional y JCI nº 6 fichados
  previamente por otras sesiones; Fiscalía Anticorrupción ya
  existía en main.
- **7 hitos**: operación UCO 19-abr-2017 (imputación) → prisión
  preventiva Velasco 22-abr-2017 (declaracion_imputado) → cambio
  juez Velasco→Castellón jul-2017 (cambio_juez) → auto procesamiento
  pieza Emissao 18-nov-2019 (auto_procesamiento) → archivo pieza
  Inassa para Ruiz-Gallardón y otros 14 desimputados 30-may-2019
  (archivo_provisional) → inicio vista oral pieza Inassa
  24-may-2023 (inicio_vista_oral) → cambio juez Castellón→Piña
  8-ene-2025 (cambio_juez) → señalamiento juicio pieza golf
  22-dic-2025 (apertura_juicio_oral).
- **7 hechos**: adjudicación amañada campo golf 2003-2004 (atribuido),
  comisiones sobres efectivo TCT (atribuido), prisión preventiva
  Ignacio González abril 2017 (atribuido), múltiples piezas
  separadas activas (investigado), compra Inassa sobreprecio 2001
  (atribuido), compra Emissao desvío 2013 (atribuido), archivo
  Ruiz-Gallardón pieza Inassa 2019 (exculpatorio).
- **14 roles**: 5 procesados en pieza golf + 3 procesados en
  Inassa + Rodríguez Sobrino procesado Emissao+Inassa + Ignacio
  González investigado→procesado-golf + Ruiz-Gallardón
  investigado→desimputado + 4 jueces instructores en cadena
  Velasco/Castellón/Tardón/Piña + Andreu juez_ponente Sec 2ª +
  Comunidad de Madrid acusación_particular + Ayuntamiento de
  Madrid acusación_particular + Canal de Isabel II perjudicado.
- **11 documentos**: dos N1 BOE descargados al árbol
  (BOE-A-2024-17653 jubilación García-Castellón + BOE-A-2025-350
  RD destino Piña, ambos con `ruta_local` + `hash_sha256` y XMLs
  estructurados); nueve N4 de cobertura cruzada en seis líneas
  editoriales distintas (El Español, Público, El Independiente,
  eldiario.es, Confilegal, The Objective).

## Tensión brief vs realidad procesal (guardarrail 1 de `/investigar-caso`)

El brief inicial del maintainer (sesión 2026-05-23, planning Bloque
A del Camino al lanzamiento público) presentaba a Lezo como caso
con **sentencia firme del Tribunal Supremo** por delitos vinculados
al Canal de Isabel II, candidato para servir como 2º caso firme del
inventario tras el FGE.

La investigación confirmó que **a fecha de PR1 (2026-05-23) no
existe sentencia firme del TS en ninguna pieza**. El juicio oral
más avanzado (pieza del campo de golf) ha sido señalado por la
Sección Segunda de la Sala de lo Penal de la Audiencia Nacional
para **13-30 de septiembre de 2027**. La pieza Inassa inició
vista oral el 24 de mayo de 2023 ante la misma Sección Segunda;
la sentencia de esta primera pieza no se localiza públicamente a
fecha de PR4 (posible incidente de cuestiones previas o jurado
todavía no resuelto; pendiente seguimiento). La pieza Emissao
sigue en fase intermedia desde el auto de procesamiento del 18
de noviembre de 2019.

Decisión editorial mantenida durante los cuatro PRs: hechos en
estado `atribuido` / `investigado` / `exculpatorio`, sin
`acreditado` hasta resolución firme.

## Convención editorial fijada en la cobertura de Lezo

- **Magistrados de cargo público nominal**: fichados con
  `cargos_publicos_historicos` precisos (BOE / CGPJ); cuando la
  fecha de cargo es incierta, anotada como aproximada en NOTES.
  Aplicado a Velasco, García-Castellón, Tardón, Piña, Andreu.
- **Procesados privados con rol formal**: fichados como
  `es_figura_publica: false` con biografía corta neutra ceñida a
  rol procesal sin datos personales innecesarios (V-17 y doc 04
  §11). Aplicado a Pablo González, Caballero, Clemente. Revisión
  obligatoria de anonimización si su rol se cierra con absolución
  o desimputación.
- **Procesados privados que también son figuras públicas por
  cargo histórico**: Ildefonso de Miguel (ex gerente Canal)
  fichado como figura pública con cargo histórico. Caso especial
  porque su rol procesal arranca por ese cargo.
- **Ignacio González como caso multi-pieza**: tres tramos
  procesales distintos modelados con tres roles consecutivos del
  mismo sujeto sobre el mismo `caso_id: lezo` — `investigado`
  (cubre la apertura del procedimiento 2017-2019), `procesado`
  pieza golf (2019-vigente) y `desimputado` pieza Inassa
  (2019-vigente). El sistema lo gestiona naturalmente porque el
  modelo no exige unicidad sujeto×caso, sólo sujeto×caso×rol.
- **Cuantías en M€ y M$**: las cuantías de las piezas en USD
  (Inassa 73 M$; Emissao 30 M$) se conservan en USD por
  fidelidad a la operación original; las peticiones de pena y
  responsabilidad civil en €. RichProse autoformatea ambas.
- **Nombre completo de Ignacio González**: la cobertura jurídica
  indica «Jaime Ignacio González González» como nombre formal.
  Persona fichada con ese nombre completo y la prensa generalista
  cubierta en `nombres_alternativos` («Ignacio González»,
  «Ignacio González González», «González González»).
- **TCT**: nombre legal «Tecnoconcret Proyectos de Ingeniería»
  según cobertura jurídica. Fichada como `Organizacion(tipo:
  empresa)` sin CIF por no contar con la confirmación registral.

## Niveles de fuente — decisiones aplicadas

- **N1**: dos documentos del BOE en el repositorio local
  (BOE-A-2024-17653 y BOE-A-2025-350) con `ruta_local` +
  `hash_sha256` + XML estructurado del propio BOE. Pendientes
  N1 adicionales: notas oficiales del CGPJ sobre el auto de
  procesamiento Emissao 18-nov-2019 y sobre el auto de apertura
  de juicio oral pieza golf agosto 2021 si están accesibles en
  `poderjudicial.es`; auto íntegro si llega a CENDOJ tras
  primera sentencia de la pieza Inassa.
- **N4**: cobertura cruzada de seis líneas editoriales
  (El Español + Público + Confilegal + eldiario.es + El
  Independiente + The Objective). V-13 cumplido en todos los
  hitos sin documento oficial accesible.
- **Hook archive.org**: los 9 documentos N4 de Lezo se
  procesarán por el hook pre-commit cuando entren al staging.
  Sin verificación específica en NOTES.

## Pendientes PR6+

Actualizado tras el cierre de PR5 (sesión 24-may-2026, commit
`efc331c`), que fichó a Manuel Cobo Vega como desimputado de la
pieza Inassa y modeló el caso del ático de Estepona como `Caso`
propio con `RelacionEntreCasos conexion_factual` apuntando a
Lezo.

- **Javier López Madrid** como Persona y rol procesado pieza
  Emissao. Empresario español conocido, figura pública por
  cobertura mediática (caso tarjetas «black» de Caja Madrid y
  causas asociadas). Sentado en el banquillo junto a Ignacio
  González por presuntos delitos de tráfico de influencias,
  cohecho, falsedad documental y fraude a las administraciones.
  De los procesados pendientes es el más relevante editorialmente.
- **Diego Fernando García Arias, Luis Vicente Moro Díaz y
  Ramón Navarro Pereira** como procesados Emissao/Inassa.
  Figuras menores (director de nuevos negocios de Inassa,
  vinculado a Essentium, director gerente de Triple A). Evaluación
  caso a caso conforme a V-17 / doc 04 §11. La opción
  conservadora es dejarlos como mención en la descripción del
  hito sin Persona propia.
- **Resto de desimputados de la pieza Inassa** (12 personas
  más sobreseídas el 30-may-2019, ya tienen Cobo y Ruiz-Gallardón
  fichados de los principales). Modelar sólo las que sean
  figuras públicas relevantes; el resto puede quedar como
  mención en descripción del hito de archivo
  `archivo-pieza-inassa-gallardon-lezo-2019-05-30`.
- **Esperanza Aguirre** como Persona si se documenta
  formalmente su comparecencia como testigo o cualquier rol
  procesal en alguna pieza. La cobertura indica que fue
  requerida a testificar; pendiente de verificar si se llegó
  a celebrar la diligencia y en qué pieza.
- **Auto íntegro de la providencia de la Sec 2ª de la AN
  señalando juicio oral pieza golf para sept-2027** si aparece
  en CENDOJ o nota CGPJ específica. Probable que sea
  providencia interna no publicable.
- **Sentencia de primera instancia de la pieza Inassa** si ya
  ha recaído tras la vista oral del 24-may-2023; pendiente de
  rastrear. Si recae, modelar como hito `sentencia_primera_instancia`
  + roles consecutivos (`procesado` → `condenado_no_firme` o
  `absuelto`) para los 22 acusados. Patrón de cuatro roles
  consecutivos en cadena ya validado en FGE.
- **Promoción a `acreditado`** de los hechos respaldados por
  resolución firme: aplazada al juicio oral de septiembre de
  2027 y eventual casación posterior para la pieza golf, y a
  la primera sentencia de Inassa cuando se localice. Hasta
  entonces, todos los hechos conservados en `atribuido` /
  `investigado` / `exculpatorio` conforme al guardarrail 3 de
  `/investigar-caso`.

## Lo que NO está bloqueante

Ninguno de los pendientes anteriores impide que el caso Lezo se
considere publicable en la primera oleada de lanzamiento del sitio:
los 5 PRs ya cubren la columna vertebral procesal (5 piezas
documentadas, 4 instructores en cadena, tribunal de enjuiciamiento
con ponente, dos acusaciones particulares, dos N1 BOE descargados,
9 N4 cruzados en 6 líneas editoriales, 7 hitos jurisdiccionales,
14 roles, primera RelacionEntreCasos con caso conexo). Los
refinamientos PR6+ son acumulativos, no críticos.

## Incidencia multiagéntico documentada

Durante esta sesión (24-may-2026), los 12 archivos del PR2 de
Lezo fueron arrastrados dos veces consecutivas por commits de la
sesión paralela del caso Kitchen (commits `93cbb7a` y luego
`41f9642` tras el reset intermedio del primero). El contenido
editorial del PR2 (3 personas, 1 hito, 2 hechos, 3 roles, 3
documentos) está correctamente en main pero atribuido a commits
con mensajes Kitchen/ROADMAP/AGENTS.

La sesión paralela detectó la incidencia, hizo `git reset HEAD~1`,
documentó la lección en el commit `40de2b0` y consolidó dos
normas nuevas en `AGENTS.md §"Repositorio multiagéntico en
paralelo"` (puntos 6 y 7) mediante el commit `41f9642`:

- **Norma 6**: no encadenar `git add` y `git commit` con `&&`,
  separar siempre en llamadas discretas para inspeccionar el
  staging entre uno y otro.
- **Norma 7**: minimizar commits intermedios cuando hay sesiones
  paralelas activas. Acumular cambios en el menor número
  posible de commits finales para reducir la ventana de
  contaminación cruzada.

PR3 y PR4 aplicaron ambas normas correctamente y no sufrieron
arrastre. Trazabilidad efectiva del contenido editorial de Lezo
PR2: visible vía `git log --oneline -- content/casos/lezo/` y
`git log --oneline -- content/personas/edmundo-rodriguez-sobrino.yaml`.
