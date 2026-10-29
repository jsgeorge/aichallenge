import type { AnswerRecord } from '../types';

export interface Tier {
  name: string;
  min: number;
  blurb: string;
}

/** Ordered from highest to lowest threshold. */
export const TIERS: Tier[] = [
  { name: 'AGI Whisperer', min: 85, blurb: 'You speak fluent machine. The models should be studying you.' },
  { name: 'Model Architect', min: 65, blurb: 'Solid structural knowledge with only a few loose weights.' },
  { name: 'Neural Apprentice', min: 40, blurb: 'The connections are forming. A few more epochs and you’ll converge.' },
  { name: 'Novice Node', min: 0, blurb: 'Every network starts with random weights. Train again.' },
];

export function tierFor(pct: number): Tier {
  return TIERS.find((t) => pct >= t.min) ?? TIERS[TIERS.length - 1];
}

export function scoreOf(answers: AnswerRecord[]) {
  const correct = answers.filter((a) => a.correct).length;
  const total = answers.length;
  const pct = total ? Math.round((correct / total) * 100) : 0;
  const timeMs = answers.reduce((sum, a) => sum + a.timeMs, 0);
  return { correct, total, pct, timeMs };
}

export function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
