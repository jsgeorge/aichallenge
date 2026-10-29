import { useEffect, useRef, useState } from 'react';

interface Props {
  seconds: number;
  startedAt: number;
  running: boolean;
  onExpire: () => void;
}

/** Countdown ring for timed questions. Calls onExpire once when time runs out. */
export function Timer({ seconds, startedAt, running, onExpire }: Props) {
  const totalMs = seconds * 1000;
  const [remaining, setRemaining] = useState(() => Math.max(0, totalMs - (Date.now() - startedAt)));
  const fired = useRef(false);
  const expireRef = useRef(onExpire);
  expireRef.current = onExpire;

  useEffect(() => {
    fired.current = false;
    setRemaining(Math.max(0, totalMs - (Date.now() - startedAt)));
  }, [startedAt, totalMs]);

  useEffect(() => {
    if (!running) return;
    const tick = () => {
      const left = Math.max(0, totalMs - (Date.now() - startedAt));
      setRemaining(left);
      if (left === 0 && !fired.current) {
        fired.current = true;
        expireRef.current();
      }
    };
    tick();
    const t = setInterval(tick, 200);
    return () => clearInterval(t);
  }, [running, startedAt, totalMs]);

  const secs = Math.ceil(remaining / 1000);
  const frac = remaining / totalMs;
  const danger = secs <= 10;
  const r = 17;
  const c = 2 * Math.PI * r;

  return (
    <div
      className={`flex items-center gap-2 font-mono text-sm tabular-nums ${danger && running ? 'text-bad' : 'text-ink-muted'}`}
      role="timer"
      aria-label={`${secs} seconds remaining`}
    >
      <svg width="40" height="40" viewBox="0 0 40 40" className="-rotate-90" aria-hidden="true">
        <circle cx="20" cy="20" r={r} fill="none" stroke="rgb(var(--c-surface-3))" strokeWidth="3" />
        <circle
          cx="20"
          cy="20"
          r={r}
          fill="none"
          stroke={danger ? 'rgb(var(--c-bad))' : 'rgb(var(--c-signal))'}
          strokeWidth="3"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - frac)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 200ms linear' }}
        />
      </svg>
      <span className="w-9 text-right text-base">{secs.toString().padStart(2, '0')}s</span>
    </div>
  );
}
