import type { TopicChoice } from '../types';

interface Props {
  topic: TopicChoice;
  className?: string;
}

/**
 * Custom topic glyphs on a shared 24×24 grid: 1.5px strokes, round caps,
 * with one filled "signal node" in each icon as the common motif.
 */
export function TopicIcon({ topic, className = 'h-6 w-6' }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[topic]}
    </svg>
  );
}

const node = (cx: number, cy: number, r = 1.6) => <circle cx={cx} cy={cy} r={r} fill="currentColor" stroke="none" />;

const PATHS: Record<TopicChoice, JSX.Element> = {
  // orbiting system: the field as a whole
  general: (
    <>
      <ellipse cx="12" cy="12" rx="9" ry="3.6" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)" />
      {node(12, 12, 1.8)}
    </>
  ),
  // scatter plot with a fitted line
  ml: (
    <>
      <path d="M3.5 20.5h17M3.5 20.5v-17" />
      <path d="M5.5 17.5 19.5 6" strokeDasharray="2 2" />
      <circle cx="8" cy="13.5" r="1" />
      <circle cx="11" cy="14.5" r="1" />
      <circle cx="13" cy="9.5" r="1" />
      <circle cx="17" cy="10" r="1" />
      {node(15.5, 7.6)}
    </>
  ),
  // speech bubble filled with tokens
  llm: (
    <>
      <path d="M4 5.5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-9l-4.5 3.5V16.5H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z" />
      <rect x="6.5" y="9.5" width="3" height="3" rx="0.5" />
      <rect x="10.5" y="9.5" width="3" height="3" rx="0.5" />
      {node(16, 11)}
    </>
  ),
  // documents feeding a lens
  rag: (
    <>
      <path d="M4 3.5h8l3 3V12" />
      <path d="M4 3.5v15h6" />
      <path d="M7 8h5M7 11h3" />
      <circle cx="16" cy="16" r="3.5" />
      <path d="m18.6 18.6 2.4 2.4" />
      {node(16, 16, 1.2)}
    </>
  ),
  // stacked model layers
  models: (
    <>
      <path d="m12 3.5 8.5 4.25L12 12 3.5 7.75 12 3.5Z" />
      <path d="m3.5 12 8.5 4.25L20.5 12" />
      <path d="m3.5 16.25 8.5 4.25 8.5-4.25" />
      {node(12, 7.75)}
    </>
  ),
  // terminal prompt
  prompting: (
    <>
      <rect x="2.5" y="4.5" width="19" height="15" rx="1.5" />
      <path d="M2.5 8h19" />
      <path d="m6.5 11.5 3 2.5-3 2.5" />
      <path d="M12 16.5h4" />
      {node(5, 6.25, 0.9)}
    </>
  ),
  // act → observe loop around a core
  agents: (
    <>
      <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" />
      <path d="M17.6 3.6v3.3h-3.3" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
      {node(12, 12, 1.2)}
    </>
  ),
  // balance scale
  ethics: (
    <>
      <path d="M12 4v16M8 20h8" />
      <path d="M5 7h14" />
      <path d="m5 7-2.5 6h5L5 7ZM19 7l-2.5 6h5L19 7Z" />
      {node(12, 4.5)}
    </>
  ),
  // interconnected grid: draw from everything
  mixed: (
    <>
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
      <path d="M8 6h8M6 8v8M18 8v8M8 18h8M7.5 7.5l9 9M16.5 7.5l-9 9" />
      {node(12, 12)}
    </>
  ),
};
