import { Rocket, Timer as TimerIcon } from 'lucide-react';
import { TopicIcon } from '../components/TopicIcon';
import { getPool, topicQuestionCount } from '../data/bank';
import { COUNT_OPTIONS, LEVEL_BY_ID, LEVELS, TIMER_SECONDS, TOPIC_BY_ID, TOPICS } from '../data/topics';
import { useQuiz } from '../store/useQuiz';
import type { DraftSettings } from '../types';

export function Setup() {
  const draft = useQuiz((s) => s.draft);
  const setDraft = useQuiz((s) => s.setDraft);
  const launch = useQuiz((s) => s.launch);

  // How many questions the chosen topic × level can supply; limits the count chips.
  const available = draft.topic && draft.level ? getPool(draft.topic, draft.level).length : Infinity;
  const countOptions = COUNT_OPTIONS.filter((n) => n <= available);
  if (available !== Infinity && available < COUNT_OPTIONS[COUNT_OPTIONS.length - 1] && !countOptions.includes(available))
    countOptions.push(available);
  const countValid = draft.count !== null && draft.count <= available;
  const ready = draft.topic !== null && draft.level !== null && countValid && available > 0;

  return (
    <div className="mx-auto max-w-console px-4 pb-36 pt-8 sm:px-6 lg:pb-16 lg:pt-12">
      <header className="mb-8">
        <p className="hud-label">
          <span className="text-signal">//</span> Pre-flight configuration
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">Configure your run</h1>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-12">
          {/* 01 — Topic */}
          <fieldset>
            <Legend step="01" title="Select domain" />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {TOPICS.map((t) => (
                <label
                  key={t.id}
                  className={`group relative block cursor-pointer ${t.id === 'mixed' ? 'sm:col-span-2 xl:col-span-1' : ''}`}
                >
                  <input
                    type="radio"
                    name="topic"
                    value={t.id}
                    checked={draft.topic === t.id}
                    onChange={() => setDraft({ topic: t.id })}
                    className="peer sr-only"
                  />
                  <div
                    className={`panel flex h-full gap-4 p-4 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-signal/40 group-hover:bg-surface-2/80 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-signal peer-checked:border-signal peer-checked:bg-signal/[0.06] peer-checked:shadow-[var(--glow-signal)]`}
                  >
                    <span
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-[4px] border transition-colors ${
                        draft.topic === t.id ? 'border-signal/60 bg-signal/10 text-signal' : 'border-line bg-surface-2 text-ink-muted group-hover:text-signal'
                      }`}
                    >
                      <TopicIcon topic={t.id} />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display text-[17px] font-semibold leading-tight">{t.name}</span>
                      <span className="mt-1 block text-sm leading-snug text-ink-muted">{t.description}</span>
                      <span className="mt-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
                        {topicQuestionCount(t.id)} questions
                      </span>
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          {/* 02 — Level */}
          <fieldset>
            <Legend step="02" title="Clearance level" />
            <div className="grid gap-px overflow-hidden rounded-[6px] border border-line bg-line sm:grid-cols-3">
              {LEVELS.map((l) => {
                const active = draft.level === l.id;
                return (
                  <label key={l.id} className="relative block cursor-pointer">
                    <input
                      type="radio"
                      name="level"
                      value={l.id}
                      checked={active}
                      onChange={() => setDraft({ level: l.id })}
                      className="peer sr-only"
                    />
                    <div
                      className={`h-full p-4 transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:-outline-offset-2 peer-focus-visible:outline-signal ${
                        active ? 'bg-signal/[0.09]' : 'bg-surface-1 hover:bg-surface-2'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-display text-lg font-semibold ${active ? 'text-signal' : ''}`}>{l.name}</span>
                        <span className={`font-mono text-[11px] tracking-[0.14em] ${active ? 'text-signal' : 'text-ink-faint'}`}>
                          {l.code}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-ink-muted">{l.description}</p>
                      <LevelBars level={LEVELS.indexOf(l) + 1} active={active} />
                    </div>
                    {active && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-signal" aria-hidden="true" />}
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* 03 — Count + timer */}
          <fieldset>
            <Legend step="03" title="Number of questions" />
            <div className="flex flex-wrap items-center gap-3">
              {countOptions.map((n) => {
                const active = draft.count === n;
                return (
                  <label key={n} className="cursor-pointer">
                    <input
                      type="radio"
                      name="count"
                      value={n}
                      checked={active}
                      onChange={() => setDraft({ count: n })}
                      className="peer sr-only"
                    />
                    <span
                      className={`grid h-14 w-16 place-items-center rounded-[4px] border font-mono text-xl font-bold tabular-nums transition-all peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-signal ${
                        active
                          ? 'border-signal bg-signal text-void shadow-[var(--glow-signal)]'
                          : 'border-line bg-surface-1 text-ink hover:border-signal/50'
                      }`}
                    >
                      {n}
                    </span>
                  </label>
                );
              })}
            </div>
            {available !== Infinity && available < COUNT_OPTIONS[COUNT_OPTIONS.length - 1] && (
              <p className="mt-3 text-sm text-amber" role="status">
                This domain and level only has {available} questions, so the larger sizes are unavailable.
              </p>
            )}
            {draft.count !== null && !countValid && (
              <p className="mt-3 text-sm text-amber" role="status">
                {draft.count} questions isn't available for this selection. Pick a smaller size.
              </p>
            )}

            <div className="mt-8 flex items-center justify-between gap-4 rounded-[6px] border border-line bg-surface-1/70 p-4">
              <div className="flex items-start gap-3">
                <TimerIcon className="mt-0.5 h-5 w-5 text-ink-muted" aria-hidden="true" />
                <div>
                  <p id="timer-label" className="font-medium">
                    Countdown timer
                  </p>
                  <p className="text-sm text-ink-muted">
                    {draft.level
                      ? `${TIMER_SECONDS[draft.level]}s per question at ${LEVEL_BY_ID[draft.level].name}. Running out counts as wrong.`
                      : '30s / 45s / 60s per question depending on level.'}
                  </p>
                </div>
              </div>
              <Switch checked={draft.timer} onChange={(timer) => setDraft({ timer })} labelledBy="timer-label" />
            </div>
          </fieldset>
        </div>

        <Summary draft={draft} ready={ready} onLaunch={launch} />
      </div>
    </div>
  );
}

function Legend({ step, title }: { step: string; title: string }) {
  return (
    <legend className="mb-4 flex w-full items-center gap-3">
      <span className="font-mono text-sm text-signal">{step}</span>
      <span className="font-display text-xl font-semibold">{title}</span>
      <span className="h-px flex-1 bg-line" aria-hidden="true" />
    </legend>
  );
}

function LevelBars({ level, active }: { level: number; active: boolean }) {
  return (
    <div className="mt-3 flex gap-1" aria-hidden="true">
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={`h-1 w-6 rounded-full ${i <= level ? (active ? 'bg-signal' : 'bg-ink-faint') : 'bg-surface-3'}`}
        />
      ))}
    </div>
  );
}

function Switch({ checked, onChange, labelledBy }: { checked: boolean; onChange: (v: boolean) => void; labelledBy: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      onClick={() => onChange(!checked)}
      className={`relative h-8 w-14 shrink-0 rounded-full border transition-colors ${
        checked ? 'border-signal bg-signal/25' : 'border-line bg-surface-3'
      }`}
    >
      <span
        className={`absolute top-1 h-[22px] w-[22px] rounded-full transition-all duration-200 ${
          checked ? 'left-[27px] bg-signal shadow-[0_0_12px_rgb(var(--c-signal))]' : 'left-1 bg-ink-faint'
        }`}
      />
      <span className="sr-only">{checked ? 'On' : 'Off'}</span>
    </button>
  );
}

function Summary({ draft, ready, onLaunch }: { draft: DraftSettings; ready: boolean; onLaunch: () => void }) {
  const estimateSec =
    draft.count && draft.level ? draft.count * (draft.timer ? TIMER_SECONDS[draft.level] : 20) : null;
  const rows: [string, string | null][] = [
    ['Domain', draft.topic ? TOPIC_BY_ID[draft.topic].name : null],
    ['Level', draft.level ? LEVEL_BY_ID[draft.level].name : null],
    ['Questions', draft.count ? String(draft.count) : null],
    ['Timer', draft.timer && draft.level ? `${TIMER_SECONDS[draft.level]}s / question` : draft.timer ? 'On' : 'Off'],
  ];
  const missing = rows.slice(0, 3).filter(([, v]) => v === null).length;

  const launchButton = (
    <button type="button" className="btn-primary w-full" disabled={!ready} onClick={onLaunch}>
      <Rocket className="h-4 w-4" aria-hidden="true" /> Launch
    </button>
  );

  return (
    <>
      {/* Desktop: sticky side panel */}
      <aside className="hidden lg:block" aria-label="Run summary">
        <div className="panel brackets sticky top-20 p-5">
          <p className="hud-label">Run summary</p>
          <dl className="mt-4 space-y-3 font-mono text-sm">
            {rows.map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-3 border-b border-dashed border-line pb-3">
                <dt className="text-ink-faint">{k}</dt>
                <dd className={v ? 'text-right text-ink' : 'text-ink-faint'}>{v ?? '-- pending'}</dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-ink-faint">Est. time</dt>
              <dd className="text-amber">{estimateSec ? `~${Math.ceil(estimateSec / 60)} min` : '--'}</dd>
            </div>
          </dl>
          <div className="mt-6">{launchButton}</div>
          <p className="mt-3 text-center font-mono text-[11px] tracking-[0.1em] text-ink-faint" aria-live="polite">
            {ready ? 'ALL SYSTEMS GO' : `${missing || 1} SELECTION${missing === 1 ? '' : 'S'} REMAINING`}
          </p>
        </div>
      </aside>

      {/* Mobile: sticky bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-void/90 p-4 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-console items-center gap-4">
          <div className="min-w-0 flex-1 font-mono text-xs leading-relaxed">
            <p className="truncate text-ink">{draft.topic ? TOPIC_BY_ID[draft.topic].name : 'Domain --'}</p>
            <p className="truncate text-ink-faint">
              {draft.level ? LEVEL_BY_ID[draft.level].name : 'Level --'} · {draft.count ?? '--'} Q · timer{' '}
              {draft.timer ? 'on' : 'off'}
            </p>
          </div>
          <div className="w-36 shrink-0">{launchButton}</div>
        </div>
      </div>
    </>
  );
}
