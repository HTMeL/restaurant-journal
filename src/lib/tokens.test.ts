import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { contrastRatio } from './contrast'

const css = readFileSync(new URL('../styles/tokens.css', import.meta.url), 'utf8')

function token(name: string): string {
  const m = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`))
  if (!m) throw new Error(`Token --${name} not found`)
  return m[1]
}

// [foreground, background, minimum ratio]. 4.5 is WCAG AA for body text,
// 3 is AA for UI boundaries such as input borders.
const pairs: [string, string, number][] = [
  ['color-text', 'color-bg', 4.5],
  ['color-text', 'color-surface', 4.5],
  ['color-text-muted', 'color-bg', 4.5],
  ['color-text-muted', 'color-surface', 4.5],
  ['color-text-muted', 'color-surface-sunken', 4.5],
  ['color-on-accent', 'color-accent', 4.5],
  ['color-on-accent-soft', 'color-accent-soft', 4.5],
  ['color-signal-back-text', 'color-signal-back-bg', 4.5],
  ['color-signal-mixed-text', 'color-signal-mixed-bg', 4.5],
  ['color-signal-never-text', 'color-signal-never-bg', 4.5],
  ['color-border-strong', 'color-bg', 3],
  ['color-border-strong', 'color-surface', 3],
  ['color-hero-title', 'color-bg', 4.5],
  ['color-hero-text', 'color-bg', 4.5],
  ['color-focus', 'color-bg', 3],
  ['color-accent', 'color-bg', 3],
]

describe('design tokens meet WCAG AA', () => {
  it.each(pairs)('%s on %s is at least %d:1', (fg, bg, min) => {
    expect(contrastRatio(token(fg), token(bg))).toBeGreaterThanOrEqual(min)
  })
})
