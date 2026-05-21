# Roadmap operativo de presuntamente

> **Estado vivo del proyecto.** Este es el primer fichero que cualquier persona (o agente LLM) debe leer al empezar a trabajar, y el último que debe actualizar al cerrar la sesión. Si abres el proyecto por primera vez o desde otra máquina, empieza aquí.
>
> El roadmap **conceptual** — razonamiento de las fases, criterios de salida, esfuerzo estimado — vive en [`docs/diseno/06-roadmap-por-fases.md`](docs/diseno/06-roadmap-por-fases.md). Este fichero es la versión **operativa**: dónde estamos, qué hay encima de la mesa, qué se ha aprendido.

**Última actualización:** 2026-05-21.

---

## Estado actual

- **Fase activa**: Fase 0 ✅ completada · Fase 1 (MVP Plus Ultra) en marcha — PR1 de contenido en rama `fase-1/plus-ultra-content`.
- **Último hito**: schemas Hito/Hecho/Documento/RolEnCaso/Organizacion/RelacionEntreCasos cerrados con `additionalProperties:false` + reglas if/then derivadas de V-09/V-10/V-11/V-14/V-15; esqueleto del caso Plus Ultra con 1 caso, 7 organizaciones, 1 persona (juez Calama), 5 delitos, 2 documentos, 1 hito (querella Manos Limpias 2025-12-23), 1 hecho atribuido, 2 roles, NOTES.md detallado y skill `incorporar-hito` v0. CI verde (20 entidades validadas).
- **Próximo paso comprometido**: PR1 sale del maintainer con revisión; resolver decisiones pendientes (Zapatero, ampliación lista blanca SEPI) antes de PR2 que incorporará operación UDEF 2025-12-11, cambio_organo 2026-03, auto 2026-05-19 con personas y roles que el maintainer apruebe.
- **Dev server local**: `pnpm dev` en `http://localhost:4321` (config en [`.claude/launch.json`](.claude/launch.json)).

---

## Backlog inmediato

Una idea, un bullet. `[ ]` pendiente, `[x]` hecho. Items completados se eliminan tras una o dos sesiones (la historia detallada está en el git log).

### Antes de Fase 1
- [x] Configurar git con email noreply.
- [x] Commit y push inicial del scaffolding.
- [x] Lenguaje visual canónico en [`/DESIGN.md`](DESIGN.md) (formato esperado por Claude Design + Claude Code).
- [ ] Resultado de Claude Design aplicado al sistema visual del repo: `src/styles/global.css` y componentes en `src/components/`.

### Fase 1 — MVP Plus Ultra
- [x] Completar schemas con todas las propiedades: `hito`, `hecho`, `documento`, `rol-en-caso`, `organizacion`, `relacion-entre-casos`. Cerrados con `additionalProperties: false` + reglas if/then para V-09, V-10, V-11, V-14, V-15 (rama `fase-1/plus-ultra-content`).
- [x] Skill `incorporar-hito` v0 — toma PDF de auto, propone YAML de `Hito` + `Hecho`(s) + `Documento`(s) + cambios en `RolEnCaso`. Guardarraíles del doc 03 §4 explícitos. Marcada explícitamente como v0 iterativa (rama `fase-1/plus-ultra-content`).
- [ ] YAMLs del caso Plus Ultra:
  - [x] `Caso` raíz (esqueleto en `fase-1/plus-ultra-content`).
  - [ ] 4-8 `Persona` implicadas — **1/4 en PR1** (juez Calama). 3-7 pendientes para PR2 (ejecutivos PU + decisión editorial Zapatero).
  - [x] 5-10 `Organizacion` — 7 en PR1 (AN, JCI 4, JI 15 Madrid, Fiscalía Anticorrupción, SEPI, Plus Ultra, Manos Limpias).
  - [ ] 8-15 `RolEnCaso` — **2/8 en PR1** (Calama juez_instructor, Manos Limpias acusacion_popular). Resto pendiente PR2.
  - [ ] 8-15 `Hito` — **1/8 en PR1** (querella Manos Limpias 2025-12-23). Pendiente PR2: operación UDEF 2025-12-11, cambio_organo 2026-03, auto 2026-05-19 (este último sujeto a decisión editorial Zapatero, ver `decisiones pendientes`).
  - [ ] 15-25 `Hecho` — **1/15 en PR1** (préstamo SEPI 2021-03-09, atribuido). Resto pendiente PR2.
  - [ ] 10-20 `Documento` — **2/10 en PR1** (querella Manos Limpias, nota SEPI 2021-03). Resto pendiente PR2.
