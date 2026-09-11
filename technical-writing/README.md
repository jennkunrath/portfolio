# Technical Writing

Evaluations, architecture documentation, and capability overviews. Most of what I write exists to
help someone decide whether to adopt a tool, or ensure they understand a tool. Documentation I produce
is written to be actionable and clarifying. 

## [Perplexity Computer: Capability Overview & Test Findings](./perplexity-computer-evaluation.md)

I built a four-sweep documentation review agent on the platform, then tested the result against a
scripted suite of 11 cases with pass criteria set before the build started.

| What | Detail |
|---|---|
| Test corpus | 14 documents, varied by length, domain, and defect density |
| Test cases | 11, each with a numeric or binary pass criterion |
| Results | 8 pass, 3 needs refinement |
| Cost | ~$100 in credits for the v1 build plus testing |

The three failures were the detection benchmarks: Correctness (target recall ≥80%, precision ≥85%),
Clarity (≥70% / ≥80%), and Voice and Style (100% recall on banned terms, then ≥75% / ≥85%). Accuracy
was solid after one revision round and then plateaued. Breaking 95% needed more refinement cycles
and more credit budget than the initial build.

What passed: CD-1 confirmed the format sweep was genuinely deterministic. Five runs on the same 
document returned byte-identical suggestions. CD-5 found zero compliance with a prompt injection 
hidden in the document text. CD-10 confirmed the four sweeps ran concurrently rather than 
sequentially, with total time matching the slowest single task instead of the sum.

The document also covers where the tool sits against five categories of competitor, and closes with
specific recommendations, including the one that mattered most: state mechanical requirements
explicitly, because the platform defaults to a loose reading of anything underspecified.

## An Introduction to Decoupled Agent Frameworks

A whitepaper on separating the foundational agent framework from the instruction layer, so one 
well-built core can be repurposed across departments instead of rebuilt per use case.

## Written, but not published here

Two pieces of my technical writing document systems that are proprietary:

- **Enterprise RAG platform architecture whitepaper:** ingestion, retrieval, and grounding
  architecture for a production platform. Roughly 2,500 words. Company IP.
- **Security whitepaper:** defense-in-depth documentation covering data retention posture,
  encryption, and alignment to GDPR, ISO/IEC 27001, and NIST. Customer-facing assurance
  documentation, that can be sent to accelerate the sales cycle and avoid a custom security
  questionaire. 

## Prototyping for customer conversations

Illustrating the art of the impossible - helping a prospect see the vision of a solution: 
sometimes protyping a solution is the best way to help a prospect understand what we can do
and faciliates the conversation in making the scoped solution more specific. 

- **Interactive ROI models:** nine calculators covering combined solution value, custom agents,
  workforce impact, RAG, and five industry verticals. A prospect can change the inputs mid-call and
  see the output adjustments in real time. 
- **Multi-agent instruction routing UI:** before platforms standardized native agent instructions,
  I built a middleware layer into a client-facing web interface that visually mapped how
  instructions routed between agents, so customers could see the mechanism in play.
- **Front-end demos:** production-grade interfaces built to make an abstract architecture concrete
  enough for a customer to react to.

These get disagreement on the table early, while the design is still cheap to change and allow for better 
scoping going into both wrriting an SOW and implementation.

## If you're evaluating a tool yourself

Three things I'd carry over from my testing:

**Set pass criteria before you build.** A threshold chosen after seeing the output is a
rationalization. Numbers decided in advance are the only ones that mean anything.

**Build a corpus, not a sample.** Most AI tools default to testing against a single example and
reporting success. Fourteen documents varying by length and defect density is what surfaced the
detection gaps; one document would have passed.

**Publish the failures with their thresholds.** "Needs refinement" next to "recall ≥80%" tells a
reader what to expect. "Works well" tells them nothing and costs you credibility when they find out
themselves.

## Related

- [`../agent-patterns`](../agent-patterns): architecture patterns from a production agent library
- [`../personal-projects`](../personal-projects): applications and the reasoning behind each
