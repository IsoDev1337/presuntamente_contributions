# NOTES — Caso del Fiscal General del Estado

Anotaciones internas. **No se publica.** Vive en el repo para humanos
y agentes LLM que iteren sobre este caso. Convención en `AGENTS.md`
§ *NOTES.md por caso*.

Última actualización: 2026-05-22 (PR1 — esqueleto inicial del caso con
sentencia firme + dos votos particulares + recurso amparo TC en
trámite).

---

## Por qué este caso entra ahora

Decidido el 2026-05-22 por el maintainer: el caso del FGE entra
después del PR3 del caso González Amador porque (a) está
factualmente conectado al caso ya fichado, (b) tiene sentencia firme
del TS (la primera del inventario) y por tanto permite estrenar el
rol `condenado_firme` con un caso de máxima relevancia objetiva, y
(c) la sentencia firme abre la puerta a hechos con tipo `acreditado`
que hasta ahora ningún caso del inventario tenía con respaldo
jurisdiccional plenamente firme. La fichada como caso autónomo era
condición previa para crear la `Persona(carlos-neira)` y el
`RelacionEntreCasos(gonzalez-amador, fiscal-general-del-estado)` que
quedaban pendientes en NOTES del caso González Amador.

## Decisiones editoriales aplicadas en PR1

### Rol procesal de Carlos Neira en cada caso

