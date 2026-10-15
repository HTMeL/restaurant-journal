/** Small inline icons. Shapes differ (not just colors) so signals work without color. */
import type { SVGProps } from 'react'

const base: SVGProps<SVGSVGElement> = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
}

export const ThumbUpIcon = () => (
  <svg {...base}>
    <path d="M7 11v9H4v-9h3Zm0 0 4-7a2 2 0 0 1 2 2v4h5.5a2 2 0 0 1 2 2.3l-1.2 6a2 2 0 0 1-2 1.7H7" />
  </svg>
)

export const ThumbDownIcon = () => (
  <svg {...base}>
    <path d="M17 13V4h3v9h-3Zm0 0-4 7a2 2 0 0 1-2-2v-4H5.5a2 2 0 0 1-2-2.3l1.2-6A2 2 0 0 1 6.700 4H17" />
  </svg>
)

/** Two-way arrow: opinions differ. */
export const MixedIcon = () => (
  <svg {...base}>
    <path d="M4 9h14m-4-4 4 4-4 4M20 15H6m4-4-4 4 4 4" />
  </svg>
)

export const BookIcon = () => (
  <svg {...base}>
    <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Zm0 13a3 3 0 0 1 3-3h11" />
  </svg>
)

export const BookmarkIcon = () => (
  <svg {...base}>
    <path d="M7 4h10v16l-5-4-5 4V4Z" />
  </svg>
)

export const HomeIcon = () => (
  <svg {...base}>
    <path d="M4 11 12 4l8 7v9h-5v-6H9v6H4v-9Z" />
  </svg>
)

export const PlusIcon = () => (
  <svg {...base}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const PlateIcon = () => (
  <svg {...base} width={32} height={32}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4" />
  </svg>
)
