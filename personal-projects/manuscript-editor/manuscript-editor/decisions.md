# 📁 DECISIONS — Manuscriptly (AI Manuscript Editor)

This document is the decision log for Manuscriptly. It tracks architectural, product, and editorial decisions that have already been settled, the specific rationale behind them, the alternatives that were considered and rejected, and whether each decision is locked or open to future revisit.

> **AI Collaborator Rule**: Do NOT propose reopening settled decisions marked as **Final** unless explicitly asked by the author. Use this log to keep development focused and prevent going in circles across sessions.

---

## Decision Log

### DEC-001: SQLite via Drizzle ORM instead of Hosted PostgreSQL

- **Status**: Final for v1 (Revisitable for v2 multi-user cloud sync)
- **Decision**: Use a local file-based SQLite database (`better-sqlite3`) managed through Drizzle ORM.
- **Why**: 
  - Zero-friction developer and user experience: runs locally without Docker, external background processes, or cloud database credentials.
  - Keeps manuscripts, story bibles, and suggestion states private and local to the user's machine.
  - Drizzle ORM maintains schema parity; migrating to PostgreSQL later requires changing the connection client, not the schema or queries.
- **Options Rejected**:
  - *Supabase / Managed PostgreSQL*: Unnecessary network latency, cloud dependency, and operational overhead for a single-user writing tool.
  - *Local Docker PostgreSQL*: High setup friction for non-technical users and unnecessary resource footprint.
- **When to Revisit**: When building v2 multi-user collaboration or multi-device cloud synchronization.

---

### DEC-002: Surgical In-Place Find-and-Replace vs. Full-Chapter AI Rewriting

- **Status**: Final (Core Product Philosophy)
- **Decision**: Suggestions must target specific excerpt strings and execute surgical string replacements upon user acceptance. Full-chapter or multi-paragraph LLM regenerations are strictly prohibited.
- **Why**:
  - Fiction authors value sentence rhythm, idiosyncratic phrasing, and craft. Full-chapter LLM rewrites inevitably introduce unsolicited edits, flatten metaphors, and hallucinate subtle narrative changes.
  - Authors must retain full agency and granular control over every punctuation mark and line edit.
  - Diff tracking and localized replacements minimize blast radius and avoid unintended edits.
- **Options Rejected**:
  - *"Rewrite Chapter" in-place streaming*: Destroys author voice and obscures what changed.
  - *"Accept All" bulk replacement*: Encourages unexamined acceptance of AI suggestions.
- **When to Revisit**: Never. This is a foundational design principle.

---

### DEC-003: Sequential Evolving JSON Story Bible vs. Vector Database / RAG

- **Status**: Final (Architecture Core)
- **Decision**: Maintain a structured JSON "story bible" (tracking characters, chronological timeline, props/recurring items, and world rules) that is updated chapter-by-chapter and forwarded sequentially.
- **Why**:
  - Narrative continuity is inherently chronological and stateful. A character who dies in Chapter 4 cannot appear in Chapter 7; an item lost in Chapter 2 cannot be held in Chapter 3.
  - Vector similarity search (RAG) retrieves semantically similar passages regardless of timeline order, completely missing chronological continuity breaks and state mutations.
  - Structured JSON state allows deterministic inspection and low-token forwarding into the next chapter's LLM context.
- **Options Rejected**:
  - *Vector embeddings (Pinecone/Chroma/Faiss)*: Semantic similarity does not equal chronological narrative consistency.
  - *All-in-one mega-prompt*: Passing an entire 80k-word novel in a single prompt for continuity analysis leads to attention dilution and missed details.
- **When to Revisit**: Only if supplementing the story bible with semantic search for non-chronological lore lookups in very large fantasy/sci-fi worldbuilding projects.

---

### DEC-004: Long-Context Gemini via Server-Side OpenAI-Compatible Responses API

- **Status**: Final
- **Decision**: Route all AI analysis calls through the Express backend using Gemini's long-context model via the OpenAI-compatible Responses endpoint.
- **Why**:
  - Gemini's massive context window comfortably handles the author's Voice Profile, cumulative Story Bible, chapter text, and editorial system instructions simultaneously without truncation.
  - Calling the API server-side protects user API keys and keeps client-side bundles lightweight and secure.
  - OpenAI compatibility standardizes the schema and keeps the pipeline model-agnostic if alternative foundation models are benchmarked.
- **Options Rejected**:
  - *Client-side browser LLM calls*: Security vulnerability (exposes API keys) and poor reliability.
  - *Short-context models (8k–32k)*: Require aggressive truncation or lossy summarization of the voice profile and story bible.
- **When to Revisit**: Re-evaluate if specialized, fine-tuned fiction editing models emerge with equal context windows and superior voice adherence.

---

### DEC-005: Blake Snyder's 15 Save the Cat! Beats for Macro Structural Review

- **Status**: Final for v1 fiction (Revisitable for genre-specific frameworks in v1.2)
- **Decision**: Standardize whole-manuscript pacing and structural evaluation on Blake Snyder's 15 *Save the Cat!* beat sheet milestones (Opening Image, Catalyst, Debate, Break into Two, B Story, Fun and Games, Midpoint, Bad Guys Close In, All Hope Is Lost, Dark Night of the Soul, Break into Three, Finale, Final Image).
- **Why**:
  - Industry-standard framework for commercial fiction and screenwriting with clear, measurable milestone proportions.
  - Provides objective pacing diagnostics (e.g., whether the Midpoint arrives too early or the Dark Night of the Soul is truncated) derived from chapter summaries.
- **Options Rejected**:
  - *Freytag's Pyramid*: Too high-level and generic to provide actionable developmental suggestions.
  - *Dan Harmon's Story Circle*: Better suited for episodic short fiction than full-length novels.
- **When to Revisit**: In v1.2, allow authors to select alternative story architectures (e.g., The Hero's Journey, 7-Point Story Structure, Three-Act / Nine-Block, or custom beat templates).

---

### DEC-006: Warm Literary Aesthetic (Parchment, Charcoal & Burgundy)

- **Status**: Final
- **Decision**: Apply a warm, literary visual theme (parchment/cream surfaces, ink-charcoal text, burgundy accents reminiscent of an editorial red pen) using Tailwind CSS and shadcn/ui.
- **Why**:
  - Creative writers spend hours reading and reviewing drafts. Cold, high-contrast blues, purples, and neon accents typical of SaaS dashboards cause visual fatigue and emotional disconnect from the writing craft.
  - The tactile, book-like aesthetic reinforces the editorial environment and respects the literary medium.
- **Options Rejected**:
  - *Standard enterprise SaaS UI (Inter font, slate blues, gray cards)*: Feels like Jira or a spreadsheet rather than a book workspace.
  - *Pure monochrome / brutalist*: Lacks editorial warmth and hierarchy.
- **When to Revisit**: Settled.

---

### DEC-007: Wouter & TanStack Query for Frontend Architecture

- **Status**: Final
- **Decision**: Use Wouter for client-side routing and TanStack Query for API state management.
- **Why**:
  - The application has only two primary views (Home/Library and Workspace/Editor). Wouter provides featherweight routing (<1.5KB) without the boilerplate of React Router.
  - TanStack Query provides robust cache invalidation, background polling for sequential chapter analysis progress, and optimistic UI updates for suggestion resolution.
- **Options Rejected**:
  - *React Router v6/v7*: Excessive bundle weight and complexity for a two-route interface.
  - *Redux / Zustand*: Unnecessary global state; server state in TanStack Query handles all active manuscript data cleanly.
- **When to Revisit**: Settled for current SPA architecture.
