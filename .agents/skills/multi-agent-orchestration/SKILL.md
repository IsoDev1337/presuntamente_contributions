---
name: multi-agent-orchestration
description: Coordination protocol for parallel agent sessions on a shared git repository. Provider-agnostic (Claude Code, Codex, Cursor, human CLI). Uses real `git worktree` for filesystem isolation and a shared coordination layer under `.git/agents/` (sessions + messages) so any agent can see what others are doing and exchange targeted asks. Pull-based by default with an optional Claude Code `Stop` hook for near-real-time inbox checks. Invoke when starting a parallel session ("open agent session", "start parallel work", "I'm running this alongside another agent"), when listing or reading agent inbox ("check agent messages", "any messages?"), when sending a question to another running session, or when closing a session. Also invoke proactively when about to touch a hot path (shared schemas, root docs, cross-cutting libs) and want to check whether another session is already working there.
---

# multi-agent-orchestration

## Purpose

Provide a minimal, provider-agnostic protocol for multiple AI agents (or an agent and a human) working in parallel on the same git repository **without stepping on each other**. Solves two concrete problems:

1. **Filesystem race**: when two agents share the same working copy, every `git add` / `git commit` writes through the same global `.git/index`, leading to cross-contamination (one session's `git commit` accidentally staging another session's untracked files).
2. **Coordination gap**: agents don't know what other live sessions are touching, what's been decided in a parallel thread, or how to ask a peer a question they can't answer alone.

The skill defines: (a) how sessions isolate themselves via real `git worktree`, (b) a shared coordination directory inside `.git/` that all worktrees share by design, and (c) a small set of conventions for session manifests, mailbox messages with read tracking, and quality rules for what's worth sharing.

## When to invoke this skill

- Starting a session that may run in parallel with another agent or human on the same repo → `open <slug>`.
- Checking who else is active and what they're touching → `list`.
- Reading mail addressed to this session → `inbox`.
- Asking another live session a question this session genuinely cannot resolve from the repo → `send`.
- Replying to a received message → `reply`.
- Ending a session, archiving inbox, escalating loose ends → `close`.
- **Proactive trigger**: about to write to a "hot path" (project-wide root docs, shared schemas, cross-cutting libs). Run `list` first to check whether another active session has claimed it.

## Inputs

- For `open`: a short kebab-case slug describing the session goal (e.g. `auth-rewrite`, `payments-refactor`, `landing-redesign`). If absent, derive one from the user's stated goal and confirm.
- For `send` / `reply`: target session slug, message type (`question` | `notice` | `reply` | `escalation`), and the message body.
- For `close`: no arguments; the skill operates on the session opened in this terminal/worktree.

## Architecture

### Layer 1 — Worktree isolation (mandatory, provider-agnostic)

Every parallel session **must** run in its own `git worktree`. Never run two agent sessions on the same working copy. The agnostic command is:

```
git worktree add <path> -b session/<slug>
```

`<path>` is wherever the provider prefers (Claude Code defaults to `.claude/worktrees/<name>`, others may differ; both are gitignored). The coordination layer below is shared across all worktrees by design and does not depend on `<path>`.

### Layer 2 — Coordination directory under `.git/agents/`

All sessions read and write to a single shared directory resolved via `git rev-parse --git-common-dir`. This works because all worktrees of a repository share the same `.git/` common directory — sessions see each other automatically, and the directory is never tracked by git (it lives inside `.git/`, which is the repository itself, not its versioned content).

```
$(git rev-parse --git-common-dir)/agents/
├── sessions/
│   └── <ISO-timestamp>-<slug>/
│       └── SESSION.md
├── messages/
│   ├── <ISO-timestamp>-<from>-<short-id>.md       ← created by sender
│   ├── <ISO-timestamp>-<from>-<short-id>.read     ← created by recipient on read
│   ├── <ISO-timestamp>-<from>-<short-id>.replied  ← created by recipient on reply
│   └── _archive/                                  ← closed sessions move processed messages here
└── README.md                                      ← optional, points to this skill
```

Key property: **each agent only ever writes files that "belong" to itself**. The sender writes the `.md`; the recipient writes the lateral `.read` / `.replied` markers (which are new files, not mutations). No agent ever edits another agent's content.

### Layer 3 — Pull model with optional push hook

Agents are turn-based, not continuous processes. They cannot be interrupted mid-tool-call by an external event. Therefore:

