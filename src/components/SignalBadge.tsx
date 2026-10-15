import type { GoBackSignal } from '../types'
import { MixedIcon, ThumbDownIcon, ThumbUpIcon } from './Icons'

const SIGNALS = {
  back: { label: "We'd go back", Icon: ThumbUpIcon },
  mixed: { label: 'Mixed', Icon: MixedIcon },
  never: { label: 'Never again', Icon: ThumbDownIcon },
} as const

/** Icon shape + words + tone, so it never depends on color alone. */
export function SignalBadge({ signal }: { signal: GoBackSignal }) {
  const { label, Icon } = SIGNALS[signal]
  return (
    <span className={`signal signal--${signal}`}>
      <Icon />
      <span>{label}</span>
    </span>
  )
}
