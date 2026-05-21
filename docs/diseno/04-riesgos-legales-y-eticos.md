# Riesgos legales y éticos

**Estado:** borrador 1.0 · 2026-05-21
**Disclaimer del propio documento:** este análisis es informativo y editorial, NO es asesoramiento jurídico. Para decisiones operativas sensibles (cómo responder a una querella, cómo gestionar un requerimiento) consultar con abogado especializado en derecho al honor / libertad de información en España.
**Asume:** docs 01-03 cerrados.

---

## 0. Resumen

Publicar un inventario de casos de corrupción con personas imputadas tiene riesgo real. Vectores principales:

1. **Derecho al honor, intimidad e imagen** (LO 1/1982): la afirmación que insinúa culpabilidad sin acreditación, o que pone información personal sin función pública, puede dar lugar a demanda civil.
2. **Presunción de inocencia** (CE art. 24.2): aunque es derecho frente al Estado, su vulneración mediática es factor que los tribunales civiles valoran en demanda por honor.
3. **LOPD/RGPD**: tratar datos personales identificables sin base jurídica adecuada o sin proporcionalidad.
4. **Injurias y calumnias** (CP arts. 205-216): vía penal, menos frecuente pero existe.
5. **Derecho de rectificación** (LO 2/1984): obligación de atender rectificaciones de hechos publicados.
6. **Responsabilidad LSSI** sobre contenidos publicados.

El doc 01 ya implementa muchas mitigaciones estructurales (separación acreditado/investigado, niveles de fuente, `RolEnCaso` temporales con desimputaciones explícitas). Este doc cierra lo que faltaba: identificación del responsable, mecanismo de rectificación, disclaimer, tratamiento de personas privadas, política ante querellas.

---

## 1. Marco legal aplicable

Resumen no exhaustivo, en castellano informativo:

- **CE art. 20** — libertad de información veraz; **art. 18** — honor, intimidad, propia imagen; **art. 24** — tutela judicial, presunción de inocencia.
- **LO 1/1982** — protección civil del derecho al honor, intimidad e imagen. La afectación se valora por: carácter público o privado del afectado, interés público de la información, veracidad y diligencia del informador.
- **LO 2/1984** — derecho de rectificación. Quien se considere aludido por información inexacta tiene derecho a publicación de rectificación.
- **LO 3/2018 (LOPD-GDD)** y **RGPD UE 2016/679** — tratamiento de datos personales. Base jurídica más relevante para presuntamente: **interés legítimo** (art. 6.1.f RGPD). El tratamiento debe ser proporcional, mínimo y trazable.
- **LSSI 34/2002** — servicios de la sociedad de la información: deberes del prestador, retirada de contenido manifiestamente ilícito si hay conocimiento efectivo.
- **CP arts. 205-216** — calumnias e injurias.
- **Doctrina del TC y TS** sobre conflicto honor vs información — abundante; pivote es la **veracidad como diligencia** (no verdad absoluta) y el **interés público** del personaje y del hecho.

Clave: **un investigado en procedimiento penal de relevancia pública es objeto legítimo de información pública**, siempre que se respete el lenguaje (no se afirme culpabilidad sin sentencia firme) y se atienda rectificación.

---

## 2. Análisis de riesgos por tipo de afirmación

Mapeo `Hecho.tipo` → riesgo:

| Tipo de Hecho | Riesgo legal | Mitigación |
|---------------|--------------|------------|
| acreditado | bajo (sentencia firme respalda) | citación clara; si TC revoca, marcamos como superado |
| investigado | medio (hay procedimiento real pero no condena) | etiqueta `tipo` visible; lenguaje "se investiga", "se atribuye"; nunca insinuar culpabilidad |
| atribuido | medio-alto (un actor sostiene algo no acreditado) | identificar al actor en el enunciado; nivel de fuente visible |
| exculpatorio | bajo-positivo (libera a alguien) | publicar prominentemente, no esconder |
| desmentido | medio (puede ofender al actor desmentido) | documentar el desmentido con rigor |
| no_concluyente | bajo | etiqueta clara |

---

## 3. Presunción de inocencia: reglas de redacción

Parcialmente cubiertas por P-09 del doc 02. Consolidadas aquí:

