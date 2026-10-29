import type { Level, Question, TopicChoice, TopicId } from '../types';
import general from './questions/general.json';
import ml from './questions/ml.json';
import llm from './questions/llm.json';
import rag from './questions/rag.json';
import models from './questions/models.json';
import prompting from './questions/prompting.json';
import agents from './questions/agents.json';
import ethics from './questions/ethics.json';

// JSON imports are typed loosely; the shape is enforced by scripts/validate-questions.mjs.
export const BANK: Record<TopicId, Question[]> = {
  general: general as Question[],
  ml: ml as Question[],
  llm: llm as Question[],
  rag: rag as Question[],
  models: models as Question[],
  prompting: prompting as Question[],
  agents: agents as Question[],
  ethics: ethics as Question[],
};

export const ALL_QUESTIONS: Question[] = Object.values(BANK).flat();

export function getPool(topic: TopicChoice, level: Level): Question[] {
  const source = topic === 'mixed' ? ALL_QUESTIONS : BANK[topic];
  return source.filter((q) => q.level === level);
}

export function topicQuestionCount(topic: TopicChoice): number {
  return topic === 'mixed' ? ALL_QUESTIONS.length : BANK[topic].length;
}
