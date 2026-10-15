import type { Household, Member } from '../../types'
import type { HouseholdRepository } from '../repositories'
import { currentUser, supabase, unwrap } from './client'

interface MemberRow {
  id: string
  household_id: string
  slot: 1 | 2
  display_name: string
}

const toMember = (r: MemberRow): Member => ({
  id: r.id,
  householdId: r.household_id,
  slot: r.slot,
  displayName: r.display_name,
})

export const household: HouseholdRepository = {
  async getHousehold() {
    // Row level security only lets you see your own household, so there is at most one row.
    const row = unwrap(await supabase().from('households').select('*').maybeSingle())
    if (!row) return undefined
    const h: Household = { id: row.id, code: row.code, createdAt: row.created_at }
    return h
  },
  async setCode() {
    throw new Error('The household code is generated for you and cannot be changed.')
  },
  async listMembers() {
    const rows = unwrap(await supabase().from('members').select('*').order('slot'))
    return (rows as MemberRow[]).map(toMember)
  },
  async renameMember(id, displayName) {
    const name = displayName.trim()
    if (!name) {
      const row = unwrap(await supabase().from('members').select('*').eq('id', id).single())
      return toMember(row as MemberRow)
    }
    const row = unwrap(await supabase().from('members').update({ display_name: name }).eq('id', id).select().single())
    return toMember(row as MemberRow)
  },
  async getCurrentMemberId() {
    const user = await currentUser()
    if (!user) return undefined
    const row = unwrap(await supabase().from('members').select('id').eq('user_id', user.id).maybeSingle())
    return row?.id as string | undefined
  },
  async setCurrentMemberId() {
    // Who you are is decided by who signed in, so there is nothing to store.
  },
}