- **Default (agnostic)**: agents pull their inbox at well-defined checkpoints — at session open, before touching a hot path, and at session close.
- **Optional Claude Code enhancement**: a `Stop` hook (or `UserPromptSubmit` hook) can scan the inbox at end of each turn and surface "📬 N new messages" to the next turn. Documented in the "Provider notes" section.
- **Not recommended**: spawning a polling subagent. It cannot interrupt the principal session and burns tokens for no benefit.

If a question needs a synchronous answer, escalate to the maintainer, not to another agent session.

## Conventions

### Session manifest format

`SESSION.md` lives in `.git/agents/sessions/<ISO-timestamp>-<slug>/SESSION.md` and uses this template:

```markdown
---
status: active | closed
agent: claude-code | codex | cursor | human | other
opened: 2026-05-24T18:49
closed: null
worktree: <absolute or relative path to the worktree>
slug: <kebab-case session slug>
---

## Goal
One sentence. What this session delivers.

## Planned scope (read / write)
- write: src/auth/**
- write: docs/architecture.md  ← HOT PATH
- read:  schemas/**

## Touched in reality
- (filled in at close from `git diff --name-only main` in the worktree)

## Notes for other sessions
- Anything actively useful to other agents that they cannot deduce from the repo.
- Active warnings about hot paths in flight.
- Decisions taken in this session that affect cross-cutting state.
```

### Message format

Each message is a markdown file with YAML frontmatter:

```markdown
---
id: msg-<short-random>
from: <sender session slug>
to: <recipient session slug>            ← use `maintainer` to escalate to the human
ts: 2026-05-24T19:15
type: question | notice | reply | escalation
thread: <id of the root message of this thread>
in_reply_to: null | <id>
priority: normal | high | blocking
---
Body of the message in markdown. Keep it tight; one ask per message.
```

### Read state tracking

- **unread**: only `<id>.md` exists.
- **read**: recipient creates an empty `<id>.read` sibling. Filesystem mtime carries the read timestamp.
- **replied**: recipient creates `<id>.replied` containing the id of the reply message.
- **archived**: on session close, processed messages and their lateral markers move to `_archive/`.

### Quality rules (what's worth writing)

The cost of a message is not writing it — it's the blocking time on the other side. Default to investigating the repo before asking.

**Put in `SESSION.md`** (information not deducible from reading the repo):
- One-sentence goal.
- Planned read/write scope.
- Active warnings about hot paths in flight.
- Cross-cutting decisions taken in this session.

**Do not put in `SESSION.md`**:
- Internal scratchpad notes (those belong wherever the project keeps per-task notes).
- Implementation details that only matter to this session.
- Narrative summaries of work done (those belong in the commit message).

**Send a message only when the recipient cannot resolve it in 30 seconds reading the repo**:
- Preemptive veto on a path you're about to touch and the recipient was watching.
- A cross-cutting editorial decision not yet written down.
- A breaking change you already made that invalidates an assumption of theirs.
- Escalation to the maintainer when a deadlock can't be resolved between agents.

**Do not send a message for**:
- "Where is X?" → grep it.
- "What did you change in Y?" → `git log` / `git diff`.
- "Are you done?" → read their `SESSION.md` status.
- Anything answerable by reading the repo, project documentation, or another session's manifest.

If in doubt, **don't ask — investigate**.

## Actions

### `open <slug>`

1. Resolve the coordination root: `COORD=$(git rev-parse --git-common-dir)/agents`. Create `$COORD/sessions/` and `$COORD/messages/` if absent.
2. Create the worktree if not already inside one: `git worktree add <provider-default-path> -b session/<slug>`.
3. Read `$COORD/sessions/*/SESSION.md` and list every session with `status: active`. Surface their slugs, planned scope, and "Notes for other sessions" to the user/agent context.
4. Read this session's inbox (messages in `$COORD/messages/` with `to: <slug>` and no `.read` sibling). Surface them.
5. Create `$COORD/sessions/<ISO-timestamp>-<slug>/SESSION.md` using the template above, prompting for goal and planned scope.

### `list`

1. List all `SESSION.md` with `status: active`, with: slug, agent, opened-at, planned write scope, hot-path conflicts with the current session's planned scope.
2. List the count of unread messages per active session.
3. Do not modify anything.

### `inbox`

1. List unread messages addressed to this session (no `.read` sibling).
2. For each, surface frontmatter + body.
3. After surfacing, create the `.read` sibling for each one shown. (Reading = ack.)
4. If a message has `priority: blocking`, surface it first and recommend stopping current work to address it.

### `send <to> <type> "<body>"`

1. Validate `<to>` resolves to an active session slug or to `maintainer`.
2. Apply the quality rules above. If the message looks like something the recipient can resolve by reading the repo, refuse and recommend investigation instead.
3. Write `$COORD/messages/<ISO-timestamp>-<from>-<id>.md` with frontmatter from this session's slug, the recipient, ts, type, a fresh thread id (or carry forward if replying), and the body.