- [x] Delitos del catálogo aplicables a Plus Ultra — 5 en PR1 (tráfico de influencias, organización criminal, falsedad documental, blanqueo de capitales, malversación).
- [ ] Componentes Astro de la ficha (siguiendo doc 02): `PgCasoDetalle`, encabezado, resumen ejecutivo, estado procesal, personas implicadas con micro-swimlane, cronología, hechos clasificados por estado epistémico, biblioteca de documentos, sección "cómo se ha redactado".
- [ ] Pagefind integrado y funcionando con el caso indexado.
- [ ] Página principal con listado básico (un caso).
- [ ] `/aviso-legal` con texto completo (a partir del borrador en doc 04 §8).
- [ ] `/rectificar` con instrucciones funcionales (formulario opcional vía Cloudflare Workers).
- [ ] `NOTES.md` del caso Plus Ultra con metadata, decisiones tomadas, referencias.

### Después de Fase 1, antes de Fase 2
- [ ] Revisar y consolidar `incorporar-hito` con lo aprendido al fichar Plus Ultra.
- [ ] Crear `investigar-caso` v0 con lo aprendido.
- [ ] Templates de issue (`rectificacion`, `sugerencia-fuente`).
- [ ] `CODEOWNERS` placeholder.
- [ ] Primer caso adicional sugerido: Begoña Gómez (testea trayectoria con desimputaciones).

---

## Decisiones pendientes del maintainer

Sólo cosas que requieren input humano, no del asistente.

- **Zapatero como `RolEnCaso=investigado` en Plus Ultra.** El brief de la sesión de Claude Code vetaba imputarlo formalmente, pero las fuentes confirman que el auto del 2026-05-19 del JCI nº 4 (AN) le cita como investigado. ¿Se incorpora en PR2 conforme a la realidad procesal documentada? Detalle y fuentes en `content/casos/plus-ultra/NOTES.md` § Discrepancia con el brief.
- **Ampliar `DominiosOficiales` (lista blanca V-12) con `sepi.es` y/u otros organismos públicos dependientes del Ministerio de Hacienda.** La nota SEPI sobre el préstamo Plus Ultra es Nivel 3 hoy; con la ampliación pasaría a Nivel 1. Decisión de doc 01 §3.
- **Política de citación del auto del 2026-05-19** (nota CGPJ en `poderjudicial.es`) cuando contiene a Zapatero por nombre. Atado a la decisión anterior.

---

## Fases del proyecto (estado consolidado)

Detalle en [`docs/diseno/06-roadmap-por-fases.md`](docs/diseno/06-roadmap-por-fases.md).

| Fase | Estado | Comentario |
|------|--------|-----------|
| 0 — Scaffolding | ✅ | Astro 5 + Open Props + schemas + CI + AGENTS.md. Commits `068cc9d`, `a3e429e`, `e1881e5`. |
| 1 — MVP Plus Ultra | 🔄 en preparación | Ver backlog arriba. Skills `incorporar-hito` se construye iterativamente con el caso. |
| 2 — Crecer a 5-6 casos vivos | ⏳ | Begoña Gómez, Koldo, Cerdán, González Amador, Fiscal General. |
| 3 — Visualización + watchers | ⏳ | Mini-grafo, watchers CENDOJ/CGPJ, panel admin. |
| 4 — Apertura editorial | ⏳ | CODEOWNERS reales, contributors externos. |
| 5 — Evoluciones futuras | ⏳ | UI web contributiva, multiidioma, API pública, asociación legal. |

---

## Aprendizajes y notas (vivo)

Cosas que aprendemos por el camino y conviene recordar más allá de los docs de diseño.