- Nunca verbos que afirmen culpabilidad sobre quien no tiene sentencia firme condenatoria: prohibidos "robó", "estafó", "se apropió" para hechos investigados; sí permitidos sólo en cita literal de fuente identificada entre comillas.
- Verbos preferidos para hechos investigados: "se le atribuye", "se investiga", "consta en el informe X que", "la acusación sostiene", "el instructor considera indiciariamente que".
- Sentencias no firmes: "ha sido condenado en primera instancia, pendiente de recurso" — nunca "es culpable".
- Personas absueltas o desimputadas: nunca "fue acusado de X" como descripción presente; sí "fue investigado por X y posteriormente desimputado por el órgano Y mediante auto Z".
- Causas archivadas: "el procedimiento fue archivado" + tipo (provisional vs libre). Nunca "no se demostró pero podría haber sido".

CI puede ayudar con lista negra simple de verbos para hechos no acreditados (warning, no bloqueante; decide review humano).

---

## 4. Derecho al honor: análisis por sujeto

**Figuras públicas con función pública vigente o reciente:**
Soportan más exposición. Información veraz, contrastada, de interés público y sobre ejercicio de función es protegida.
*Riesgo: bajo* si seguimos las reglas del modelo.

**Figuras públicas sin función actual (ex-cargos, jubilados):**
Algo más de margen. Lo investigado en su ejercicio sigue siendo público; lo posterior a su salida, más sensible.
*Riesgo: bajo-medio.*

**Particulares con función económica relevante (empresarios investigados):**
Si están imputados en procedimiento público, son objeto legítimo de información. Su vida no profesional NO.
*Riesgo: medio.*

**Particulares sin función pública (familiares, asesores externos, testigos):**
Riesgo más alto. Sólo aparecen si tienen rol formal en el procedimiento. Datos mínimos. Sin foto. V-17 obligatoria si su rol procesal se cierra.
*Riesgo: alto si no se cumple V-17.*

**Jueces, fiscales y abogados (rol funcional):**
Aparecen como rol funcional, sin que eso implique nada sobre su persona. Citables por su actuación profesional pública.
*Riesgo: bajo*, salvo afirmaciones sobre su independencia o competencia sin base.

---

## 5. LOPD/RGPD

Bases jurídicas aplicables al tratamiento que hace presuntamente:

- **Interés legítimo (art. 6.1.f RGPD)**: el interés del público en conocer procedimientos judiciales de relevancia social pesa frente al interés del individuo en no aparecer mencionado, **cuando los datos provienen de fuentes públicas y se tratan con proporcionalidad**.
- **Datos especiales (art. 9 RGPD)**: NO se tratan. No publicamos salud, ideología, orientación sexual, origen racial. La ideología política aparece sólo si es un cargo declarado público (afiliación partidaria pública) vinculada a la función.

Principios:
- **Minimización**: sólo los datos estrictamente necesarios para identificar a la persona en su rol procesal.
- **Exactitud**: actualización conforme cambia el procedimiento (Hitos, `RolEnCaso`).
- **Limitación del plazo**: V-17. Cuando una persona privada deja de tener rol procesal vivo, revisión obligatoria.
- **Trazabilidad**: el git log es la trazabilidad.
- **Derechos del afectado**: el mecanismo de rectificación cubre rectificación y oposición; si llega una solicitud de supresión (art. 17 RGPD), se evalúa caso a caso (en cargos públicos prevalece interés público; en particulares con causa archivada normalmente se acepta).

---

## 6. Mecanismo de rectificación

Diseño:

- **Vía pública**: formulario en `presuntamente.org/rectificar` (o template de issue específico en GitHub) con:
  - Ficha afectada (URL).
  - Afirmación concreta cuestionada (o sección).
  - Motivo de la rectificación.
  - Documento o fuente que sostiene la rectificación (URL, PDF).
  - Identificación opcional del solicitante (con email de contacto).
- **Vía correo**: `rectificacion@presuntamente.org` como canal alternativo.
- **Vía burofax / postal**: cuando aplique formalmente la LO 2/1984.

Plazos comprometidos públicamente:
- **Acuse de recibo**: 48 horas hábiles.
- **Resolución provisional**: 7 días hábiles.
- **Publicación de rectificación si procede**: dentro del plazo legal (3 días desde recepción según LO 2/1984; comprometemos 7 días para revisión exhaustiva).

