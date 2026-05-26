# Archivado automático en archive.org

> Archivos clave: [`scripts/archivar-n4.mjs`](../../../scripts/archivar-n4.mjs) · [`hooks/pre-commit`](../../../hooks/pre-commit) · comandos `pnpm archive:catchup` / `pnpm archive:dry`.

## Qué hace

Captura snapshots en [web.archive.org](https://web.archive.org) de URLs periodísticas y rellena `url_archivo` en los YAML, cumpliendo el espíritu de V-13 (mirror permanente ante desaparición o edición del original).

## Fuentes que archiva

| Ruta | Campo origen | Filtro |
|------|----------------|--------|
| `content/documentos/*.yaml` | `url_canonica` | `nivel_fuente: 4`, sin `url_archivo` ni `url_archivo_no_disponible` |
| `content/cobertura-mediatica/*.yaml` | `url` (por noticia en `noticias[]`) | sin `url_archivo` en ese ítem |

## Cómo se dispara

### Activación del hook (una vez por máquina)

```bash
git config core.hooksPath hooks
```

Sin esto, Git usa `.git/hooks/` (solo samples) y **el hook no corre nunca**.

### pre-commit (automático, acotado)

Al hacer `git commit`, si hay en staging documentos N4 o YAML de cobertura mediática con URLs sin archivar:

- Procesa **como máximo 5 URLs** por commit (`ARCHIVAR_HOOK_MAX` o `--hook-max=` para cambiar el tope; `0` = sin tope).
- Espera 8 s entre llamadas (~1 min en el peor caso con 5 URLs).
- Re-stagea los YAML modificados para que entren en el mismo commit.
- **No bloquea** el commit si archive.org falla.

**Por qué no pre-push:** el tiempo de espera es el mismo; solo cambia el momento en que el maintainer espera. Un push con 30 URLs nuevas seguiría siendo lento o incompleto.

**Por qué no archivar todo en el hook:** un commit con 29 noticias de cobertura serían ~4+ minutos bloqueando el commit. El diseño acordado es: hook para **incrementos pequeños**, catchup manual para **lotes grandes**.

### Catchup manual (sin tope)

```bash
pnpm archive:dry      # lista pendientes
pnpm archive:catchup  # archiva todo el backlog
pnpm archive:catchup -- --caso=begona-gomez   # solo un caso (documentos + cobertura)
```

Útil al activar el hook por primera vez, tras clonar el repo, o cuando el pre-commit aplazó URLs por el tope de 5.

## Estado actual

**Entregado 2026-05-26:** el script cubre documentos N4 y noticias de `content/cobertura-mediatica/`. El pre-commit vigila ambas rutas con tope de 5 URLs.

Backlog típico sin catchup: Kitchen (N4 sin `url_canonica`), cobertura de Begoña (29 noticias sin mirror), documentos N4 sueltos con URL pero sin pasar catchup.

## Decisiones editoriales y aprendizajes

- El hook es **ayuda**, no garantía: si la red o archive.org fallan, el commit pasa y el backlog queda para `archive:catchup`.
- Paywall / anti-bot (HTTP 520): marcar `url_archivo_no_disponible` en documentos N4 con justificación; confiar en respaldo cruzado (doc 01).
- No usar `git commit --no-verify` por costumbre; reservarlo para urgencias editoriales.

## Pendientes operativos

- [ ] Maintainer: `git config core.hooksPath hooks` en cada máquina que commitee.
- [ ] Ejecutar `pnpm archive:catchup` para vaciar backlog histórico (Kitchen, cobertura Begoña, etc.).
- [x] Corregir en NOTES de casos la suposición de que el hook archiva “solo al commit” sin activar `core.hooksPath` (Begoña, Kitchen, Plus Ultra; 2026-05-26).
