/**
 * Business rules for logging visits. Works only through the repository interfaces,
 * so it keeps working unchanged when the data layer moves to Supabase.
 */
import type { Repositories } from '../data'
import type { ProcessedPhoto } from '../lib/image'
import type { AgeTag, Cuisine, Id, Place, Ratings, Thumb, Visit, Vote } from '../types'

export interface VisitFields {
  date: string
  loggedBy: Id
  thumb: Thumb
  ratings: Ratings
  note: string
  kidAges: AgeTag[]
  votes: Record<Id, Vote>
}

function clean(f: VisitFields) {
  const note = f.note.trim()
  return {
    date: f.date,
    loggedBy: f.loggedBy,
    thumb: f.thumb,
    ratings: f.ratings,
    kidAges: f.kidAges,
    votes: f.votes,
    note: note || undefined,
  }
}

async function savePhotos(repos: Repositories, visitId: Id, photos: ProcessedPhoto[]): Promise<Id[]> {
  const saved = await Promise.all(
    photos.map((p) => repos.photos.add({ visitId, blob: p.blob, width: p.width, height: p.height })),
  )
  return saved.map((p) => p.id)
}

/**
 * Log a visit. Reuses a place by id or (case-insensitive) name, creates it if new,
 * and moves a "want" place to "been".
 */
export async function logVisit(
  repos: Repositories,
  input: { placeId?: Id; placeName: string; cuisine?: Cuisine; fields: VisitFields; photos: ProcessedPhoto[] },
): Promise<{ place: Place; visit: Visit }> {
  const all = await repos.places.list()
  const wanted = input.placeName.trim().toLowerCase()
  let place = input.placeId
    ? all.find((p) => p.id === input.placeId)
    : all.find((p) => p.name.trim().toLowerCase() === wanted)

  if (!place) {
    place = await repos.places.add({ name: input.placeName.trim(), status: 'been', cuisine: input.cuisine })
  } else if (place.status === 'want' || (input.cuisine && !place.cuisine)) {
    // Moves Want to try to Been, and fills in a cuisine the place was missing.
    place = await repos.places.update(place.id, {
      status: 'been',
      cuisine: place.cuisine ?? input.cuisine,
    })
  }

  let visit = await repos.visits.add({ placeId: place.id, photoIds: [], ...clean(input.fields) })
  if (input.photos.length) {
    const photoIds = await savePhotos(repos, visit.id, input.photos)
    visit = await repos.visits.update(visit.id, { photoIds })
  }
  return { place, visit }
}

export async function updateVisit(
  repos: Repositories,
  visitId: Id,
  input: { fields: VisitFields; keepPhotoIds: Id[]; removePhotoIds: Id[]; newPhotos: ProcessedPhoto[] },
): Promise<Visit> {
  await Promise.all(input.removePhotoIds.map((id) => repos.photos.remove(id)))
  const added = await savePhotos(repos, visitId, input.newPhotos)
  return repos.visits.update(visitId, { ...clean(input.fields), photoIds: [...input.keepPhotoIds, ...added] })
}