Tipos de respuesta:
- **Rectificación íntegra**: el hecho era inexacto, se sustituye y se anota la rectificación visiblemente.
- **Rectificación parcial**: matización del enunciado.
- **Mantención motivada**: la información se sostiene; respuesta motivada al solicitante citando documentos.
- **Retirada provisional**: mientras se aclara, retirar el hecho/sección.
- **Retirada definitiva**: el hecho era injustificable, se elimina con anotación de corrección en el log.

Las rectificaciones se anotan visiblemente en la ficha ("Esta sección fue rectificada el X tras solicitud Y; ver historial").

---

## 7. Identificación del responsable: anónimo vs identificado

Análisis claro:

**Opción A — Responsable identificado** (tú, con nombre y apellidos, con identificación a efectos LSSI):
- Cumple LSSI art. 10 (deber de identificación del prestador).
- Es la postura defendible si llega querella o burofax: hay responsable, hay canal.
- Facilita confianza del lector y de medios que vayan a citar el sitio.
- *Riesgo personal:* exposición a presiones legales y, en menor medida, a hostigamiento. En España es manejable si la línea editorial es rigurosa.

**Opción B — Responsable anónimo o seudónimo:**
- **No cumple LSSI.** Es infracción técnica usable en tu contra en eventual disputa civil.
- Erosiona la confianza del proyecto. ¿Quién se hace responsable de la información?
- Cualquier querella se dirige al hosting o al registrador del dominio, que tendrá tus datos por whois — el anonimato es ficticio.
- No protege legalmente; sí frente a hostigamiento difuso, pero a precio alto en credibilidad.

**Opción C — Persona jurídica (asociación o fundación):**
- Una asociación sin ánimo de lucro como responsable. La asociación es la prestadora del servicio.
- Distribuye responsabilidad (junta directiva, no una persona).
- Requiere constitución formal: estatutos, registro, número de asociados, NIF de asociación, contabilidad.
- Apto para crecer el proyecto a algo más comunitario.

**Recomendación:**

- **MVP y primer año: opción A** (tú, identificado). Es la postura más alineada con el objetivo del sitio (transparencia) y la única que cumple LSSI sin malabares.
- **Cuando el proyecto crezca: migrar a opción C**. Una asociación recibe el testigo. Da paraguas legal a colaboradores y permite recibir donaciones de forma limpia.
- **NUNCA opción B.**

---

## 8. Disclaimer recomendado (borrador, revisar con abogado antes de producción)

Para el pie de cada ficha y para una sección `/aviso-legal`:

> **Aviso legal y editorial**
>
> presuntamente.org es un sitio de información ciudadana que recoge y estructura información pública sobre procedimientos judiciales relevantes en España. No es un medio de comunicación tradicional ni un órgano oficial.
>
> Toda persona mencionada en este sitio como investigada, procesada, acusada o relacionada con un procedimiento penal en curso **se presume inocente** hasta que recaiga sentencia firme condenatoria. La inclusión de su nombre en una ficha responde exclusivamente al hecho de que figura formalmente en un procedimiento de relevancia pública, no a una valoración de culpabilidad.
>
> Las afirmaciones de cada ficha están categorizadas según su estado epistémico (acreditadas, bajo investigación, atribuidas por un actor identificado, exculpatorias, desmentidas) y cada afirmación cita la fuente y nivel de fuente que la sostiene.
>
> Cualquier persona que se considere afectada por una información publicada puede solicitar su rectificación en `presuntamente.org/rectificar` o por correo a `rectificacion@presuntamente.org`. Las solicitudes se atienden en los plazos descritos en nuestra política editorial.
>
> Responsable del sitio a efectos de LSSI: **[Nombre y apellidos del maintainer; identificación completa]**.
>
> El contenido editorial de este sitio se publica bajo licencia **CC BY-SA 4.0** (propuesta). El código que lo genera está disponible públicamente bajo **AGPL-3.0**.

Revisar con abogado antes de publicar.

---

## 9. Acciones técnicas y editoriales mitigadoras (consolidado)

Trazabilidad de mitigaciones del proyecto a sus riesgos legales:

