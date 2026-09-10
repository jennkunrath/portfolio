# Claude Skills

Backup and reference copies of the Claude Skills I've built.

A Skill is a folder containing a `SKILL.md` — YAML frontmatter (`name`, `description`) plus
instructions in the body — and optionally `references/`, `assets/`, and `scripts/`. The
`description` is what decides when the skill fires, so most of the engineering effort goes there.

## Index

| Skill | What it does |
|---|---|
| [`sugar-boost`](./sugar-boost) | A pasteable candy-themed prompt block that injects energy into a thread gone flat, cutting jargon and hedging without cutting accuracy. |

## Related

[`../agent-patterns`](../agent-patterns) holds a write-up of the architecture patterns I converged
on across a production agent library, plus four reference skills that each demonstrate one pattern.

## Using one

Drop the skill folder into your Claude skills directory, or upload it through the Skills
interface in Claude. Skills are portable — the folder is the entire unit.
