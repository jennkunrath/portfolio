# Combined Solution ROI

**Positioning:** Solution — models RAG search and custom agents together, as a combined deployment.

## What it's for

Per the suite's own description: "Assess the unified architectural value of RAG tied to Custom Agents. Models information accuracy feeding scaled process automation workflows without operational overlap." This is the calculator for the case that actually happens most often in a real deployment — a buyer isn't choosing RAG search *or* a custom agent in isolation, they're building an agent that depends on a grounded, accurate retrieval layer underneath it. This calculator exists specifically to model that dependency rather than double-counting the value of each piece separately, which is the "without operational overlap" line doing the real work in that description.

## Why this calculator exists alongside the two standalone ones

[Custom AI Agent Model](custom-ai-agent-model.md) and [RAG ROI Model](rag-roi-model.md) each isolate one piece of the stack for a buyer who's deciding between them, or who's only building one. This calculator is for the buyer who's already decided they need both — the question isn't "which one," it's "what's the return on doing them together, and how much of that return is the agent's alone versus the retrieval layer's alone." Positioning a combined model as its own calculator, rather than just adding the other two calculators' outputs, is what lets it account for that overlap instead of overstating the total.

## Structure/Architecture

Following the pattern shared across the suite, this calculator combines the value-driver categories from both standalone solution calculators into one model, with an explicit mechanism (implied by "without operational overlap") for netting out value that would otherwise be counted twice — for instance, retrieval accuracy that only matters because an agent consumes it downstream. It carries the same organization-profile inputs, benchmark-source toggle, stress test, grounding/ceiling guardrails, and payback/ROI module as the rest of the suite.
