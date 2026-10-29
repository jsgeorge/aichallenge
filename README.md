# AI Challenge

A mission-control style quiz that tests what you know about artificial intelligence. Pick a domain, a clearance level and a run size. Answer questions one at a time with instant feedback and explanations, then get a scored debrief.

- **8 domains + Mixed**: General AI, Machine Learning, LLMs, RAG, AI Models, Prompt Engineering, AI Agents & Tool Use, AI Ethics & Safety.
- **3 levels**: Beginner (concepts and vocabulary), Intermediate (how things work, trade-offs), Advanced (architecture, math intuition, edge cases, scenarios, code snippets).
- **480 questions**: 20 per topic per level, so a 20-question run never repeats.
- Question and option order are shuffled every attempt. The optional countdown timer gives 30s / 45s / 60s per question by level.
- Streak counter, animated score ring, four performance tiers, full review and a "Review mistakes only" drill.
- History, best score per domain and a score-over-time chart, all stored in `localStorage`.

## Setup

Requires Node 18+.

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

| Script              | What it does                                                    |
| ------------------- | --------------------------------------------------------------- |
| `npm run build`     | Validates the question bank, type-checks, builds to `dist/`     |
| `npm run preview`   | Serves the production build                                     |
| `npm run validate`  | Checks every question file against the schema and minimum counts |
| `npm run typecheck` | `tsc --noEmit`                                                  |

No backend or API keys are needed.

## Stack

React 18 + Vite + TypeScript, Tailwind CSS (colors mapped to CSS variables), Framer Motion, Recharts (lazy-loaded on the history screen), Zustand.

```
src/
  components/   Background (node mesh), Header, Modal, ScoreRing, Timer, StreakBadge, TopicIcon, ErrorBoundary
  screens/      Home, Setup, Quiz, Results, History
  data/
    questions/  one JSON file per topic (general, ml, llm, rag, models, prompting, agents, ethics)
    bank.ts     loads the JSON files, builds pools per topic/level
    topics.ts   topic + level metadata, count options, timer durations
  lib/          shuffle, quiz building, scoring/tiers, storage, token helper
  store/        useQuiz: Zustand store for screen, settings, session, history
  styles/       tokens.css (design tokens) + index.css (Tailwind layers)
scripts/
  validate-questions.mjs
```

## Adding questions

1. Open the topic file in `src/data/questions/`, e.g. `rag.json`.
2. Append an object that follows this schema:

   ```json
   {
     "id": "rag-int-021",
     "topic": "rag",
     "level": "intermediate",
     "type": "multiple_choice",
     "question": "Why chunk documents before embedding them?",
     "code": "optional monospace snippet, shown in a code block",
     "options": ["…", "…", "…", "…"],
     "answerIndex": 1,
     "explanation": "1–3 sentences on why the answer is right.",
     "tags": ["chunking"]
   }
   ```

   Rules, enforced by `npm run validate`:
   - `id` is unique across all files. The convention is `<prefix>-<beg|int|adv>-<NNN>`.
   - `topic` matches the file name.
   - `level` is `beginner`, `intermediate` or `advanced`.
   - `multiple_choice` has exactly 4 unique options. `true_false` has exactly `["True", "False"]`, which is never shuffled.
   - `answerIndex` points at the correct option, using its position in the file. Options are shuffled at runtime and the index is remapped.
   - Each topic needs at least 20 questions per level.
   - Avoid "all of the above" style options, because they break under shuffling.

3. Run `npm run validate`.

**Adding a new topic:** create `src/data/questions/<id>.json`, add the id to `TopicId` in `src/types.ts`, import it in `src/data/bank.ts`, add metadata in `src/data/topics.ts`, and add a glyph to `src/components/TopicIcon.tsx`.

**Content guidelines:** each question has one defensible answer and plausible distractors. For the AI Models topic, stick to durable facts (who makes what, architecture, API concepts) rather than prices or version numbers.

## Behavior notes

- **Refresh mid-quiz:** the in-progress session is saved after every answer. On reload you get a Resume / Discard prompt. On resume, the current question's clock restarts.
- **Timer runs out:** the question counts as wrong, the correct answer and explanation are shown, and the review shows "No answer: time ran out".
- **Small pools:** the setup screen disables run sizes larger than the selected topic × level pool, and adds a chip for the exact pool size if it's under 20.
- **Mistake drills** re-deal only the questions you missed. They aren't recorded in history, so stats reflect full runs only.
- **Keyboard:** `1`–`4` or `A`–`D` to answer (`T`/`F` also work on true/false), and `Enter` for next. Every control is reachable with Tab, and focus rings are always visible.
- **Accessibility:** right and wrong are shown with ✓/✗ icons and text labels as well as color. A live region announces each result. `prefers-reduced-motion` disables the background animation and motion effects.

## Possible extension: generated questions

The spec's optional "Generate fresh questions" mode isn't included. To add it, create a server route (for example a Vite middleware or a small serverless function) that holds the LLM API key in an environment variable and asks the model for questions in the schema above. Validate the response with the same rules as `scripts/validate-questions.mjs`, and fall back to the local bank on any error. Never put the key in client code.
