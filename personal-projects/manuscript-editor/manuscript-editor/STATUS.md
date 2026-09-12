# ⏳ STATUS — Manuscriptly (AI Manuscript Editor)

**Current Status**: v1 Prototype & Core Pipeline Completed  
**Last Updated**: 2026-09-12  
**Active Phase**: Verification & Real-World Novel Testing  

---

## 🎯 Current Snapshot

Manuscriptly is currently in a functional v1 prototype state. The full-stack pipeline (voice profiling, sequential story bible continuity analysis, Save the Cat structural evaluation, split-pane suggestion review, and .docx export) is built, styled in a warm literary theme, and verified in both development and standalone production builds.

The immediate priority is running a complete, full-length novel draft (50,000+ words) through the pipeline to evaluate story bible drift, token latency, and suggestion precision under real-world writing conditions.

---

## ✅ Completed (Done)

- [x] **Ingestion & Document Parsing**: Support for `.docx` (via `mammoth`) and `.txt` with automatic heading-based chapter splitting and fallback fixed-length chunking (~3,500 words).
- [x] **Voice Profile Analysis**: One-time initial chapter analysis fingerprinting POV, tense, tone, vocabulary level, sentence rhythm, dialogue style, and narrative quirks.
- [x] **Continuity Engine & Living Story Bible**: Sequential chapter processing that accumulates and passes an evolving JSON story bible (characters, timeline, props, world rules) forward across chapters.
- [x] **Macro Structural Analysis**: Full-manuscript pass checking chapter summaries against Blake Snyder's 15 *Save the Cat!* story beats to surface pacing and plot structure gaps.
- [x] **Split-Pane Review Workspace**: Side-by-side manuscript reader and suggestion panel with category filters (copyedit, line edit, continuity, structure) and severity tags.
- [x] **Surgical In-Place Edits**: Targeted excerpt replacement (accept / edit replacement text / reject) without rewriting unaffected chapter prose; live resolved progress counter.
- [x] **Pipeline Resilience & Session Persistence**: Sequential chapter processing with automatic retry (3 attempts with backoff), manual error recovery, and full state saved to SQLite via Drizzle ORM.
- [x] **Clean Export**: Reassembly of revised chapters with all accepted edits into a clean, formatted `.docx` file.
- [x] **UI & Theme**: Warm literary aesthetic (parchment/cream surfaces, ink-charcoal text, burgundy editorial accents) with full light and dark mode support.

---

## 📋 Open / Backlog

- [ ] **Full-Length Novel Benchmark**: Run a 50k–80k word fiction manuscript through the sequential analyzer to monitor API response times, context limits, and story bible evolution.
- [ ] **Fuzzy Excerpt Matching**: Implement fuzzy diff/substring matching to prevent orphaned suggestions when earlier edits in the same paragraph shift character offsets.
- [ ] **Expanded Structural Frameworks**: Add options for alternative narrative structures (Hero's Journey, 7-Point Story Structure, 3-Act / 8-Sequence) alongside Save the Cat.
- [ ] **Version History & Undo Stack**: Track revision history across suggestion acceptance sessions with revert capabilities.
- [ ] **Mobile/Tablet Review Mode**: Optimize responsive layout so suggestions can be reviewed on smaller screens or tablets.
- [ ] **Multi-User / Cloud Sync (v2)**: Migrate SQLite to hosted PostgreSQL (already schema-portable via Drizzle) if multi-device access or collaboration is needed.

---

## ⚡ Next Best Action

1. **Load Test Manuscript**: Ingest a complete multi-chapter fiction draft through the desktop interface.
2. **Review Continuity Suggestions**: Verify that cross-chapter continuity flags (e.g., character timeline conflicts, forgotten props) produce actionable, high-confidence cards in the suggestion panel.
3. **Assess Voice Profile Fidelity**: Check whether line-edit and copyedit recommendations respect the author's voice profile or slip into generic AI phrasing.

---

## 🛑 Blockers & Dependencies

- **None currently blocking**. The application is operational.
- **External Dependency**: LLM endpoint availability (Gemini API via OpenAI-compatible endpoint) and valid API key configuration in `.env`.

---

## 🔍 Needs Review

- **Cascading Edit Collisions**: Investigate how best to handle adjacent suggestions when accepting the first one alters the text of the second. Current behavior skips replacement if exact excerpt match fails. Needs evaluation for a fuzzy matching or offset tracking mechanism.
