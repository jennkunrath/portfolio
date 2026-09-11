# An Introduction to Decoupled Agent Frameworks

*By Jenn Kunrath*

---

Most conversations about AI start singular. Someone has a specific problem, they write a clever prompt, they get a useful answer, and everyone moves on. I do it too. But that's not how you get AI to actually move the needle for an organization, and pretending otherwise is how a lot of well-intentioned projects quietly stall.

Let me start somewhere relatable before I get to the part my team obsesses over. One of the most common ways people use AI today is in the kitchen. For example, asking what to substitute for buttermilk, or handing it a photo of a sad-looking fridge and asking what's for dinner. These should be familiar use cases and great low-stakes ways to think about scale—because the difference between cooking at home and running an industrial kitchen is exactly the framework discussion I want to have here.

At organizational scale, the unit of work is rarely a single prompt. It's an AI agent—or an agentic system—that you give a goal, a set of tools, and the instructions to carry out a task on a team's behalf. This paper is about how I've learned to build those agents and workflows so they don't stay trapped in one recipe, but stay versatile across many organizational functions. The architecture that makes that possible rests on an old engineering principle—decoupling—applied to agents. This is separating a durable framework from a set of configurable instructions. It's an approach I've come to call a "decoupled agent framework," and if that's a new idea to you, we're going to go through it together in detail.

## The Scalability Gap

If you want AI to scale, it helps to think big-picture. Let's be honest with ourselves though, thinking big-picture isn't how most of us actually solve problems. We put our heads down on the one thing in front of us, solve it in a silo, and never ask what the broader version of that solution could have done. The cost of that habit is invisible, which is exactly why it's dangerous. It silently adds up even though you never see the cross-organizational impact and opportunities you left on the table, the value that went unrealized.

And the stakes are real. A widely-cited MIT study found that roughly 95% of AI adoptions fail, often for the unglamorous reason that nobody had a clear plan for where to start or how to build and test. Even if your rollout beats those odds and lands in the lucky 5%, there's a second gap hiding behind the first. The critical question is: how much did your baseline actually improve, versus how much was possible with a smarter design? McKinsey's 2025 State of AI report puts only about 6% of organizations in the "AI high performer" category—the ones attributing real, enterprise-level financial impact to their AI use. So the vast majority of companies using AI aren't capturing the value it can deliver. That gap, the one between "it works" and "it's worth it," is where the compounding efficiencies actually live.

Back to the kitchen as an analogy to frame this around—if one person wants cookies, baking a single batch solves the problem for a day. Then more people start asking. After all, these are really good cookies. This creates the scalability gap. Sure, we had a small user base that got cookies. But did that set up actual business potential? We're not trying to bake one batch with this question, we're looking into the potential of setting up a supply chain.

## How Do You Close the Gap?

The fix is a mindset shift. A solution—cookies (browser cache joke not intended) or AI—shouldn't be a one-off. It should be a resource you can adjust and reuse across many situations. That's where the real differentiation kicks in, and where problem-solving stops feeling like whack-a-mole and starts feeling like infrastructure. The catch is that most organizations are blind to this opportunity—not because they're not smart, but because they don't know how to look past a single solution to broader potential, let alone how to design for it.

Here's a scenario I see all the time—an organization is excited about AI and has several departments raising their hands. They want these flashy fancy efficiency tools. But they don't want to think too hard about what that should look like, leaning instead towards something quick to stand up, low-friction, benefits soon, and with minimal disruption. When we're all focused on getting our jobs done, we don't often have the time or bandwidth to step back and examine greater workflow considerations.

To ground our example with some specifics, let's say engineering wants coding support—something to help check and debug what they're building. HR wants an agent employees can ask about policy. Oh, and Customer Support wants a chatbot that can talk to customers and triage requests.

Three groups, three wishes. No genie in the bottle on this one. The tempting move is to build three separate agents—and it works, right up until you're maintaining three codebases, three sets of developmental quirks and bugs, and requisite fixes every time the underlying model changes. That's technical debt you signed up for without noticing. It requires ongoing effort and investment to manage, adding to the overall cost of these solutions. The better move is to find what they share and build it once.

## From Solution to Resource

To scale, the mindset shifts from building products to building infrastructure. Think of the framework like a standing mixer, one well-made machine that, with the right attachment, whips cream, kneads dough, or peels apples. You don't buy a new mixer for every recipe. It's the general-purpose base you build everything else on top of.

### Decoupling Framework from Instruction

So how do you actually build on that base? You start by pulling apart two things that usually get tangled together—the framework and the instructions—and treating them as separate layers.

**The Framework.** This is the engine. It holds the hard skills shared across every use case—in the standing-mixer analogy, it's the base, the machine that drives the work. You build it, you test it rigorously, you deploy it. Then it stays put.

**The Instructions.** This is the prompt-engineering layer: the context and the specific goal. Done well, it's adaptable—think of the front of the mixer, where you plug in whichever attachment the job calls for.

Separate the two and you unlock what developers call "write once, deploy many." One secure, high-performance framework can run twenty different agents. You just feed it twenty different instruction sets that fit an instructional template.

This is where differentiated AI solutions are gaining momentum, and also where you want to make sure you don't get left behind. The newest generation of solutions doesn't solve in a single shot; it works in a loop—plan a step, call a tool, look at what came back, adjust, go again. That looping behavior, plus the tools and memory and guardrails it leans on, belongs in the framework.

Build this once, build it well, and it can be deployed across multiple use cases with your organizational agents inheriting a loop you've actually tested. That's easier to maintain and better than something built on the fly or under a deadline. The principle here is reduce and reuse applied to the context of business tools and practices. And the more agents you have using this framework, the more you're enabling organizational scale, with compounding payoffs on what you've built and are maintaining.

