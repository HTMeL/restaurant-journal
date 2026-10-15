/**
 * Repository interfaces: the only contract the UI knows about.
 *
 * Every method returns a Promise even though the local implementation is
 * synchronous for most of it, so a Supabase implementation can drop in without
 * touching a single component. See README, "Connecting Supabase".
 */
import type { Cuisine, Household, Id, Member, Photo, Place, PlaceStatus, Visit } from '../types'

export type NewPlace = {
  name: string
  status: PlaceStatus
  cuisine?: Cuisine
  foundNote?: string
}

export type PlacePatch = Partial<Pick<Place, 'name' | 'status' | 'cuisine' | 'foundNote'>>

export interface PlaceRepository {
  list(): Promise<Place[]>
  get(id: Id): Promise<Place | undefined>
  add(input: NewPlace): Promise<Place>
  update(id: Id, patch: PlacePatch): Promise<Place>
  remove(id: Id): Promise<void>
}

export type NewVisit = Omit<Visit, 'id' | 'createdAt'>

export type VisitPatch = Partial<Omit<Visit, 'id' | 'placeId' | 'createdAt'>>

export interface VisitRepository {
  list(): Promise<Visit[]>
  listByPlace(placeId: Id): Promise<Visit[]>
  get(id: Id): Promise<Visit | undefined>
  add(input: NewVisit): Promise<Visit>
  update(id: Id, patch: VisitPatch): Promise<Visit>
  remove(id: Id): Promise<void>
}

export interface NewPhoto {
  visitId: Id
  blob: Blob
  width: number
  height: number
}

export interface PhotoRepository {
  add(input: NewPhoto): Promise<Photo>
  /**
   * A URL the browser can put in an <img src>. Local: an object URL for the
   * stored blob. Supabase: a public or signed Storage URL. Callers treat it as opaque.
   */
  getUrl(id: Id): Promise<string | undefined>
  remove(id: Id): Promise<void>
}

export interface HouseholdRepository {
  getHousehold(): Promise<Household | undefined>
  /** Local only: any code is accepted. Supabase would verify an invite instead. */
  setCode(code: string): Promise<Household>
  listMembers(): Promise<Member[]>
  renameMember(id: Id, displayName: string): Promise<Member>
  /** Which adult is holding the phone. Stored per device, not per household. */
  getCurrentMemberId(): Promise<Id | undefined>
  setCurrentMemberId(id: Id): Promise<void>
}

/** Who is signed in, and whether they belong to a household yet. */
export type SessionState =
  | { status: 'signedOut' }
  | { status: 'needsHousehold'; email: string }
  | { status: 'ready'; email?: string }

export interface SessionRepository {
  getState(): Promise<SessionState>
  /** Called whenever sign-in state changes. Returns an unsubscribe function. */
  subscribe(listener: () => void): () => void
  signIn(email: string, password: string): Promise<void>
  /** `confirmationRequired` is true when the project wants the email confirmed first. */
  signUp(email: string, password: string): Promise<{ confirmationRequired: boolean }>
  signOut(): Promise<void>
  /** First adult: starts a household and gets a code to share. */
  createHousehold(displayName: string): Promise<void>
  /** Second adult: joins with the code from the first. */
  joinHousehold(code: string, displayName: string): Promise<void>
}

/** Sample data for testing. */
export interface SampleDataAdmin {
  /**
   * Local: replaces everything with the sample data.
   * Supabase: adds the sample places only when the household has none yet.
   */
  loadSampleData(): Promise<void>
}

export interface Repositories {
  /** 'local' = browser storage with sample data. 'supabase' = the real backend. */
  mode: 'local' | 'supabase'
  session: SessionRepository
  places: PlaceRepository
  visits: VisitRepository
  photos: PhotoRepository
  household: HouseholdRepository
  admin: SampleDataAdmin
}
