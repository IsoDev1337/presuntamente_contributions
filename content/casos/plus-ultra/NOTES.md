# NOTES — Caso Plus Ultra

Anotaciones internas. **No se publica.** Vive en el repo para humanos y agentes LLM que iteren sobre este caso. Convención en `AGENTS.md` § *NOTES.md por caso*.

Última actualización: 2026-05-21.

---

## Estado editorial

- **PR1 (esta entrega):** esqueleto deliberadamente conservador. Schemas cerrados, caso plano, una persona (juez instructor), 7 organizaciones, catálogo de delitos aplicables, 2 documentos verificables, 1 hito (querella Manos Limpias), 1 hecho atribuido (préstamo SEPI), 2 roles (juez instructor y acusación popular). El caso queda **publicable cuando se den los siguientes pasos**.
- **PR2 pendiente:** decisión editorial del maintainer sobre Zapatero (ver §Discrepancia con el brief), incorporación del auto del 19 may 2026 y los hitos asociados, ejecutivos de Plus Ultra como personas con `RolEnCaso=investigado` desde 2025-12-11, hechos investigados del informe UDEF.

## Discrepancia con el brief recibido

El brief de la sesión de Claude Code instruía expresamente:

> "Plus Ultra" NUNCA se etiqueta como "caso Zapatero". Zapatero NO está
> imputado formalmente en esta causa. Su mención puede vivir en
> nombres_alternativos del Caso o en NOTES.md, nunca como
> investigado_formal.

Las fuentes consultadas el 2026-05-21 (≥ 4 medios, multi-línea editorial)
confirman que el juez José Luis Calama del JCI nº 4 de la Audiencia
Nacional dictó el **2026-05-19** un auto que:

1. Levanta el secreto del sumario.
2. Cita a José Luis Rodríguez Zapatero como **investigado** para el
   2026-06-02 por presuntos delitos de tráfico de influencias,
   organización criminal y falsedad documental.

Esto sí encaja con la definición de "investigado_formal" del modelo
(`RolEnCaso.rol = investigado` con `hito_origen_id` apuntando al auto).
**El brief está desactualizado o el maintainer desea retrasar la
incorporación por cautela editorial.** Se respeta la instrucción del
brief: en PR1 no se crea la Persona Zapatero ni su RolEnCaso ni el Hito
de 2026-05-19.

**Decisión pendiente del maintainer** (decisiones pendientes en
`ROADMAP.md`):

- ¿Se incorpora a Zapatero como `Persona` y `RolEnCaso=investigado` en
  PR2, como sostiene la documentación judicial pública?
- En caso afirmativo, redacción neutra del Hito 2026-05-19 conforme al
  doc 04 §3 (verbos "se investiga", "se atribuye", nunca "es culpable").

## Correcciones a datos del brief

- **Fecha del préstamo SEPI.** El brief decía "2020-06-22". La fecha
  correcta del acuerdo del Consejo de Ministros que autoriza el préstamo
  es **2021-03-09** (confirmado por SEPI y por la mayoría de cobertura
  multi-medio). 22 de junio de 2020 NO se identifica con ningún hito
  documentable del caso; posiblemente confusión con la entrada en vigor
  del Fondo de Apoyo a la Solvencia (Real Decreto-ley 25/2020, 3 jul
  2020). El campo `fecha_apertura` del Caso refleja el inicio de las
  diligencias previas a petición de la Fiscalía Anticorrupción tras la
  cooperación internacional Francia/Suiza en 2024.
- **"Imputación reciente: 19-may-2026"** — confirmado por fuente
  oficial (nota CGPJ en `poderjudicial.es`), pero **no se incorpora** a
  PR1 por la discrepancia anterior.
- **Acusación popular Vox** — pendiente de verificar si Vox tiene rol
  formal de acusación popular en esta causa, distinto de Manos Limpias.
  En cobertura multi-medio del 19-20 may 2026 se menciona la querella de
  Manos Limpias como principal palanca popular; Vox aparece más como
  comentario político. No se crea `RolEnCaso=acusacion_popular` para Vox
  hasta confirmar con auto judicial.

## Origen procesal verificado

- 2024 (mes exacto no disponible públicamente): la **Fiscalía
  Anticorrupción** recibe peticiones de cooperación internacional desde
  Francia y Suiza relacionadas con presunto blanqueo de fondos
  venezolanos. La Fiscalía pide al **Juzgado de Instrucción nº 15 de
  Madrid** la apertura de diligencias previas sobre el rescate Plus
  Ultra. Sin documento canónico público de la apertura.
