# ⛳ PROGRESS — Manuscriptly (AI Manuscript Editor)

This document is the dated project diary for Manuscriptly. It tracks the chronological evolution of the build, recording what was worked on, what changed, what technical experiments succeeded or failed, and what comes next.

---

## 📅 2026-09-12 — Standalone Desktop Build & Obsidian Project Memory Integration

- **Worked on**:
  - Exported and finalized the production web client bundle (`Manuscriptly — Manuscript Editor`) on the Desktop.
  - Verified `.docx` export pipeline with formatted headings and paragraph preservation.
  - Established project memory architecture following the 4-file Obsidian standard (`README.md`, `STATUS.md`, `progress.md`, `decisions.md`).
- **What changed**:
  - Transitioned from the early development working title (*Marginalia*) to the polished name **Manuscriptly**.
  - Documented core decisions, architectural trade-offs, and operational guidelines for future AI development sessions.
- **What worked**:
  - Clean client-side rendering with fast initial load and bundled Google Fonts (Source Serif 4, Libre Baskerville, JetBrains Mono, Inter).
  - Rapid state hydration from SQLite backend via TanStack Query.
- **What didn't**:
  - Observed that if an author accepts a suggestion that modifies paragraph text, subsequent suggestions in that same paragraph may fail string matching. Flagged as the primary technical item for review in `STATUS.md`.
- **What's next**:
  - Perform live benchmark on a full novel manuscript draft (50,000+ words).
  - Test story bible accuracy across 20+ sequential chapter passes.

---

## 📅 2026-09-11 — Editorial Pipeline Orchestration & Split-Pane Review Workspace

- **Worked on**:
  - Integrated Gemini long-context model via the OpenAI-compatible Responses API endpoint.
  - Built the sequential analysis pipeline in `server/pipeline.ts` with exponential backoff and retry handling.
  - Built the desktop split-pane UI: left pane for reading the manuscript text with interactive excerpt highlights; right pane for categorized suggestion cards.
  - Implemented the inline acceptance mechanic (accept, edit replacement text, or reject).
- **What changed**:
  - Replaced blocking full-manuscript analysis spinners with a sequential progress indicator showing real-time chapter status ("Analyzing chapter 14 of 32").
  - Implemented automatic retry (up to 3 attempts with exponential backoff) with a manual retry fallback if a chapter analysis fails.
- **What worked**:
  - Surgical string replacement cleanly modifies only the target excerpt, leaving the rest of the chapter completely untouched.
  - Categorization into Copyedit, Line Edit, Continuity, and Structure provides clear mental separation for the author during revisions.
- **What didn't**:
  - Experimented with streaming AI rewrites for full chapters; rejected immediately because the LLM hallucinated unwanted sentence modifications and eroded the author's voice.
- **What's next**:
  - Finalize production build scripts and compile assets.

---

## 📅 2026-09-10 — Ingestion, Parser & SQLite Persistence

- **Worked on**:
  - Built document parser in `server/docParser.ts` supporting `.docx` (via `mammoth`) and `.txt` files.
  - Configured Drizzle ORM schema (`shared/schema.ts`) for manuscripts, chapters, suggestions, and voice profiles.
  - Configured SQLite with `better-sqlite3` as the default local persistence layer.
- **What changed**:
  - Replaced original PostgreSQL deployment plan with zero-config local SQLite to make the editor completely self-contained on the desktop.
- **What worked**:
  - Regex-based chapter splitting accurately detects common chapter headings (`Chapter 1`, `Part II`, `Act One`, markdown `#` headings).
  - Preserved Drizzle schema compatibility so moving to PostgreSQL later requires zero schema rewrites.
- **What didn't**:
  - Pure regex splitting failed on manuscripts without standard chapter headers. Implemented a fallback chunker that segments unstructured text into ~3,500-word logical chunks.
- **What's next**:
  - Implement Voice Profiling and Story Bible schemas in the LLM pipeline.

---

## 📅 2026-09-08 — Conceptual Architecture & Story Bible Design

- **Worked on**:
  - Defined product scope and core differentiators: tackling the expensive, nuanced problem of editing book-length fiction.
  - Formulated the two primary technical innovations:
    1. **Voice Profile Pass**: Fingerprinting the author's distinctive style from Chapter 1 so all suggestions emulate the author rather than generic prose.
    2. **Living Story Bible**: Sequential state tracking (characters, timeline, props, world rules) to catch cross-chapter continuity errors.
  - Selected Blake Snyder's *Save the Cat!* 15-beat structure for macro-level narrative pacing diagnostics.
- **What changed**:
  - Scoped project strictly to fiction authors and novelists requiring deep continuity and voice preservation.
- **What worked**:
  - Formulating the Story Bible as a sequential JSON object passed chapter-to-chapter rather than relying on unordered vector searches.
- **What didn't**:
  - Evaluated vector databases (RAG) for continuity; discovered that vector retrieval is non-chronological and misses critical timeline discrepancies (e.g. character deaths or item transfers).
- **What's next**:
  - Build ingestion parser and data model.
