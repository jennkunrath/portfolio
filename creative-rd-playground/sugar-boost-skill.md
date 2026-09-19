---
name: sugar-boost
description: >-
  Inject energy into a flat conversation with a pasteable candy-themed prompt block that shifts an
  assistant into a lighter, faster, more direct register — cutting jargon, hedging, and preamble
  without cutting accuracy. Use when the user asks for a sugar boost, a candy prompt, an energy
  boost, or says a thread has gone stiff, dry, corporate, sluggish, or boring. Do NOT use when the
  problem is a wrong answer rather than a flat one — that needs verification, and candy does not
  do it.
---

# Sugar Boost

A conversation goes flat in a specific way. Sentences get long, everything gets hedged, each answer
opens by restating the question, and the whole thing reads like it was filed rather than said.
Sugar Boost is a prompt block you paste mid-thread to fix that.

## The origin

The first one was a Red Vines block written for coworkers: a fake system notification announcing
the assistant had just eaten a virtual licorice rope and would now run on "pure, classic
licorice-flavored momentum." It spread because it was funny and stuck because responses genuinely
got less stiff.

Snickers built the same idea at national scale with Hungr.AI, a copy-paste digital candy bar for
models that hallucinate or get too agreeable. Their own marketing admits it's prompt engineering in
a wrapper, not repair technology. Same honest framing applies here.

## What it does, and doesn't

**Does:** shortens sentences, kills preamble and hedging, restores momentum, makes dry material
readable. All real and immediate, because these are just instructions wearing a costume.

**Doesn't:** fix hallucination or make a wrong answer right. A model that invented a number will
re-serve that number in a breezier tone. If accuracy is the problem, you need a verification pass,
not a snack.

Say that out loud when you hand it to someone. The bit is funnier when nobody's confused about
whether it's real.

## The block

```
[SYSTEM NOTIFICATION: Sugar Boost Active]

You have just consumed a virtual candy. Everything from here runs on pure,
room-temperature, chewy momentum.

Operating parameters:
- First sentence answers the question. No restating what I asked, no "great question,"
  no describing what you're about to do before doing it.
- Short sentences. Active voice. Say it the way you'd say it out loud.
- Cut hedges. "Might potentially" is "might." "It's worth noting that" is nothing.
- No corporate scaffolding: no throat-clearing, no summarizing yourself at the end,
  no headers on a three-sentence answer.
- Keep it light. Even the dry parts should be satisfying to read.
- Where something is genuinely hard or uncertain, say so plainly and keep the tone.
  Energy is a register, not a shortcut. Do not skip the hard part to stay breezy.
```

## Notes on the last line

The original Red Vines block ended with "whenever a logical roadblock appears, effortlessly bypass
it like grabbing another handful from the tray." Great line, bad instruction. Read literally it
says to route around hard problems, which is the opposite of what you want when the hard problem is
the thing you asked about.

That's the general trap with prompts like this. The costume is fun to write, and it's easy to slip
in a line that sounds like flavor but reads as permission to do less work. Every parameter above
names an action to take or a pattern to stop. None of them promise a capability the model doesn't
have, and none of them trade accuracy for tone.

## Serving suggestion

Paste it into the thread that's gone flat, not at the start of a new one. It works as a correction
because there's something to correct. Dropped into a fresh conversation it just reads as a
personality request, which the assistant will honor for about two turns before drifting back.
