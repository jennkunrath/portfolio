---
name: spec-qa-review
description: Reviews an agent, pipeline, or testing-methodology spec against Weaver's 17-point spec-QA checklist and reports what's covered, what's missing or under-specified, and drafts the missing sections in the spec's own language so they're ready to fold in. Use this whenever Jenn is about to hand a spec to a builder, asks to "QA this spec," "check this for gaps," "review this before we build," "does this have everything a builder needs," "is this spec tight enough," or wants feedback on completeness or specificity for an agent scope, build spec, pipeline design, or testing methodology doc -- even if she doesn't say "QA" or name the checklist explicitly.
---

# Spec QA Review

## Why this exists

A spec that reads clean can still leave a builder guessing. Two failure modes are the most common and the most expensive to hit late: something the builder needs was left out entirely (no acceptance threshold, no golden set, no rollback plan), or something in the spec is a judgment call dressed up as a settled rule (a term like "workaround" decides whether a rebuild passes, but nobody wrote down what counts as one). This skill catches both by holding any spec up against a fixed 17-point checklist, and — unlike a generic completeness check — it doesn't stop at "this is missing." It drafts the missing piece, in the vocabulary of the actual spec (real stage names, real file names, real agent names), so the spec owner gets a ready-to-review addition instead of a to-do list.

## When to use this

Trigger on any request to review, QA, sanity-check, tighten, or "look over" a spec, scope doc, agent build plan, pipeline design, or testing methodology doc before it goes to a builder — not just when the word "QA" appears.

## The checklist

The full 17-item checklist lives in `references/checklist.md` — read it before starting a review. Don't rely on memory of just the item names; the "what good looks like" and "how it tends to go missing" notes for each item are what turn this into a review that finds the actual missing line, not a shallow keyword check.

The 17 items sit in four groups:

**Structure & scope** — goal/purpose statement, pattern/determinism classification, stage-by-stage pipeline breakdown, knowledge inputs, API/interface contract

**Test design** — golden test set definition, assessment outcomes per stage type, variance bands/acceptance thresholds, rebuild/fidelity rating

**Process** — phased process with time-boxes, setup/environment instructions, results/reporting template, reference materials index, FAQ/anticipated failure modes

**Judgment & verification** — sequencing/dependency rules, definitions for subjective judgment calls, automated conformance check ("QA calibration")

## How to run a review

1. **Read the whole spec first**, not just the section headers. The most useful gaps live in the space between two sections that each look complete on their own — a metric named in one place and never defined with a number anywhere else, for example.

2. **Go through all 17 items, one at a time.** For each, decide: **Present** (stated clearly enough that a builder wouldn't have to ask), **Partial** (gestured at, but missing the specific detail that makes it usable — a number, an owner, a rubric, a stop condition), or **Missing** (not addressed at all).

3. **For Present items, don't over-explain.** A one-line note pointing at where it lives is enough. The point of this review is the gaps, not re-summarizing what's already there.

4. **For Partial or Missing items, draft the fix — don't just name the gap.** This is what makes the review useful instead of a list of complaints. Write the missing piece as if you were adding it to the spec: reuse the spec's own agent names, stage names, file names, and terminology. A drafted acceptance-threshold table beats "you should add acceptance thresholds." A drafted stop-condition sentence naming the actual pipeline stages beats "define your sequencing rules." If the spec doesn't give you enough to draft something concrete, say so and ask one direct question rather than producing generic filler.

5. **Report both sides.** Close by naming what the spec already does well, briefly. A gap-only report reads as nitpicking; an honest one is the one people actually act on.

## Output format

Use this structure:

```markdown
# Spec QA Review: [spec name]

## Coverage at a glance
| Item | Status | Note |
|---|---|---|
(all 17 items, in checklist order — status is Present / Partial / Missing)

## What's already solid
A few sentences, or a short list if the items are genuinely parallel, on what the spec already does well.

## Gaps and drafted fixes
One subsection per Partial/Missing item, in checklist order:

### [Item name]
**What's missing:** specific to this spec, not the generic item description.
**Suggested addition (draft — for review, not automatic inclusion):**
> [the actual drafted content, ready to review]

## Open questions
Anything you couldn't draft with confidence because the spec doesn't give enough context. Ask rather than guess.
```

Keep drafts tight — a drafted paragraph or a small table beats a wall of text. The goal is something the spec owner can glance at and accept, edit, or reject in seconds.
