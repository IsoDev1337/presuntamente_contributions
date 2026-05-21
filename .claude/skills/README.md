# Skills locales del proyecto presuntamente

Skills para usar con Claude Code en este repositorio. **En Fase 0 son placeholders**; se implementan según se necesiten.

## Skills planeadas

- **`investigar-caso`** — arrancar un caso nuevo desde URL/nombre. Crea el esqueleto YAML en `/content/casos/<slug>/` y abre PR.
- **`incorporar-hito`** — añadir Hito + Hechos + Documento a un caso existente desde un PDF de auto. Aplica los guardarraíles del doc 03 §4 (nunca asigna `tipo = acreditado` automáticamente; nunca inventa).
- **`revisar-señales`** — procesar `content/signals.yaml`, descartar ruido, proponer PRs por las señales reales.
- **`validar-repo`** — ejecutar `pnpm validate` con output agrupado por entidad y resumen.
- **`rectificar`** — gestionar una solicitud de rectificación entrante (issue con etiqueta `rectificacion`). Aplica el procedimiento del doc 04 §6.
- **`anonimizar`** — V-17: cuando una persona privada cierra todos sus `RolEnCaso`, gestionar revisión de anonimización o retirada de ficha.

## Convención de implementación

Cada skill vivirá en su propio directorio:

```
.claude/skills/
  investigar-caso/
    SKILL.md         ← descripción + instrucciones de uso
    (assets opcionales)
  incorporar-hito/
    SKILL.md
  ...
```

## Cómo se invocan

Desde Claude Code en este repo: `/<skill-name>` con argumentos opcionales según cada skill.

## Documentos de referencia

- Procedimiento operativo: `docs/diseno/03-estrategia-de-mantenimiento.md`.
- Guardarraíles legales: `docs/diseno/04-riesgos-legales-y-eticos.md`.
- Reglas anti-desinformación que toda skill debe respetar: `docs/diseno/02-ficha-de-caso.md` §4.