- **Las skills se moldean con la experiencia.** No fijar las skills upfront; iterarlas mientras se investiga cada caso. Cada nuevo caso refina la skill correspondiente.
- **Branding lo hace Claude Design** (plataforma de Anthropic, separada de Claude Code). El lenguaje visual canónico vive en [`/DESIGN.md`](DESIGN.md) en raíz, formato estándar que Claude Design lee del repo conectado y que Claude Code consumirá en el Handoff. Cuando vuelva el resultado de Claude Design, se integra en `src/styles/global.css` y componentes en `src/components/`, respetando el patrón `Pg*`.
- **El maintainer no quiere revisar docs largos por defecto.** Resumir, decidir, preguntar sólo cuando es genuinamente bloqueante.
- **`additionalProperties: true` en schemas skeleton es intencional**; se cierra a `false` cuando la propiedad final del schema se conozca al fichar Plus Ultra.
- **Versión de pnpm solo en `package.json`** (`packageManager`). No duplicar en `.github/workflows/`; `pnpm/action-setup` la lee del package.json automáticamente. Duplicar dispara `ERR_PNPM_BAD_PM_VERSION` y rompe CI.
- **pnpm 11 cambia settings de sitio**: `onlyBuiltDependencies` (entre otros) se renombra a `allowBuilds` y vive en `pnpm-workspace.yaml`, no en el campo `pnpm` de package.json (que ahora se ignora). Vale aunque el proyecto no sea monorepo. Ver https://pnpm.io/settings.
- **pnpm 11 bloquea install scripts por defecto** (medida contra supply-chain attacks). Aprobar las deps necesarias en `pnpm-workspace.yaml` → `allowBuilds`. Para este proyecto: `esbuild` y `sharp` (ambas indirectas vía Astro).
- **pnpm 11 requiere Node ≥ 22**. Por eso `.nvmrc` está en `24` y la CI usa `node-version: 24` en `setup-node`.
- **Pendiente futuro próximo**: las actions `actions/checkout@v4`, `pnpm/action-setup@v4`, `actions/setup-node@v4` corren INTERNAMENTE sobre Node 20, deprecadas el 2 jun 2026 y retiradas el 16 sept 2026. Bumpear a `@v5` cuando salga estable de cada una. (El `node-version` del runner ya está en 24; esto sólo afecta al runtime interno de los propios actions.)
- **Tensión brief vs realidad procesal en casos vivos.** Al fichar Plus Ultra el 2026-05-21 surgió la primera tensión entre lo que decía el brief (sin Zapatero como investigado) y la realidad procesal verificable (auto del 2026-05-19 que sí le imputa). Decisión operativa: respetar el brief, dejar la discrepancia documentada en `NOTES.md` del caso + `ROADMAP.md → Decisiones pendientes`, y deferir al maintainer. Reutilizar el patrón en futuros casos donde brief y fuente diverjan: registrar primero, no improvisar.
- **La V-04 no encaja con hechos administrativos no controvertidos** (ej. un Real Decreto en BOE, una nota institucional sobre una decisión del Consejo de Ministros). Al no haber sentencia firme, no pueden ser `acreditado` aunque sean factualmente verificables. Se modelan como `atribuido` con el organismo emisor como actor en el enunciado. Funciona pero sugiere que en Fase 2 conviene revisar si el modelo necesita una etiqueta extra para "factual no controvertido" o si `atribuido` cubre suficientemente.
- **`incorporar-hito` se queda en v0 deliberadamente.** Sólo documenta los guardarraíles y el flujo; tras cada PDF real, ampliar la sección "Histórico" del SKILL.md con lecciones aprendidas. No anticipar plantillas hasta tener uso real.

---

## Cómo se mantiene este documento

**Obligatorio** para cualquier agente o maintainer que trabaje en el repo:

1. **Al abrir el proyecto** o empezar una nueva sesión, leer este fichero entero antes de hacer nada.
2. **Al cerrar una sesión** o tras un cambio significativo, actualizarlo:
   - Marcar items completados.
   - Eliminar los completados tras una o dos sesiones (la historia detallada vive en el git log).
   - Añadir nuevos items detectados.
   - Si se ha tomado una decisión arquitectónica, anotarla en *Aprendizajes y notas* y actualizar el doc de diseño correspondiente.
3. **No duplicar contenido de `docs/diseno/`**. Aquí va el "qué" operativo; allí el "por qué" razonado.
4. **Si la convención cambia**, actualizar también `AGENTS.md` §"Workflow para agentes".
