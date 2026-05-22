# NOTES — Caso Begoña Gómez

Anotaciones internas. **No se publica.** Vive en el repo para humanos y agentes LLM que iteren sobre este caso. Convención en `AGENTS.md` § *NOTES.md por caso*.

Última actualización: 2026-05-22 (PR2 — completa acusaciones populares, hito de imputación de Goyache, anulación AP Madrid, recurso Fiscalía y UCM perjudicada).

---

## Por qué este caso entra el segundo

Decidido en el cierre de la sesión 2026-05-22 (ver `ROADMAP.md`): el caso testea trayectoria con **desimputaciones y sobreseimientos parciales**, que Plus Ultra (el caso 0) no tiene. En concreto, este PR1 ya contiene dos cierres de trayectoria que validan el modelo:

1. La Audiencia Provincial de Madrid **desimputa al rector de la UCM Joaquín Goyache** el 16 de mayo de 2025. Se modela como `Hito(tipo=desimputacion)` + `RolEnCaso(rol=investigado, fecha_fin=2025-05-16, hito_fin_id=...)` + `RolEnCaso(rol=desimputado, fecha_inicio=2025-05-16, hito_origen_id=...)` + `Hecho(tipo=exculpatorio)`.
2. El propio auto de cierre de instrucción del 13 de abril de 2026 **archiva el delito de intrusismo profesional** contra Begoña Gómez por falta de indicios sólidos, manteniendo los otros cuatro delitos. Se modela como `Hecho(tipo=exculpatorio)` (no se crea un `Hito(tipo=sobreseimiento_libre)` separado porque el archivo del delito es accesorio al hito principal del auto, y el procedimiento no se archiva: continúa por los otros cuatro delitos).

Ambos cierres dejan en pie la presunción de inocencia y las trayectorias procesales se exhiben con los slots existentes del modelo.

## Estado editorial — PR1 + PR2 acumulado

- **caso.yaml** raíz creado en PR1.
- **5 personas** con rol procesal formal (sin cambios en PR2): Begoña Gómez, Juan Carlos Peinado (juez instructor), Cristina Álvarez (asesora Moncloa), Juan Carlos Barrabés (empresario), Joaquín Goyache (rector UCM, desimputado).
- **14 organizaciones**: 8 del aparato procesal/medios PR1 + 6 nuevas PR2 (Vox como partido_politico ejerciendo acusación popular, Iustitia Europa, Movimiento de Regeneración Política de España, elDiario.es, Newtral, Confilegal). Más Manos Limpias reutilizada del caso Plus Ultra.
- **2 delitos nuevos del catálogo** (PR1): corrupción en los negocios, apropiación indebida. Reutilizados: tráfico de influencias y malversación de caudales públicos.
- **16 documentos**: 8 de PR1 + 8 de PR2 (auto AP Madrid 23-feb-2026 + cobertura Infobae/TheObjective; cobertura imputación Goyache elDiario + perfil Newtral; cobertura UCM perjudicada Confilegal + Moncloa.com cuantificación; escrito Fiscalía recurso 21-abr-2026 marcado nivel 2 — fuente oficial secundaria/instructora).
- **8 hitos**: 5 de PR1 + 3 de PR2 (imputación Goyache 22-jul-2024; anulación AP Madrid jurado popular 23-feb-2026; recurso Fiscalía ante AP Madrid 21-abr-2026).
- **8 hechos**: 6 de PR1 + 2 de PR2 (AP Madrid considera que los autos previos carecen de motivación — exculpatorio; UCM cuantifica en 113.509,32 € el perjuicio — atribuido).
- **15 roles**: 11 de PR1 (con correcciones — ver §"Correcciones en PR2") + 4 nuevos PR2 (Vox acusación popular 29-abr-2024; Iustitia Europa acusación popular 29-abr-2024; MRPE acusación popular mayo 2024; UCM perjudicada 6-oct-2025).

## Correcciones aplicadas en PR2

