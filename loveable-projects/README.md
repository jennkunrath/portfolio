# Lovable Projects

Snapshots of apps I've built in [Lovable](https://lovable.dev). The through-line across most of them is an AI API wired into a working interface — retrieval, agent behavior, model comparison, classification — whether the project started as work or as something I just wanted to exist.

This folder is an index and an archive. It is not the live version of anything.

## What's in here, and what isn't

**Point-in-time snapshots.** Each subfolder is an export taken on the date in the index below. The working version of every project lives in Lovable. A snapshot here is frozen the day it lands, so treat the date as the expiration date on anything you read in the code.

**No secrets, ever.** Supabase URLs and anon keys, model API keys, and edge function config stay out of this repo. If a project needs environment variables to run, they belong in a local `.env` that never gets committed. Scan the diff before every commit — Lovable exports can carry config you didn't mean to publish.

**Not a substitute for sync.** Lovable connects a project to its own private GitHub repo through Project settings → Git, and pushes commits as you build. Any project I'm actively working on should be on that path instead of in here. This folder is for the ones that are parked, finished, or worth keeping as reference.

## Index

| Project | Snapshot from |
|---|---|
| Agent Audit Pro | Sep 2026 |
| Workflow Genie | Sep 2026 |
| Workflow Ally | Jul 2026 |
| Adaptive Skill Path | Jun 2026 |
| Iris AI Navigator | Jun 2026 |
| Order Sentinel | Apr 2026 |
| Success Criteria Builder | Mar 2026 |
| Research and Content API | Mar 2026 |
| gpt-oss-explorer | Oct 2025 |
| feline-decoder | Jul 2025 |

## Adding a project

1. Export the project from Lovable.
2. Drop it in a subfolder named after the project, lowercase and hyphenated (`order-sentinel`, not `Order Sentinel`).
3. Add a row to the index above with the month you took the snapshot.
4. Check the diff for keys and `.env` files before you commit.

## Restoring one

Lovable exports to GitHub but does not import from it — there's no path that pushes a snapshot back into the Lovable editor. What you get from this folder is a runnable codebase, not a restored project.

To run one locally: `npm install`, then `npm run dev`. Anything backed by Supabase needs its own project and environment variables before it will do more than render.

If the goal is to keep building in Lovable, rebuild from the prompt history rather than the code, and connect the new project to Git on day one.
