# NOTES — caso Lezo (PR1)

Anotaciones internas. Excluido del build público.

## Tensión brief vs realidad procesal (guardarrail 1 de `/investigar-caso`)

El brief inicial del maintainer (sesión 2026-05-23, planning Bloque A
del Camino al lanzamiento público) presentaba a Lezo como caso con
**sentencia firme del Tribunal Supremo** por delitos vinculados al
Canal de Isabel II, candidato para servir como 2º caso firme del
inventario tras el FGE.

La investigación confirma que **a fecha de PR1 (2026-05-23) no existe
sentencia firme del TS en ninguna pieza del caso Lezo**. El juicio
oral de la pieza más avanzada (campo de golf del Canal) ha sido
señalado por la Sección Segunda de la Sala de lo Penal de la
Audiencia Nacional para **13-30 de septiembre de 2027** (cobertura
cruzada eldiario.es 22-dic-2025, Confilegal 23-dic-2025, El Plural
24-dic-2025, El Debate 25-dic-2025). Otras piezas (Emissao, Inassa)
siguen en instrucción o fase intermedia sin señalamiento.

**Decisión editorial tomada con el maintainer en la propia sesión
(`AskUserQuestion` 2026-05-23)**: arrancar Lezo igualmente sin
firmeza, con hitos jurisdiccionales documentados, hechos en estado
`atribuido`/`investigado` y promoción a `acreditado` aplazada al
PR posterior al juicio oral (esperable PR3+ en septiembre/octubre
de 2027 o cuando recaiga sentencia firme tras casación). El caso
cumple igualmente el objetivo del Bloque A de equilibrar la
narrativa del inventario con un caso PP/derechas (junto con
Kitchen, que arranca en sesión paralela).

## Decisiones tomadas en PR1

- **Pieza modelada en detalle**: la del campo de golf (la que va a
  juicio oral en septiembre de 2027). Cinco procesados: Ignacio
  González, su hermano Pablo Manuel González, su cuñado Juan José
  Caballero Escudier, el socio José Antonio Clemente Marín y el ex
  gerente del Canal Ildefonso de Miguel Rodríguez.
- **Piezas mencionadas en `descripcion_corta` pero no modeladas con
  rol propio**: Emissao (procesamiento 18-nov-2019), Inassa (en
  fase intermedia), ático Estepona (archivada 2020), pieza
  Ruiz-Gallardón (archivada 2019). Pendientes PR2+.
- **Magistrados modelados como `Persona`**: Manuel María
  García-Castellón García-Lomas (titular JCI 6 julio-2017 ↔ 2-sept-2024
  por jubilación forzosa por edad declarada en BOE-A-2024-17653) y
  Antonio Piña Alonso (titular JCI 6 desde 8-ene-2025 por RD
  1271/2024 publicado en BOE-A-2025-350). El primer instructor,
  Eloy Velasco, se menciona en el hito de prisión preventiva sin
  fichar como Persona en PR1 (estuvo brevemente, hasta jun-2017;
  PR2+ si se modela retrospectivamente).
- **María Tardón** asumió las causas provisionalmente entre la
  jubilación de García-Castellón (2-sept-2024) y el nombramiento de
  Piña (8-ene-2025). Mencionada en `descripcion_corta` y NOTES sin
  fichar como Persona en PR1: la titularidad propiamente del JCI 6
  no la asumió (siguió siendo titular del JCI 3). PR2+ si se
  necesita.
- **Procesados privados con rol formal**: Pablo Manuel González,
  Juan José Caballero, José Antonio Clemente, Ildefonso de Miguel
  están identificados públicamente en cobertura masiva y en escrito
  de acusación de la Fiscalía Anticorrupción; se ficha cada uno
  como `Persona(es_figura_publica:false)` con biografía corta
  estrictamente neutra ceñida al rol procesal, sin datos personales
  innecesarios (V-17 y doc 04 §11 respetados). Revisión obligatoria
  de anonimización si los roles se cierran con absolución, archivo
  o desimputación.
