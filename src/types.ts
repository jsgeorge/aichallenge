export type TopicId = 'general' | 'ml' | 'llm' | 'rag' | 'models' | 'prompting' | 'agents' | 'ethics';
export type TopicChoice = TopicId | 'mixed';
export type Level = 'beginner' | 'intermediate' | 'advanced';
export type QuestionType = 'multiple_choice' | 'true_false';

/** Shape of every entry in src/data/questions/*.json */
export interface Question {
  id: string;
  topic: TopicId;
  level: Level;
  type: QuestionType;
  question: string;
  code?: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  tags: string[];
}

export interface QuizSettings {
  topic: TopicChoice;
  level: Level;
  count: number;
  timer: boolean;
}

/** Settings while the user is still choosing on the setup screen. */
export interface DraftSettings {
  topic: TopicChoice | null;
  level: Level | null;
  count: number | null;
  timer: boolean;
}

export interface AnswerRecord {
  questionId: string;
  /** Index into the (shuffled) options, or null when the timer ran out. */
  selected: number | null;
  correct: boolean;
  timedOut: boolean;
  timeMs: number;
}

export type SessionMode = 'standard' | 'review';

export interface Session {
  id: string;
  mode: SessionMode;
  settings: QuizSettings;
  /** Questions in play order, with options already shuffled. */
  questions: Question[];
  index: number;
  answers: AnswerRecord[];
  streak: number;
  bestStreak: number;
  questionStartedAt: number;
  startedAt: number;
  finishedAt?: number;
}

export interface HistoryEntry {
  id: string;
  date: number;
  topic: TopicChoice;
  level: Level;
  count: number;
  correct: number;
  pct: number;
  timeMs: number;
  bestStreak: number;
}

export type Screen = 'home' | 'setup' | 'quiz' | 'results' | 'history';
