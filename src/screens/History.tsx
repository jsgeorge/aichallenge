import { ArrowRight, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Modal } from '../components/Modal';
import { TopicIcon } from '../components/TopicIcon';
import { LEVEL_BY_ID, TOPIC_BY_ID, TOPICS } from '../data/topics';
import { formatDuration } from '../lib/scoring';
import { tokenColor } from '../lib/tokens';
import { useQuiz } from '../store/useQuiz';
import type { HistoryEntry } from '../types';

const dateFmt = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
const dateTimeFmt = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

export function History() {
  const history = useQuiz((s) => s.history);
  const clear = useQuiz((s) => s.clearHistory);
  const go = useQuiz((s) => s.go);
  const [confirm, setConfirm] = useState(false);

  const bestByTopic = useMemo(() => {
    const m = new Map<string, HistoryEntry>();
    for (const h of history) {
      const cur = m.get(h.topic);
      if (!cur || h.pct > cur.pct) m.set(h.topic, h);
    }
    return m;
  }, [history]);

  const avg = history.length ? Math.round(history.reduce((s, h) => s + h.pct, 0) / history.length) : 0;
  const totalQ = history.reduce((s, h) => s + h.count, 0);

  if (history.length === 0) {
    return (
      <div className="mx-auto max-w-console px-4 pb-16 pt-12 sm:px-6">
        <Heading />
        <div className="panel brackets mt-8 p-10 text-center">
          <p className="font-mono text-sm text-ink-faint">&gt; mission log empty_</p>
          <p className="mx-auto mt-3 max-w-md text-ink-muted">
            Complete a challenge and your score, time and streak will show up here.
          </p>
          <button type="button" className="btn-primary mt-6" onClick={() => go('setup')}>
            Start a challenge <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  const chartData = history.map((h, i) => ({ n: i + 1, pct: h.pct, entry: h }));

  return (
    <div className="mx-auto max-w-console px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Heading />
        <button type="button" className="btn-ghost min-h-[44px] text-xs" onClick={() => setConfirm(true)}>
          <Trash2 className="h-4 w-4" aria-hidden="true" /> Clear log
        </button>
      </div>

      <dl className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-[6px] border border-line bg-line">
        <Stat label="Runs" value={String(history.length)} />
        <Stat label="Avg score" value={`${avg}%`} />
        <Stat label="Questions" value={String(totalQ)} />
      </dl>

      <section className="panel mt-6 p-4 sm:p-6" aria-labelledby="chart-heading">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 id="chart-heading" className="font-display text-xl font-bold">
            Score over time
          </h2>
          <span className="hud-label">Last {chartData.length} runs</span>
        </div>
        <ScoreChart data={chartData} />
        <p className="sr-only">
          Scores in order: {history.map((h) => `${h.pct}%`).join(', ')}.
        </p>
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <section aria-labelledby="best-heading">
          <h2 id="best-heading" className="mb-4 font-display text-xl font-bold">
            Best by domain
          </h2>
          <ul className="space-y-2">
            {TOPICS.map((t) => {
              const best = bestByTopic.get(t.id);
              return (
                <li key={t.id} className="flex items-center gap-3 rounded-[4px] border border-line bg-surface-1/70 px-3 py-2.5">
                  <TopicIcon topic={t.id} className={`h-4 w-4 shrink-0 ${best ? 'text-signal' : 'text-ink-faint'}`} />
                  <span className="w-36 shrink-0 truncate text-sm sm:w-44">{t.name}</span>
                  <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3" aria-hidden="true">
                    {best && (
                      <span
                        className="absolute inset-y-0 left-0 rounded-full bg-signal"
                        style={{ width: `${best.pct}%`, boxShadow: '0 0 10px rgb(var(--c-signal) / 0.6)' }}
                      />
                    )}
                  </span>
                  <span className="w-11 text-right font-mono text-sm tabular-nums">{best ? `${best.pct}%` : '--'}</span>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="runs-heading">
          <h2 id="runs-heading" className="mb-4 font-display text-xl font-bold">
            Past attempts
          </h2>
          <div className="overflow-hidden rounded-[6px] border border-line">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
                <tr>
                  <th scope="col" className="px-3 py-2.5 font-normal">Domain</th>
                  <th scope="col" className="hidden px-3 py-2.5 font-normal sm:table-cell">Level</th>
                  <th scope="col" className="px-3 py-2.5 text-right font-normal">Score</th>
                  <th scope="col" className="hidden px-3 py-2.5 text-right font-normal sm:table-cell">Time</th>
                  <th scope="col" className="px-3 py-2.5 text-right font-normal">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-surface-1/70">
                {[...history].reverse().slice(0, 50).map((h) => (
                  <tr key={h.id}>
                    <td className="px-3 py-2.5">
                      <span className="block truncate">{TOPIC_BY_ID[h.topic].name}</span>
                      <span className="block font-mono text-[11px] text-ink-faint sm:hidden">{LEVEL_BY_ID[h.level].name}</span>
                    </td>
                    <td className="hidden px-3 py-2.5 text-ink-muted sm:table-cell">{LEVEL_BY_ID[h.level].name}</td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums">
                      <span className={h.pct >= 65 ? 'text-signal' : h.pct >= 40 ? 'text-amber' : 'text-bad'}>{h.pct}%</span>
                      <span className="block text-[11px] text-ink-faint">
                        {h.correct}/{h.count}
                      </span>
                    </td>
                    <td className="hidden px-3 py-2.5 text-right font-mono tabular-nums text-ink-muted sm:table-cell">
                      {formatDuration(h.timeMs)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-xs text-ink-muted">
                      {dateTimeFmt.format(h.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <Modal
        open={confirm}
        label="Destructive action"
        title="Clear mission log?"
        onClose={() => setConfirm(false)}
        actions={
          <>
            <button type="button" className="btn-ghost" onClick={() => setConfirm(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn border border-bad/60 bg-bad/10 text-bad hover:bg-bad/20"
              onClick={() => {
                clear();
                setConfirm(false);
              }}
            >
              Clear all
            </button>
          </>
        }
      >
        <p>This permanently removes all {history.length} saved runs from this browser.</p>
      </Modal>
    </div>
  );
}

function Heading() {
  return (
    <header>
      <p className="hud-label">
        <span className="text-signal">//</span> Telemetry
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">Mission log</h1>
    </header>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-1 px-4 py-3">
      <dt className="hud-label">{label}</dt>
      <dd className="mt-1 font-mono text-2xl font-bold tabular-nums">{value}</dd>
    </div>
  );
}

interface Point {
  n: number;
  pct: number;
  entry: HistoryEntry;
}

function ScoreChart({ data }: { data: Point[] }) {
  const signal = tokenColor('signal');
  const line = tokenColor('line');
  const faint = tokenColor('ink-faint');

  return (
    <div className="h-64 w-full sm:h-72" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <defs>
            <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={signal} stopOpacity={0.35} />
              <stop offset="100%" stopColor={signal} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={line} strokeDasharray="2 4" vertical={false} />
          <XAxis
            dataKey="n"
            tick={{ fill: faint, fontSize: 11, fontFamily: 'JetBrains Mono' }}
            tickLine={false}
            axisLine={{ stroke: line }}
            allowDecimals={false}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tick={{ fill: faint, fontSize: 11, fontFamily: 'JetBrains Mono' }}
            tickLine={false}
            axisLine={false}
            unit="%"
          />
          <ReferenceLine y={85} stroke={tokenColor('amber', 0.5)} strokeDasharray="4 4" />
          <Tooltip
            cursor={{ stroke: signal, strokeOpacity: 0.4 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as Point;
              return (
                <div className="rounded-[4px] border border-line bg-surface-2 px-3 py-2 font-mono text-xs shadow-lg">
                  <p className="text-sm font-bold text-signal">{p.pct}%</p>
                  <p className="text-ink">{TOPIC_BY_ID[p.entry.topic].name}</p>
                  <p className="text-ink-faint">
                    {LEVEL_BY_ID[p.entry.level].name} · {dateFmt.format(p.entry.date)}
                  </p>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="pct"
            stroke={signal}
            strokeWidth={2}
            fill="url(#scoreFill)"
            dot={{ r: 3, fill: signal, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: signal, stroke: tokenColor('base'), strokeWidth: 2 }}
            isAnimationActive={!window.matchMedia('(prefers-reduced-motion: reduce)').matches}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
