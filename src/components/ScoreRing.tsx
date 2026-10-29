import { animate, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Props {
  pct: number;
  size?: number;
}

const STROKE = 10;

/** Animated percentage ring: the arc sweeps and the number counts up together. */
export function ScoreRing({ pct, size = 220 }: Props) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? pct : 0);
  const r = (size - STROKE) / 2 - 8;
  const c = 2 * Math.PI * r;
  const color = pct >= 65 ? 'rgb(var(--c-signal))' : pct >= 40 ? 'rgb(var(--c-amber))' : 'rgb(var(--c-bad))';

  useEffect(() => {
    if (reduce) {
      setShown(pct);
      return;
    }
    const controls = animate(0, pct, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [pct, reduce]);

  // 60 tick marks around the outside, HUD style
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
    const r1 = size / 2 - 2;
    const r2 = r1 - (i % 5 === 0 ? 6 : 3);
    return (
      <line
        key={i}
        x1={size / 2 + Math.cos(a) * r1}
        y1={size / 2 + Math.sin(a) * r1}
        x2={size / 2 + Math.cos(a) * r2}
        y2={size / 2 + Math.sin(a) * r2}
        stroke="rgb(var(--c-line))"
        strokeWidth={1}
      />
    );
  });

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        {ticks}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--c-surface-3))" strokeWidth={STROKE} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={c}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          initial={{ strokeDashoffset: reduce ? c * (1 - pct / 100) : c }}
          animate={{ strokeDashoffset: c * (1 - pct / 100) }}
          transition={{ duration: reduce ? 0 : 1.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-mono text-5xl font-bold tabular-nums tracking-tight sm:text-6xl" aria-hidden="true">
            {shown}
            <span className="text-2xl text-ink-muted">%</span>
          </div>
          <div className="hud-label mt-1">Accuracy</div>
        </div>
      </div>
      <span className="sr-only">Score {pct} percent</span>
    </div>
  );
}
