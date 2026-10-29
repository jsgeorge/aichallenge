import { motion } from 'framer-motion';
import { ArrowRight, History as HistoryIcon } from 'lucide-react';
import { Modal } from '../components/Modal';
import { TopicIcon } from '../components/TopicIcon';
import { ALL_QUESTIONS } from '../data/bank';
import { LEVEL_BY_ID, TOPIC_BY_ID, TOPICS } from '../data/topics';
import { useQuiz } from '../store/useQuiz';

const rise = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.08 * i, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }),
};

export function Home() {
  const go = useQuiz((s) => s.go);
  const history = useQuiz((s) => s.history);
  const pending = useQuiz((s) => s.pendingResume);
  const resume = useQuiz((s) => s.resume);
  const discard = useQuiz((s) => s.discardResume);

  const last = history[history.length - 1];
  const best = history.reduce((m, h) => Math.max(m, h.pct), 0);

  return (
    <div className="mx-auto max-w-console px-4 pb-16 pt-10 sm:px-6 sm:pt-16 lg:pt-24">
      <motion.p variants={rise} initial="hidden" animate="show" custom={0} className="hud-label">
        <span className="text-signal">//</span> Knowledge diagnostic · {ALL_QUESTIONS.length} probes loaded
      </motion.p>

      <h1 className="mt-5 font-display font-extrabold uppercase leading-[0.86] tracking-[-0.03em]">
        <motion.span
          variants={rise}
          initial="hidden"
          animate="show"
          custom={1}
          className="block text-[clamp(4.5rem,17vw,11rem)] text-signal"
          style={{ textShadow: '0 0 60px rgb(var(--c-signal) / 0.35)' }}
        >
          AI
        </motion.span>
        <motion.span
          variants={rise}
          initial="hidden"
          animate="show"
          custom={2}
          className="block whitespace-nowrap text-[clamp(1.75rem,7.6vw,5.75rem)]"
        >
          Challenge
          <span className="cursor-blink ml-[0.12em] inline-block h-[0.7em] w-[0.36em] bg-amber align-baseline" aria-hidden="true" />
        </motion.span>
      </h1>

      <div className="mt-4 grid items-end gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <motion.p
            variants={rise}
            initial="hidden"
            animate="show"
            custom={3}
            className="mt-7 max-w-xl text-lg text-ink-muted sm:text-xl"
          >
            How well do you actually know the machines? Pick a domain and a clearance level, then find out.
          </motion.p>

          <motion.div variants={rise} initial="hidden" animate="show" custom={4} className="mt-9 flex flex-wrap gap-3">
            <button type="button" className="btn-primary px-7" onClick={() => go('setup')}>
              Start Challenge <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" className="btn-ghost" onClick={() => go('history')}>
              <HistoryIcon className="h-4 w-4" aria-hidden="true" /> Mission log
            </button>
          </motion.div>
        </div>

        <motion.aside
          variants={rise}
          initial="hidden"
          animate="show"
          custom={3}
          className="panel brackets p-5 lg:col-span-5 lg:mb-3"
          aria-label="Mission brief"
        >
          <div className="flex items-center justify-between">
            <p className="hud-label">Mission brief</p>
            <p className="hud-label text-ok">● Ready</p>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-[4px] border border-line bg-line">
            <Stat label="Domains" value="08" />
            <Stat label="Clearance levels" value="03" />
            <Stat label="Last run" value={last ? `${last.pct}%` : '--'} accent={!!last} />
            <Stat label="Best score" value={history.length ? `${best}%` : '--'} accent={!!history.length} />
          </dl>
          <p className="mt-4 font-mono text-xs leading-relaxed text-ink-faint">
            {last
              ? `> last: ${TOPIC_BY_ID[last.topic].name} · ${LEVEL_BY_ID[last.level].name} · ${last.correct}/${last.count}`
              : '> no runs logged. awaiting first launch_'}
          </p>
        </motion.aside>
      </div>

      <motion.section
        variants={rise}
        initial="hidden"
        animate="show"
        custom={5}
        aria-label="Available domains"
        className="mt-16 border-t border-line pt-6 lg:mt-24"
      >
        <p className="hud-label mb-4">Module index</p>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
          {TOPICS.map((t, i) => (
            <li key={t.id} className="flex items-center gap-2.5 text-sm text-ink-muted">
              <span className="font-mono text-[11px] text-ink-faint">{String(i + 1).padStart(2, '0')}</span>
              <TopicIcon topic={t.id} className="h-4 w-4 text-signal/80" />
              <span className="truncate">{t.name}</span>
            </li>
          ))}
        </ul>
      </motion.section>

      <Modal
        open={!!pending}
        label="Interrupted session"
        title="Resume your challenge?"
        onClose={discard}
        actions={
          <>
            <button type="button" className="btn-ghost" onClick={discard}>
              Discard
            </button>
            <button type="button" className="btn-primary" onClick={resume}>
              Resume
            </button>
          </>
        }
      >
        {pending && (
          <p>
            You have an unfinished run: <span className="text-ink">{TOPIC_BY_ID[pending.settings.topic].name}</span>,{' '}
            {LEVEL_BY_ID[pending.settings.level].name}. You've answered {pending.answers.length} of{' '}
            {pending.questions.length} questions. The clock restarts for the current question.
          </p>
        )}
      </Modal>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-surface-1 px-4 py-3">
      <dt className="hud-label">{label}</dt>
      <dd className={`mt-1 font-mono text-2xl font-bold tabular-nums ${accent ? 'text-signal' : 'text-ink'}`}>{value}</dd>
    </div>
  );
}