| Riesgo | Mitigación | Doc |
|--------|------------|-----|
| Imputación tratada como condena | Separar `tipo` de Hecho + `RolEnCaso` temporal | 01 §2.4, §2.6 |
| Persona desimputada que sigue como "imputada" | `RolEnCaso` con `fecha_fin`; `Hecho` con `corregido_por` | 01 §2.4, §2.6 |
| Persona privada expuesta innecesariamente | `es_figura_publica` flag + V-17 | 01 §2.2, V-17 |
| Cita ambigua | Documentos con nivel obligatorio | 01 §2.7, V-04 a V-13 |
| Afirmación sin fuente | V-04 a V-13 bloqueantes | 01 §4 |
| Información obsoleta | `ultima_revision_editorial` + revisión periódica | 03 §5 |
| Rectificación no atendida | Mecanismo documentado con plazos | 04 §6 |
| Línea editorial sesgada | Curador único con guía editorial pública + apertura a contribuciones revisadas | conv. brief |
| Lenguaje editorial agresivo | Lista negra de adjetivos + revisión humana | 02 P-09 |
| Identificación del responsable | Maintainer identificado, LSSI completa | 04 §7 |
| Eliminación silenciosa de información | Git log público | 03 §0 |

---

## 10. Cómo responder a una querella o burofax

Procedimiento de emergencia:

1. **No editar ni borrar nada de inmediato.** Capturar el contenido afectado en su estado actual (commit + tag + archive externo).
2. **Acuse de recibo** al solicitante en 24-48 horas.
3. **Buscar abogado de derecho al honor / libertad de información** si no se tiene uno asignado. Una hora de consulta cuanto antes.
4. **Evaluar la afirmación cuestionada** con el material del modelo: ¿qué `tipo` de Hecho es? ¿Qué Documentos lo respaldan? ¿Hay margen para mejorar la redacción sin retirarla?
5. **Tres respuestas posibles**:
   - Rectificación o matización (si está justificada).
   - Sostenimiento motivado con cita exhaustiva (si la información es sólida).
   - Retirada provisional mientras se resuelve.
6. **Documentar todo el intercambio** públicamente si el solicitante consiente; resumido si no.

**Plan de contención del peor caso:** si llega demanda civil con medida cautelar de retirada, cumplir con la cautelar inmediatamente y litigar después. No es ceder; es ganar tiempo y no acumular sanciones.

---

## 11. Ética

Más allá de lo legal, criterios éticos del proyecto:

- **No exponer familiares no implicados.** Aunque la prensa popularice menciones, nosotros no las publicamos.
- **No publicar direcciones, teléfonos, datos personales** que no añadan al entendimiento del caso.
- **No publicar imágenes humillantes**, ni siquiera de figuras públicas, salvo que sean parte indispensable del relato (raro).
- **Respetar el luto.** Si un investigado fallece sin sentencia firme, la ficha se mantiene pero se actualiza con Hito de fallecimiento y un cambio de tono editorial (presente de indicativo → pasado descriptivo). Las imputaciones no se "borran" por fallecimiento, pero se contextualiza que el procedimiento se extingue.
- **Reconocer errores propios.** Si el sitio publicó algo mal, anotarlo visiblemente, no enterrarlo.
- **No celebrar.** El sitio no celebra ni una imputación ni una absolución. Las informa.

---

## 12. Cuestiones abiertas

1. **Asesoría legal recurrente o sólo a demanda.** Razonable contratar 1-2h al año de revisión preventiva y dejar el resto a demanda.
2. **Seguro de responsabilidad civil** para medios pequeños existe. Coste anual razonable; vale la pena explorar.
3. **Política de donaciones.** Si llegan, ¿se aceptan en MVP? ¿Anónimas? Riesgo de instrumentalización. Propuesta: NO aceptar en MVP; abrir vía asociación cuando exista (opción C).
4. **Política de inclusión de imágenes.** Sólo CC o dominio público; nunca scrapping de medios. Definir lista de bancos aceptados (Wikimedia Commons, Pexels, Unsplash con verificación de licencia).
5. **Relación con periodistas.** ¿Se acepta cita a ficha? Sí, con la licencia CC BY-SA. ¿Se les responde si piden información extra? Propuesta: dirigirles al repo público, no responder consultas privadas en MVP.

---

## 13. Siguiente paso

Doc 05 — Arquitectura técnica.
