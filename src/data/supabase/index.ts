/** Supabase implementation of the repository interfaces. */
import type { Repositories } from '../repositories'
import { buildSeed } from '../seed'
import { household } from './household'
import { photos } from './photos'
import { places } from './places'
import { session } from './session'
import { visits } from './visits'

export function createSupabaseRepositories(): Repositories {
  return {
    mode: 'supabase',
    session,
    places,
    visits,
    photos,
    household,
    admin: {
      // Adds the invented sample places, but never touches a journal that already has data.
      async loadSampleData() {
        if ((await places.list()).length > 0) {
          throw new Error('Your journal already has places, so the sample places were not added.')
        }
        const seed = buildSeed()
        const members = await household.listMembers()
        const mine = await household.getCurrentMemberId()
        const memberFor = (seedId: string) => {
          const slot = seed.members.find((m) => m.id === seedId)?.slot
          return members.find((m) => m.slot === slot)?.id
        }

        const placeIds = new Map<string, string>()
        for (const p of seed.places) {
          const created = await places.add({ name: p.name, status: p.status, cuisine: p.cuisine, foundNote: p.foundNote })
          placeIds.set(p.id, created.id)
        }
        for (const v of seed.visits) {
          const votes: Record<string, 'yes' | 'no'> = {}
          for (const [seedMember, vote] of Object.entries(v.votes)) {
            const id = memberFor(seedMember)
            if (id) votes[id] = vote
          }
          await visits.add({
            placeId: placeIds.get(v.placeId)!,
            date: v.date,
            loggedBy: memberFor(v.loggedBy) ?? mine ?? '',
            thumb: v.thumb,
            ratings: v.ratings,
            note: v.note,
            kidAges: v.kidAges,
            votes,
            photoIds: [],
          })
        }
      },
    },
  }
}
