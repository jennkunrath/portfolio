# 🧠 Manuscriptly (AI Manuscript Editor)

> **Stable Overview & Project Memory**: This document stores the long-term context, core mission, constraints, and operational guidance for Manuscriptly. It is designed to help both human developers and AI collaborators immediately understand the project's background, architectural philosophy, and boundaries before doing any work. It should only change when the broader project direction changes.

---

## 📖 Executive Overview

**Manuscriptly** (formerly known under the working title *Marginalia*) is a full-stack, local-first web application engineered to perform a comprehensive, continuity-aware editorial pass on book-length fiction manuscripts. 

An author uploads a `.docx` or `.txt` file. The application parses and chunks the manuscript into chapters, performs a one-time **Voice Profile analysis** on the opening chapter, executes a sequential chapter-by-chapter editorial analysis powered by an evolving **Living Story Bible**, and runs a whole-manuscript structural evaluation against the **Save the Cat! 15-beat sheet**. 

Authors review every suggestion—categorized by Copyedit, Line Edit, Continuity, and Structure—in an interactive split-pane workspace where they can accept, reject, or edit proposed text inline before exporting the finished book as a clean, professionally formatted `.docx`.

---

## 💡 Why It Matters & Why I Built It

As a fiction writer, the single most expensive, exhausting, and nuanced phase of writing a book is revision. High-quality editing is not just spellcheck; it operates across multiple interconnected cognitive layers:
1. **Macro Structure**: Does the pacing work? Are narrative milestones hit in proportion?
2. **Long-Horizon Continuity**: Did a character change eye color in Chapter 7? Did someone leave a coat in a car in Chapter 2 and pull keys from it in Chapter 9? Is someone in two places at once?
3. **Voice & Style**: Does the prose have distinctive cadence, tone, and character vocabulary, or does it sound like a sterile textbook?
4. **Micro Line Editing**: Pacing within paragraphs, dialogue tags, flow, and grammatical precision.

Existing AI tools fail novelists in two catastrophic ways:
- **Context Amnesia**: They evaluate one chapter in isolation, missing narrative arcs, foreshadowing, and cross-chapter continuity discrepancies.
- **Voice Homogenization**: They replace distinctive authorial voice, quirky rhythms, and deliberate stylistic choices with bland, generic "AI corporate prose."

Manuscriptly was designed to solve both problems: using long-context AI to maintain an evolving story bible across the entire book, while strictly anchoring every suggestion to the author's unique voice profile.

---

## 👥 Who It Is For

- **Fiction Writers & Novelists**: Authors with complete first or second drafts (50k–100k+ words) preparing for developmental and line revisions.
- **Self-Publishing Authors**: Writers seeking professional-grade continuity checking, pacing analysis, and proofreading prior to formatting and distribution.
- **Developmental Editors**: Professional editors looking for a high-leverage assistant to catch timeline contradictions and track story bibles during client passes.

---

## 🤖 How AI Should Help

When working on this project as an AI collaborator:
- **Editorial Tone**: Act as a seasoned developmental and line editor who respects the author's voice above all else. Never suggest "fixes" that sanitize deliberate stylistic flourishes, dialect, or unconventional rhythm into generic English.
- **Engineering Mindset**: Prioritize **non-destructive workflows**, data privacy (local SQLite storage), deterministic JSON schema outputs, and robust error recovery over flashy or unpredictable features.
- **Surgical Changes**: When proposing code or prompt changes, ensure that replacements remain granular excerpts rather than full-chapter regenerations.
- **Respect Settled Decisions**: Consult `decisions.md` before suggesting changes to the database (SQLite vs Postgres), routing, story bible mechanics, or theme.

---

## 🔗 Useful Links & Reference Files

| Resource | Path / Link | Description |
|---|---|---|
| **Live Desktop Build** | `/Users/jenn/Desktop/Manuscriptly — Manuscript Editor` | Standalone compiled client bundle (`index.html` + assets) |
| **Project Source** | `/Users/jenn/Desktop/portfolio-main/personal-projects/manuscript-editor` | Main project repository within developer portfolio |
| **Current Status** | `STATUS.md` | Active sprint snapshot, completed tasks, open backlog, and blockers |
| **Project Diary** | `progress.md` | Chronological log of build milestones, tests, and findings |
| **Decision Log** | `decisions.md` | Settled architecture choices, rejected options, and revisit triggers |
| **Portfolio Hub** | `/Users/jenn/Desktop/portfolio-main/README.md` | Jenn Kunrath's overarching solutions engineering & AI portfolio |

---

## 🎨 Design Constraints & Tone Notes

- **Warm Literary Aesthetic**: The interface uses cream/parchment surfaces (`#FDFBF7`, `#F7F4EE`), deep ink-charcoal text (`#2A2723`), and a rich burgundy accent (`#800020` / `#9E2A2B`) reminiscent of a physical editorial red pencil. Avoid cold blue enterprise SaaS palettes.
- **Desktop-First Ergonomics**: The workspace requires a side-by-side split pane (manuscript text on the left, interactive suggestion cards on the right). Reviewing a 300-page book is intensive desktop work.
- **Non-Destructive Guarantee**: Accepting a suggestion must only modify the targeted excerpt string. The remaining text of the chapter must remain byte-for-byte untouched.

---

## 🛠️ Technical Architecture & Core Features

### 1. Ingestion & Chapter Chunking
- Ingests `.docx` (parsed via `mammoth`) or `.txt` files.
- Automatically splits manuscripts using regex patterns for chapter headings (`Chapter \d+`, `Part [IVXLCDM]+`, `Act \w+`, markdown headers).
- Includes a fallback sliding chunker (~3,500 words) for unformatted text drafts.

