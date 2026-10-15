import type { Visit } from '../../types'
import type { VisitPatch, VisitRepository } from '../repositories'
import { householdId, supabase, unwrap } from './client'

interface VisitRow {
  id: string
  place_id: string
  logged_by: string | null
  date: string
  thumb: Visit['thumb']
  ratings: Visit['ratings'] | null
  note: string | null
  kid_ages: Visit['kidAges'] | null
  votes: Visit['votes'] | null
  created_at: string
  photos: { id: string; created_at: string }[] | null
}

// Photos are their own table; a visit's photoIds are derived from it.
const SELECT = '*, photos(id, created_at)'

const toVisit = (r: VisitRow): Visit => ({
  id: r.id,
  placeId: r.place_id,
  date: r.date,
  loggedBy: r.logged_by ?? '',
  thumb: r.thumb,
  ratings: r.ratings ?? {},
  note: r.note ?? undefined,
  kidAges: r.kid_ages ?? [],
  votes: r.votes ?? {},
  photoIds: [...(r.photos ?? [])].sort((a, b) => a.created_at.localeCompare(b.created_at)).map((p) => p.id),
  createdAt: r.created_at,
})

function toRowPatch(p: VisitPatch) {
  const row: Record<string, unknown> = {}
  if (p.date !== undefined) row.date = p.date
  if (p.loggedBy !== undefined) row.logged_by = p.loggedBy || null
  if (p.thumb !== undefined) row.thumb = p.thumb
  if (p.ratings !== undefined) row.ratings = p.ratings
  if ('note' in p) row.note = p.note ?? null
  if (p.kidAges !== undefined) row.kid_ages = p.kidAges
  if (p.votes !== undefined) row.votes = p.votes
  // photoIds is ignored on purpose: adding a photo creates its own row.
  return row
}

export const visits: VisitRepository = {
  async list() {
    const rows = unwrap(await supabase().from('visits').select(SELECT))
    return (rows as VisitRow[]).map(toVisit)
  },
  async listByPlace(placeId) {
    const rows = unwrap(await supabase().from('visits').select(SELECT).eq('place_id', placeId))
    return (rows as VisitRow[]).map(toVisit)
  },
  async get(id) {
    const row = unwrap(await supabase().from('visits').select(SELECT).eq('id', id).maybeSingle())
    return row ? toVisit(row as VisitRow) : undefined
  },
  async add(input) {
    const row = unwrap(
      await supabase()
        .from('visits')
        .insert({
          household_id: await householdId(),
          place_id: input.placeId,
          logged_by: input.loggedBy || null,
          date: input.date,
          thumb: input.thumb,
          ratings: input.ratings,
          note: input.note ?? null,
          kid_ages: input.kidAges,
          votes: input.votes,
        })
        .select(SELECT)
        .single(),
    )
    return toVisit(row as VisitRow)
  },
  async update(id, patch) {
    const changes = toRowPatch(patch)
    if (Object.keys(changes).length === 0) {
      const current = await visits.get(id)
      if (!current) throw new Error('Visit not found')
      return current
    }
    const row = unwrap(await supabase().from('visits').update(changes).eq('id', id).select(SELECT).single())
    return toVisit(row as VisitRow)
  },
  async remove(id) {
    unwrap(await supabase().from('visits').delete().eq('id', id))
  },
}
