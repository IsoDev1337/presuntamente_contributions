# Cómo contribuir a presuntamente

> El proyecto acepta Pull Requests de contribuyentes externos (ver "Contribuir por Pull Request"). Los cauces editoriales descritos abajo (aportes y rectificaciones por correo o issue) siguen plenamente operativos y no requieren saber git.

## Antes de cualquier cosa

Lee [`AGENTS.md`](AGENTS.md) y los principios del proyecto. Toda contribución debe respetar:

- Imputación ≠ condena.
- Cada afirmación con fuente y nivel.
- Tratamiento sin cuota política.
- Presunción de inocencia en el lenguaje.

## Aportar fuentes, correcciones o ideas

Si tienes mejor acceso a fuentes o mejor conocimiento de un caso que el equipo del sitio, puedes aportar al inventario sin saber git ni exponerte en un issue público. Tres tipos de aporte aceptados bajo el mismo cauce editorial:

- **Pista a fuente o hito que falta**: sentencia, auto, BOE, informe institucional, cobertura periodística cruzada de una línea editorial no representada.
- **Corrección fáctica menor**: errata, fecha equivocada, órgano mal asignado, segundo apellido incorrecto, link roto, atribución de delito que no encaja con el auto.
- **Idea o sugerencia sobre el sitio**: feature deseada, mejora de UX, observación editorial general.

**Cauce principal**: correo a `aportar@presuntamente.org`. Por defecto el aporte es **anónimo**: el commit que incorpore tu pista cita la fuente verificada, no a ti. Si quieres ser acreditado, pídelo explícitamente en el correo y se añadirá un trailer `Aporte-externo: <nombre o medio>` al commit.

**Alternativa para usuarios de GitHub**: issue con etiqueta `sugerencia-fuente` (template en [`.github/ISSUE_TEMPLATE/sugerencia-fuente.yml`](.github/ISSUE_TEMPLATE/sugerencia-fuente.yml)). El issue es público; si necesitas privacidad, usa el correo.

Procedimiento editorial completo, alcance (qué se acepta y qué no, qué no depositamos), plazos comprometidos (5 días hábiles acuse, 30 días resolución) y tratamiento RGPD en [doc 04 — "Mecanismo de aportación editorial"](docs/diseno/04-riesgos-legales-y-eticos.md#6bis-mecanismo-de-aportación-editorial).

## Proponer una rectificación

**Si te consideras aludido** por una información publicada y discrepas, el cauce es distinto del de aportación: es el derecho de rectificación de la Ley Orgánica 2/1984. Ver [`LEGAL.md`](LEGAL.md). Resumen: correo a `rectificacion@presuntamente.org`, o issue con etiqueta `rectificacion` (template en [`.github/ISSUE_TEMPLATE/rectificacion.yml`](.github/ISSUE_TEMPLATE/rectificacion.yml)). Plazos comprometidos: acuse 48 h hábiles, resolución provisional 7 días hábiles. Detalle en [doc 04 — "Mecanismo de rectificación"](docs/diseno/04-riesgos-legales-y-eticos.md#6-mecanismo-de-rectificación).

## Contribuir por Pull Request

Si quieres contribuir directamente al repositorio (catalogar medios, corregir datos, mejorar el sitio):

1. **Fork + rama** por unidad de cambio coherente.
2. **PR descriptivo**: qué cambia, por qué, y con qué fuentes (toda afirmación editorial necesita fuente verificable).
3. **CI verde** antes del merge (`pnpm validate` + `pnpm build` + tests; corre automáticamente en el PR).
4. **El merge lo hace siempre el maintainer**, tras revisión editorial. Para contenido de casos se aplica además la auditoría cualitativa (presunción de inocencia, niveles de fuente, neutralidad).

Las issues etiquetadas [`good first issue`](https://github.com/davidchicano/presuntamente/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) son el mejor punto de entrada. El maintainer trabaja directamente sobre `main` en sus propias sesiones; el detalle del workflow interno está en [AGENTS.md → "Workflow de rama y PRs"](AGENTS.md#workflow-de-rama-y-prs).

## Para desarrollo local

```bash
pnpm install
pnpm dev        # arrancar Astro en local
pnpm validate   # validar todos los YAML del repo contra los schemas
pnpm build      # build estático del sitio + índice Pagefind
pnpm preview    # servir dist/ con el índice de búsqueda construido
```

Node 24 (ver [`.nvmrc`](.nvmrc)). pnpm 11 (declarado en `package.json` → `packageManager`).
