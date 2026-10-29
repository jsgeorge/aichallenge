import type { Question } from '../types';

/** Fisher–Yates shuffle; returns a new array. */
export function shuffle<T>(items: readonly T[]): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Shuffles a multiple-choice question's options and remaps answerIndex.
 * True/false questions keep their natural True → False order.
 */
export function shuffleOptions(q: Question): Question {
  if (q.type === 'true_false') return { ...q };
  const order = shuffle(q.options.map((_, i) => i));
  return {
    ...q,
    options: order.map((i) => q.options[i]),
    answerIndex: order.indexOf(q.answerIndex),
  };
}
