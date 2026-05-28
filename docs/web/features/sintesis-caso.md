# Síntesis de caso

> Archivos clave: `schemas/caso.schema.json` (`sintesis_caso`) · `src/content.config.ts` · `content/casos/*/caso.yaml` · `src/components/pages/PgCasoDetalle.astro` · `.agents/skills/revisar-caso/SKILL.md`

## Qué hace

Ofrece en la cabecera de la ficha de caso una sintesis accesible y esquematica, siempre visible antes del resumen ejecutivo formal.

## Para qué sirve

Permite que una persona sin tiempo o sin vocabulario juridico entienda rapidamente que se investiga, que ha pasado, como esta el caso y que cifras importan, antes de entrar en la prosa larga.

## Cómo funciona

La version pre-launch deberia ser contenido editorial controlado, no generacion en runtime.

Modelo implementado:

- `descripcion_corta`: prosa formal actual del resumen ejecutivo.
- `sintesis_caso.que_se_investiga`: respuesta corta a que se investiga, en una frase o dos lineas utiles para tarjetas y cabecera.
- `sintesis_caso.hechos_clave`: 2-4 hitos o hechos relevantes.
- `sintesis_caso.estado_actual`: situacion procesal actual en lenguaje directo.
- `sintesis_caso.cifras_clave`: chips de cifras, delitos, penas, organo o hitos cuantificables.

El bloque se renderiza justo despues del masthead de caso y antes del `SectionH` "Resumen ejecutivo". No tiene header numerado propio porque forma parte de la ficha superior, no de la estructura larga de la pagina. La version completa sigue debajo como resumen ejecutivo formal.

Regla de copy para `que_se_investiga`:

- Debe caber mentalmente como entradilla: una frase, idealmente 20-35 palabras y excepcionalmente hasta dos lineas.
- Debe responder al objeto de investigacion, no recapitular organos, fechas, personas, registros, importes y estado procesal.
- Si el nombre mediatico del caso gira sobre una persona que tiene rol formal, la entradilla debe nombrarla con su rol procesal prudente (`investigada`, `procesada`, etc.) o debe quedar claro por que no se la nombra.
- Los importes concretos, fechas de autos, registros policiales, nombres secundarios y causas paralelas van en `hechos_clave`, `estado_actual`, `cifras_clave` o `descripcion_corta`.
- Si `que_se_investiga` queda casi tan largo como `descripcion_corta` o `resumen_cifras`, esta mal calibrado: compactar antes de publicar.

## Estado actual

Implementada en pre-launch el 2026-05-25.

- Campo `sintesis_caso` añadido al schema canonico de `Caso` como objeto estructurado (`que_se_investiga`, `hechos_clave`, `estado_actual`, `cifras_clave`).
- Campo tipado en la Content Collection de Astro.
- Sintesis creadas para los 7 casos publicables actuales: Plus Ultra, Begoña Gomez, Fiscal General del Estado, Gonzalez Amador, Kitchen, Lezo y atico de Estepona.
- Bloque fijo integrado bajo el masthead de `PgCasoDetalle`, sin toggle y sin nombre publico propio.
- UI con mas jerarquia visual: pregunta principal, hechos clave numerados, estado actual y chips de cifras.
- Skill `revisar-caso` actualizada para tratar `Caso.sintesis_caso.*` como prosa publicable sujeta a los mismos chequeos editoriales.

## Decisiones editoriales y aprendizajes

- **Mas claro no significa mas agresivo.** La version accesible mantiene presuncion de inocencia, fuentes y cautelas.
- **Evitar tono de tertulia.** Se puede ser directo sin usar verbos prohibidos ni caricaturizar el caso.
- **`sintesis_caso` sustituye al nombre de trabajo anterior.** El bloque ya no es un modo ni un CTA: es una pieza estable de la ficha superior.
- **Debe decidirse pronto.** Si se mete despues de decenas de casos, habra que reescribir mucho contenido.
- **Puede apoyarse en Lectura Facil, pero no limitarse a ella.** La referencia UNE-153101 es util por prudencia, aunque el producto puede tener voz propia.
- **El nombre canonico es `sintesis_caso`.** Se descarta `resumen_accesible` porque promete una conformidad formal con lectura facil que no se esta certificando, y se descarta el nombre de trabajo anterior porque ya no hay boton ni modo alternativo.
- **La version breve no sustituye al resumen formal.** El resumen completo sigue siendo la referencia indexable y SEO; `sintesis_caso` es una entrada de lectura rapida.
- **`que_se_investiga` no es otro resumen ejecutivo.** Aprendizaje del caso Leire Diez (2026-05-28): cuando ese campo acumula sujetos, auto, cifras, registro y causa paralela, duplica el resumen ejecutivo y degrada tambien las tarjetas de inicio/listado que lo reutilizan.
- **Compactar no puede borrar al sujeto principal.** En el mismo caso, el primer ajuste dejo la sintesis demasiado abstracta y el resumen ejecutivo tampoco nombraba a Leire Diez; si el nombre mediatico depende de una persona con rol formal, hay que nombrarla con cautela procesal.
- **No usar gradientes.** El bloque necesita presencia, pero el gradiente le resta seriedad institucional. Fondo plano, borde y filete mostaza bastan.
- **Parte de la ficha, no seccion autonoma.** Va antes del resumen ejecutivo formal y no consume numeracion propia.
- **Objeto estructurado, no bloque markdown.** La estructura evita que el campo se convierta en una segunda mini-ficha narrativa y fuerza la misma arquitectura en todos los casos.
- **Cifras visibles cuando ayudan.** El bloque debe llevar dinero, penas, delitos, numero de procesados o hitos cuantificables si existen, sin convertir cifras indiciarias en hechos probados.
- **Marketiniano en aspecto, prudente en texto.** La UI puede tener mas jerarquia y punch visual; el copy mantiene atribucion, cautelas y presuncion de inocencia.

## Ideas futuras

### v1 pre-launch

- [x] Añadir campo de sintesis al schema de caso.
- [x] Crear sintesis para los casos publicables actuales.
- [x] Bloque fijo antes del resumen ejecutivo de ficha de caso.
- [x] Checklist en `revisar-caso` para verbos prohibidos y afirmaciones sin respaldo tambien sobre el texto accesible.
- [x] Estandarizar mini-secciones: que se investiga, hechos clave, estado actual y cifras clave.

### v1.x

- Sintesis breve para cronologia.
- Sintesis breve por hecho sensible.
- Persistencia de preferencia del lector entre paginas.
- Refinar una guia de copy con plantillas por fase procesal.

### Sin compromiso

- Skill LLM para proponer borradores de `sintesis_caso`, siempre con revision humana antes de publicar.

## Pendientes operativos

- [x] Decidir nombre de campo (`sintesis_caso`).
- [x] Retirar el nombre de trabajo anterior de la UI y de los identificadores internos activos.
- [ ] Resolver impacto SEO/Pagefind tras pasar de toggle oculto a bloque visible.
- [x] Crear guia de estilo breve para `sintesis_caso.que_se_investiga`.
- [ ] Revisar visualmente el bloque en mobile tras el siguiente pase de browser.
