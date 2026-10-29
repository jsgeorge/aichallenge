import type { Level, TopicChoice } from '../types';

export interface TopicMeta {
  id: TopicChoice;
  name: string;
  /** Short label for badges. */
  short: string;
  description: string;
}

export const TOPICS: TopicMeta[] = [
  { id: 'general', name: 'General AI', short: 'GEN', description: 'History, milestones and the big ideas behind the field.' },
  { id: 'ml', name: 'Machine Learning', short: 'ML', description: 'Training, evaluation, overfitting and the classic algorithms.' },
  { id: 'llm', name: 'Large Language Models', short: 'LLM', description: 'Tokens, attention, sampling and how chat models are made.' },
  { id: 'rag', name: 'RAG', short: 'RAG', description: 'Retrieval-augmented generation: chunking, embeddings, re-ranking.' },
  { id: 'models', name: 'AI Models', short: 'MOD', description: 'Claude, GPT, Gemini, Llama, Mistral: makers, architecture, APIs.' },
  { id: 'prompting', name: 'Prompt Engineering', short: 'PRM', description: 'Instructions, few-shot, chain-of-thought and robust prompts.' },
  { id: 'agents', name: 'AI Agents & Tool Use', short: 'AGT', description: 'Tool calling, agent loops, MCP and keeping agents safe.' },
  { id: 'ethics', name: 'AI Ethics & Safety', short: 'ETH', description: 'Bias, privacy, alignment, interpretability and governance.' },
  { id: 'mixed', name: 'Mixed / All Topics', short: 'MIX', description: 'A random draw from every domain. No hiding places.' },
];

export const TOPIC_BY_ID = Object.fromEntries(TOPICS.map((t) => [t.id, t])) as Record<TopicChoice, TopicMeta>;

export const LEVELS: { id: Level; name: string; code: string; description: string }[] = [
  { id: 'beginner', name: 'Beginner', code: 'L1', description: 'Concepts and vocabulary' },
  { id: 'intermediate', name: 'Intermediate', code: 'L2', description: 'How things work, trade-offs' },
  { id: 'advanced', name: 'Advanced', code: 'L3', description: 'Architecture, math intuition, edge cases, applied scenarios' },
];

export const LEVEL_BY_ID = Object.fromEntries(LEVELS.map((l) => [l.id, l])) as Record<Level, (typeof LEVELS)[number]>;

export const COUNT_OPTIONS = [5, 10, 15, 20];

/** Seconds allowed per question when the timer is on. */
export const TIMER_SECONDS: Record<Level, number> = {
  beginner: 30,
  intermediate: 45,
  advanced: 60,
};
