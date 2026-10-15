import type { Cuisine, Place, PlaceSummary, RatingKey, Visit } from '../types'
import { orderedCuisines } from './cuisines'
import { goBackSignal, latestVisit, sortVisitsNewestFirst } from './signal'

export type FilterId = 'roomy' | 'shortWait' | 'newborns' | 'toddlers' | 'goBack'

export const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'roomy', label: 'Roomy' },
  { id: 'shortWait', label: 'Short wait' },
  { id: 'newborns', label: 'Good for newborns' },
  { id: 'toddlers', label: 'Good for toddlers' },
  { id: 'goBack', label: 'Would go back' },
]

/** Build one summary per place, joining visits and deriving the signal. */
export function summarize(
  places: Place[],
  visits: Visit[],
  hasPhoto: (photoId: string) => boolean = () => true,
): PlaceSummary[] {
  return places.map((place) => {
    const own = sortVisitsNewestFirst(visits.filter((v) => v.placeId === place.id))
    const coverPhotoId = own.flatMap((v) => v.photoIds).find(hasPhoto)
    return {
      place,
      visits: own,
      lastVisit: latestVisit(own),
      signal: goBackSignal(own),
      coverPhotoId,
    }
  })
}

/** The most recent rating given for a dimension, ignoring visits that skipped it. */
function latestRating(visits: Visit[], key: RatingKey) {
  return visits.find((v) => v.ratings[key] !== undefined)?.ratings[key]
}

function goodFor(visits: Visit[], age: 'newborn' | 'toddler'): boolean {
  return visits.some((v) => v.thumb === 'up' && v.kidAges.includes(age))
}

export function matchesFilter(s: PlaceSummary, id: FilterId): boolean {
  switch (id) {
    case 'roomy':
      return latestRating(s.visits, 'space') === 3
    case 'shortWait':
      return latestRating(s.visits, 'wait') === 3
    case 'newborns':
      return goodFor(s.visits, 'newborn')
    case 'toddlers':
      return goodFor(s.visits, 'toddler')
    case 'goBack':
      return s.signal === 'back'
  }
}

/** Active chips and an optional cuisine narrow the list together (AND). */
export function applyFilters(list: PlaceSummary[], active: FilterId[], cuisine?: Cuisine): PlaceSummary[] {
  return list.filter(
    (s) => (!cuisine || s.place.cuisine === cuisine) && active.every((id) => matchesFilter(s, id)),
  )
}

/** Cuisines that at least one place has, in the standard display order. */
export function cuisinesPresent(list: PlaceSummary[]): Cuisine[] {
  return orderedCuisines(list.map((s) => s.place.cuisine))
}

/** Most recently visited first; places with no visit go last, alphabetically. */
export function sortSummaries(list: PlaceSummary[]): PlaceSummary[] {
  return [...list].sort((a, b) => {
    const ad = a.lastVisit?.date
    const bd = b.lastVisit?.date
    if (ad && bd) return bd.localeCompare(ad) || a.place.name.localeCompare(b.place.name)
    if (ad) return -1
    if (bd) return 1
    return a.place.name.localeCompare(b.place.name)
  })
}
