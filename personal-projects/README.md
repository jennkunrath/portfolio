# Personal Projects

Apps I built on my own time, to solve personal problems. Please hold your jokes. Each folder holds the
project's README, its documentation, and where available its source and the prompts used to
generate it.

I build these fast, using natural-language prompting to get to a working prototype and also doing some manual code changes and review where needed. The prompts are kept alongside the code where I have them, because
with this way of working the specificity of the input is the skill.

## The projects

### 🧠 [MindfulApp](./mindful-app)

An AI journaling companion built for friends who needed compassionate support for the hours when I couldn't
pick up the phone. A journal thread conversation, an accomplishment tracker that celebrates what you did
instead of what's left, and a companion tuned to be supportive without being a annoyingly postive.

**Stack:** React, TypeScript, Express, PostgreSQL/Drizzle, OpenAI GPT-4o
**Includes:** full source, architecture notes, screenshots, and the three original build prompts

### 📖 [AI Manuscript Editor](./manuscript-editor)

An editorial pass on a book-length manuscript that stays continuity-aware across large contexts.
Fingerprints the author's voice from chapter one, carries an evolving story bible forward through
every chapter so it can catch a broken timeline or a character in two places at once, then checks
the finished structure against the Save the Cat beat sheet. Suggestiosns reviewable in a side bar. 
This is my attempt at using technology to create a personal editor for my own writing.

**Stack:** React, TypeScript, Express, SQLite/Drizzle, long-context Gemini
**The interesting part:** the story bible. Chapter-scoped tools can't see continuity issues or plot holes.

### 🐈 [Cat Sound Decoder](./cat-sound-decoder)

Interprets a cat vocalization in context by combining an audio classifier with observed ear and
tail position, then explaining whether the two signals agree. Trained on the publically available CatMeows dataset, with
body-language mappings drawn from the Feline Grimace Scale, Cornell's Feline Health Center, and the
ASPCA.

**Stack:** React 19, TypeScript, FastAPI, scikit-learn, librosa
**The interesting part:** the two signals are kept separate and the conflict is surfaced rather than
resolved. Also the most honest about its own limits, which is the harder engineering problem.

## A note on scope

These are personal builds, not products. Each README has a limitations section that means it.
Pet Sound Decoder in particular is an educational tool and says plainly that a concerning result
belongs in front of a veterinarian, not an app.
