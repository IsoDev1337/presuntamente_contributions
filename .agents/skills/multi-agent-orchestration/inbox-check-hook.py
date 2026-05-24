#!/usr/bin/env python3
"""
multi-agent-orchestration UserPromptSubmit hook.

Detects the active session matching the current worktree, counts unread
messages addressed to that session in the shared coordination layer
(.git/agents/messages/), and injects a notification into additionalContext
so the agent sees it on the next model turn.

Exits 0 silently when:
  - not inside a git repository
  - no SESSION.md matches the current worktree
  - no unread messages for the active session

On any unexpected error, exits 0 without output (hook must never block
prompts due to its own bugs). All implementation lives in Python stdlib;
no external deps.
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from pathlib import Path


FRONTMATTER_RE = re.compile(r"^---\s*\n(.*?)\n---", re.DOTALL)


def parse_frontmatter(path: Path) -> dict:
    try:
        content = path.read_text(encoding="utf-8")
    except OSError:
        return {}
    match = FRONTMATTER_RE.match(content)
    if not match:
        return {}
    result: dict = {}
    for raw in match.group(1).splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or ":" not in line:
            continue
        key, _, value = line.partition(":")
        key = key.strip()
        value = value.strip()
        if value.startswith('"') and value.endswith('"'):
            value = value[1:-1]
        elif value.startswith("'") and value.endswith("'"):
            value = value[1:-1]
        value = re.sub(r"\s+←.*$", "", value).strip()
        result[key] = value
    return result


def find_active_session(sessions_dir: Path, cwd: Path) -> str | None:
    if not sessions_dir.is_dir():
        return None
    for entry in sessions_dir.iterdir():
        session_md = entry / "SESSION.md"
        if not session_md.is_file():
            continue
        fm = parse_frontmatter(session_md)
        if fm.get("status") != "active":
            continue
        worktree_raw = fm.get("worktree", "")
        if not worktree_raw:
            continue
        try:
            wt = Path(worktree_raw).expanduser().resolve()
        except (OSError, RuntimeError):
            continue
        if cwd == wt or wt in cwd.parents:
            return fm.get("slug") or entry.name
    return None


def count_unread(messages_dir: Path, slug: str) -> list[dict]:
    if not messages_dir.is_dir():
        return []
    unread: list[dict] = []
    for msg in messages_dir.glob("*.md"):
        read_marker = msg.parent / f"{msg.stem}.read"
        if read_marker.exists():
            continue
        fm = parse_frontmatter(msg)
        if fm.get("to") != slug:
            continue
        unread.append({
            "id": fm.get("id", msg.stem),
            "from": fm.get("from", "?"),
            "type": fm.get("type", "?"),
            "priority": fm.get("priority", "normal"),
        })
    return unread


def main() -> None:
    try:
        payload = json.load(sys.stdin)
    except (json.JSONDecodeError, ValueError):
        sys.exit(0)

    cwd_raw = payload.get("cwd") or os.getcwd()
    cwd = Path(cwd_raw).resolve()

    try:
        common_dir_raw = subprocess.check_output(
            ["git", "rev-parse", "--git-common-dir"],
            cwd=str(cwd),
            stderr=subprocess.DEVNULL,
            timeout=3,
        ).decode().strip()
    except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired):
        sys.exit(0)

    common_dir = Path(common_dir_raw)
    if not common_dir.is_absolute():
        common_dir = (cwd / common_dir).resolve()

    agents_dir = common_dir / "agents"
    slug = find_active_session(agents_dir / "sessions", cwd)
    if not slug:
        sys.exit(0)

    unread = count_unread(agents_dir / "messages", slug)
    if not unread:
        sys.exit(0)

    blocking = [m for m in unread if m["priority"] == "blocking"]
    high = [m for m in unread if m["priority"] == "high"]

    lines = [
        f"📬 {len(unread)} unread agent message(s) for session `{slug}`."
    ]
    if blocking:
        lines.append(f"   {len(blocking)} marked **blocking** — address before continuing.")
    if high:
        lines.append(f"   {len(high)} marked high priority.")
    senders = sorted({m["from"] for m in unread})
    if senders:
        lines.append(f"   From: {', '.join(senders)}.")
    lines.append("Run `/multi-agent-orchestration inbox` to read them.")

    output = {
        "hookSpecificOutput": {
            "hookEventName": "UserPromptSubmit",
            "additionalContext": "\n".join(lines),
        }
    }
    print(json.dumps(output))
    sys.exit(0)


if __name__ == "__main__":
    try:
        main()
    except Exception:
        sys.exit(0)
