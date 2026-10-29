import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const SPARKS = 10;

/** Streak counter. At 3+ it lights up amber and bursts each time the streak grows. */
export function StreakBadge({ streak }: { streak: number }) {
  const reduce = useReducedMotion();
  const hot = streak >= 3;

  return (
    <div
      className={`relative flex items-center gap-2 rounded-[4px] border px-2.5 py-1.5 font-mono text-xs uppercase tracking-[0.14em] transition-colors duration-300 ${
        hot ? 'border-amber/60 bg-amber/10 text-amber shadow-[var(--glow-amber)]' : 'border-line text-ink-muted'
      }`}
      aria-label={`Current streak ${streak}`}
    >
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
        <path d="M9.2 1 3 9.2h4.3L6.4 15 13 6.6H8.6L9.2 1Z" />
      </svg>
      <span>Streak</span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={streak}
          initial={reduce ? false : { y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          className="inline-block min-w-[2ch] text-right text-sm font-bold"
        >
          ×{streak}
        </motion.span>
      </AnimatePresence>

      {hot && !reduce && (
        <span key={`burst-${streak}`} className="pointer-events-none absolute inset-0" aria-hidden="true">
          {Array.from({ length: SPARKS }, (_, i) => {
            const a = (i / SPARKS) * Math.PI * 2;
            return (
              <motion.span
                key={i}
                className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-amber"
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: Math.cos(a) * 38, y: Math.sin(a) * 24, opacity: 0, scale: 0.4 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              />
            );
          })}
        </span>
      )}
    </div>
  );
}
