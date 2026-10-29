import { getPool } from '../data/bank';
import type { Level, Question, QuizSettings, TopicChoice } from '../types';
import { shuffle, shuffleOptions } from './shuffle';

export function availableCount(topic: TopicChoice, level: Level): number {
  return getPool(topic, level).length;
}

/** Draws `count` unique questions (capped at the pool size) in random order, with shuffled options. */
export function buildQuiz(settings: QuizSettings): Question[] {
  const pool = getPool(settings.topic, settings.level);
  return shuffle(pool).slice(0, settings.count).map(shuffleOptions);
}

/** Re-deals an existing set of questions (used for retries and mistake drills). */
export function redeal(questions: Question[]): Question[] {
  return shuffle(questions).map(shuffleOptions);
}

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
