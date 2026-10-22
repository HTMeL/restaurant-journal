/**
 * Supabase client and shared helpers. Only files in src/data/supabase may import this.
 * The publishable key is meant to be public: row level security in the database
 * (see supabase/migrations) is what keeps each household's data private.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const isSupabaseConfigured = Boolean(url && key)

// True while someone who opened a password reset link still has to choose a new password.
// The link lands with "type=recovery" in the address, and Supabase also fires a
// PASSWORD_RECOVERY event; the listener is registered the moment the client is created
// so that event can't be missed.
let recovering = typeof window !== 'undefined' && /[#&?]type=recovery(&|$)/.test(window.location.hash)
export const isRecovering = () => recovering
export const setRecovering = (value: boolean) => {
  recovering = value
}

let client: SupabaseClient | undefined
export function supabase(): SupabaseClient {
  if (!client) {
    client = createClient(url!, key!)
    client.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') recovering = true
    })
  }
  return client
}

/** Throws on a Supabase error; otherwise returns the data. Callers cast rows to their own types. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function unwrap<T = any>(res: { data: unknown; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message)
  return res.data as T
}

/** The signed-in user's household id. Cached until the session changes; failures are not cached. */
let cachedHousehold: Promise<string> | undefined
export function householdId(): Promise<string> {
  if (!cachedHousehold) {
    const pending = (async () => {
      const { data } = await supabase().auth.getSession()
      if (!data.session) throw new Error('Not signed in')
      const row = unwrap(
        await supabase().from('members').select('household_id').eq('user_id', data.session.user.id).maybeSingle(),
      )
      if (!row) throw new Error('Join or start a household first')
      return row.household_id as string
    })()
    pending.catch(() => {
      if (cachedHousehold === pending) cachedHousehold = undefined
    })
    cachedHousehold = pending
  }
  return cachedHousehold
}

export function forgetHousehold(): void {
  cachedHousehold = undefined
}

export async function currentUser() {
  const { data } = await supabase().auth.getSession()
  return data.session?.user
}
