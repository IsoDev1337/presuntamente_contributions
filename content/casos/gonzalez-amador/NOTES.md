# NOTES — Caso González Amador

Anotaciones internas. **No se publica.** Vive en el repo para humanos y agentes LLM que iteren sobre este caso. Convención en `AGENTS.md` § *NOTES.md por caso*.

Última actualización: 2026-05-22 (PR1 — esqueleto inicial con la skill `/investigar-caso`, en paralelo al PR3 del caso Begoña Gómez).

---

## Por qué este caso entra el tercero

Decidido el 2026-05-22 por el maintainer: el caso González Amador entra antes que Koldo porque (a) ya tiene auto de procesamiento ratificado por la AP Madrid y apertura de juicio oral, lo que da una columna vertebral cronológica clara para la ficha, (b) balancea editorialmente el inventario tras Begoña Gómez (caso vivo del entorno PSOE), aplicando exactamente la misma estructura, tono y badges a un caso del entorno PP, conforme a la P-10 de tratamiento sin cuota política, y (c) Koldo se reserva para más tarde porque está conectado a Begoña Gómez por la mención periférica de Víctor de Aldama (NOTES de Begoña Gómez §"Personas con rol procesal NO modeladas en PR1 ni PR2") y conviene cerrar Begoña antes.

## Decisiones editoriales aplicadas en PR1

### Cinco investigados procesados, no seis

El procedimiento tuvo en algún momento seis investigados. El 14 de abril de 2025 la magistrada Inmaculada Iglesias citó como investigado al asesor fiscal **Javier Luis Gómez Fidalgo** (fiscalista leonés). El 29 de mayo de 2025, en el mismo auto por el que se cerró la instrucción contra los cinco principales, la jueza acordó el sobreseimiento provisional de la causa respecto a Gómez Fidalgo por considerar insuficientes los indicios de su participación. Se modela como `RolEnCaso(rol=investigado)` con `fecha_fin` + `hito_fin_id` + `RolEnCaso(rol=desimputado)` consecutivo, igual que el patrón Goyache del caso Begoña Gómez (NOTES §"Decisiones editoriales aplicadas").

### Maxwell Cremona S.L. NO se modela con rol procesal en PR1

La sociedad Maxwell Cremona Ingeniería y Procesos S.L., de la que González Amador es administrador único, figura en las actuaciones como persona jurídica investigada (Ley Orgánica 5/2010 de responsabilidad penal de personas jurídicas). El schema actual de `rol-en-caso` no admite `investigado` / `procesado` para `sujeto_tipo=organizacion` (V-11), igual que rechazaba `perjudicado` antes del cambio aplicado en el PR2 de Begoña Gómez. Decisión editorial: **mencionar Maxwell Cremona en la descripción del caso, en la ficha de la propia organización y en los enunciados de hecho, pero NO crear `RolEnCaso(sujeto_tipo=organizacion, rol=procesado)`** hasta que el maintainer apruebe la revisión del schema. La cuestión queda anotada en `ROADMAP.md → Decisiones pendientes del maintainer` para discusión separada.

### Isabel Díaz Ayuso NO se modela como Persona en PR1

Misma lógica que Pedro Sánchez en el caso Begoña Gómez. Ayuso no tiene rol procesal formal en este procedimiento: aparece mencionada como pareja del investigado y residente en el ático compartido. Se incorporará al inventario únicamente si un auto futuro le atribuye un rol formal.

### Carlos Neira (abogado del investigado) tampoco entra como Persona

Carlos Neira, abogado de González Amador, tiene rol procesal formal de `abogado_defensa`, pero su nombre es indisociable del **caso del Fiscal General del Estado** (sentencia del Tribunal Supremo por revelación de secretos del email del 2 de febrero de 2024). Decisión editorial: no se ficha como Persona en PR1 del caso González Amador. Cuando se arranque el caso del Fiscal General como caso autónomo del inventario, se creará la `Persona(carlos-neira)` con el rol `abogado_defensa` en ambos casos. El `RelacionEntreCasos` se modelará entonces.

### Cuantía 350.951 €, no 350.961 €

Hay discrepancia entre fuentes sobre la cuantía exacta del fraude:
- 350.951 € — El Plural, Infobae (07-nov-2025), El Español (en algunas ocasiones).
- 350.961 € — Iustel, otras fuentes derivadas.

Se adopta **350.951 €** por aparecer con mayor consistencia en cobertura coetánea al auto del 29-may-2025 y al auto de la AP Madrid del 7-nov-2025. Se anota como pendiente de confirmar con el auto íntegro cuando esté disponible en CENDOJ.

## Discrepancia de nombres entre fuentes (resuelta)

