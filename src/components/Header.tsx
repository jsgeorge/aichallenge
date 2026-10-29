import { useEffect, useState } from 'react';
import { useQuiz } from '../store/useQuiz';

function useUtcClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now.toISOString().slice(11, 19);
}

export function Header() {
  const screen = useQuiz((s) => s.screen);
  const go = useQuiz((s) => s.go);
  const clock = useUtcClock();
  const inQuiz = screen === 'quiz';

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-void/70 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-console items-center justify-between gap-4 px-4 sm:px-6">
        <button
          type="button"
          onClick={() => !inQuiz && go('home')}
          disabled={inQuiz}
          className="group flex items-center gap-2.5 disabled:cursor-default"
          aria-label="AI Challenge home"
        >
          <span className="relative grid h-7 w-7 place-items-center rounded-[4px] border border-signal/50">
            <span className="h-2 w-2 rounded-full bg-signal shadow-[0_0_10px_rgb(var(--c-signal))]" />
          </span>
          <span className="font-display text-[15px] font-bold tracking-tight">
            AI<span className="text-signal">/</span>CHALLENGE
          </span>
        </button>

        <div className="flex items-center gap-4">
          {!inQuiz && (
            <nav aria-label="Primary" className="flex items-center gap-1">
              <NavLink active={screen === 'setup'} onClick={() => go('setup')}>
                New
              </NavLink>
              <NavLink active={screen === 'history'} onClick={() => go('history')}>
                History
              </NavLink>
            </nav>
          )}
          <div className="hidden items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-ink-faint sm:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ok" aria-hidden="true" />
            <span>SYS NOMINAL</span>
            <span className="text-line">|</span>
            <time aria-label="Current UTC time">{clock} UTC</time>
          </div>
        </div>
      </div>
    </header>
  );
}

function NavLink({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`rounded px-3 py-2 font-mono text-xs uppercase tracking-[0.14em] transition-colors ${
        active ? 'text-signal' : 'text-ink-muted hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}
