import type { Place } from '../../types'
import type { PlacePatch, PlaceRepository } from '../repositories'
import { householdId, supabase, unwrap } from './client'

interface PlaceRow {
  id: string
  household_id: string
  name: string
  status: Place['status']
  cuisine: Place['cuisine'] | null
  found_note: string | null
  created_at: string
}

const toPlace = (r: PlaceRow): Place => ({
  id: r.id,
  householdId: r.household_id,
  name: r.name,
  status: r.status,
  cuisine: r.cuisine ?? undefined,
  foundNote: r.found_note ?? undefined,
  createdAt: r.created_at,
})

function toRowPatch(p: PlacePatch) {
  const row: Record<string, unknown> = {}
  if ('name' in p) row.name = p.name?.trim()
  if ('status' in p) row.status = p.status
  if ('cuisine' in p) row.cuisine = p.cuisine ?? null
  if ('foundNote' in p) row.found_note = p.foundNote ?? null
  return row
}

export const places: PlaceRepository = {
  async list() {
    const rows = unwrap(await supabase().from('places').select('*').order('created_at'))
    return (rows as PlaceRow[]).map(toPlace)
  },
  async get(id) {
    const row = unwrap(await supabase().from('places').select('*').eq('id', id).maybeSingle())
    return row ? toPlace(row as PlaceRow) : undefined
  },
  async add(input) {
    const row = unwrap(
      await supabase()
        .from('places')
        .insert({
          household_id: await householdId(),
          name: input.name.trim(),
          status: input.status,
          cuisine: input.cuisine ?? null,
          found_note: input.foundNote ?? null,
        })
        .select()
        .single(),
    )
    return toPlace(row as PlaceRow)
  },
  async update(id, patch) {
    const row = unwrap(await supabase().from('places').update(toRowPatch(patch)).eq('id', id).select().single())
    return toPlace(row as PlaceRow)
  },
  async remove(id) {
    unwrap(await supabase().from('places').delete().eq('id', id))
  },
}
