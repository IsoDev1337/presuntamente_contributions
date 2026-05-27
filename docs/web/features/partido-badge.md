# PartidoBadge — chip por partido con color institucional sobrio

> Archivos clave: `src/components/PartidoBadge.astro` · `src/styles/global.css` (`--color-partido-<slug>-*`) · puntos de uso: `PgCasos.astro`, `PgInicio.astro`, `PgCasoDetalle.astro`. Relacionada con [`partidos-afectados.md`](partidos-afectados.md).

## Qué hace

Renderiza un chip identificativo por partido político usando el color institucional real con saturación bajada. Sustituye los chips uniformes con `--color-accent` que se usaban hasta 2026-05-27 en listado de casos, home y bloque "Partidos afectados" de la ficha de caso.

## Para qué sirve

Que un lector reconozca de un vistazo qué siglas toca un caso sin tener que leer el label. La identificación visual es valiosa en el listado denso `/casos` y en la home, donde el escaneo va antes que la lectura.

Importante: el color es **identificación**, no juicio. El sistema visual gov-retro del sitio veta los colores partidistas de alta saturación tipo papeleta electoral. Los tokens están bajados en intensidad para no convertir el sitio en infografía electoral.

## Cómo funciona

### API

```astro
<PartidoBadge
  id="psoe"            {/* slug de la organización-partido */}
  label="PSOE"         {/* siglas o nombre a mostrar */}
  href="/organizaciones/psoe"  {/* opcional */}
  size="sm"            {/* sm | md (default sm) */}
  asLink={false}       {/* fuerza <span> aunque haya href, para no anidar <a> */}
/>
```

- `size="sm"` para listados densos (columna `/casos`, home).
- `size="md"` para fichas (no usado hoy; reservado).
- `asLink={false}` necesario cuando el badge está dentro de un `<a>` mayor (home cards).

### Paleta sobria

7 partidos modelados en el inventario, todos con tokens `--color-partido-<slug>-{bg,fg,border}` en `global.css`:

| Slug | Color base | bg | fg | border |
|---|---|---|---|---|
| `psoe` | rojo apagado | `#f5e2e2` | `#8a3030` | `#c87575` |
| `partido-popular` | azul medio | `#e1eaf5` | `#2f4a75` | `#7090c0` |
| `vox` | verde sobrio | `#e3edd6` | `#4a6826` | `#7a9a4f` |
| `podemos` | morado apagado | `#efe1ef` | `#6a3a6a` | `#a87aa8` |
| `sumar` | coral | `#f7e6da` | `#9a4d22` | `#c47a55` |
| `izquierda-unida` | granate | `#f3dada` | `#7a1f1f` | `#a44a4a` |
| `mas-madrid` | cyan-turquesa | `#d8eaec` | `#1f5560` | `#5a99a5` |
| **(otros)** | fallback gris | `#ececea` | `#4a4d52` | `#b3b6ba` |

Contenedor: fondo suave + texto + borde fino uniforme (1px), sin `border-left` grueso (vocabulario ajeno — ver [DESIGN.md — "Sistema de badges"](../../../DESIGN.md#2bis-sistema-de-badges)). Peso 600.

### Hover en versión enlazable

`filter: brightness(0.94)` sobre el `<a class="partido-badge">`. Oscurece sutilmente sin invertir colores (invertir parecería selección, no hover).

### Bloque editorial de PgCasoDetalle

El bloque grande "Organizaciones afectadas" (sigla + tipo + justificación) **no usa `PartidoBadge` directamente** — el color de partido se aplica al `color` de la sigla vía atributo `data-partido="<slug>"`. Razón: el chip dentro del bloque editorial duplicaría caja-en-caja y rompería el grid.

## Estado actual

**Entregado 2026-05-27**:

- Componente `PartidoBadge.astro` + tokens en `global.css`.
- Sustituido en 3 sitios:
  - `/casos` (columna Partidos afectados) — `size="sm"` con `href`.
  - Home (cards destacadas) — `size="sm"` con `asLink={false}`.
  - `PgCasoDetalle.astro` bloque editorial — vía `data-partido` (no `PartidoBadge` directo).
- CSS muerto (`.destacado__partido-chip`, `.c-partido-chip`) borrado.
- Dedupe en columna `/casos`: un chip por partido aunque haya varias entradas con `tipo_afectacion` distinto.
- **2026-05-27 (tarde)**: contenedor sin `border-left` grueso (ver "Paleta sobria" arriba).

## Decisiones editoriales y aprendizajes

- **Sólo los 7 partidos modelados tienen tokens.** Cualquier `partido_id` desconocido cae al fallback gris. No se eligen colores a ojo; si entra un partido nuevo en el inventario hay que añadirlo explícitamente al mapa.
- **Color institucional con saturación bajada, no fiel a marca.** Vox verde-bandera y PP azul-bandera saturados convertirían el listado en una papeleta electoral. La saturación bajada conserva identificación sin tono partidista.
- **Peso 600 obligatorio.** No subir a 700/800 (regla AGENTS.md). En el refactor del bloque editorial de PgCasoDetalle se bajó la sigla de 700→600 también, alineando con la regla.
- **No anidar `<a>` dentro de `<a>`.** El prop `asLink={false}` existe específicamente para la home, donde la card destacada ya es un enlace. Saltarse esto produce HTML inválido y el navegador rompe el segundo `<a>` silenciosamente.

## Ideas futuras

### v1.x

- Añadir más partidos al mapa cuando entren al inventario: BNG, EH Bildu, Junts, ERC, Compromís, Ciudadanos, UPN, CC, PRC, CUP. Cada uno con color sobrio bajado, no de bandera.
- Tooltip nativo con el nombre completo del partido al hover del chip (hoy sólo tiene `aria-label`).

### Sin compromiso

- `size="md"` para fichas grandes cuando se reabra el bloque editorial.
- Variante "outline" (sin fondo) si una página necesita densidad extra.

## Pendientes operativos

- [x] Crear componente + paleta + sustituir call-sites. **Entregado 2026-05-27.**
- [x] Dedupe en listado. **Entregado 2026-05-27.**
- [ ] Añadir partidos al mapa según entren al inventario (BNG, EH Bildu, Junts, ERC, etc.).