- **`goyache-investigado.yaml`**: delitos corregidos de `[malversacion-caudales-publicos]` a `[trafico-de-influencias, corrupcion-en-los-negocios]`. La malversación se introdujo en la causa en agosto de 2025 (imputación específica de Cristina Álvarez), pero Goyache fue citado en julio de 2024 antes de esa ampliación. `fecha_inicio` se ajusta a `2024-07-22` (la fecha del auto que documentan elDiario.es y Newtral.es el 22-jul-2024) y `hito_origen_id` ya apunta al hito específico `imputacion-goyache-bg-2024-07-22`.
- **`hazte-oir-acusacion-popular.yaml`**: `fecha_inicio` corregida de `2024-04-24` (mejor aproximación inicial) a `2024-04-29` (cruzada con la fecha confirmada de Vox; las personaciones de Hazte Oír, Vox e Iustitia Europa son coetáneas según la cobertura).

## Pendiente para PR3 y siguientes

- **Archive.org / archive.ph mirrors** para los 14 documentos N4 (6 de PR1 + 7 de PR2; el escrito de la Fiscalía es N2 y no requiere mirror obligatorio aunque conviene). WebFetch no puede llamar a archive.org desde el entorno del agente; el maintainer debe lanzar el archivado y completar `url_archivo`. Mirror obligatorio para fuentes N4 según doc 01 §3.
- **Localización de fuentes oficiales** (sustituir N4 por N1 cuando aparezcan):
  - Nota CGPJ del auto del JI nº 41 de Madrid del 13 de abril de 2026 (auto de procesamiento) en `poderjudicial.es`.
  - Nota institucional del auto de la Audiencia Provincial de Madrid del 23 de febrero de 2026 (anulación jurado popular).
  - Auto del JI nº 41 que cita a Joaquín Goyache como investigado (julio 2024).
  - Auto de la AP Madrid del 16 de mayo de 2025 (desimputación Goyache / Güemes).
  - Auto del JI nº 41 que ofrece personación a la UCM (3 de octubre de 2025).
  - Texto íntegro de los autos en CENDOJ cuando se publiquen.
  - Escrito de la Fiscalía del 21 de abril de 2026 en `fiscal.es` (el doc actual está marcado nivel 2 con texto sin URL canónica).
- **Texto íntegro de la denuncia de Manos Limpias** (08-abr-2024). Si aparece publicada en un medio identificable, podría subirse el `nivel_fuente` a 3 (filtrado_verificado).
- **Auto de incoación del 16-abr-2024** del JI nº 41 de Madrid.
- **Hito específico del auto del JI nº 41 que ofrece personación a la UCM** (03-oct-2025). El rol `ucm-perjudicada-bg-2025-10` apunta provisionalmente al hito de origen del procedimiento; idealmente debería apuntar a un hito propio del auto.
- **Juan José Güemes** (ex consejero de la Comunidad de Madrid, mencionado como desimputado junto con Goyache el 16-may-2025 según Moncloa.com). NO modelado en PR1/PR2 por ausencia de cobertura suficiente del auto específico que lo imputó. Pendiente para PR3 cuando se localice fuente sólida.
- **Recursos posteriores al 21-abr-2026**: la causa está abierta y vivirá nuevos hitos. Posibles próximos: resolución de la AP Madrid sobre el recurso de la Fiscalía; defensas alegando ante AP Madrid (escritos del 18-may-2026 ya en cobertura); listado de testigos pedido por la defensa (más de 30, según El Español del 18-may-2026); apertura del juicio oral si la AP confirma el procesamiento.
- **Número exacto del procedimiento ("DP 1146/2024" según una fuente)**: requiere segunda fuente cruzada o auto/nota oficial.

## Discrepancia de fecha de apertura

Wikipedia indica como fecha de inicio **24-abr-2024** (presumiblemente la fecha pública del conocimiento del auto). Infobae y Maldita.es coinciden en **16-abr-2024** como fecha del auto de incoación de diligencias previas, tras denuncia presentada el **08-abr-2024**. Se adopta:

- `Caso.fecha_apertura = 2024-04-16` (incoación formal del procedimiento por el juez).
- `Hito(denuncia_presentada) = 2024-04-08` (presentación de la denuncia por Manos Limpias).

## Cambio del schema en PR2

