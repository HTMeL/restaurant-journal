/** Domain types. These mirror the tables the Supabase backend will have later. */

export type Id = string

export interface Household {
  id: Id
  /** Shared code the two adults enter. Local-only for now; no real auth. */
  code: string
  createdAt: string
}

export interface Member {
  id: Id
  householdId: Id
  /** Editable display name, e.g. "Alex". Never a child's name. */
  displayName: string
  /** Fixed slot so the "who are you" picker stays predictable. */
  slot: 1 | 2
}

export type PlaceStatus = 'want' | 'been'

export type Cuisine =
  | 'american'
  | 'mexican'
  | 'italian'
  | 'asian'
  | 'seafood'
  | 'latin'
  | 'bbq'
  | 'breakfast'
  | 'cafe'
  | 'other'

export interface Place {
  id: Id
  householdId: Id
  name: string
  status: PlaceStatus
  /** Optional. A property of the place, not of a visit. */
  cuisine?: Cuisine
  /** Want-to-try only: where the place was found (a friend, a post, a drive-by). */
  foundNote?: string
  createdAt: string
}

/**
 * A tap rating where 3 is always the best outcome for a family:
 * short wait, roomy, quiet, great service, plenty of room.
 * The words shown for each step live in lib/ratings.ts.
 */
export type Rating = 1 | 2 | 3

export type RatingKey = 'wait' | 'space' | 'noiseAir' | 'service' | 'seating'

export type Ratings = Partial<Record<RatingKey, Rating>>

export type Thumb = 'up' | 'down'

export type AgeTag = 'newborn' | 'toddler' | 'preschool' | 'schoolAge'

export type Vote = 'yes' | 'no'

export interface Visit {
  id: Id
  placeId: Id
  /** Calendar date, YYYY-MM-DD. */
  date: string
  loggedBy: Id
  thumb: Thumb
  ratings: Ratings
  note?: string
  kidAges: AgeTag[]
  /** Optional would-go-back vote per adult, keyed by member id. */
  votes: Record<Id, Vote>
  photoIds: Id[]
  createdAt: string
}

export interface Photo {
  id: Id
  visitId: Id
  /** Resized JPEG. Set by the local (IndexedDB) implementation. */
  blob?: Blob
  /** Object path in the private "photos" bucket. Set by the Supabase implementation. */
  storagePath?: string
  width: number
  height: number
  createdAt: string
}

export type GoBackSignal = 'back' | 'mixed' | 'never'

/** Place plus the facts the Friday-night view needs, assembled in one place. */
export interface PlaceSummary {
  place: Place
  visits: Visit[]
  lastVisit?: Visit
  signal?: GoBackSignal
  /** First photo of the most recent visit that has one. */
  coverPhotoId?: Id
}
