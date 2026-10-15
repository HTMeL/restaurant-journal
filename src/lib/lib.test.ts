import { describe, expect, it } from 'vitest'
import { buildSeed } from '../data/seed'
import { orderedCuisines } from './cuisines'
import { applyFilters, cuisinesPresent, sortSummaries, summarize } from './filters'
import { formatVisitDate, todayISO } from './dates'
import { goBackSignal } from './signal'
import type { Visit } from '../types'

const base: Visit = {
  id: 'v', placeId: 'p', date: '2026-03-01', loggedBy: 'm1', thumb: 'up',
  ratings: {}, kidAges: [], votes: {}, photoIds: [], createdAt: '2026-03-01T00:00:00Z',
}
const v = (o: Partial<Visit>): Visit => ({ ...base, ...o })

describe('goBackSignal', () => {
  it('is undefined with no visits', () => expect(goBackSignal([])).toBeUndefined())
  it('is "never" for a thumbs down', () => expect(goBackSignal([v({ thumb: 'down' })])).toBe('never'))
  it('is "back" for thumbs up with no objections', () => {
    expect(goBackSignal([v({ votes: { m1: 'yes' } })])).toBe('back')
  })
  it('is "mixed" when an adult votes no', () => {
    expect(goBackSignal([v({ votes: { m1: 'yes', m2: 'no' } })])).toBe('mixed')
  })
  it('uses the most recent visit so a place can recover', () => {
    const visits = [v({ id: 'a', date: '2026-01-01', thumb: 'down' }), v({ id: 'b', date: '2026-02-01' })]
    expect(goBackSignal(visits)).toBe('back')
  })
})

describe('filters and sorting on seed data', () => {
  const seed = buildSeed(new Date(2026, 5, 15))
  const all = summarize(seed.places, seed.visits)
  const been = all.filter((s) => s.place.status === 'been')
  const names = (list: typeof all) => list.map((s) => s.place.name)

  it('sorts most recent visit first', () => {
    expect(names(sortSummaries(been))[0]).toBe('Little Egret Cafe')
  })
  it('"Would go back" excludes mixed and never', () => {
    const list = names(applyFilters(been, ['goBack']))
    expect(list).not.toContain('Mangrove Bay Grill')
    expect(list).not.toContain('Coral Reef Taqueria')
    expect(list).toContain('Palmetto Patio Kitchen')
  })
  it('combines filters with AND', () => {
    const list = names(applyFilters(been, ['roomy', 'goBack']))
    expect(list).toContain('Palmetto Patio Kitchen')
    expect(list).not.toContain('Sawgrass Noodle House')
  })
  it('newborn filter needs a thumbs-up visit tagged newborn', () => {
    const list = names(applyFilters(been, ['newborns']))
    expect(list).toContain('Little Egret Cafe')
    expect(list).not.toContain('Coral Reef Taqueria')
  })
})

describe('cuisine filter', () => {
  const seed = buildSeed(new Date(2026, 5, 15))
  const been = summarize(seed.places, seed.visits).filter((s) => s.place.status === 'been')
  const names = (list: typeof been) => list.map((s) => s.place.name).sort()

  it('narrows to one cuisine', () => {
    expect(names(applyFilters(been, [], 'seafood'))).toEqual(['Bayfront Fish Shack', 'Mangrove Bay Grill'])
  })
  it('combines with other chips', () => {
    expect(names(applyFilters(been, ['goBack'], 'seafood'))).toEqual(['Bayfront Fish Shack'])
  })
  it('lists only cuisines in use, in display order', () => {
    expect(cuisinesPresent(been)).toEqual(['mexican', 'italian', 'asian', 'seafood', 'latin', 'breakfast', 'cafe'])
  })
})

describe('orderedCuisines', () => {
  it('keeps display order, drops duplicates and missing values', () => {
    expect(orderedCuisines(['cafe', undefined, 'asian', 'cafe'])).toEqual(['asian', 'cafe'])
  })
})

describe('dates', () => {
  it('formats without a year in the current year', () => {
    expect(formatVisitDate('2026-03-03', new Date(2026, 5, 1))).toBe('Mar 3')
  })
  it('adds the year otherwise', () => {
    expect(formatVisitDate('2025-03-03', new Date(2026, 5, 1))).toBe('Mar 3, 2025')
  })
  it('todayISO is local YYYY-MM-DD', () => {
    expect(todayISO(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})
