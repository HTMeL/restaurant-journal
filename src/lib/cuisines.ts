import type { Cuisine } from '../types'

/** Short, plain labels. Each has a matching icon in components/CuisineIcon.tsx. */
export const CUISINES: { value: Cuisine; label: string }[] = [
  { value: 'american', label: 'American' },
  { value: 'mexican', label: 'Mexican' },
  { value: 'italian', label: 'Italian' },
  { value: 'asian', label: 'Asian' },
  { value: 'seafood', label: 'Seafood' },
  { value: 'latin', label: 'Latin' },
  { value: 'bbq', label: 'Barbecue' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'cafe', label: 'Cafe' },
  { value: 'other', label: 'Other' },
]

/** The cuisines that appear in `used`, in the standard display order. */
export function orderedCuisines(used: Iterable<Cuisine | undefined>): Cuisine[] {
  const set = new Set(used)
  return CUISINES.map((c) => c.value).filter((c) => set.has(c))
}

export function cuisineLabel(c: Cuisine): string {
  return CUISINES.find((x) => x.value === c)?.label ?? c
}