Carlos Neira es el abogado de Alberto González Amador. En el caso
González Amador su rol es `abogado_defensa` del investigado, conforme
quedó pendiente en NOTES de aquel caso. En el caso FGE, en cambio, su
rol procesal NO es `abogado_defensa` (lo sería respecto del acusado
García Ortiz, que tiene su propia defensa) sino **`abogado_acusacion`**,
porque defiende a la acusación particular, encarnada en su cliente
Alberto González Amador, que es a la vez el perjudicado del delito y
quien ejerció la acción penal. La indicación de la NOTES de González
Amador, que apuntaba "abogado_defensa en ambos casos", se revisó en
este PR1 con cobertura confirmando que Neira firma escritos como
acusación particular (cf. El Español 30-ene-2026 "La pareja de Ayuso
pide al TS que confirme la condena al exfiscal general").

### Rol procesal de Alberto González Amador en el caso FGE

González Amador es a la vez **perjudicado** y **acusación particular**
en el caso FGE: perjudicado porque la sentencia firme le reconoce
10.000 euros de indemnización por daños morales derivados de la
filtración, y acusación particular porque ejerció la acción penal
mediante querella presentada el 3 de abril de 2024 ante el TSJ
Madrid. En el modelo del proyecto las dos figuras pueden recaer en la
misma persona; el rol procesal que define su posición activa en el
procedimiento es `acusacion_particular`, así que se modela ese rol y
la condición de perjudicado queda reflejada editorialmente en la nota
del rol y en los hechos de la indemnización. Si en el futuro se
quiere modelar el `perjudicado` de forma autónoma para visualizarlo
en la card de la persona, se podrá añadir como rol consecutivo o
paralelo; en PR1 se opta por la solución sencilla.

### Trayectoria procesal completa de García Ortiz como cadena de cuatro roles consecutivos

El procedimiento es el primero del inventario con sentencia firme
condenatoria, así que García Ortiz testa por primera vez la cadena
completa `investigado → procesado → condenado_no_firme → condenado_firme`
con `fecha_fin` + `hito_fin_id` en los tres primeros tramos y
`hito_origen_id` en los condenado_*. Se aplica el mismo patrón
reusable de la cadena `investigado → desimputado` validado con
Goyache (Begoña Gómez PR1) y Gómez Fidalgo (González Amador PR1).

### Hechos `atribuido` en PR1 a pesar de existir sentencia firme

El guardarraíl 3 de la skill `/investigar-caso` (no asignar
`Hecho.tipo = acreditado` automáticamente) sigue plenamente vigente
aunque exista sentencia firme. En PR1 se modelan todos los hechos
como `atribuido` con cita literal de la Sentencia 1000/2025, dejando
para una revisión humana explícita del maintainer (PR2) la promoción
a `acreditado` de los hechos directamente derivados del fallo
dispositivo. Justificación adicional: el recurso de amparo ante el
Tribunal Constitucional, presentado el 10 de abril de 2026 por la
Fiscalía y el 13 de abril de 2026 por la defensa del condenado,
podría hipotéticamente revisar la firmeza en sede constitucional;
optar conservadoramente por `atribuido` hasta que el amparo decaiga
o se resuelva sin efectos retroactivos es coherente con el principio
del modelo (preferir el grado epistémico inferior cuando hay
incertidumbre, aunque sea procesalmente marginal).

### Magistrados modelados en PR1

De los siete magistrados que enjuiciaron el caso se modelan en PR1
dos personas concretas: **Andrés Martínez Arrieta** como
`juez_ponente` (presidente de la Sala Segunda y ponente final tras
el cambio de ponencia motivado por los votos particulares) y
**Ángel Luis Hurtado** como `juez_instructor` (magistrado instructor
designado por la Sala). Los cinco magistrados restantes del tribunal
de enjuiciamiento (Manuel Marchena, Carmen Lamela, Juan Ramón
Berdugo, Antonio del Moral en la mayoría; Ana María Ferrer García y
Susana Polo García en los votos particulares) se citan en la prosa
de la ficha y en la `descripcion` del hito de sentencia pero no se
ficha cada uno como Persona en PR1; se reservan para PR2 si entran
en otros casos del inventario o si el maintainer lo pide. El
magistrado Francisco José Goyena Salgado, instructor en la fase
previa ante el TSJ Madrid (mayo-julio de 2024), tampoco se ficha en
PR1 porque la fase ante el TSJM se modela como contexto en la
`descripcion` del primer hito y no como hito propio.

### Sentencia 1000/2025: nivel de fuente

El texto íntegro de la Sentencia 1000/2025 no se ha localizado en
CENDOJ (poderjudicial.es) a fecha de PR1, pese a ser una causa
especial del TS Sala Segunda con tribunal aforado, lo que la haría
candidata habitual a publicación. Sí está disponible en mirrors
periodísticos (PDF de okdiario, transcripción en Público.es,
análisis jurídico en Catalina Garay) y en la base de datos de
Civil-Mercantil. Para PR1 se modelan dos documentos distintos: la
**nota oficial del CGPJ del 9 de diciembre de 2025** anunciando la
notificación de la sentencia (N1 en `poderjudicial.es`) y el
**texto íntegro de la sentencia** como N3 `filtrado_verificado` (PDF
del 9-dic-2025 en mirrors periodísticos con verificación cruzada
entre Público.es y okdiario.com). Cuando aparezca en CENDOJ se
elevará a N1 manteniendo el mismo `id` del documento.

### Numerología procesal

- **Causa principal**: Causa Especial nº 20557/2024.
- **Causas acumuladas** (ambas presentadas por Manos Limpias / Miguel
  Bernad Remón): Causas Especiales 21116/2024 y 21258/2024. La
  acumulación es contextual y se cita en la `descripcion` del hito de
  apertura de causa; no se modelan como hitos `acumulacion_causas`
  propios en PR1 (cabe hacerlo en PR2 si el maintainer lo solicita).
- **Sentencia**: 1000/2025, de 9 de diciembre de 2025.
- **Real Decreto de cese**: 1138/2025 de 9 de diciembre (BOE
  10-dic-2025).
- **Real Decreto de nombramiento de la sucesora**: 1140/2025 de
  9 de diciembre (BOE 10-dic-2025).

## Magistrados, votación y votos particulares

Tribunal de enjuiciamiento (Sala Segunda del TS, siete magistrados,
constituido el 25-sept-2025):

- Andrés Martínez Arrieta (presidente; ponente final).
- Manuel Marchena Gómez.
- Juan Ramón Berdugo Gómez de la Torre.
- Antonio del Moral García.
- Carmen Lamela Díaz.
- Ana María Ferrer García (voto particular disidente).
- Susana Polo García (voto particular disidente).

Mayoría condenatoria: 5 votos a 2.

## Verbos del doc 04 §3 aplicados

- "La Sala Segunda del Tribunal Supremo declara probado…", "consta
  en la sentencia firme que…", "el fallo dispositivo impone…", "los
  votos particulares disidentes sostienen que…", "la defensa alega…",
  "el recurso de amparo pendiente plantea…".
- En el caso de hechos posteriores a la sentencia firme pero todavía
  cubiertos por la presunción de inocencia formal (el amparo
  constitucional puede dejar la sentencia sin efecto), se mantiene el
  registro epistémico `atribuido` en lugar de `acreditado`.

## Fuentes consultadas para PR1

Multi-línea editorial (≥ 2 líneas editoriales por hito), con
cobertura cruzada entre derecha, centro e izquierda mediática.

- Nota CGPJ 16-oct-2024 (apertura causa) — `poderjudicial.es` N1.
- Nota CGPJ 20-nov-2025 (condena, lectura del fallo) — `poderjudicial.es` N1.
- Nota CGPJ 9-dic-2025 (notificación de la sentencia) — `poderjudicial.es` N1.
- Sentencia 1000/2025 íntegra — N3 (filtrado_verificado, dos mirrors).
- BOE-A-2025-XXXXX — RD 1138/2025 de cese; BOE-A-2025-XXXXY — RD
  1140/2025 de nombramiento. (URLs canónicas confirmadas con
  búsqueda en `boe.es` en PR1; ver el documento `boe-cese-garcia-ortiz`).
- El Español — cobertura del juicio (3-13 nov 2025) y del fallo del
  20-nov-2025 con resultado "5 votos a 2".
- Infobae — archivo Pilar Rodríguez 29-jul-2025; incidente nulidad
  26-feb-2026.
- TheObjective — recurso amparo TC 13-abr-2026.
- El Independiente — amparo de la Fiscalía 10-abr-2026.
- Confilegal — ratificación condena 26-feb-2026.
- Moncloa.com — sentencia y firmeza.
- Demócrata — publicación sentencia íntegra.
- Wikipedia — biografía pública verificada de García Ortiz (sólo para
  datos biográficos no controvertidos: fecha de nacimiento, formación,
  nombramientos, cese).

URLs específicas en cada `Documento` que las cita.

## Pendiente para PR2 y siguientes

- **Archive.org / archive.ph mirrors** para los documentos N4.
  Maintainer está automatizándolo vía hook pre-commit (commit
  `64d92a8`).
- **Localización del texto íntegro de la Sentencia 1000/2025 en
  CENDOJ**. Si aparece, sustituir el documento N3 por N1 manteniendo
  el mismo `id` del documento.
- **Revisión humana explícita del maintainer** para promover a
  `acreditado` los hechos directamente derivados del fallo dispositivo
  de la sentencia firme (V-04 + guardarraíl 3 de la skill). Hechos
  candidatos: filtración del correo del 2-feb-2024 acreditada por
  sentencia firme, penas impuestas, indemnización, identidad del
  perjudicado.
- **Apertura de hitos pendientes**:
  - Denuncia ICAM al TSJM (20-mar-2024) — `denuncia_presentada`.
  - Querella González Amador al TSJM (3-abr-2024) —
    `querella_presentada`.
  - TSJM admite causa, designa instructor Goyena (7-may-2024) —
    `querella_admitida`.
  - TSJM eleva exposición razonada al TS (15-jul-2024) —
    `cambio_organo` (de TSJ Madrid a Sala Penal TS).
  - Registros UCO en despacho de García Ortiz y en Fiscalía
    Provincial de Madrid (29-oct-2024) — al no encajar en ningún
    tipo del enum del schema, modelarlos como contexto del hito
    `imputacion` o crear tipo nuevo en revisión schema.
  - Designación del tribunal de siete magistrados (25-sept-2025) —
    contexto del hito de `apertura_juicio_oral`.
- **Recurso de amparo ante el Tribunal Constitucional**. A fecha de
  PR1 (mayo de 2026) hay dos recursos presentados (Fiscalía el
  10-abr-2026; García Ortiz el 13-abr-2026), pendientes de admisión
  a trámite. El tipo de Hito `recurso_amparo` no existe en el enum
  del schema; cuando entre el primer auto del TC sobre admisión,
  decidir si se amplía el enum (paralelo a la adición de
  `escrito_conclusiones_provisionales` en Begoña Gómez PR3) o se
  modela como `recurso_casacion` (operativamente cercano, aunque no
  sea casación stricto sensu) con explicación editorial.
- **Cinco magistrados del tribunal de enjuiciamiento sin Persona
  propia** (Marchena, Lamela, Berdugo, Del Moral; Ferrer y Polo si
  el maintainer quiere modelar la disidencia con cards propias).
- **Personas del entorno del condenado citadas en la sentencia** pero
  sin rol procesal formal: Almudena Lastra (fiscal superior de
  Madrid), directora de comunicación de la Fiscalía. No se modelan en
  PR1 conforme al principio editorial de incluir sólo a personas con
  rol procesal formal; quedan como contexto en la prosa.
- **Cadena SER** (medio al que se filtró el correo el 13-mar-2024) no
  se ficha como `Organizacion` en PR1 porque no es parte procesal y
  sólo se cita en prosa como contexto del hecho de filtración. Si en
  PR2 se modelan los hitos previos al TS (en particular el
  20-mar-2024 ICAM denuncia, o el 13-mar-2024 filtración misma como
  hito propio), añadir Cadena SER y revisar.

## Avisos para el LLM en futuras incorporaciones

- **García Ortiz está condenado por sentencia firme.** Pero la
  presunción de inocencia formal sólo decae con la firmeza definitiva;
  el recurso de amparo ante el TC, aunque jurisdiccional residual,
  no es vía ordinaria y por tanto la firmeza ya consta. Aun así, el
  registro epistémico de los hechos en PR1 sigue siendo `atribuido`
  conservadoramente; cuando el maintainer apruebe, se promoverán a
  `acreditado`. Lenguaje editorial: "condenado en sentencia firme",
  "se declara probado por sentencia firme", "consta en el fallo".
- **Pilar Rodríguez Fernández es DESIMPUTADA.** Por auto del
  29-jul-2025 la Sala Penal archivó el procedimiento respecto de
  ella. Cualquier redacción que la mencione como investigada sin
  matiz temporal es incorrecta.
- **Alberto González Amador NO está acusado en este procedimiento.**
  Es el perjudicado y ejerció la acusación particular. La
  presunción de inocencia que rige en el caso González Amador (caso
  conexo, también vivo) no se ve afectada por la condena firme
  contra García Ortiz: son procedimientos distintos sobre delitos
  distintos. Cuidado al redactar para no mezclar.
- **El caso González Amador NO se mezcla aquí.** La filtración del
  correo del 2-feb-2024 es el hecho que da origen al delito
  cometido por García Ortiz, pero la causa contra González Amador
  por presunto fraude fiscal sigue su curso independiente. El
  `RelacionEntreCasos` modelado en este PR1 documenta la conexión
  factual; el contenido editorial respeta la separación.
- **Tratamiento sin cuota política.** El caso involucra al máximo
  responsable del Ministerio Fiscal, nombrado a propuesta del
  Gobierno. La P-10 obliga a aplicar exactamente la misma estructura,
  badges y tono que a cualquier otro caso del inventario.
- **La controversia política y mediática alrededor del caso es
  intensa.** El propio Gobierno ha manifestado intención de
  "anular" la sentencia (cobertura de El Debate 11-abr-2026), y el
  recurso de amparo plantea cuestiones de fondo sobre la
  presunción de inocencia, el deber de reserva del Fiscal General y
  los límites del control judicial sobre las decisiones del
  Ministerio Fiscal. Mantener registro estrictamente procesal en
  los hechos: lo que dice la sentencia firme, lo que sostienen los
  votos particulares, lo que alega el recurso de amparo. No
  editorializar.
