/**
 * localStorage + IndexedDB implementation of the repository interfaces.
 * This folder is the only place in the app allowed to touch browser storage.
 */
import type { Household, Id, Member, Photo, Place, Visit } from '../../types'
import type {
  HouseholdRepository,
  NewPhoto,
  NewPlace,
  NewVisit,
  PhotoRepository,
  PlacePatch,
  PlaceRepository,
  Repositories,
  SessionRepository,
  VisitPatch,
  VisitRepository,
} from '../repositories'
import { buildSeed } from '../seed'
import { idbPhotos } from './idb'
import { hasKey, newId, readJson, removeKey, writeJson } from './store'

const K = {
  household: 'household',
  members: 'members',
  places: 'places',
  visits: 'visits',
  currentMember: 'currentMember',
} as const

function seedIfEmpty(): void {
  if (hasKey(K.household)) return
  const seed = buildSeed()
  writeJson(K.household, seed.household)
  writeJson(K.members, seed.members)
  writeJson(K.places, seed.places)
  writeJson(K.visits, seed.visits)
  writeJson(K.currentMember, seed.members[0].id)
}

function householdId(): Id {
  const h = readJson<Household | undefined>(K.household, undefined)
  if (!h) throw new Error('No household')
  return h.id
}

const places: PlaceRepository = {
  async list() {
    return readJson<Place[]>(K.places, [])
  },
  async get(id) {
    return readJson<Place[]>(K.places, []).find((p) => p.id === id)
  },
  async add(input: NewPlace) {
    const place: Place = {
      id: newId('place'),
      householdId: householdId(),
      createdAt: new Date().toISOString(),
      ...input,
    }
    writeJson(K.places, [...readJson<Place[]>(K.places, []), place])
    return place
  },
  async update(id, patch: PlacePatch) {
    const all = readJson<Place[]>(K.places, [])
    const i = all.findIndex((p) => p.id === id)
    if (i < 0) throw new Error(`Place ${id} not found`)
    const next = { ...all[i], ...patch }
    all[i] = next
    writeJson(K.places, all)
    return next
  },
  async remove(id) {
    writeJson(K.places, readJson<Place[]>(K.places, []).filter((p) => p.id !== id))
  },
}

const visits: VisitRepository = {
  async list() {
    return readJson<Visit[]>(K.visits, [])
  },
  async listByPlace(placeId) {
    return readJson<Visit[]>(K.visits, []).filter((v) => v.placeId === placeId)
  },
  async get(id) {
    return readJson<Visit[]>(K.visits, []).find((v) => v.id === id)
  },
  async add(input: NewVisit) {
    const visit: Visit = { id: newId('visit'), createdAt: new Date().toISOString(), ...input }
    writeJson(K.visits, [...readJson<Visit[]>(K.visits, []), visit])
    return visit
  },
  async update(id, patch: VisitPatch) {
    const all = readJson<Visit[]>(K.visits, [])
    const i = all.findIndex((v) => v.id === id)
    if (i < 0) throw new Error(`Visit ${id} not found`)
    const next = { ...all[i], ...patch }
    all[i] = next
    writeJson(K.visits, all)
    return next
  },
  async remove(id) {
    writeJson(K.visits, readJson<Visit[]>(K.visits, []).filter((v) => v.id !== id))
  },
}

// Object URLs are cached so a list of cards doesn't create a new URL per render.
const urlCache = new Map<Id, string>()

const photos: PhotoRepository = {
  async add(input: NewPhoto) {
    const photo: Photo = { id: newId('photo'), createdAt: new Date().toISOString(), ...input }
    await idbPhotos.put(photo)
    return photo
  },
  async getUrl(id) {
    const cached = urlCache.get(id)
    if (cached) return cached
    const photo = await idbPhotos.get<Photo>(id)
    if (!photo) return undefined
    if (!photo.blob) return undefined
    const url = URL.createObjectURL(photo.blob)
    urlCache.set(id, url)
    return url
  },
  async remove(id) {
    const cached = urlCache.get(id)
    if (cached) {
      URL.revokeObjectURL(cached)
      urlCache.delete(id)
    }
    await idbPhotos.delete(id)
  },
}

const household: HouseholdRepository = {
  async getHousehold() {
    return readJson<Household | undefined>(K.household, undefined)
  },
  async setCode(code) {
    const current = readJson<Household | undefined>(K.household, undefined)
    const next: Household = {
      id: current?.id ?? newId('household'),
      createdAt: current?.createdAt ?? new Date().toISOString(),
      code: code.trim(),
    }
    writeJson(K.household, next)
    return next
  },
  async listMembers() {
    return readJson<Member[]>(K.members, [])
  },
  async renameMember(id, displayName) {
    const all = readJson<Member[]>(K.members, [])
    const i = all.findIndex((m) => m.id === id)
    if (i < 0) throw new Error(`Member ${id} not found`)
    all[i] = { ...all[i], displayName: displayName.trim() || all[i].displayName }
    writeJson(K.members, all)
    return all[i]
  },
  async getCurrentMemberId() {
    return readJson<Id | undefined>(K.currentMember, undefined)
  },
  async setCurrentMemberId(id) {
    writeJson(K.currentMember, id)
  },
}

// Local mode has no accounts: everyone is always "signed in" to the sample household.
const session: SessionRepository = {
  getState: async () => ({ status: 'ready' }),
  subscribe: () => () => {},
  signIn: async () => {},
  signUp: async () => ({ confirmationRequired: false }),
  signOut: async () => {},
  createHousehold: async () => {},
  joinHousehold: async () => {},
}

export function createLocalRepositories(): Repositories {
  seedIfEmpty()
  return {
    mode: 'local',
    session,
    places,
    visits,
    photos,
    household,
    admin: {
      async loadSampleData() {
        for (const key of Object.values(K)) removeKey(key)
        for (const url of urlCache.values()) URL.revokeObjectURL(url)
        urlCache.clear()
        await idbPhotos.clear()
        seedIfEmpty()
      },
    },
  }
}
