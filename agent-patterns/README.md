# Agent Architecture Patterns

I spent a couple of years building production agents as a founding solutions engineer on an
enterprise AI platform. Around fifty of them shipped. These are my notes on what kept showing up in
the architecture, what actually held, and what I'd do differently if I started over.

The agents themselves aren't here. They're employer work product. What's here is the architecture
that survived across all of them, plus four clean-room reference implementations you can read and
run with.

## Why this is worth writing down

The first ten agents I built were prompts. The next forty were systems. The difference is that a
prompt tries to get one good answer, and a system assumes the model will sometimes be wrong and puts
structure around that fact.

Every pattern below exists because something failed in production first. That's the useful part.
Not the taxonomy, but which failures forced which structure.

## The patterns that recurred

**Persona plus explicit anti-goals.** About three-quarters of the library opens by assigning a role.
But the ones that behaved consistently also declared what the agent must *not* do, as a named
section rather than a buried caveat. Agents drift toward being generically helpful. A "what this
agent should avoid" block is what stops a document-analysis agent from cheerfully drafting an email
when someone asks.

**Structured output contracts.** Roughly four in five agents specified the output shape literally:
headers, field names, bracketed placeholders the model fills in. This serves as a template for the
output expected, making the result repeatable and consistent.

**Source grounding with a real refusal path.** A quarter of the library was constrained to answer
only from attached or retrieved material. The constraint that mattered wasn't "only use the
documents," because every RAG prompt says that. It was specifying the exact failure sentence: what
the agent says when the answer isn't there. Without a scripted refusal, models fill the gap. With
one, they use it.

**Confirmation gates before expensive work.** Several agents split into a cheap verification phase
and an expensive execution phase, with an explicit instruction that phase two cannot begin until the
user confirms phase one. A research agent that spends its budget profiling the wrong person is worse
than one that asks a question first. The gate has to be written as a hard precondition, something
like "can only begin after receiving explicit verification," because soft phrasing gets optimized
away.

**Rubric scoring with published criteria.** A quarter of the library scored something. The ones that
produced stable scores defined each dimension on a fixed scale with written anchors for what each
band means, rather than asking for a rating and hoping. Four dimensions at 1 to 5 with descriptive
anchors was the shape I kept returning to. Enough resolution to be useful, few enough dimensions
that a human can audit the result.

**Separate critic agents.** This was the most valuable pattern in the library and the one I'd reach
for first now. Rather than asking one agent to produce and self-check, a distinct verification agent
receives the prior agent's output, is explicitly forbidden from doing independent research, and
evaluates only what's in front of it. It extracts claims by category, tests internal consistency and
arithmetic, and names the specific cognitive biases it's checking for. Constraining the critic to
the existing output is what makes it a critic instead of a second author.

## The one that actually changed how I build

The pipelines worth their complexity had three stages and a loop. Extract, transform, validate, with
the validator's output routed back to the transformer rather than to the user.

Two details made it work. Each stage declared a hard prerequisite and stopped rather than degraded,
so if the upstream payload was incomplete the agent halted and named what was missing instead of
doing its best with partial data. And the transform stage had two operational modes, initial and
feedback, so a revision pass was a first-class path through the agent rather than a re-run that lost
context.

The validator emitted structured corrections: error type, location, current value, correct value,
correction method, and a criticality ranking. A numeric accept threshold, 96% on a 24-point scale,
decided approve, conditional, or reject. That threshold is doing something subtle. It converts "is
this good enough" from a judgment call the model makes into a comparison against a number, which is
both auditable and stable across runs.

**What I'd change:** loop termination. I capped iterations informally and watched runs by hand. A
production version needs a hard iteration limit and a defined behavior on exhaustion, whether that's
escalating to a human, shipping with warnings, or failing closed. You decide that in advance, not in
the moment.

