# Página /aportar

> Componente: `src/components/pages/PgAportar.astro` (pendiente de crear) · Wrapper: `src/pages/aportar.astro` (pendiente de crear)

## Estado actual

**No existe todavía.** Esta ficha es placeholder: documenta la decisión editorial cerrada y los pendientes operativos para cuando se construya.

Decisión editorial canónica en `docs/diseno/04-riesgos-legales-y-eticos.md` §6bis. Feature transversal completa documentada en [`docs/web/features/aporte-editorial.md`](../features/aporte-editorial.md).

La página será **hermana de `/rectificar`** (cauce legal LO 2/1984) pero con identidad editorial propia, separando claramente:

- **`/rectificar`**: para quien se considere aludido por una afirmación y discrepe. Cauce defensivo, plazos LO 2/1984 (48 h acuse, 7 días resolución).
- **`/aportar`**: para terceros con conocimiento que quieran ampliar o corregir el inventario. Cauce proactivo, sin marco legal específico, plazos comprometidos por respeto (5 días acuse, 30 días resolución).

Las dos páginas enlazan entre sí cuando el visitante llega a la puerta equivocada ("¿buscabas el cauce de rectificación? Pasa por aquí").

## Ideas futuras

### v1.x — comprometido

- **Tres carriles visibles** con orientación específica sobre qué pedimos en cada uno:
  1. Pista a fuente o hito que falta.
  2. Corrección fáctica menor (errata, fecha, link roto).
  3. Idea o sugerencia sobre el sitio.
- **Cauce principal email** `aportar@presuntamente.org`, presentado prominentemente. Alternativa GitHub para devs (template `sugerencia-fuente.yml`).
- **Mensaje sobre privacidad por defecto**: "por defecto tu aporte es anónimo; si quieres que te acreditemos en el commit, dilo en el correo". Reduce la barrera para funcionarios y periodistas con fuentes.
- **Bloque "Qué no aceptamos"** explícito y honesto: documentos bajo secreto de sumario, escritos de parte no notificados, mirrors no auditables, doxxing. Mejor decirlo claro que confundir al aportante con material que no podemos publicar.
- **Plazos visibles** (5 días acuse, 30 días resolución) para que el aportante sepa qué esperar.
- **Enlace al doc 04 §6bis** para quien quiera el detalle editorial completo.

### Sin compromiso

- **Formulario integrado** que vuelque a la bandeja interna sin necesidad de que el aportante abra su cliente de correo. Requiere Cloudflare Worker + Turnstile/hCaptcha. Trade-off: el formulario tiene mayor tasa de conversión que el email (Aportar es un acto que la gente puede aplazar si requiere abrir Gmail/Proton) pero introduce infra que no tenemos hoy y oscurece la traza del aporte.
- **Bloque "Aportes recientes incorporados"** mostrando los últimos commits con trailer `Aporte-externo:` (los que el aportante autorizó acreditar). Refuerza la transparencia y reconoce el feedback loop. Riesgo: si la mayoría de aportantes prefieren anonimato (probable), el bloque queda casi vacío y comunica falta de tracción incluso cuando hay actividad.
- **Versión catalana `/cat/aportar`** cuando se active el catalán en el sitio.
- **Card OG específica** para que cuando se comparta el link del aviso de aportar, el preview comunique el cauce.

## Aprendizajes y decisiones editoriales

Por inaugurar: cuando se construya la página, anotar aquí los porqués no obvios (qué copy probó y descartó, qué dudas surgieron sobre la frontera entre rectificación y aportación, qué señales recibió el copy de los primeros aportantes reales tras el lanzamiento público).

## Pendientes operativos

- [ ] Crear `src/pages/aportar.astro` (wrapper mínimo) + `src/components/pages/PgAportar.astro` (lógica).
- [ ] Diseñar visualmente alineado con `/rectificar` pero con identidad editorial propia (mostaza claro para los CTA del aporte vs granate institucional del de rectificar, p. ej.; decisión final con la skill `presuntamente-design`).
- [ ] Copy completo de las tres tarjetas de carril, con ejemplos concretos en cada una (qué clase de pista esperamos).
- [ ] Cross-link desde la página `/rectificar` ("¿buscabas el cauce editorial? pasa por `/aportar`").
- [ ] Decidir si el slug en CA es `/aportar` o `aportar-ca` o `/contribuir` — coordinar con la skill de i18n cuando se active el catalán.