Durante el PR2 fue necesario añadir el valor `perjudicado` al enum de roles válidos para organizaciones en `schemas/rol-en-caso.schema.json` (regla V-11). La versión previa del schema admitía sólo `acusacion_popular / acusacion_particular / querellante / denunciante` para `sujeto_tipo=organizacion`, lo que dejaba fuera el caso real de la UCM personada como perjudicada — una persona jurídica que ejerce la acción civil derivada del delito en proceso penal español. El cambio es mínimo (un valor adicional en el enum interno del bloque if/then de V-11) y defendible: el "perjudicado" es legítimamente un rol de parte en el procedimiento penal español. Documentado en el propio schema y en `ROADMAP.md` como aprendizaje de modelado.

## Personas con rol procesal NO modeladas en PR1 ni PR2

Decisiones editoriales aplicadas:

- **Pedro Sánchez** (presidente del Gobierno): compareció como testigo el 22-jul-2024 acogiéndose a su derecho a no declarar. Aunque el rol "testigo" existe en el modelo, no se le crea ficha en PR1 — su rol procesal es accesorio al caso (testigo) y editorialmente entra en la categoría de "familiar de implicada con rol no imputador". Se menciona como contexto en la biografía corta de Begoña Gómez y en la descripción del caso (relación de la investigada como esposa del Presidente del Gobierno). Si futuras resoluciones le atribuyen otro rol procesal, se revisa.
- **Vicerrectores y exvicerrectores de la UCM** que han declarado como testigos (Juan Carlos Doadrio y otros): no se les crea ficha hasta que un auto les atribuya rol distinto de testigo.
- **Víctor de Aldama** (mencionado en la denuncia inicial por su presencia en reuniones de Globalia): no es investigado en este procedimiento; su rol procesal pertenece a otra causa (caso Koldo). Fuera del inventario aquí.

## Verbos del doc 04 §3 aplicados

- "Consta en el auto…", "el instructor considera indiciariamente que…", "se atribuye…", "según la Fiscalía…", "la Audiencia Provincial considera que no concurren indicios racionales de criminalidad…".
- Final explícito de presunción de inocencia en cada rol activo de imputación/procesamiento ("rige el principio de presunción de inocencia mientras no recaiga resolución firme en contrario").

## Fuentes consultadas para PR1

Multi-línea editorial (≥ 2 líneas editoriales por hito). Verificación cruzada.

- Maldita.es — explicación de la denuncia de Manos Limpias.
- Infobae — apertura de diligencias (24-abr-2024) y procesamiento (13-abr-2026).
- El Español — procesamiento (13-abr-2026), testigos del juicio.
- Libertad Digital — procesamiento (13-abr-2026), prueba software UCM.
- TheObjective — recurso de la Fiscalía pidiendo archivo (22-abr-2026).
- Moncloa.com — UCM de imputados a perjudicados (13-oct-2025).
- Newtral.es — perfil de Goyache.
- Noticias de Navarra — coste software UCM (23-ene-2026).
- Wikipedia (es) — Caso Begoña Gómez y Juan Carlos Peinado (sólo para verificar fechas y biografías; nunca como soporte único de hecho).

URLs específicas en cada `Documento` que las cita, conforme al modelo.

## Avisos para el LLM en futuras incorporaciones

- **Nunca redactar a Begoña Gómez como culpable.** Verbos prohibidos del doc 04 §3. Hasta sentencia firme, sólo "se investiga", "se atribuye", "consta en el auto de Peinado que…", "el instructor considera indiciariamente que…".
- **El procedimiento NO está archivado.** El archivo del 13-abr-2026 sólo afecta al delito de intrusismo profesional. Por los otros cuatro delitos sigue adelante hacia Tribunal del Jurado.
- **Pedro Sánchez NO es investigado** ni procesado en esta causa. Mencionarlo sólo como contexto (esposo de la investigada / presidente del Gobierno).
- **Joaquín Goyache es DESIMPUTADO.** Su rol vigente es `desimputado` desde el 16-may-2025 por resolución de la Audiencia Provincial de Madrid. Cualquier redacción posterior debe respetarlo expresamente.
- **Tratamiento sin cuota política.** El caso afecta a una familia cercana al gobierno actual. La P-10 del doc 02 obliga a aplicar exactamente la misma estructura, badges y tono que a cualquier otro caso del inventario.
- **Familiares no implicados** (en particular cualquier referencia a otros miembros de la familia Sánchez-Gómez): fuera del inventario salvo que un auto les atribuya rol procesal formal. Doc 04 §11.
