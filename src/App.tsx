import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { lazy, Suspense, useEffect } from 'react';
import { Background } from './components/Background';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { Home } from './screens/Home';
import { Quiz } from './screens/Quiz';
import { Results } from './screens/Results';
import { Setup } from './screens/Setup';
import { useQuiz } from './store/useQuiz';
import type { Screen } from './types';

// Recharts is only needed on the history screen, so it loads on demand.
const History = lazy(() => import('./screens/History').then((m) => ({ default: m.History })));

const SCREENS: Record<Screen, React.ComponentType> = {
  home: Home,
  setup: Setup,
  quiz: Quiz,
  results: Results,
  history: History,
};

const TITLES: Record<Screen, string> = {
  home: 'AI Challenge',
  setup: 'Configure · AI Challenge',
  quiz: 'In progress · AI Challenge',
  results: 'Results · AI Challenge',
  history: 'Mission log · AI Challenge',
};

export default function App() {
  const screen = useQuiz((s) => s.screen);
  const hasSession = useQuiz((s) => !!s.session);
  // Quiz and results need a session; fall back to home if it's missing.
  const active: Screen = (screen === 'quiz' || screen === 'results') && !hasSession ? 'home' : screen;
  const View = SCREENS[active];

  useEffect(() => {
    document.title = TITLES[active];
    if (active !== 'quiz') window.scrollTo({ top: 0 });
  }, [active]);

  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#main"
        className="sr-only z-50 rounded bg-signal px-4 py-2 font-mono text-sm text-void focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <Background />
      <Header />
      <AnimatePresence mode="wait">
        <motion.main
          id="main"
          key={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <ErrorBoundary>
            <Suspense fallback={<p className="hud-label mx-auto max-w-console px-6 pt-16">Loading telemetry…</p>}>
              <View />
            </Suspense>
          </ErrorBoundary>
        </motion.main>
      </AnimatePresence>
    </MotionConfig>
  );
}