- **Nombre completo de Ignacio González**: la sentencia de la Sección
  Segunda y la cobertura jurídica indican que su nombre formal es
  «Jaime Ignacio González González» (la prensa generalista usa
  «Ignacio González González» o «Ignacio González»). Persona
  fichada con `nombre_completo: "Jaime Ignacio González González"`
  y nombres alternativos para captura por RichProse.
- **TCT**: sociedad familiar fundada en mayo de 2003, nombre legal
  «Tecnoconcret Proyectos de Ingeniería» según cobertura jurídica
  (Confilegal). Fichada como `Organizacion(tipo: empresa)` sin CIF
  por no contar con la confirmación registral.

## Niveles de fuente — decisiones

- **N1**: dos documentos del BOE en el repositorio local con `ruta_local`
  + `hash_sha256` (jubilación García-Castellón y nombramiento Piña),
  conforme a la convención de primarios descargados introducida en
  PR2 del caso FGE. Pendientes PR2+: notas oficiales del CGPJ sobre
  el auto de procesamiento de la pieza Emissao (18-nov-2019) y sobre
  el auto de apertura de juicio oral de la pieza golf (agosto de
  2021) si están accesibles en `poderjudicial.es`; auto íntegro si
  llega a CENDOJ (poco probable en piezas todavía en instrucción,
  ver lección Plus Ultra).
- **N4**: cobertura cruzada de líneas editoriales distintas
  (Público + eldiario.es vs Confilegal + El Debate vs Infobae + El
  Plural + Madridiario). V-13 cumplido.

## Pendientes PR2+

- **Auto de procesamiento íntegro de la pieza golf**: el auto de
  García-Castellón es de noviembre de 2019 (orden de procesamiento),
  pero el auto de apertura de juicio oral propiamente es de agosto
  de 2021. Ninguno localizado en CENDOJ; mirrors periodísticos
  parciales accesibles (Confilegal, Público). Si aparece copia
  íntegra en mirror estable, descargar conforme a §"Documentos
  primarios descargados" (autorización maintainer).
- **Auto íntegro de la sección 2ª de la AN señalando juicio oral
  para sept-2027** (probablemente providencia de diciembre de 2025).
  Esperar publicación en CENDOJ o nota CGPJ específica.
- **Otros procesados activos en piezas separadas (Emissao, Inassa)**:
  Edmundo Rodríguez Sobrino, Diego Fernando García Arias, Luis
  Vicente Moro Díaz, Ramón Navarro Pereira, Javier López Madrid y
  los demás. Conforme se modelen las piezas Emissao e Inassa.
- **Eloy Velasco** como Persona si se decide modelar retrospectivamente
  el rol de juez instructor inicial del JCI 6 (abril-junio 2017).
- **María Tardón** como Persona si el rol provisional entre la
  jubilación de García-Castellón y el nombramiento de Piña
  (sep-nov 2024) se considera materialmente relevante en algún
  hito procesal (autos dictados en ese intervalo).
- **Fernando Andreu** como Persona si se profundiza en la fase de
  juicio oral con el tribunal de la Sección Segunda de la Sala de
  lo Penal de la Audiencia Nacional. Es ponente designado para la
  pieza golf según cobertura.
- **Personación del Ayuntamiento de Madrid** como acusación
  particular (admisión por la AN bajo el gobierno de Manuela Carmena
  en 2017-2018). Modelar Organización ayuntamiento-madrid + rol en
  PR2.
- **Cuantificaciones precisas** de las distintas piezas (Emissao
  sobreprecio ~9,7 M$; Inassa ~4 M€ comisiones; Adjudicaciones
  Canal Golf >3 M€ + 504.780 €). Verificar contra escritos de
  acusación íntegros cuando estén disponibles.
- **Promoción a `acreditado`** de los hechos respaldados por
  resolución firme: pendiente del juicio oral de septiembre de
  2027 y de la eventual casación posterior. Hasta entonces,
  conservar todos los hechos en `atribuido` / `investigado`
  conforme al guardarrail 3 de `/investigar-caso`.
