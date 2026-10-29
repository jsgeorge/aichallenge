import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Check, CornerDownLeft, X as XIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Modal } from '../components/Modal';
import { StreakBadge } from '../components/StreakBadge';
import { Timer } from '../components/Timer';
import { TopicIcon } from '../components/TopicIcon';
import { LEVEL_BY_ID, TIMER_SECONDS, TOPIC_BY_ID } from '../data/topics';
import { useQuiz } from '../store/useQuiz';

const LETTERS = ['A', 'B', 'C', 'D'];

export function Quiz() {
  const session = useQuiz((s) => s.session);
  const answer = useQuiz((s) => s.answer);
  const next = useQuiz((s) => s.next);
  const quit = useQuiz((s) => s.quit);
  const reduce = useReducedMotion();
  const [confirmQuit, setConfirmQuit] = useState(false);
  const nextRef = useRef<HTMLButtonElement>(null);
  const questionRef = useRef<HTMLHeadingElement>(null);

  const q = session?.questions[session.index];
  const record = session && session.answers.length > session.index ? session.answers[session.index] : null;
  const answered = record !== null;
  const isLast = session ? session.index === session.questions.length - 1 : false;

  const choose = useCallback((i: number) => !answered && answer(i), [answered, answer]);

  // Keyboard: 1–4 / A–D (and T/F for true-false) to answer, Enter for next.
  useEffect(() => {
    if (!q || confirmQuit) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      const key = e.key.toLowerCase();
      if (!answered) {
        let idx = -1;
        if (/^[1-4]$/.test(key)) idx = Number(key) - 1;
        else if (/^[a-d]$/.test(key)) idx = key.charCodeAt(0) - 97;
        else if (q.type === 'true_false' && (key === 't' || key === 'f')) idx = key === 't' ? 0 : 1;
        if (idx >= 0 && idx < q.options.length) {
          e.preventDefault();
          choose(idx);
        }
      } else if (e.key === 'Enter' && target.tagName !== 'BUTTON') {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [q, answered, choose, next, confirmQuit]);

  // After answering, move focus to Next so Enter/Space continue naturally.
  useEffect(() => {
    if (answered) nextRef.current?.focus({ preventScroll: true });
  }, [answered]);

  // New question: move focus to the question heading for screen readers.
  useEffect(() => {
    questionRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }, [session?.index, reduce]);

  if (!session || !q) return null;

  const topic = TOPIC_BY_ID[q.topic];
  const level = LEVEL_BY_ID[session.settings.level];
  const total = session.questions.length;

  const liveMessage = record
    ? record.timedOut
      ? `Time's up. The correct answer is ${q.options[q.answerIndex]}.`
      : record.correct
        ? `Correct. ${session.streak >= 3 ? `Streak of ${session.streak}.` : ''}`
        : `Incorrect. The correct answer is ${q.options[q.answerIndex]}.`
    : '';

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
      {/* HUD bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex min-w-0 items-center gap-2 rounded-[4px] border border-line bg-surface-1/80 px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
            <TopicIcon topic={q.topic} className="h-3.5 w-3.5 shrink-0 text-signal" />
            <span className="truncate">{topic.short}</span>
            <span className="text-line">/</span>
            <span>{level.code}</span>
          </span>
          {session.mode === 'review' && (
            <span className="rounded-[4px] border border-amber/50 px-2 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-amber">
              Mistake drill
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <StreakBadge streak={session.streak} />
          {session.settings.timer && (
            <Timer
              seconds={TIMER_SECONDS[session.settings.level]}
              startedAt={session.questionStartedAt}
              running={!answered}
              onExpire={() => answer(null)}
            />
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="mt-5">
        <div className="mb-2 flex items-baseline justify-between font-mono text-xs tracking-[0.14em] text-ink-faint">
          <span>
            <span className="text-ink">Q {session.index + 1}</span> / {total}
          </span>
          <span>{Math.round((session.answers.length / total) * 100)}% complete</span>
        </div>
        <div
          className="flex h-1.5 gap-[3px]"
          role="progressbar"
          aria-label="Quiz progress"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={session.answers.length}
        >
          {session.questions.map((sq, i) => {
            const a = session.answers[i];
            const cls = a
              ? a.correct
                ? 'bg-ok'
                : 'bg-bad'
              : i === session.index
                ? 'bg-signal/70 animate-pulse'
                : 'bg-surface-3';
            return <span key={sq.id} className={`flex-1 rounded-full transition-colors duration-300 ${cls}`} />;
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.section
          key={q.id + session.index}
          initial={reduce ? false : { opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, x: -24 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8"
          aria-labelledby="question-text"
        >
          <p className="hud-label mb-3">
            {q.type === 'true_false' ? 'True or false' : 'Multiple choice'}
          </p>
          <h1
            id="question-text"
            ref={questionRef}
            tabIndex={-1}
            className="text-balance font-sans text-[22px] font-semibold leading-snug outline-none sm:text-[26px]"
          >
            {q.question}
          </h1>

          {q.code && (
            <pre className="mt-5 overflow-x-auto rounded-[6px] border border-line bg-[#05060A] p-4 font-mono text-[13px] leading-relaxed text-ink">
              <code>{q.code}</code>
            </pre>
          )}

          <ul className={`mt-6 grid gap-3 ${q.type === 'true_false' ? 'sm:grid-cols-2' : ''}`} role="list">
            {q.options.map((opt, i) => (
              <li key={opt}>
                <OptionButton
                  letter={LETTERS[i]}
                  text={opt}
                  state={
                    !record
                      ? 'idle'
                      : i === q.answerIndex
                        ? 'correct'
                        : i === record.selected
                          ? 'wrong'
                          : 'dim'
                  }
                  picked={record?.selected === i}
                  disabled={answered}
                  onClick={() => choose(i)}
                />
              </li>
            ))}
          </ul>

          <div aria-live="assertive" className="sr-only">
            {liveMessage}
          </div>

          <AnimatePresence>
            {record && (
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className={`mt-6 rounded-[6px] border-l-2 bg-surface-1/90 p-5 ${record.correct ? 'border-ok' : 'border-bad'}`}
              >
                <p
                  className={`flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.16em] ${
                    record.correct ? 'text-ok' : 'text-bad'
                  }`}
                >
                  {record.correct ? <Check className="h-4 w-4" aria-hidden="true" /> : <XIcon className="h-4 w-4" aria-hidden="true" />}
                  {record.timedOut ? "Time's up" : record.correct ? 'Correct' : 'Incorrect'}
                </p>
                <p className="mt-2 leading-relaxed text-ink">{q.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between gap-3">
            <button type="button" className="btn-ghost min-h-[44px] px-4 text-xs" onClick={() => setConfirmQuit(true)}>
              Abort
            </button>
            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-1.5 font-mono text-[11px] text-ink-faint md:flex">
                {answered ? (
                  <>
                    <span className="kbd">
                      <CornerDownLeft className="h-3 w-3" aria-hidden="true" />
                    </span>
                    next
                  </>
                ) : (
                  <>
                    <span className="kbd">1</span>–<span className="kbd">{q.options.length}</span> or{' '}
                    <span className="kbd">A</span>–<span className="kbd">{LETTERS[q.options.length - 1]}</span> to answer
                  </>
                )}
              </span>
              <button ref={nextRef} type="button" className="btn-primary" disabled={!answered} onClick={next}>
                {isLast ? 'See results' : 'Next'} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </motion.section>
      </AnimatePresence>

      <Modal
        open={confirmQuit}
        label="Abort mission"
        title="Leave this challenge?"
        onClose={() => setConfirmQuit(false)}
        actions={
          <>
            <button type="button" className="btn-ghost" onClick={() => setConfirmQuit(false)}>
              Keep going
            </button>
            <button
              type="button"
              className="btn border border-bad/60 bg-bad/10 text-bad hover:bg-bad/20"
              onClick={() => {
                setConfirmQuit(false);
                quit();
              }}
            >
              Abort run
            </button>
          </>
        }
      >
        <p>Your progress on this run will be discarded and won't be saved to history.</p>
      </Modal>
    </div>
  );
}

type OptionState = 'idle' | 'correct' | 'wrong' | 'dim';

function OptionButton({
  letter,
  text,
  state,
  picked,
  disabled,
  onClick,
}: {
  letter: string;
  text: string;
  state: OptionState;
  picked: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const reduce = useReducedMotion();
  const styles: Record<OptionState, string> = {
    idle: 'border-line bg-surface-1/80 hover:-translate-y-0.5 hover:border-signal/60 hover:bg-surface-2 hover:shadow-[var(--glow-signal)]',
    correct: 'border-ok bg-ok/10 text-ink',
    wrong: 'border-bad bg-bad/10 text-ink',
    dim: 'border-line/60 bg-surface-1/40 text-ink-faint',
  };
  const keyStyles: Record<OptionState, string> = {
    idle: 'border-line text-ink-muted group-hover:border-signal group-hover:text-signal',
    correct: 'border-ok bg-ok text-void',
    wrong: 'border-bad bg-bad text-void',
    dim: 'border-line/60 text-ink-faint',
  };
  const label = state === 'correct' ? (picked ? 'Your answer · correct' : 'Correct answer') : state === 'wrong' ? 'Your answer' : null;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`${letter}: ${text}${label ? ` (${label})` : ''}`}
      animate={
        reduce || state === 'idle' || state === 'dim'
          ? undefined
          : state === 'wrong'
            ? { x: [0, -6, 6, -3, 3, 0] }
            : { scale: [1, 1.015, 1] }
      }
      transition={{ duration: 0.4 }}
      className={`group flex min-h-[60px] w-full items-center gap-4 rounded-[6px] border px-4 py-3 text-left transition-all duration-200 disabled:cursor-default ${styles[state]}`}
    >
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-[4px] border font-mono text-sm font-bold transition-colors ${keyStyles[state]}`}
        aria-hidden="true"
      >
        {state === 'correct' ? <Check className="h-4 w-4" /> : state === 'wrong' ? <XIcon className="h-4 w-4" /> : letter}
      </span>
      <span className="flex-1 text-[15px] leading-snug sm:text-base">
        {text}
        {label && (
          <span
            className={`mt-1 block font-mono text-[10px] uppercase tracking-[0.14em] sm:hidden ${
              state === 'correct' ? 'text-ok' : 'text-bad'
            }`}
            aria-hidden="true"
          >
            {label}
          </span>
        )}
      </span>
      {label && (
        <span
          className={`hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] sm:block ${
            state === 'correct' ? 'text-ok' : 'text-bad'
          }`}
        >
          {label}
        </span>
      )}
    </motion.button>
  );
}