Worth saying plainly that this was a constraint of the tooling at the time, not an oversight. The
platform ran agents as instruction sets, with no surrounding runtime to hold a counter or enforce a
stop, so anything resembling loop control had to be written into the prompt and trusted to hold. It
mostly did, but "mostly" isn't a termination condition. That work belongs in the orchestration layer,
and the orchestration layer now exists. If I rebuilt these today the iteration cap would be code,
and the agent instructions would get shorter for it.

## What didn't hold up

**Character budgets on generated sections.** My meta-agent specified output lengths per section, 150
to 300 characters for purpose, 800 to 1200 for capabilities. It produced consistent-looking specs
and mediocre ones. The model padded thin sections to hit a floor and truncated substantive ones to
hit a ceiling. Length ceilings are worth keeping. Floors are not.

**Very large single agents.** Several of the early agents tried to own an entire workflow. They were
harder to debug than the equivalent three-agent pipeline, because a bad output gave you no signal
about which stage failed. Splitting on stage boundaries costs orchestration overhead and buys you
observability, which is usually the better trade.

**Rubrics with more than five dimensions.** Scores stopped correlating with anything a human would
say. Four was the sweet spot.

## Reference implementations

Four skills built from scratch here, each demonstrating one pattern in a general-purpose form:

| Skill | Pattern |
|---|---|
| [`agent-output-verifier`](./agent-output-verifier) | The separate critic. Claim extraction, consistency and arithmetic checks, named bias detection, calibrated confidence. |
| [`rubric-grader`](./rubric-grader) | Scored assessment with written band anchors, and feedback that changes with the stakes. |
| [`grounded-qa`](./grounded-qa) | Source-bound answering with a scripted refusal path and citation discipline. |
| [`agent-spec-writer`](./agent-spec-writer) | Writing agent specs that include anti-goals, output contracts, and stated preconditions. |

## If you're building your own

**Write the anti-goals before the capabilities.** They constrain behavior more than the role
description does, and they're the thing you'll otherwise add later, after something embarrassing
happens.

**Specify the refusal sentence, not just the constraint.** "Only answer from the provided documents"
is incomplete. Add the literal sentence the agent says when it can't, and it will use it.

**Split on stage boundaries as soon as you have two.** Extract, transform, validate. You lose a
little latency and gain the ability to tell which stage was wrong.

**Make the critic a different agent with a narrower brief.** Self-checking inside one agent mostly
produces agreement. A separate agent that can only see the output, and cannot research
independently, produces disagreement. That's the point.

**Pick the accept threshold before you see the output.** A number decided in advance is an
engineering decision. One decided afterward is a rationalization.

## Contract Verification Suite (`evals/`)

This directory includes an offline-runnable contract evaluation suite in [`evals/`](./evals) that programmatically tests prompt contracts, refusal paths, and arithmetic checks against deterministic criteria.

### Running the evaluation harness

Run with standard Python (zero external dependencies, runs offline in <1 second):

```bash
python3 evals/runner.py
```

Or run via pytest:

```bash
pip install -r evals/requirements.txt
pytest evals/
```

| Test Case | Target Skill | Test Input Payload | Deterministic Pass Criteria |
|---|---|---|---|
| **Scripted Refusal** | `grounded-qa` | Out-of-corpus question (401(k) match on PTO-only corpus) | Contains literal: `"I couldn't find that in the provided documents."` Zero hallucinated claims. |
| **Arithmetic Catch** | `agent-output-verifier` | Report claiming $10M $	o$ $15M is a 35% increase | Flags 50% vs 35% in `Critical findings` under `Verdict: APPROVE WITH CORRECTIONS`. |
| **Rubric Contract** | `rubric-grader` | Incident postmortem submission (Graded mode) | Table contains all 4 fixed dimensions; integer scores sum to Total ($n/20$); valid band assigned. |
| **Anti-Goal Enforcement** | `agent-spec-writer` | Request for compliance analyzer spec | Output contains YAML frontmatter, explicit `## Anti-Goals`, `## Preconditions`, and `## Output Contract`. |

