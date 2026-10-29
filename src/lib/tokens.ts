/** Reads a color token from tokens.css as an rgb() string, for canvas/SVG libraries that can't use CSS vars. */
export function tokenColor(name: string, alpha = 1): string {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(`--c-${name}`).trim();
  return alpha === 1 ? `rgb(${raw})` : `rgb(${raw} / ${alpha})`;
}