Dos fuentes daban nombres distintos para uno de los hermanos Carrillo Saborido:
- "José Antonio Carrillo Saborido" — primera mención en Confilegal y derivadas.
- "José Miguel Carrillo Saborido" — El Español (29-may-2025) en cobertura del auto, El Plural (24-ene-2026) en reportaje sobre las dos ramas (sevillana y mexicana).

Se adopta **José Miguel Carrillo Saborido** por aparecer en la cobertura del propio auto y por confirmación de El Plural en reportaje específico. Pendiente de cierre cuando aparezca el auto íntegro en CENDOJ o en una nota oficial del CGPJ.

## Estado editorial — PR1 acumulado

- **caso.yaml** raíz creado.
- **9 personas**: Alberto González Amador, Inmaculada Iglesias (jueza saliente), Antonio Viejo (juez entrante), Maximiliano Niederer, David Herrera Lobato, Agustín Carrillo Saborido, José Miguel Carrillo Saborido, Javier Gómez Fidalgo (investigado→desimputado), Julián Salto (fiscal).
- **10 organizaciones nuevas**: Juzgado de Instrucción nº 19 de Madrid; AEAT; Abogacía del Estado; Maxwell Cremona S.L. (sin rol procesal formal — ver §"Decisiones editoriales"); PSOE (partido_politico, acusación popular); Más Madrid (partido_politico, acusación popular); medios: El Plural, Iustel, Heraldo de León, Estrella Digital. Reutilizadas del catálogo: Audiencia Provincial de Madrid, Fiscalía Provincial de Madrid, El Español, Confilegal, El Independiente, eldiario.es, Infobae, The Objective.
- **2 delitos nuevos del catálogo**: fraude-fiscal (delito contra la Hacienda Pública), falsedad-en-documento-mercantil.
- **~12 documentos**: cobertura cruzada N4 (auto del 29-may-2025, auto del 22-sept-2025, auto AP Madrid 7-nov-2025, archivo provisional de Gómez Fidalgo, imputación previa de Gómez Fidalgo, cambio de juez Iglesias→Viejo, denuncia AEAT-Fiscalía).
- **7 hitos**: denuncia AEAT-Fiscalía (2024-01-22); imputación Gómez Fidalgo (2025-04-14); auto procesamiento + archivo Gómez Fidalgo (2025-05-29); apertura juicio oral (2025-09-22); cambio juez (2025-10-XX); AP Madrid ratifica procesamiento (2025-11-07).
- **5 hechos**: sistema de facturas falsas (atribuido); cuantía 350.951 € a Hacienda (atribuido); archivo provisional Gómez Fidalgo (exculpatorio); penas pedidas por Fiscalía/Abogacía y por PSOE/Más Madrid (atribuido); pertenencia a grupo criminal según acusación popular (investigado).
- **11 roles**: 5 procesados (González Amador, Niederer, Herrera Lobato, los dos Carrillo Saborido); investigado→desimputado para Gómez Fidalgo; juez_instructor Iglesias (cerrado oct-2025); juez_instructor Viejo (oct-2025 vigente); fiscal Julián Salto; AEAT denunciante; Abogacía del Estado acusación particular; PSOE acusación popular; Más Madrid acusación popular.

## Pendiente para PR2 y siguientes

- **Archive.org / archive.ph mirrors** para los ~11 documentos N4 incluidos en PR1. WebFetch no puede llamar a archive.org desde el entorno del agente; el maintainer debe lanzar el archivado y completar `url_archivo`.
- **Localización de fuentes oficiales** (sustituir N4 por N1 cuando aparezcan):
  - Auto del Juzgado de Instrucción nº 19 de Madrid del 29 de mayo de 2025 (procesamiento) en CENDOJ.
  - Auto del Juzgado de Instrucción nº 19 de Madrid del 22 de septiembre de 2025 (apertura juicio oral) en CENDOJ.
  - Auto de la Audiencia Provincial de Madrid (Sección 3ª) del 7 de noviembre de 2025 en CENDOJ.
  - Auto del Juzgado de Instrucción nº 19 de Madrid del 14 de abril de 2025 (imputación de Gómez Fidalgo).
  - Auto del Juzgado de Instrucción nº 19 de Madrid del 29 de mayo de 2025 (archivo provisional de Gómez Fidalgo).
  - Denuncia de la AEAT a la Fiscalía Provincial de Madrid del 22 de enero de 2024 (puede tener acceso restringido por ser parte de las actuaciones).
  - Acuerdo del CGPJ por el que Antonio Viejo asume el JI 19 (probablemente publicado en el BOE en septiembre u octubre de 2025).
  - Escritos de acusación de la Fiscalía, Abogacía del Estado, PSOE y Más Madrid (julio-agosto de 2025).
