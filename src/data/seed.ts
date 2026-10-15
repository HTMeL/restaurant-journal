/**
 * Sample data so the app never looks empty during testing.
 * All place names are invented. Dates are relative to "today" so the
 * Friday-night view always looks recent.
 */
import type { Cuisine, Household, Member, Place, Visit } from '../types'

export const SEED_HOUSEHOLD_ID = 'household-1'
export const SEED_MEMBER_1 = 'member-1'
export const SEED_MEMBER_2 = 'member-2'

export interface SeedData {
  household: Household
  members: Member[]
  places: Place[]
  visits: Visit[]
}

function isoDaysAgo(today: Date, days: number): string {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - days)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

export function buildSeed(today: Date = new Date()): SeedData {
  const created = today.toISOString()
  const ago = (n: number) => isoDaysAgo(today, n)

  const household: Household = { id: SEED_HOUSEHOLD_ID, code: 'SAMPLE', createdAt: created }

  const members: Member[] = [
    { id: SEED_MEMBER_1, householdId: SEED_HOUSEHOLD_ID, displayName: 'Adult 1', slot: 1 },
    { id: SEED_MEMBER_2, householdId: SEED_HOUSEHOLD_ID, displayName: 'Adult 2', slot: 2 },
  ]

  const place = (
    n: number,
    name: string,
    status: Place['status'],
    cuisine: Cuisine,
    foundNote?: string,
  ): Place => ({
    id: `place-${n}`,
    householdId: SEED_HOUSEHOLD_ID,
    name,
    status,
    cuisine,
    foundNote,
    createdAt: created,
  })

  const places: Place[] = [
    place(1, 'Palmetto Patio Kitchen', 'been', 'latin'),
    place(2, 'Sawgrass Noodle House', 'been', 'asian'),
    place(3, 'Coral Reef Taqueria', 'been', 'mexican'),
    place(4, 'Mangrove Bay Grill', 'been', 'seafood'),
    place(5, 'Seagrape Pizza Porch', 'been', 'italian'),
    place(6, 'Little Egret Cafe', 'been', 'cafe'),
    place(7, 'Hammock Breakfast Club', 'been', 'breakfast'),
    place(8, 'Bayfront Fish Shack', 'been', 'seafood'),
    place(9, 'Sunrise Dumpling Bar', 'want', 'asian', 'A neighbor mentioned it'),
    place(10, 'Tidewater Smokehouse', 'want', 'bbq', 'Spotted it driving down Oakland Park'),
    place(11, 'Orange Blossom Bakery', 'want', 'cafe', 'From a friend at toddler group'),
  ]

  let v = 0
  const visit = (
    placeNum: number,
    daysAgo: number,
    rest: Omit<Visit, 'id' | 'placeId' | 'date' | 'createdAt' | 'photoIds' | 'loggedBy'> & {
      loggedBy?: string
    },
  ): Visit => {
    v += 1
    return {
      id: `visit-${v}`,
      placeId: `place-${placeNum}`,
      date: ago(daysAgo),
      createdAt: created,
      photoIds: [],
      loggedBy: SEED_MEMBER_1,
      ...rest,
    }
  }

  const visits: Visit[] = [
    visit(1, 6, {
      thumb: 'up',
      ratings: { wait: 3, space: 3, noiseAir: 2, service: 3, seating: 3 },
      note: 'Shaded patio, high chairs right by the door.',
      kidAges: ['newborn', 'toddler'],
      votes: { [SEED_MEMBER_1]: 'yes', [SEED_MEMBER_2]: 'yes' },
    }),
    visit(1, 48, {
      thumb: 'up',
      ratings: { wait: 2, space: 3, service: 3 },
      kidAges: ['toddler'],
      votes: {},
      loggedBy: SEED_MEMBER_2,
    }),
    visit(2, 13, {
      thumb: 'up',
      ratings: { wait: 3, space: 2, noiseAir: 1, service: 3, seating: 2 },
      note: 'Food comes fast. A bit loud inside.',
      kidAges: ['toddler'],
      votes: { [SEED_MEMBER_2]: 'yes' },
      loggedBy: SEED_MEMBER_2,
    }),
    visit(3, 20, {
      thumb: 'down',
      ratings: { wait: 1, space: 1, noiseAir: 1, seating: 1 },
      note: 'Tight tables and no high chair free.',
      kidAges: ['newborn', 'toddler'],
      votes: { [SEED_MEMBER_1]: 'no', [SEED_MEMBER_2]: 'no' },
    }),
    visit(4, 9, {
      thumb: 'up',
      ratings: { wait: 1, space: 3, noiseAir: 3, service: 2, seating: 3 },
      note: 'Lovely breezy patio, long wait on a Friday.',
      kidAges: ['toddler'],
      votes: { [SEED_MEMBER_1]: 'yes', [SEED_MEMBER_2]: 'no' },
    }),
    visit(5, 27, {
      thumb: 'up',
      ratings: { wait: 2, space: 3, noiseAir: 2, service: 2 },
      kidAges: ['toddler', 'preschool'],
      votes: { [SEED_MEMBER_1]: 'yes' },
    }),
    visit(6, 3, {
      thumb: 'up',
      ratings: { wait: 3, space: 2, noiseAir: 3, service: 3, seating: 2 },
      note: 'Quiet and cool. Easy with a stroller.',
      kidAges: ['newborn'],
      votes: { [SEED_MEMBER_1]: 'yes', [SEED_MEMBER_2]: 'yes' },
      loggedBy: SEED_MEMBER_2,
    }),
    visit(7, 34, {
      thumb: 'down',
      ratings: { wait: 1, service: 1 },
      kidAges: ['toddler'],
      votes: {},
    }),
    visit(8, 70, {
      thumb: 'down',
      ratings: { wait: 1, space: 2 },
      note: 'Slow on a busy night.',
      kidAges: ['toddler'],
      votes: {},
    }),
    visit(8, 16, {
      thumb: 'up',
      ratings: { wait: 2, space: 2, noiseAir: 2, service: 3, seating: 2 },
      note: 'Went earlier this time. Much better.',
      kidAges: ['newborn', 'toddler'],
      votes: { [SEED_MEMBER_2]: 'yes' },
      loggedBy: SEED_MEMBER_2,
    }),
  ]

  return { household, members, places, visits }
}
