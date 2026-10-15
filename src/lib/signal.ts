import type { GoBackSignal, Visit } from '../types'

/** Newest first. Date decides; creation time breaks ties on the same day. */
export function sortVisitsNewestFirst(visits: Visit[]): Visit[] {
  return [...visits].sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
  )
}

export function latestVisit(visits: Visit[]): Visit | undefined {
  return sortVisitsNewestFirst(visits)[0]
}

/**
 * The go-back signal comes from the most recent visit, so a place can recover
 * after a bad first night. A thumbs up with any adult "no" vote reads as "mixed"
 * so disagreement is shown honestly instead of averaged away.
 */
export function goBackSignal(visits: Visit[]): GoBackSignal | undefined {
  const last = latestVisit(visits)
  if (!last) return undefined
  if (last.thumb === 'down') return 'never'
  return Object.values(last.votes).includes('no') ? 'mixed' : 'back'
}
