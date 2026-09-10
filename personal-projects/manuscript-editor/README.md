# AI Manuscript Editor

Full-stack web app for getting an AI editorial pass on a long manuscript. Upload a `.docx` or `.txt` file, and it splits the manuscript into chapters, learns the author's voice, runs a chapter-by-chapter editorial analysis that stays continuity-aware across the whole book, checks the overall structure against the Save the Cat beat sheet, and lets you review every suggestion — copyedit, line edit, continuity, or structure — in a side-by-side panel before exporting the revised manuscript as a clean `.docx`.

## Why I built it

I write fiction, and the expensive problem with a book-length draft is editing. It's also a nuanced skill that involves
looking at story structure, analyzing a plot consistency across characters, as well as spelling and grammar and type-os 
that can happen. A big part of this build was ensuring there was enough memory to look at the full context of a novel. 
Another layer to this is ensuring a writer's unique voice also drives how edits are suggested. 
## Features

- **Upload & chapter chunking** — accepts `.docx` (parsed with `mammoth`) or `.txt`. Splits on detected chapter/part/book headings, falling back to fixed-length chunks (~3,500 words) for unstructured text.
- **Voice Profile pass** — a one-time analysis of the manuscript's opening chapter that fingerprints point of view, tense, tone, sentence rhythm, vocabulary level, dialogue style, and recurring quirks. This profile is passed into every later analysis call so suggestions match the author's actual voice instead of generic "correct" prose.
- **Per-chapter analysis with a living story bible** — each chapter is analyzed in order with an evolving JSON "story bible" (characters, timeline, recurring objects/props, world rules) carried forward from the previous chapters, so continuity issues (a character in two places at once, a broken timeline, a mentioned-then-forgotten object) get caught across the whole manuscript, not just within a single chapter.
- **Whole-manuscript structural pass** — after every chapter is analyzed, one final pass checks the manuscript's chapter summaries against the 15 standard Save the Cat story beats and flags structural gaps.
- **Suggestion review panel** — suggestions are grouped by category (copyedit / line edit / continuity / structure) and severity (low / medium / high). Each card shows the excerpt, the issue, the proposed fix, and the rationale. Clicking a card scrolls the manuscript pane and highlights the exact passage it refers to.
- **Accept / reject / edit inline** — accepting a suggestion performs a targeted find-and-replace of just that excerpt in the chapter's stored text (the rest of the chapter is untouched). You can also edit a suggestion's replacement text before accepting it, or reject it outright. A live counter tracks progress (e.g. "42 of 118 resolved").
- **Resilient processing** — chapters are analyzed sequentially with progress shown in the UI ("Analyzing chapter 14 of 32"), not a blocking spinner. If an LLM call fails, that chapter is retried automatically (3 attempts with backoff); if it still fails, the chapter is marked with an error and a manual retry button, and the rest of the manuscript keeps processing.
- **Resume anytime** — the voice profile, story bible, and all suggestions are stored in the database, so you can close the tab mid-analysis and pick up where you left off from the home page.
- **Export to .docx** — reassembles all chapters (with every accepted/edited change merged in) into a single downloadable Word document with chapter headings and paragraph breaks preserved.
- **Light & dark mode** with a warm, literary visual theme (parchment/cream surfaces, ink-charcoal text, a burgundy accent evoking red-pen editorial marks).

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Wouter (routing)
- **Backend:** Node.js, Express, TypeScript
- **Database:** SQLite via Drizzle ORM (`better-sqlite3`) — a drop-in substitute for the Postgres setup described in the original spec; the schema and query layer are Postgres-portable if you want to swap it in later
- **AI:** Long-context Gemini model, called server-side only via the OpenAI-compatible Responses API (never exposed to the browser)
- **Document handling:** `mammoth` (`.docx` → text on upload), `docx` (text → `.docx` on export), `multer` (file uploads)

## Project Structure

```
manuscript-editor/
├── client/               # React frontend
│   └── src/
│       ├── pages/        # Home (upload/library) and Workspace (editor + review panel)
│       ├── components/   # SuggestionCard, ManuscriptReader, ThemeToggle, shadcn/ui primitives
│       └── lib/           # API client, shared types
├── server/
│   ├── index.ts          # Express app entry point
│   ├── routes.ts         # REST API routes
│   ├── storage.ts        # Database access layer (Drizzle)
│   ├── docParser.ts       # .docx/.txt extraction + chapter chunking
│   ├── llm.ts             # LLM client + JSON-mode helper with retries
│   ├── pipeline.ts        # Orchestrates voice profile → per-chapter → structural passes
│   └── docExport.ts       # Builds the exported .docx
├── shared/
│   └── schema.ts          # Drizzle table definitions (manuscripts, chapters, suggestions)
└── script/build.ts        # Production build script
```

## Getting Started

### Prerequisites

- Node.js 20+
- An API key for a long-context LLM (the app is wired for Gemini via an OpenAI-compatible endpoint)

### Install

```bash
npm install
```

### Configure environment variables

```bash
OPENAI_API_KEY=your-api-key
OPENAI_BASE_URL=https://your-openai-compatible-endpoint/v1
```

### Run in development

```bash
npm run dev
```

The app serves both the API and the frontend on `http://localhost:5000`.

### Build & run in production

```bash
npm run build
npm start
```

### Other scripts

```bash
npm run check     # TypeScript type-check
npm run db:push   # Push the Drizzle schema to the database
```

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/manuscripts` | Upload a `.docx`/`.txt` file, chunk it into chapters, and kick off the analysis pipeline |
| `GET` | `/api/manuscripts` | List all manuscripts |
| `GET` | `/api/manuscripts/:id` | Get a manuscript's status and progress |
| `GET` | `/api/manuscripts/:id/chapters` | List a manuscript's chapters and their current text |
| `GET` | `/api/manuscripts/:id/suggestions` | List all suggestions for a manuscript |
| `PATCH` | `/api/suggestions/:id` | Accept, reject, or edit a suggestion (`{ action: "accept" \| "reject" \| "edit", editedText? }`) |
| `POST` | `/api/chapters/:id/retry` | Re-run analysis for a single failed chapter |
| `GET` | `/api/manuscripts/:id/export` | Download the revised manuscript as a `.docx` |

## Known Limitations (v1)

- No multi-user collaboration or shared editing — one manuscript, one editor session.
- No version history beyond the current accepted/rejected/edited state of each suggestion.
- Only `.docx` and `.txt` are supported on upload; export is `.docx` only.
- If a suggestion's excerpt no longer matches the chapter text (e.g. it was already changed by an earlier edit), acceptance is marked resolved but the text replacement is skipped rather than guessed at.
- The review workspace's split-pane layout is optimized for desktop; on narrow mobile screens the manuscript pane and suggestion panel don't fit side by side.
