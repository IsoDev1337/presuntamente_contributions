# Cómo contribuir a presuntamente

> Esta guía es preliminar. Versión completa cuando el proyecto entre en Fase 4 del roadmap (apertura editorial).

## Antes de cualquier cosa

Lee [`AGENTS.md`](AGENTS.md) y los principios del proyecto. Toda contribución debe respetar:

- Imputación ≠ condena.
- Cada afirmación con fuente y nivel.
- Tratamiento sin cuota política.
- Presunción de inocencia en el lenguaje.

## Sugerir una fuente o un hito

Abre un issue con la etiqueta `sugerencia-fuente` y aporta:

- **Caso al que pertenece** (URL en presuntamente.org cuando esté operativo, o slug del caso).
- **Documento o evento** que aportas: URL canónica, enlace de archivo (archive.org / archive.ph), o PDF.
- **Por qué es relevante**: qué Hito o Hecho introduce o modifica.

## Proponer una rectificación

Ver [`LEGAL.md`](LEGAL.md). Resumen: issue con etiqueta `rectificacion` o correo a `rectificacion@presuntamente.org` (operativo cuando se compre el dominio).

## Para colaboradores con permisos (futuro)

Pendiente: protocolo de PR cuando entren colaboradores externos a partir de Fase 4 del roadmap. Mientras tanto, el maintainer único trabaja en **commits directos a `main`** (sin ramas ni Pull Requests) y el push lo lanza siempre él, no los agentes. Detalle en [`AGENTS.md`](AGENTS.md) §"Workflow de rama y PRs".

Política prevista: ver `docs/diseno/03-estrategia-de-mantenimiento.md` y `docs/diseno/04-riesgos-legales-y-eticos.md`.

## Para desarrollo local

```bash
pnpm install
pnpm dev        # arrancar Astro en local
pnpm validate   # validar todos los YAML del repo contra los schemas
pnpm build      # build estático del sitio + índice Pagefind
pnpm preview    # servir dist/ con el índice de búsqueda construido
```

Node 24 (ver [`.nvmrc`](.nvmrc)). pnpm 11 (declarado en `package.json` → `packageManager`).