**The Right Tool for the Job.** A well-equipped kitchen comes with multiple tools and appliances, and so should your framework. Sometimes you want a heavy, reasoning-focused model. Sometimes a fast lightweight option is the smarter call, more cost effective, and adequate for your use case. Because this is its own layer, you pick the right tool per context instead of marrying the whole system to one model. The inherent benefit here is flexibility.

From there you template each layer. The framework template holds what stays the same across agents. The instruction template holds what changes per use case. Getting away from metaphors and hypotheticals, let's look at one I built and used for a real application.

## Use Case: The Modular Training Agent

Don't you hate papers that spin around theoretical presumptions and never actually give you real details? I know I do, which is why I'm including this concrete example of how I used a decoupled framework inside an agentic solution I actually deployed—an adaptive training simulator. The goal was to deliver structured skills training and make it something that could support a whole pipeline of learning objectives that included sales enablement, compliance, customer-service onboarding, and more. Using the decoupled approach, we start from one question—what about a training is the same every single time, so we can build it into a repeatable framework?

That fixed part became the Framework: the course structure and scoring. I defined a three-segment module—an introduction with no scoring, a practice round with developmental feedback, and a graded activity with real assessment. Grading uses the same four metrics, one to five each, twenty points total. Same feedback structure, same certification tiers, same rules for nudging a wandering learner back on task (guardrails, so nobody derails the session asking the training bot for puppy potty-training tips). Now I'll challenge you to step back and notice what's missing from all of that. Did you figure it out? If you said that it's missing what is being taught, then you are correct! And that is the intention. It's pure machinery—build it once, test it once, run it for every course you'll ever offer.

The Instructions are what turn that fixed machinery into a course on a specific subject. This is where it gets more interesting than dropping a topic into a slot. On top of the framework sits a template: a reusable scaffold for generating a course. To build the sales-enablement version, I took that template, added the details that mattered—learning objectives, the context I wanted covered—and handed the whole thing to AI, which drafted a specific syllabus from those inputs aligned with the format I required to feed it back into my framework. To build the compliance version, same template, different inputs, new syllabus. I'm authoring the intent and AI drafts the course. All of this stays within the framework's rails—the module count, the assessments, and the scoring don't move. The subject changes; the pedagogy holds.

Here's the split. The shaded text is the framework, fixed once and reused. The bracketed values are the inputs I feed the template so AI can draft each subject's course:

```text
FRAMEWORK (fixed — built once)
  Module pattern: 1) Introduction  2) Practice  3) Graded
  Scoring: Clarity / Relevance / Specificity / Effectiveness
  1–5 each, 20 total. Certify at ≥70% / ≥85%.

TEMPLATE (per subject — AI drafts the course)
  Inputs: [subject], [learning objectives], [context]
  → AI drafts a syllabus that fills the framework's rails
```

Here's what this translates to. The framework—the part that was genuinely hard to get right—never changes, and standing up a new subject is a matter of new inputs, not a new build. Because the expensive work in a training simulator was never the subject matter; it was the development of the structure. Consistent scoring. Difficulty that ramps. Feedback that actually helps instead of just grading. Get that right once and every future course inherits it. Skip the decoupling and rebuild it per course, and you get drift—Module 3 of the sales training grades on a different curve than Module 3 of compliance, and eventually nobody can tell you why. Buggy at best and incredibly frustrating to untangle at its worst.

And this scales past answering and scoring into doing. Because the loop and the tool access live in the shared engine, an agent built on it doesn't have to stop at a response. It can record a score, update a learner's progress, issue a certificate, or hand off to a human for internal review. The instruction layer just says which actions each agent is allowed to take, and when. A knowledge agent and an action-taking agent ride the same foundation, only the instructions differ.

**The Scalable Solution.** Decoupling gives you something that's genuinely easier to test, maintain, and stretch across use cases—when it's built thoughtfully. I won't pretend it's effortless—but it's worth the investment to get it right. Now some of you may be a little overwhelmed. Maybe the recipe I've outlined in this paper feels like attempting your first soufflé: every ingredient and step is right there in front of you, but the technique is what you're worried about. If that's the case, I've got you covered in the next section.

## The Expert Advantage: Lowering the Risk of Failure

There's real value in bringing in people who've done this before, navigated the pitfalls, and have a process informed by experience. Think of it as a cooking class instead of a recipe card—a chef at your elbow, not just instructions on the counter. The right team gets you to a working solution faster and makes sure the thing is structurally sound and built to scale. And when a better model or a faster API shows up, staying current is their job, not yet another plate you're spinning.

That's the part of my job at Weaver I enjoy the most. We don't hand a client a pilot and wave goodbye, we build production systems meant to be tested, maintained, scaled, and organizationally valuable—the difference between baking one batch and standing up a kitchen that keeps running. And because the framework is decoupled, the models and tools and data behind each agent can be swapped and tuned as the technology moves. They're designed to be agile instead of being welded into something brittle and subject to constant change.

The other thing a good partner brings is their mise en place—in the professional kitchen sense. My team has built enough of these systems across enough organizations that we show up with a plan, the order of operations mapped, the likely failure points flagged, the best practices you haven't hit yet already accounted for. We've run this kitchen before, which means faster time to value and less getting lost in a learning curve. Getting the infrastructure right is table stakes—the real value is in how it keeps paying off as your AI use grows.

## Conclusion

We're past the experimentation phase of AI. Thinking forward means getting serious about efficiency and scale—you stop building for the exception and start building for the rule.

Decouple your frameworks from your instructions, template how those instructions get customized, lean on expert infrastructure to take the risk out of building and deploying, and you give your teams a way to use this technology to genuinely greater effect. And in terms of margins, that compounds—every use case you add accelerates the next one. Which, when you zoom out, is the big picture.
