import { create } from 'zustand';
import { buildQuiz, newId, redeal } from '../lib/quiz';
import { scoreOf } from '../lib/scoring';
import { KEYS, load, remove, save } from '../lib/storage';
import type { DraftSettings, HistoryEntry, Question, QuizSettings, Screen, Session } from '../types';

const MAX_HISTORY = 200;

interface QuizState {
  screen: Screen;
  draft: DraftSettings;
  session: Session | null;
  /** An unfinished session found in storage on startup, waiting for resume/restart. */
  pendingResume: Session | null;
  history: HistoryEntry[];

  go: (screen: Screen) => void;
  setDraft: (patch: Partial<DraftSettings>) => void;
  launch: () => void;
  retry: () => void;
  drillMistakes: () => void;
  answer: (selected: number | null) => void;
  next: () => void;
  quit: () => void;
  resume: () => void;
  discardResume: () => void;
  clearHistory: () => void;
}

function isComplete(d: DraftSettings): d is QuizSettings {
  return d.topic !== null && d.level !== null && d.count !== null;
}

function createSession(settings: QuizSettings, questions: Question[], mode: Session['mode']): Session {
  const now = Date.now();
  return {
    id: newId(),
    mode,
    settings: { ...settings, count: questions.length },
    questions,
    index: 0,
    answers: [],
    streak: 0,
    bestStreak: 0,
    questionStartedAt: now,
    startedAt: now,
  };
}

function restoredSession(): Session | null {
  const s = load<Session | null>(KEYS.session, null);
  if (!s || s.finishedAt || !Array.isArray(s.questions) || s.questions.length === 0) return null;
  return s;
}

const defaultDraft: DraftSettings = { topic: null, level: null, count: null, timer: false };

export const useQuiz = create<QuizState>((set, get) => ({
  screen: 'home',
  draft: { ...defaultDraft, ...load<Partial<DraftSettings>>(KEYS.settings, {}) },
  session: null,
  pendingResume: restoredSession(),
  history: load<HistoryEntry[]>(KEYS.history, []),

  go: (screen) => set({ screen }),

  setDraft: (patch) => {
    const draft = { ...get().draft, ...patch };
    save(KEYS.settings, draft);
    set({ draft });
  },

  launch: () => {
    const { draft } = get();
    if (!isComplete(draft)) return;
    const questions = buildQuiz(draft);
    if (questions.length === 0) return;
    set({ session: createSession(draft, questions, 'standard'), pendingResume: null, screen: 'quiz' });
  },

  retry: () => {
    const { session } = get();
    if (!session) return;
    const questions = session.mode === 'review' ? redeal(session.questions) : buildQuiz(session.settings);
    set({ session: createSession(session.settings, questions, session.mode), screen: 'quiz' });
  },

  drillMistakes: () => {
    const { session } = get();
    if (!session) return;
    const missed = new Set(session.answers.filter((a) => !a.correct).map((a) => a.questionId));
    const questions = session.questions.filter((q) => missed.has(q.id));
    if (questions.length === 0) return;
    set({ session: createSession(session.settings, redeal(questions), 'review'), screen: 'quiz' });
  },

  answer: (selected) => {
    const { session } = get();
    if (!session || session.finishedAt) return;
    if (session.answers.length > session.index) return; // already locked in
    const q = session.questions[session.index];
    const correct = selected !== null && selected === q.answerIndex;
    const streak = correct ? session.streak + 1 : 0;
    set({
      session: {
        ...session,
        answers: [
          ...session.answers,
          {
            questionId: q.id,
            selected,
            correct,
            timedOut: selected === null,
            timeMs: Date.now() - session.questionStartedAt,
          },
        ],
        streak,
        bestStreak: Math.max(session.bestStreak, streak),
      },
    });
  },

  next: () => {
    const { session, history } = get();
    if (!session || session.answers.length <= session.index) return;
    if (session.index + 1 < session.questions.length) {
      set({ session: { ...session, index: session.index + 1, questionStartedAt: Date.now() } });
      return;
    }
    const finished: Session = { ...session, finishedAt: Date.now() };
    let nextHistory = history;
    // Mistake drills are practice, so only full runs count toward stats.
    if (session.mode === 'standard') {
      const { correct, pct, timeMs } = scoreOf(session.answers);
      const entry: HistoryEntry = {
        id: session.id,
        date: finished.finishedAt!,
        topic: session.settings.topic,
        level: session.settings.level,
        count: session.questions.length,
        correct,
        pct,
        timeMs,
        bestStreak: session.bestStreak,
      };
      nextHistory = [...history, entry].slice(-MAX_HISTORY);
      save(KEYS.history, nextHistory);
    }
    set({ session: finished, history: nextHistory, screen: 'results' });
  },

  quit: () => set({ session: null, screen: 'home' }),

  resume: () => {
    const { pendingResume } = get();
    if (!pendingResume) return;
    // The clock restarts for the current question: time away from the tab isn't counted.
    set({
      session: { ...pendingResume, questionStartedAt: Date.now() },
      pendingResume: null,
      screen: 'quiz',
    });
  },

  discardResume: () => {
    remove(KEYS.session);
    set({ pendingResume: null });
  },

  clearHistory: () => {
    remove(KEYS.history);
    set({ history: [] });
  },
}));

// Persist the in-progress session so a refresh can offer to resume it.
useQuiz.subscribe((state, prev) => {
  if (state.session === prev.session) return;
  if (state.session && !state.session.finishedAt) save(KEYS.session, state.session);
  else if (!state.pendingResume) remove(KEYS.session);
});