### `reply <id> "<body>"`

1. Read the original message; copy its `thread` id.
2. Write a new message with `in_reply_to: <id>`, `to: <original from>`, `type: reply`.
3. Create the `<id>.replied` sibling on the original, with the new message's id as its content.

### `close`

1. Read this session's `SESSION.md`. Update `status: closed`, fill `closed:` with the current ISO timestamp.
2. Fill the "Touched in reality" section from `git -C <worktree> diff --name-only $(git merge-base main HEAD)`.
3. For every message in this session's inbox without a `.read`: either read+ack them, or escalate them to `maintainer` with `type: escalation` referencing the original thread id.
4. Move processed messages (those with `.read` or `.replied`) and their siblings to `$COORD/messages/_archive/`.
5. Do not delete the worktree automatically. The maintainer decides when to remove it (commit history may still be useful).
6. Do not commit anything as part of `close`. Commits remain a separate, explicit decision.

## File layout reference

```
.git/agents/
├── sessions/
│   ├── 2026-05-24T1849-auth-rewrite/
│   │   └── SESSION.md
│   └── 2026-05-24T1842-payments-refactor/
│       └── SESSION.md
└── messages/
    ├── 2026-05-24T1915-auth-rewrite-a3f1.md
    ├── 2026-05-24T1915-auth-rewrite-a3f1.read
    ├── 2026-05-24T1920-payments-refactor-b7c2.md
    └── _archive/
        └── 2026-05-23T1100-old-session-c4d5.md
```

## Reference inbox-notification hook

Default operation is pull-at-checkpoint (open / before hot path / close). Some providers expose a `UserPromptSubmit` lifecycle hook that fires before every user prompt and can inject text into the model's next-turn context. Using that hook narrows inbox latency from "next checkpoint" to "next turn".

A reference implementation is bundled with this skill at `inbox-check-hook.py` (Python 3 standard library only, no third-party dependencies). The script is provider-agnostic: it works with any provider whose `UserPromptSubmit` hook delivers the standard payload (JSON on stdin including at least `cwd`) and accepts the standard output shape (`hookSpecificOutput.additionalContext` printed as JSON on stdout). Both Claude Code and Codex match this contract today.

### What the hook does

1. Reads JSON from stdin.
2. Resolves the git common dir from `cwd`. If not inside a git repository, exits 0 silently.
3. Iterates `<common-dir>/agents/sessions/*/SESSION.md` and finds the one with `status: active` whose `worktree:` frontmatter field matches the current `cwd` (cwd equals the worktree path or is a descendant of it). If none matches, exits 0 silently.
4. Counts files in `<common-dir>/agents/messages/*.md` whose `to:` frontmatter equals the active slug and which have no `.read` sibling.
5. If any are found, prints a JSON document with `hookSpecificOutput.additionalContext` summarizing count, blocking / high-priority breakdown, and senders. Exits 0.
6. Wrapped in a top-level `except` so any unexpected error exits 0 — the hook must never block a user prompt because of its own bugs.

### Activating the hook

Mark the script executable once: `chmod +x <skill-dir>/inbox-check-hook.py`. Then configure your provider to invoke it on `UserPromptSubmit`.

**Claude Code** — add to `.claude/settings.local.json` (per-user; should be gitignored in any project that adopts this skill) or `.claude/settings.json` (project-shared):

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PROJECT_DIR}/<path-to-skill>/inbox-check-hook.py",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

Schema reference: `code.claude.com/docs/en/hooks`.

**Codex (OpenAI CLI)** — add to `.codex/hooks.json` at the repo root (project-shared) or `~/.codex/hooks.json` (user-global):

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "/absolute/path/to/<skill-dir>/inbox-check-hook.py",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

Codex resolves `command` through the shell. There is no `CLAUDE_PROJECT_DIR` equivalent; use an absolute path or a shell expression your environment can resolve. Codex hooks may also live inline under `[hooks]` in `~/.codex/config.toml` or `.codex/config.toml`.

Schema reference: `developers.openai.com/codex/hooks`.

**Other providers** — if your provider exposes a `UserPromptSubmit`-equivalent lifecycle hook that delivers `cwd` on stdin and accepts `hookSpecificOutput.additionalContext` on stdout, the same script works. If not, fall back to the pull-at-checkpoint model. The bundled script only reads `cwd` from stdin and ignores all other fields, so additive payload changes from any provider do not break it.

### Authoring a hook for a new provider

