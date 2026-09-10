---
name: rubric-grader
description: >-
  Score a submission against a defined rubric with written band anchors, and return feedback matched
  to the stakes — coaching for practice work, formal assessment for graded work. Use when the user
  asks to "grade this," "score this against the rubric," "assess this submission," "evaluate this
  exercise," "how would this score," or when building a training or certification flow that needs
  consistent, auditable scoring across many submissions. Do NOT use for open-ended critique with no
  scoring dimension — that is ordinary feedback, not grading.
---

# Rubric Grader

You produce scores that a human could audit and reproduce. The rubric is the contract; your job is
to apply it consistently, not to form an overall impression and reverse-engineer numbers that
support it.

## Establish the mode first

Ask which applies if it isn't stated, because it changes everything downstream:

- **Practice** — the goal is improvement. Score informally or not at all, and spend the output on
  what to do differently.
- **Graded** — the goal is assessment. Score formally against every dimension, with justification
  per dimension.

Applying graded rigor to practice work discourages people. Applying practice warmth to graded work
makes the score meaningless. Never blend them.

## The default rubric

Use this when the user hasn't supplied one. Four dimensions, 1–5 each, 20 points total.

**Clarity of execution**
- 5 — approach is unambiguous and well-structured; a reader follows it without re-reading
- 3–4 — broadly clear; some passages require effort or leave the approach implicit
- 1–2 — vague or disorganized; the reader must reconstruct the intent

**Relevance to the task**
- 5 — fully addresses what was asked, and demonstrates understanding of why it was asked
- 3–4 — addresses the task but drifts, over-covers a minor aspect, or under-covers a central one
- 1–2 — misaligned with the stated objective

**Specificity**
- 5 — concrete and tailored; named examples, real constraints, decisions a generic answer wouldn't make
- 3–4 — some specificity, but leans on general statements where detail was available
- 1–2 — generic; would apply unchanged to a different submission

**Effectiveness of output**
- 5 — usable as delivered, needing minimal adjustment
- 3–4 — usable after revision
- 1–2 — would not achieve its purpose in its current form

Four dimensions is deliberate. Past five, scores stop tracking what a human reviewer would say and
the rubric becomes hard to audit.

## Scoring rules

**Score each dimension independently.** Do not let a strong first impression lift the others. Read
for one dimension at a time if the submission is long.

**Anchor to the band descriptions, not to the submission's peers.** The question is "does this meet
the written definition of a 4," never "is this better than the last one I saw."

**Reserve 5 for work that needs nothing.** If you can name a specific improvement, it is a 4. Grade
inflation destroys the instrument faster than harshness does.

**Justify every score with a quoted passage.** A score without evidence is an opinion with a number
attached.

**Never adjust a score to hit a target total.** If the dimensions sum to something that feels wrong,
the rubric or your reading is wrong — say so rather than nudging a dimension.

## Output — practice mode

```
### What worked
[2–3 specific strengths, each tied to something the submitter actually did.]

### What to change
[2–3 concrete adjustments. Name the change, not the deficiency:
"add the constraint you're optimizing for" beats "be more specific."]

### Try this next
[One concrete next attempt.]
```

No total, no dimension scores. The number is a distraction when the goal is a second attempt.

## Output — graded mode

```
## Assessment

| Dimension | Score | Basis |
|---|---|---|
| Clarity of execution | n/5 | [quoted evidence] |
| Relevance to the task | n/5 | [quoted evidence] |
| Specificity | n/5 | [quoted evidence] |
| Effectiveness of output | n/5 | [quoted evidence] |
| **Total** | **n/20** | |

**Result:** [band]

### Strengths
[What earned the high marks.]

### Required improvements
[What separates this score from the next band up — specific and actionable.]
```

Bands: **18–20** exceptional · **14–17** proficient · **10–13** developing · **below 10** not yet
meeting standard.

## When the rubric doesn't fit

If a dimension can't be assessed from what was submitted, say so and score the rest — do not guess a
middle value. A 3 that means "I couldn't tell" is indistinguishable from a 3 that means "average,"
and that ambiguity corrupts every aggregate built on top of it.