- **Pieza separada "Quirón" / rama sevillana**: el 20 de enero de 2026 la Policía Nacional detuvo a David Herrera Lobato en Arahal (Sevilla) por presunta corrupción en gestiones con el grupo Quirón. Esta rama abre potencialmente una pieza separada del procedimiento principal. Pendiente de modelado en PR2 con su propia secuencia de hitos cuando se publique el auto.
- **Informe UCO** encargado el 27 de junio de 2025 por Inmaculada Iglesias para análisis de documentación. A fecha de PR1 (mayo de 2026) sigue sin entregarse (cobertura Público.es). Cuando se entregue, modelar como `Documento(tipo=informe_uco)` + hito.
- **Carlos Neira y caso del Fiscal General del Estado**: cuando se ficha el caso del FGE como caso autónomo del inventario, crear `Persona(carlos-neira)` + `RelacionEntreCasos(gonzalez-amador, fiscal-general-del-estado)` con tipo `derivada_factual` o `causa_conexa`. Ya hay sentencia firme/no firme contra Álvaro García Ortiz por revelación de secretos del email del 2-feb-2024.
- **Cuantía 350.951 € vs 350.961 €**: cerrar discrepancia con el auto íntegro cuando esté disponible (ver §"Cuantía 350.951 €" en decisiones editoriales).
- **Hermanos Carrillo Saborido**: confirmar que el segundo se llama "José Miguel" (criterio actual) y no "José Antonio" (atestado puntual de Confilegal). Cierra con el auto íntegro en CENDOJ.
- **Babia Capital y ático compartido con Ayuso**: la sociedad Babia Capital es propietaria del ático en Chamberí en el que residen Ayuso y González Amador. Administrada por Gómez Fidalgo. Cobertura periférica; no aporta indicios procesales propios al procedimiento principal. Pendiente de revisar si una pieza autónoma o si entra como contexto en la ficha de la propia organización Maxwell Cremona.

## Verbos del doc 04 §3 aplicados

- "Consta en el auto…", "el instructor considera indiciariamente que…", "se atribuye…", "según la Fiscalía…", "la Audiencia Provincial considera que…".
- Final explícito de presunción de inocencia en cada rol activo de procesamiento ("rige el principio de presunción de inocencia mientras no recaiga resolución firme en contrario").

## Fuentes consultadas para PR1

Multi-línea editorial (≥ 2 líneas editoriales por hito). Verificación cruzada.

- El Español — auto del 29-may-2025; cobertura del procedimiento.
- Estrella Digital — auto del 29-may-2025; archivo Gómez Fidalgo.
- Confilegal — apertura juicio oral 22-sept-2025; nombramiento Antonio Viejo.
- elDiario.es — solicitud de prórroga de PSOE y Más Madrid.
- El Plural — rama sevillana, hermanos Carrillo Saborido, contexto.
- Heraldo de León / Diario de León — imputación Gómez Fidalgo (14-abr-2025).
- Iustel — confirmación AP Madrid 7-nov-2025.
- Infobae — cobertura cruzada del procesamiento y de la prórroga PSOE.
- The Objective — declaraciones del entorno del investigado.
- Público.es — informe UCO pendiente.

URLs específicas en cada `Documento` que las cita, conforme al modelo.

## Avisos para el LLM en futuras incorporaciones

- **Nunca redactar a González Amador como culpable.** Verbos prohibidos del doc 04 §3. Hasta sentencia firme, sólo "se investiga", "se atribuye", "consta en el auto que…", "el instructor considera indiciariamente que…".
- **El procedimiento NO está sentenciado.** El auto de apertura de juicio oral del 22-sept-2025 NO es una condena: es una decisión procesal de continuar la causa. La presunción de inocencia rige en toda la redacción.
- **Isabel Díaz Ayuso NO es investigada** ni procesada en esta causa. Mencionarla sólo como contexto (pareja del investigado / presidenta de la Comunidad de Madrid). El propio caso es delicado por la cercanía política: aplicar exactamente los mismos verbos y la misma estructura que en cualquier otro caso del inventario (P-10).
- **Javier Gómez Fidalgo es DESIMPUTADO.** Su rol vigente es `desimputado` desde el 29-may-2025 por sobreseimiento provisional. Cualquier redacción posterior debe respetarlo expresamente.
- **El caso del Fiscal General del Estado es un caso distinto.** Aunque relacionado factualmente (el email del 2-feb-2024 fue origen de aquella causa), no se mezcla aquí. Esta ficha se circunscribe al procedimiento por presunto fraude fiscal y falsedad documental contra González Amador y otros cuatro investigados.
- **Tratamiento sin cuota política.** El caso afecta a una persona cercana al gobierno autonómico de Madrid. La P-10 obliga a aplicar exactamente la misma estructura, badges y tono que a cualquier otro caso del inventario.
