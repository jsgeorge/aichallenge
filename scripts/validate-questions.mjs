// Validates every question bank file in src/data/questions.
// Run with `npm run validate` (also runs automatically before `npm run build`).
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'questions');
const LEVELS = ['beginner', 'intermediate', 'advanced'];
const MIN_PER_LEVEL = 20;

const errors = [];
const ids = new Set();
const counts = {};

for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  const topic = file.replace(/\.json$/, '');
  let questions;
  try {
    questions = JSON.parse(readFileSync(join(dir, file), 'utf8'));
  } catch (e) {
    errors.push(`${file}: invalid JSON (${e.message})`);
    continue;
  }
  if (!Array.isArray(questions)) {
    errors.push(`${file}: top level must be an array`);
    continue;
  }
  counts[topic] = Object.fromEntries(LEVELS.map((l) => [l, 0]));

  for (const [i, q] of questions.entries()) {
    const where = `${file}[${i}] ${q?.id ?? '(no id)'}`;
    const fail = (msg) => errors.push(`${where}: ${msg}`);

    if (typeof q.id !== 'string' || !q.id) fail('missing id');
    else if (ids.has(q.id)) fail('duplicate id');
    else ids.add(q.id);

    if (q.topic !== topic) fail(`topic "${q.topic}" does not match file name "${topic}"`);
    if (!LEVELS.includes(q.level)) fail(`invalid level "${q.level}"`);
    else counts[topic][q.level]++;

    if (typeof q.question !== 'string' || q.question.trim().length < 8) fail('question text missing/too short');
    if (typeof q.explanation !== 'string' || q.explanation.trim().length < 20) fail('explanation missing/too short');
    if (q.code !== undefined && typeof q.code !== 'string') fail('code must be a string');
    if (!Array.isArray(q.tags)) fail('tags must be an array');
    if (!Array.isArray(q.options)) {
      fail('options must be an array');
      continue;
    }

    if (q.type === 'multiple_choice') {
      if (q.options.length !== 4) fail(`multiple_choice needs exactly 4 options (has ${q.options.length})`);
    } else if (q.type === 'true_false') {
      if (q.options.length !== 2 || q.options[0] !== 'True' || q.options[1] !== 'False')
        fail('true_false options must be exactly ["True", "False"]');
    } else {
      fail(`invalid type "${q.type}"`);
    }

    if (new Set(q.options.map((o) => String(o).trim().toLowerCase())).size !== q.options.length)
      fail('options must be unique');
    if (!Number.isInteger(q.answerIndex) || q.answerIndex < 0 || q.answerIndex >= q.options.length)
      fail(`answerIndex ${q.answerIndex} out of range`);
  }
}

for (const [topic, byLevel] of Object.entries(counts)) {
  for (const level of LEVELS) {
    if (byLevel[level] < MIN_PER_LEVEL)
      errors.push(`${topic}/${level}: only ${byLevel[level]} questions (minimum ${MIN_PER_LEVEL})`);
  }
}

console.log('Question bank');
for (const [topic, byLevel] of Object.entries(counts)) {
  console.log(`  ${topic.padEnd(10)} ${LEVELS.map((l) => `${l.slice(0, 3)} ${String(byLevel[l]).padStart(2)}`).join('  ')}`);
}
console.log(`  total      ${ids.size}`);

if (errors.length) {
  console.error(`\n✗ ${errors.length} problem(s):`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log('\n✓ All questions valid');