- **2025-12-11**: operación UDEF, registros en sede de Plus Ultra y
  detenciones de varios ejecutivos y un abogado. Sin nota CGPJ accesible
  con URL canónica todavía localizada; verificable por prensa
  multi-medio. Pendiente para PR2 cuando aparezca documento oficial.
- **2025-12-23**: Manos Limpias presenta querella ante el JI nº 15 de
  Madrid añadiendo a Zapatero como querellado. Documento publicado
  íntegro por Público.es → único hito de PR1.
- **2026-03** (mes preciso, día exacto pendiente): el JCI nº 4 de la
  Audiencia Nacional (juez José Luis Calama) asume competencia. Hito
  `cambio_organo` pendiente para PR2 cuando se localice el auto de
  inhibición/asunción.
- **2026-05-19**: auto del JCI nº 4 que levanta el secreto y amplía
  imputaciones. Pendiente para PR2 (ver §Discrepancia).

## Decisiones de modelado tomadas

- **`Caso.organo_judicial_id` = `juzgado-central-instruccion-4`**
  (estado actual). El paso previo por el JI nº 15 Madrid se modela como
  `Hito(tipo=cambio_organo)` cuando entre en PR2.
- **`Caso.fase_actual` = `instruccion`** porque sigue en diligencias
  previas; aún no hay procesamiento ni apertura de juicio oral.
- **Documento de la querella de Manos Limpias**: nivel de fuente 3
  (documento de parte filtrado_verificado, publicado íntegro por medio
  identificable). NO Nivel 1: no es producto del órgano judicial.
- **Documento nota SEPI 2021-03-09**: nivel de fuente 3.
  `sepi.es` NO está en la lista blanca `DominiosOficiales` del doc 01
  §3; no se puede marcar como Nivel 1. Pendiente decisión del maintainer
  si se amplía la lista blanca incluyendo `sepi.es` y otros organismos
  públicos dependientes del Ministerio de Hacienda.
- **El Hecho `pu-prestamo-sepi-2021-03-09` se marca `tipo=atribuido`**
  porque V-04 exige documento jurisdiccional firme para `acreditado`.
  Un comunicado SEPI no es jurisdiccional. La redacción cita
  explícitamente a SEPI como actor (conforme a la definición de
  `atribuido` del doc 01 §3).

## Avisos para el LLM en futuras incorporaciones

- **Nunca redactar a Zapatero como culpable** en hechos no acreditados.
  Verbos prohibidos del doc 04 §3. Hasta sentencia firme: sólo "se
  investiga", "se atribuye", "consta en el auto de Calama que…".
- **Distinguir "caso Plus Ultra" (el procedimiento) de "rescate Plus
  Ultra" (la operación administrativa SEPI 2021-03-09).** Son objetos
  distintos: el primero es el procedimiento penal; el segundo, una
  decisión administrativa que el procedimiento investiga.
- **Familiares de Zapatero (sus hijas)** aparecen en cobertura prensa
  por registros UDEF. Doc 04 §11 prohíbe exponer familiares no
  implicados. Si la causa formalmente les atribuye un rol (`RolEnCaso`)
  se evalúa entonces; mientras tanto, fuera de la ficha.
- **Vínculo con Venezuela / chavismo** se modela como organizaciones y
  hechos atribuidos a actores identificados (UDEF, Fiscalía
  Anticorrupción, Manos Limpias), nunca como hechos acreditados sin
  sentencia. Modulo de cautela alto: redacción siempre con cita al actor.

## Fuentes consultadas para PR1

Multi-medio (≥ 2 líneas editoriales). Verificación cruzada.

- CGPJ — nota oficial 19 may 2026 (poderjudicial.es).
- Público.es — texto íntegro querella Manos Limpias.
- Newtral.es — origen procesal (Fiscalía Anticorrupción, cooperación
  Francia/Suiza).
- Infobae.es — perfil empresa, accionistas venezolanos, operación UDEF
  diciembre 2025.
- TheObjective — cobertura auto 19 may 2026.
- El Español — guía protagonistas.
- VozPópuli — perfil juez Calama.
- Hosteltur — situación devolución del préstamo.
- LawAndTrends — perfil juez Calama.
- SEPI — comunicaciones institucionales rescate Plus Ultra (sepi.es).
- Wikipedia (en) — datos descriptivos de la empresa, cruzados con SEPI
  y einforma para CIF.

URLs específicas en cada `Documento` que las cita, conforme al modelo.