### 2. Voice Profile Pass
- Analyzes Chapter 1 before any edits are proposed.
- Fingerprints:
  - Narrative Point of View (POV) & Tense
  - Tone & Atmosphere
  - Sentence Rhythm & Length Variance
  - Vocabulary Complexity
  - Dialogue Style & Tag Preferences
  - Recurring Authorial Quirks
- The resulting Voice Profile JSON is injected into every subsequent chapter prompt to ensure suggestions match the author's voice.

### 3. Per-Chapter Analysis with Living Story Bible
- Chapters are analyzed sequentially.
- An evolving JSON **Story Bible** is carried forward through each chapter, tracking:
  - **Characters**: Status, physical descriptions, locations, known relationships.
  - **Timeline**: Current story date/time, elapsed time, sequence of events.
  - **Props & Objects**: Ownership and locations of critical recurring items.
  - **World Rules**: Established magic, technology, or lore constraints.
- Catches cross-chapter continuity errors (e.g., character timeline conflicts, forgotten injuries, disappearing items).

### 4. Macro Structural Pass (Save the Cat!)
- Runs after all chapters are analyzed.
- Evaluates chapter summaries against Blake Snyder's 15 standard *Save the Cat!* narrative beats:
  1. Opening Image | 2. Theme Stated | 3. Set-up | 4. Catalyst | 5. Debate | 6. Break into Two | 7. B Story | 8. Fun and Games | 9. Midpoint | 10. Bad Guys Close In | 11. All Hope Is Lost | 12. Dark Night of the Soul | 13. Break into Three | 14. Finale | 15. Final Image.
- Flags structural anomalies (e.g., missing midpoint shift, premature climax, dragging second act).

### 5. Review Workspace & Inline Actions
- Side-by-side synchronized view: clicking a suggestion card scrolls to and highlights the target passage.
- Suggestions categorized into **Copyedit**, **Line Edit**, **Continuity**, and **Structure** with **Low**, **Medium**, and **High** severity flags.
- Three user actions per card:
  - **Accept**: Executes surgical find-and-replace of the excerpt.
  - **Edit**: Allows modifying the replacement text before applying.
  - **Reject**: Dismisses the card without touching chapter text.
- Live progress counter tracks resolution metrics (e.g., "42 of 118 resolved").

### 6. Export Pipeline
- Reassembles all modified chapters with accepted changes into a single `.docx` file via the `docx` library, preserving chapter titles and formatting.

---

## 💻 Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Wouter (featherweight routing).
- **Backend**: Node.js, Express, TypeScript.
- **Database**: SQLite via Drizzle ORM (`better-sqlite3`) — local, zero-config, with schema portability to PostgreSQL.
- **AI / LLM**: Long-context Gemini model called server-side via OpenAI-compatible Responses API.
- **Document Handlers**: `mammoth` (DOCX import), `docx` (DOCX generation), `multer` (file uploads).

---

## 📂 Project Directory Structure

```
manuscript-editor/
├── README.md             # Stable project overview & memory (this file)
├── STATUS.md             # Active sprint status, current snapshot & blockers
├── progress.md           # Chronological project diary & experiment log
├── decisions.md          # Settled architectural decisions & rejected options
├── client/               # React frontend source
│   ├── dist/             # Production build distribution
│   └── src/
│       ├── pages/        # Home (Upload/Library) and Workspace (Editor + Review)
│       ├── components/   # SuggestionCard, ManuscriptReader, ThemeToggle
│       └── lib/          # API client, shared types
├── server/               # Express backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # REST API routes
│   ├── storage.ts        # Database access layer (Drizzle ORM)
│   ├── docParser.ts      # DOCX/TXT extraction & chapter chunking
│   ├── llm.ts            # LLM client & JSON-mode parsing with retries
│   ├── pipeline.ts       # Orchestrator (Voice Profile → Story Bible → Structure)
│   └── docExport.ts      # DOCX compilation & download generator
├── shared/
│   └── schema.ts         # Drizzle table schemas (manuscripts, chapters, suggestions)
└── script/build.ts       # Production compilation script
```

---

## 🚦 API Summary

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/manuscripts` | Upload manuscript file, chunk chapters, initialize analysis pipeline |
| `GET` | `/api/manuscripts` | List all saved manuscripts |
| `GET` | `/api/manuscripts/:id` | Get overall manuscript metadata and processing status |
| `GET` | `/api/manuscripts/:id/chapters` | Retrieve chapter breakdown and current text |
| `GET` | `/api/manuscripts/:id/suggestions` | Retrieve all generated editorial suggestions |
| `PATCH` | `/api/suggestions/:id` | Resolve suggestion (`{ action: "accept" \| "reject" \| "edit", editedText? }`) |
| `POST` | `/api/chapters/:id/retry` | Re-trigger analysis for a failed chapter |
| `GET` | `/api/manuscripts/:id/export` | Download finalized revised manuscript as a `.docx` document |

---

## ⚠️ Known Limitations (v1)

1. **Desktop Viewport Only**: Split-pane editorial workspace requires desktop-width displays.
2. **Cascading Edit Replacement**: If a suggestion's excerpt text is modified by an earlier edit in the same paragraph, exact string replacement is skipped to prevent file corruption.
3. **Single Active Session**: Designed as a personal, local author tool; no concurrent multi-user collaboration.
4. **Export Formats**: Ingests `.docx` and `.txt`; exports strictly to `.docx`.
