# ROI Calculator Suite

Nine interactive ROI calculators that model the projected annual value of deploying AI agents and RAG-based search — before a customer signs off on a build. Each one runs entirely in the browser and is interactive: a stakeholder moves sliders, swaps benchmark sources, and gets a defensible dollar figure with a visible audit trail of how that figure was produced, without needing to see or run any of the underlying code.

This repo documents the suite for a portfolio audience. It does not include the source code. See [Access & code availability](#access--code-availability) for why, and how to get a live calculator in front of a stakeholder.

## Why nine calculators, not one

Enterprise buyers evaluate AI investments two different ways, and a single generic calculator serves neither well:

**Vertical calculators** answer "what does this look like for my industry?" A healthcare COO doesn't want to translate "throughput" into denials management themselves — they want a calculator that already speaks in claims, prior auth, and care-gap terms, with benchmark defaults pulled from healthcare-specific research. Five calculators cover this: **Financial Services**, **Healthcare**, **Professional Services**, **Manufacturing**, and **Pharma & Life Sciences**.

**Solution calculators** answer "what does this specific piece of technology return, independent of industry?" A buyer comparing a RAG search deployment against a custom agent build wants to isolate that decision, not have it buried inside an industry-specific model. Four calculators cover this: **Custom AI Agent Model**, **RAG ROI Model**, **Workforce Impact Hub**, and **Combined Solution ROI** (which models the two together, since a real deployment rarely uses one in isolation).

The split means a sales or solutions conversation can start from whichever axis the stakeholder actually cares about — their industry, or their technology decision — and the combined model exists because in practice those two questions converge.

## The suite at a glance

| # | Calculator | Positioning | Profile |
|---|------------|--------------|---------|
| 01 | Combined Solution ROI | Solution | [combined-solution-roi.md](calculators/combined-solution-roi.md) |
| 02 | Custom AI Agent Model | Solution | [custom-ai-agent-model.md](calculators/custom-ai-agent-model.md) |
| 03 | Workforce Impact Hub | Solution | [workforce-impact-hub.md](calculators/workforce-impact-hub.md) |
| 04 | RAG ROI Model | Solution | [rag-roi-model.md](calculators/rag-roi-model.md) |
| 05 | Financial Services Vertical | Vertical | [financial-services.md](calculators/financial-services.md) |
| 06 | Healthcare Vertical | Vertical | [healthcare.md](calculators/healthcare.md) |
| 07 | Professional Services Vertical | Vertical | [professional-services.md](calculators/professional-services.md) |
| 08 | Manufacturing Vertical | Vertical | [manufacturing.md](calculators/manufacturing.md) |
| 09 | Pharma Vertical | Vertical | [pharma.md](calculators/pharma.md) |

Four of the nine — Financial Services, Healthcare, Manufacturing, and Pharma — are documented in full below, with screenshots.

## Shared architecture

All nine calculators are built on the same underlying pattern, restyled and re-parameterized per calculator. Understanding the pattern once means every profile below reads as a variation on it, not nine separate designs.

**Organization profile.** Every calculator opens by asking for headcount (or staff/workers, depending on the vertical), average loaded salary, and working weeks per year. That triple converts into an internal hourly rate that every downstream dollar figure is built from — it's the one input almost never worth leaving at default, because it's the multiplier every other number rides on.

**Industry sub-segment defaults.** Inside each vertical calculator, a row of sub-segment buttons (e.g., Banking vs. Lending vs. Insurance, inside Financial Services) one-click-populates every slider with benchmark-typical starting values for that sub-segment. Nothing is locked — a stakeholder can accept the preset or override any field individually.

**Benchmark source toggle.** Every default in the model traces back to a named, cited research source — McKinsey or Gartner, depending on the calculator — and a stakeholder can switch sources to see how the projection shifts under a different research house's assumptions. Each source carries its own citation strip so the number is never presented without a traceable origin.

**Value-driver toggles.** Each calculator groups its impact into three categories (the categories are vertical-specific — see each profile), and a stakeholder can turn any category on or off. Only active categories feed the total, so the model can be scoped down to "just cost savings" or "just compliance risk" without recalculating anything by hand.

**Worst / expected / best stress test.** A one-click switch re-populates every benchmark-driven input with the conservative-floor, benchmark-default, or top-quartile-ceiling value from the active research source. This is what makes the output defensible in a room: a stakeholder sees the range, not just a single flattering number.

**Grounding and ceiling.** Two optional guardrails keep the model honest. "Current cost of this challenge" bounds the projected value to a realistic multiple of what the stated problem costs today, scaled by which stress-test scenario is active. An optional "business-value ceiling" caps the headline outright. When either guardrail is active, a visible note explains exactly what was capped and why — the full uncapped modeled figure is never hidden, just labeled.

**Payback and credibility flags.** Once a stakeholder enters an investment amount, the calculator computes payback period, year-one net value, first-year ROI, and a value-to-cost ratio — and automatically flags when a result looks implausible: value disproportionate to the stated problem cost, investment exceeding projected value, or ROI pinned at its display ceiling. This flagging layer is deliberate — it's what stops the tool from being usable to oversell a deal, which matters as much for internal credibility as for the customer's.

**Live chart, printable report, CSV export.** The value breakdown renders as a bar chart that updates on every input change, and a stakeholder can pull a printable one-pager or the underlying numbers as CSV without needing anything from the calculator's source.


## What a stakeholder can control vs. what stays hidden

The whole point of this suite is letting someone outside the build see and adjust the assumptions behind a number, without needing (or being given) the code that produces it. In practice that split looks like:

A stakeholder can control every input listed above — headcount, salary, working weeks, all per-category volumes and rates, the industry preset, the benchmark source, the stress-test scenario, the challenge cost, the value ceiling, and the investment amount. Every one of those changes recalculates the model live and shows its effect in the value breakdown.


## Access & code availability

This repo is documentation only: positioning, methodology, and screenshots. It does not contain the calculators' HTML/CSS/JS.

## Methodology & sourcing

All published benchmark figures cited across the suite trace back to two research houses: **McKinsey** (GenAI Economic Potential reports and State of AI 2025 survey) and **Gartner** (industry-specific AI adoption research and the 2025 Hype Cycle for AI). Every calculator cites its active source inline, next to the specific number it backs. Figures are modeled for indicative planning purposes and are explicitly presented as estimates, not guaranteed outcomes — every calculator says so in its own footer.
