import type { Cuisine } from '../types'

/** One simple line icon per cuisine, drawn in the same style as Icons.tsx. */
const PATHS: Record<Cuisine, string> = {
  american: 'M4 11a8 6 0 0 1 16 0H4ZM3 14h18M5 17h14v1a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-1Z',
  mexican: 'M3 18a9 9 0 0 1 18 0H3ZM7 18a5 5 0 0 1 10 0',
  italian: 'M12 21 4 6a14 14 0 0 1 16 0l-8 15ZM11 9.5h.01M13 13h.01',
  asian: 'M4 12h16a8 8 0 0 1-16 0ZM14 3l-3 8M17 4l-4 7',
  seafood: 'M3 12c3-5 8-6 12-3l4-3v12l-4-3c-4 3-9 2-12-3ZM8 11h.01',
  latin: 'M12 21c0-4 0-7 1-10M13 11c-1-3-4-4-7-3M13 11c1-3 4-4 7-3M13 11c-3-1-3-4-1-6M13 11c3-1 3-4 1-6',
  bbq: 'M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4-1-6 1-9Z',
  breakfast: 'M5 12c0-5 4-8 8-7 4 1 7 4 6 8-1 5-6 7-10 6-3-1-4-4-4-7ZM12 12h.01',
  cafe: 'M5 9h11v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9ZM16 10h2a2 2 0 0 1 0 4h-2M8 4v2M12 4v2',
  other: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
}

export function CuisineIcon({ cuisine, size = 18 }: { cuisine: Cuisine; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[cuisine]} />
    </svg>
  )
}
