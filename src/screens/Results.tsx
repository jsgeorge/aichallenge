import { motion, useReducedMotion } from 'framer-motion';
import { Check, ChevronDown, Plus, RotateCcw, Target, X as XIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { ScoreRing } from '../components/ScoreRing';
import { TopicIcon } from '../components/TopicIcon';
import { LEVEL_BY_ID, TOPIC_BY_ID } from '../data/topics';
import { formatDuration, scoreOf, tierFor, TIERS } from '../lib/scoring';
import { useQuiz } from '../store/useQuiz';

export function Results() {
  const live = useQuiz((s) => s.session);
  // Hold on to the finished session: during the exit animation after Retry or
  // Review, the store already holds the next (unanswered) session.
  const frozen = useRef(live);
  if (live?.finishedAt) frozen.current = live;
  const session = frozen.current;
  const retry = useQuiz((s) => s.retry);
  const drill = useQuiz((s) => s.drillMistakes);
  const go = useQuiz((s) => s.go);
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState<'all' | 'mistakes'>('all');

  if (!session?.finishedAt) return null;

  const { correct, total, pct, timeMs } = scoreOf(session.answers);
  const tier = tierFor(pct);
  const tierRank = TIERS.length - TIERS.indexOf(tier); // 1..4
  const mistakes = session.answers.filter((a) => !a.correct).length;
  const answerById = new Map(session.answers.map((a) => [a.questionId, a]));
  const items = session.questions.filter((q) => filter === 'all' || !answerById.get(q.id)?.correct);

  return (
    <div className="mx-auto max-w-console px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
      <p className="hud-label">
        <span className="text-signal">//</span> Debrief · {TOPIC_BY_ID[session.settings.topic].name} ·{' '}
        {LEVEL_BY_ID[session.settings.level].name}
        {session.mode === 'review' && <span className="text-amber"> · Mistake drill</span>}
      </p>

      <section className="mt-6 grid items-center gap-10 lg:grid-cols-[auto_1fr]" aria-label="Score">
        <div className="mx-auto">
          <ScoreRing pct={pct} />
        </div>

        <div>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="hud-label flex items-center gap-2"
          >
            Classification
            <span className="flex gap-1" aria-label={`Tier ${tierRank} of ${TIERS.length}`}>
              {TIERS.map((_, i) => (
                <span key={i} className={`h-1.5 w-5 rounded-full ${i < tierRank ? 'bg-amber' : 'bg-surface-3'}`} />
              ))}
            </span>
          </motion.p>
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-2 font-display text-4xl font-extrabold uppercase leading-none tracking-tight sm:text-6xl"
          >
            {tier.name}
          </motion.h1>
          <p className="mt-3 max-w-xl text-ink-muted">{tier.blurb}</p>

          <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-[6px] border border-line bg-line sm:grid-cols-4">
            <Stat label="Score" value={`${correct}/${total}`} />
            <Stat label="Time" value={formatDuration(timeMs)} />
            <Stat label="Best streak" value={`×${session.bestStreak}`} accent="amber" />
            <Stat label="Avg / question" value={`${total ? Math.round(timeMs / total / 1000) : 0}s`} />
          </dl>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" className="btn-primary" onClick={retry}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> Retry same settings
            </button>
            <button type="button" className="btn-ghost" onClick={() => go('setup')}>
              <Plus className="h-4 w-4" aria-hidden="true" /> New challenge
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={drill}
              disabled={mistakes === 0}
              title={mistakes === 0 ? 'No mistakes to review' : undefined}
            >
              <Target className="h-4 w-4" aria-hidden="true" /> Review mistakes only
              {mistakes > 0 && <span className="text-bad">({mistakes})</span>}
            </button>
          </div>
        </div>
      </section>

      <section className="mt-16" aria-labelledby="review-heading">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-3">
          <h2 id="review-heading" className="font-display text-2xl font-bold">
            Question review
          </h2>
          <div role="tablist" aria-label="Filter review" className="flex rounded-[4px] border border-line p-0.5 font-mono text-xs">
            {(['all', 'mistakes'] as const).map((f) => (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={filter === f}
                onClick={() => setFilter(f)}
                className={`min-h-[36px] rounded-[3px] px-3 uppercase tracking-[0.14em] transition-colors ${
                  filter === f ? 'bg-surface-3 text-ink' : 'text-ink-faint hover:text-ink'
                }`}
              >
                {f === 'all' ? `All (${total})` : `Mistakes (${mistakes})`}
              </button>
            ))}
          </div>
        </div>

        {items.length === 0 ? (
          <p className="panel p-6 text-center text-ink-muted">Clean run. There are no mistakes to show.</p>
        ) : (
          <ol className="space-y-2">
            {items.map((q) => {
              const a = answerById.get(q.id)!;
              const n = session.questions.indexOf(q) + 1;
              return (
                <li key={q.id}>
                  <details className="panel group overflow-hidden open:border-line [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex min-h-[56px] cursor-pointer list-none items-center gap-3 px-4 py-3 hover:bg-surface-2/60">
                      <span
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-[4px] ${
                          a.correct ? 'bg-ok/15 text-ok' : 'bg-bad/15 text-bad'
                        }`}
                      >
                        {a.correct ? <Check className="h-4 w-4" aria-hidden="true" /> : <XIcon className="h-4 w-4" aria-hidden="true" />}
                        <span className="sr-only">{a.correct ? 'Correct' : 'Incorrect'}</span>
                      </span>
                      <span className="font-mono text-xs text-ink-faint">{String(n).padStart(2, '0')}</span>
                      <span className="flex-1 text-[15px] leading-snug">{q.question}</span>
                      <TopicIcon topic={q.topic} className="hidden h-4 w-4 shrink-0 text-ink-faint sm:block" />
                      <ChevronDown className="h-4 w-4 shrink-0 text-ink-faint transition-transform group-open:rotate-180" aria-hidden="true" />
                    </summary>
                    <div className="space-y-3 border-t border-line px-4 py-4 text-sm sm:pl-[3.75rem]">
                      {q.code && (
                        <pre className="overflow-x-auto rounded-[4px] border border-line bg-[#05060A] p-3 font-mono text-xs leading-relaxed">
                          <code>{q.code}</code>
                        </pre>
                      )}
                      <AnswerLine
                        label="Your answer"
                        tone={a.correct ? 'ok' : 'bad'}
                        text={a.selected === null ? 'No answer: time ran out' : q.options[a.selected]}
                      />
                      {!a.correct && <AnswerLine label="Correct answer" tone="ok" text={q.options[q.answerIndex]} />}
                      <p className="leading-relaxed text-ink-muted">{q.explanation}</p>
                    </div>
                  </details>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: 'amber' }) {
  return (
    <div className="bg-surface-1 px-4 py-3">
      <dt className="hud-label">{label}</dt>
      <dd className={`mt-1 font-mono text-xl font-bold tabular-nums sm:text-2xl ${accent === 'amber' ? 'text-amber' : ''}`}>{value}</dd>
    </div>
  );
}

function AnswerLine({ label, tone, text }: { label: string; tone: 'ok' | 'bad'; text: string }) {
  return (
    <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span className={`inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.14em] ${tone === 'ok' ? 'text-ok' : 'text-bad'}`}>
        {tone === 'ok' ? <Check className="h-3 w-3" aria-hidden="true" /> : <XIcon className="h-3 w-3" aria-hidden="true" />}
        {label}
      </span>
      <span className="text-ink">{text}</span>
    </p>
  );
}
