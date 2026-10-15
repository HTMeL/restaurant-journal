import type { ReactNode } from 'react'
import { CuisineIcon } from './CuisineIcon'
import { ThumbDownIcon, ThumbUpIcon } from './Icons'
import { CUISINES } from '../lib/cuisines'
import type { RatingDef } from '../lib/ratings'
import type { Cuisine, Rating, Thumb } from '../types'

/** Two big thumbs buttons. Real radio inputs, so arrow keys and screen readers work. */
export function ThumbToggle({ value, onChange }: { value?: Thumb; onChange: (t: Thumb) => void }) {
  const options: { v: Thumb; label: string; Icon: typeof ThumbUpIcon }[] = [
    { v: 'up', label: 'Worked for us', Icon: ThumbUpIcon },
    { v: 'down', label: 'Not for us', Icon: ThumbDownIcon },
  ]
  return (
    <div className="thumbs" role="radiogroup" aria-label="How did it go?">
      {options.map(({ v, label, Icon }) => (
        <label key={v} className={`thumbs__option thumbs__option--${v}`}>
          <input type="radio" name="thumb" checked={value === v} onChange={() => onChange(v)} />
          <Icon />
          <span>{label}</span>
        </label>
      ))}
    </div>
  )
}

/** Three-step tap rating. Tapping the selected step again clears it. */
export function TapRating({
  def,
  value,
  onChange,
}: {
  def: RatingDef
  value?: Rating
  onChange: (r: Rating | undefined) => void
}) {
  return (
    <fieldset className="field">
      <legend className="field__label">{def.label}</legend>
      <div className="segmented">
        {def.steps.map((label, i) => {
          const step = (i + 1) as Rating
          return (
            <button
              key={label}
              type="button"
              className="segmented__btn"
              aria-pressed={value === step}
              onClick={() => onChange(value === step ? undefined : step)}
            >
              {label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export function Chip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button type="button" className="chip" aria-pressed={pressed} onClick={onClick}>
      {children}
    </button>
  )
}

/** Single-choice cuisine chips with icons. Tapping the chosen one again clears it. */
export function CuisinePicker({
  value,
  onChange,
  options,
  label = 'Cuisine',
  compact = false,
}: {
  value?: Cuisine
  onChange: (c: Cuisine | undefined) => void
  /** Limit the choices, e.g. to cuisines that exist in a list. Defaults to all. */
  options?: Cuisine[]
  label?: string
  /** Smaller pills, for filters rather than form inputs. */
  compact?: boolean
}) {
  const shown = options ? CUISINES.filter((c) => options.includes(c.value)) : CUISINES
  return (
    <div className={`chips${compact ? ' chips--compact' : ''}`} role="group" aria-label={label}>
      {shown.map((c) => (
        <button
          key={c.value}
          type="button"
          className="chip chip--icon"
          aria-pressed={value === c.value}
          onClick={() => onChange(value === c.value ? undefined : c.value)}
        >
          <CuisineIcon cuisine={c.value} />
          {c.label}
        </button>
      ))}
    </div>
  )
}
