# Documentation Generation Agent (DocGen)

An AI-powered documentation engineering platform that structures, drafts, and reviews technical documentation against custom organizational standards and style exemplars.

DocGen uses a sequential, human-in-the-loop pipeline with parallel reviewer sub-agents. It ensures generated documentation matches organizational voice, adheres strictly to formatting standards, and never alters content without author review and approval.

---

## Table of Contents

- [Core Principles](#core-principles)
- [System Architecture](#system-architecture)
- [Workflow Pipeline](#workflow-pipeline)
  - [1. Intake & Source Ingestion](#1-intake--source-ingestion)
  - [2. Step 1: Outline](#2-step-1-outline)
  - [3. Step 2: Draft](#3-step-2-draft)
  - [4. Step 3: Multi-Agent Review](#4-step-3-multi-agent-review)
- [Review Sub-Agents](#review-sub-agents)
- [Suggestion Review & Application](#suggestion-review--application)
- [Profiles & Standards Configuration](#profiles--standards-configuration)
- [Source Material Classification](#source-material-classification)
- [Exports & Reporting](#exports--reporting)
- [Data Models & Schema](#data-models--schema)
- [API Reference](#api-reference)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)

---

## Core Principles

- **Human-in-the-Loop Control**: The agent assists and accelerates; the author retains full authority over structure, drafting, and acceptance of edits.
- **Non-Destructive Feedback**: Reviewers return advisory recommendations. Drafts are never automatically overwritten.
- **No Unfounded Hallucinations**: Information gaps in source materials are flagged with explicit `TODO` markers rather than fabricated facts.
- **Rules-Based Governance**: Documents are validated against both global organization-wide style guides and document-type-specific profiles with executable constraint scripts.

---

## System Architecture

```
                                  +-----------------------------+
                                  |   Raw Sources & Artifacts   |
                                  | (.md, .docx, .txt, pasted)  |
                                  +--------------+--------------+
                                                 |
                                                 v
                                  +-----------------------------+
                                  |       Document Intake       |
                                  |    (Select Profile & Mode)  |
                                  +--------------+--------------+
                                                 |
                                                 v
[Standards & Requirements] -----> |  Step 1: Outliner Agent     | <----> Author Edits / Approval
                                  +--------------+--------------+
                                                 |
                                                 v
[Style Exemplars & Sources] ----> |   Step 2: Drafter Agent     | <----> Author Edits / Auto-save
                                  +--------------+--------------+
                                                 |
                                                 v
                                  +-----------------------------+
                                  |  Step 3: Parallel Review    |
                                  +--------------+--------------+
                                  |  - Style Agent              |
                                  |  - Standards Agent          |
                                  |  - Grammar & Spelling Agent |
                                  |  - Additional Req. Agent    |
                                  +--------------+--------------+
                                                 |
                                                 v
                                  +-----------------------------+
                                  |  Interactive Suggestions    |
                                  |  (Accept / Reject / Undo)   |
                                  +--------------+--------------+
                                                 |
                                                 v
                                  +-----------------------------+
                                  |       Document Export       |
                                  |  - Markdown (.md)           |
                                  |  - Microsoft Word (.docx)   |
                                  |  - Audit Run Report         |
                                  +-----------------------------+
```

---

## Workflow Pipeline

### 1. Intake & Source Ingestion
- **Input Modes**:
  - `sources`: Raw notes, meeting transcripts, issue tickets, pull request comments, or specification files to be transformed into structured documentation.
  - `draft`: An existing document or manuscript to be restructured, polished, and reviewed.
- **Profile Assignment**: Assign a profile (e.g., API Reference, SOP, Runbook) or use the global standard set.
- **Run Instructions**: Optional custom directives (e.g., target audience expectations, technical background prerequisites).

### 2. Step 1: Outline
- The **Outliner Agent** analyzes the input material against profile constraints to generate a hierarchical document structure.
- The author can inspect, reorder, add, or prune sections directly in the editor.
- The **Drafter Agent** will follow the exact approved outline.

### 3. Step 2: Draft
- The **Drafter Agent** synthesizes content section by section, matching the tone and formatting of uploaded style exemplars.
- Unresolved details or missing metrics from sources are inserted as explicit `TODO` markers.
- Inline edits are automatically saved to the backend on editor blur.

### 4. Step 3: Multi-Agent Review
- Four specialized sub-agents inspect the generated draft concurrently.
- Each reviewer flags issues categorized by severity with exact excerpts, proposed replacements, rationales, and rule citations.

---

## Review Sub-Agents

| Sub-Agent | Scope & Focus | Severity Spectrum |
| :--- | :--- | :--- |
| **Style** | Enforces tone, voice, brand persona, audience leveling, and structural alignment with reference exemplars. | Minor / Major |
| **Standards** | Validates structural prerequisites, required sections, ordering, metadata blocks, and document conventions. | Major / Blocker |
| **Grammar & Spelling** | Scans for syntactic accuracy, punctuation, typos, naming conventions, and readability score. | Minor |
| **Additional Requirements** | Evaluates custom line-by-line constraint scripts defined on the active profile, quoting the exact rule broken. | Minor / Major / Blocker |

---

## Suggestion Review & Application

The right-hand review panel organizes findings for actionable triage:

- **Filter Controls**: Filter by resolution status (`All`, `Pending`, `Accepted`, `Rejected`) or narrow down by specific reviewer.
- **Card Metadata**:
  - Sub-agent origin tag and severity badge (`Blocker`, `Major`, `Minor`).
  - Target section name and highlighted strikethrough excerpt.
  - Proposed green inline diff replacement.
  - Technical rationale explaining the recommendation.
  - Explicit rule citation from the style guide or script.
- **Resolution**:
  - **Accept**: Stages the replacement to be applied.
  - **Reject**: Dismisses the recommendation.
  - **Undo**: Restores any accepted or rejected item back to pending state.
- **Application on Export**: Accepted suggestions are substituted into the document during export where the exact text excerpt matches. Any unmatched suggestions or unaddressed blockers are highlighted in the audit report as outstanding author actions.

---

## Profiles & Standards Configuration

Accessed via `/settings`, the configuration center allows organizations to calibrate review criteria:

### Global Standard Set
Applies across all documents regardless of profile:
- Foundational voice, tone, and formatting guides.
- General exemplar documents that define baseline technical documentation quality.

### Profiles
Dedicated standard sets designed for specific document types:
- **Metadata**: Profile name, Document Type (e.g., API Reference, Architecture Decision Record, SOP, Release Note), and Target Description.
- **Document Standards (Hard Requirements)**:
  - Required sections, required ordering, and mandatory components (e.g., "Overview, Prerequisites, Authentication, Endpoints, Error codes, Changelog").
  - Evaluated by the **Standards Sub-Agent** (missing items are raised as `Blockers`).
- **Additional Requirements Script**:
  - Declarative, line-by-line operational constraints.
  - Example rules:
    ```text
    Never address the reader as "we"
    Every procedure must include a rollback or undo step
    No marketing language in technical sections
    All CLI commands must show expected output
    Flag any claim that lacks a source in the supplied material
    ```
  - Evaluated line-by-line by the **Additional Requirements Sub-Agent**.
- **Profile-Specific Sources**: Specialized exemplars, API specs, or reference documents loaded specifically for that document type.

---

## Source Material Classification

When uploading or pasting reference content, assign one of three semantic roles:

1. **Style Exemplar (`style`)**: Teaches the agent the target voice, syntax style, rhythm, and formatting conventions.
2. **Standard / Style Guide (`standard`)**: Explicit directives and rules to be obeyed and evaluated against.
3. **Reference Material (`reference`)**: Factual baseline information (specs, schemas, data dictionaries) used strictly for factual grounding.

Supported file formats: `.md`, `.txt`, `.docx`, `.markdown`, `.rst`, `.json`, `.yaml`, `.yml`.

---

## Exports & Reporting

- **Markdown Export (`/api/documents/:id/export?format=md`)**: Production-ready markdown file incorporating all accepted revisions.
- **Microsoft Word Export (`/api/documents/:id/export?format=docx`)**: Styled Word document suitable for distribution and offline review.
- **Audit Run Report (`/api/documents/:id/report`)**: Comprehensive review report detailing agent run metadata, timestamps, reviewer findings, and unresolved items.

---

## Data Models & Schema

The application utilizes Drizzle ORM backed by SQLite:

- **`documents`**:
  - `id`: Auto-incrementing primary key.
  - `title`: Document title.
  - `profileId`: Associated profile ID (nullable for global set).
  - `inputMode`: Ingestion type (`sources` or `draft`).
  - `stage`: Current pipeline state (`new`, `outline_ready`, `draft_ready`, `reviewing`, `reviewed`).
  - `material`: Raw ingested text / source compilation.
  - `outline`: Current structured outline.
  - `draft`: Current document body.
  - `notes`: Custom run directives and audience notes.
  - `createdAt`: ISO creation timestamp.

- **`profiles`**:
  - `id`: Auto-incrementing primary key.
  - `name`: Display name.
  - `docType`: Category or target document type.
  - `description`: Target use-case and context.
  - `standards`: Hard structural requirements.
  - `requirementsScript`: Line-by-line evaluation rules.
  - `isDefault`: Boolean flag for default profile selection.

- **`sources`**:
  - `id`: Auto-incrementing primary key.
  - `name`: Filename or title.
  - `kind`: Semantic type (`style`, `standard`, `reference`).
  - `profileId`: Profile association (nullable for global sources).
  - `content`: Extracted plain-text content.
  - `chars`: Character count metric.

- **`suggestions`**:
  - `id`: Auto-incrementing primary key.
  - `documentId`: Target document reference.
  - `runId`: Identifier of the reviewer run.
  - `reviewer`: Sub-agent origin (`style`, `standards`, `grammar`, `requirements`).
  - `severity`: Impact level (`blocker`, `major`, `minor`).
  - `section`: Associated section heading.
  - `excerpt`: Existing text excerpt proposed for modification.
  - `proposed`: Recommended replacement text.
  - `rationale`: Technical reason for the suggestion.
  - `citation`: Underlying rule or style guide source quote.
  - `status`: Decision state (`pending`, `accepted`, `rejected`).

- **`runs`**:
  - `id`: Auto-incrementing primary key.
  - `documentId`: Target document reference.
  - `runId`: Run execution UUID.
  - `agent`: Executing agent (`outliner`, `drafter`, `style`, `standards`, `grammar`, `requirements`).
  - `status`: Execution state (`running`, `done`, `error`).
  - `summary`: High-level run output summary.
  - `found`: Number of suggestions produced.
  - `startedAt`: ISO start timestamp.

---

## API Reference

### Documents
- `GET /api/documents`: List recent document runs.
- `POST /api/documents`: Create a new document run (multipart form with files, title, material, profile, notes).
- `GET /api/documents/:id`: Retrieve document details, outline, draft, active runs, and suggestions.
- `PATCH /api/documents/:id`: Update outline or draft body.
- `DELETE /api/documents/:id`: Delete a document and its associated records.
- `POST /api/documents/:id/outline`: Trigger the Outliner agent.
- `POST /api/documents/:id/draft`: Trigger the Drafter agent using the approved outline.
- `POST /api/documents/:id/review`: Trigger parallel execution of selected review sub-agents.
- `GET /api/documents/:id/export`: Download formatted document (`?format=md` or `?format=docx`).
- `GET /api/documents/:id/report`: Download the run and review report.

### Suggestions
- `PATCH /api/suggestions/:id`: Update suggestion status (`{ status: "accepted" | "rejected" | "pending" }`).

### Profiles
- `GET /api/profiles`: List all configured profiles.
- `POST /api/profiles`: Create a new profile.
- `PATCH /api/profiles/:id`: Update profile metadata, standards, or requirements script.
- `DELETE /api/profiles/:id`: Delete a profile and its profile-scoped sources.

### Sources
- `GET /api/sources`: List all global and profile-specific sources.
- `POST /api/sources`: Upload files or paste source text (multipart form with `profileId`, `kind`, `files`, `pastedName`, `pastedContent`).
- `DELETE /api/sources/:id`: Remove a source.

---

## Technology Stack

- **Frontend Application**:
  - **Framework**: React 18, TypeScript
  - **Client Routing**: Wouter (hash-based location routing)
  - **Data Fetching & Cache**: TanStack Query (React Query)
  - **UI Components & Primitives**: Radix UI (Slot, Checkbox, Select, Tabs, Toast, Tooltip, Popper, FocusScope, DismissableLayer, Presence)
  - **Styling**: Tailwind CSS with custom theme variables, Lucide React icons
  - **Schema Validation**: Zod 4 (`zod/v4`)
- **Backend & Database**:
  - Node.js HTTP Service
  - Drizzle ORM (SQLite)
  - Multi-part document parsers for `.docx`, `.md`, and plain text

---

## Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm, pnpm, or yarn

### Installation & Run
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run database migrations or push schema:
   ```bash
   npm run db:push
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Access the web interface at `http://localhost:5000` (or the configured application port).