If a provider does not yet have a documented `UserPromptSubmit` hook, the same logic can be ported as long as the provider exposes some pre-turn or post-turn lifecycle event that:

- Passes the current working directory to the script (so it can resolve the git common dir), and
- Has any mechanism to surface text to the model on the next turn (developer-message injection, system-reminder, additional-context, or even visible terminal output the user can paste).

The minimal contract the script depends on is `cwd` in stdin JSON. Adapting the output for a different provider means changing only the `print(json.dumps(...))` block to whatever shape that provider expects (plain text on stdout works for many providers, including both Claude Code and Codex on `UserPromptSubmit` and `SessionStart`).

## Provider-specific notes (non-hook)

### Worktree placement

Each provider has its own default location for worktrees it creates itself:

- **Claude Code** — `.claude/worktrees/<name>/` (currently hardcoded; configurable via the `WorktreeCreate` lifecycle hook).
- **Codex** — wherever the user runs `git worktree add` (no default enforced).
- **Cursor** — typically `.cursor/worktrees/`, configurable.

This skill does not care which path is used. The coordination layer lives in `$(git rev-parse --git-common-dir)/agents/` and is shared across all worktrees of the same repository regardless of where they sit on disk. Add the relevant `worktrees/` paths to `.gitignore` defensively.

### Cursor task list (orthogonal)

Cursor maintains an in-product task list at `.cursor/worktrees.json`. That system is product-specific and orthogonal to this protocol. Use this skill for cross-product coordination; use Cursor's internal list for in-product orchestration if relevant.

### Human CLI

A human running `git worktree add` and writing `SESSION.md` and message files by hand follows the same protocol. The skill is designed to read just as well to a person.

## Limitations and known gaps

- **No synchronous delivery.** Messages are dropped into a shared filesystem; the recipient sees them at next pull. If a question must be answered now, escalate to a human.
- **No automatic ownership of files.** Two sessions claiming write on the same path will still race at merge time. The skill surfaces the conflict via `list`; resolution is editorial.
- **No cross-machine coordination.** `.git/` is per-clone. If two maintainers on two machines run parallel sessions, this skill does not synchronize between them.
- **Read state is best-effort.** If an agent crashes mid-read, the `.read` sibling may not be written. Recipients should be robust to seeing the same message twice.
- **No port / database / env-var isolation.** Out of scope. Worktree gives filesystem isolation only; runtime isolation is a separate concern.

## Versioning

**v0** — initial release. Skill is intentionally minimal. Refine the conventions after real use, especially:
- The quality rules: tighten or loosen based on observed false positives (useless messages) and false negatives (missing notices that caused conflicts).
- The reference hook: extend payload-field usage if a new provider requires it; harden the frontmatter parser if real-world `SESSION.md` content exposes corner cases.
- The action list: add `escalate`, `merge-status`, or other actions when a real workflow demands them.

Document changes in a `## History` section at the bottom of this file, one bullet per real session that taught the skill something.

## History

- **2026-05-25 · sesión `bloque-e` (Claude Code)** — Primera sesión real con el protocolo. Tres aprendizajes operativos para Claude Code:

  1. **El Bash tool siempre arranca desde el worktree principal, no desde el worktree activo.** El CWD del Bash tool se resetea al directorio raíz del repo en cada llamada. `cd /ruta/worktree && git add <ficheros>` funciona dentro de una sola llamada, pero la siguiente llamada vuelve a arrancar desde el repo principal. Patrón fiable: usar `git -C <ruta-worktree> add <ficheros>` para que el contexto sea explícito, o encadenar todas las operaciones del worktree en una sola llamada Bash. Sin este cuidado, un `git add` aparentemente "en el worktree" toca el index del repo principal y rompe el aislamiento.

  2. **`package.json` y lockfile llegan a main vía el merge, no vía `pnpm add` en el worktree.** Si la sesión ejecuta `pnpm add X` dentro del worktree, los cambios quedan aislados en esa rama. Cuando `git merge session/<slug> --ff-only` los trae a main, hay que correr `pnpm install` en el working tree principal para sincronizar `node_modules` antes de arrancar el servidor de dev. Sin este paso el servidor no encuentra el nuevo paquete.

  3. **Flujo de merge que funcionó:** (a) desde el worktree: `git -C <ruta-worktree> add <rutas-explícitas> && git -C <ruta-worktree> commit -m "..."`, (b) desde main: `git merge session/<slug> --ff-only`. El flag `--ff-only` es la red de seguridad: si main ha avanzado mientras, el merge falla ruidosamente en lugar de crear un merge commit silencioso.
