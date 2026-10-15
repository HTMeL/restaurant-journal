import type { SessionRepository, SessionState } from '../repositories'
import { currentUser, forgetHousehold, supabase, unwrap } from './client'

const listeners = new Set<() => void>()
let wired = false

function notify() {
  forgetHousehold()
  listeners.forEach((l) => l())
}

function wire() {
  if (wired) return
  wired = true
  // Deferred so the listener never runs supabase calls inside the auth callback itself.
  supabase().auth.onAuthStateChange(() => setTimeout(notify, 0))
}

function friendly(message: string): string {
  if (/invalid login credentials/i.test(message)) return "That email and password don't match."
  if (/email not confirmed/i.test(message)) return 'Please confirm your email first. Check your inbox for the link.'
  if (/already registered/i.test(message)) return 'There is already an account with that email. Try signing in.'
  if (/password/i.test(message) && /characters/i.test(message)) return 'Use a password with at least 8 characters.'
  return message
}

export const session: SessionRepository = {
  async getState(): Promise<SessionState> {
    const user = await currentUser()
    if (!user) return { status: 'signedOut' }
    const member = unwrap(await supabase().from('members').select('id').eq('user_id', user.id).maybeSingle())
    return member ? { status: 'ready', email: user.email } : { status: 'needsHousehold', email: user.email ?? '' }
  },
  subscribe(listener) {
    wire()
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  async signIn(email, password) {
    const { error } = await supabase().auth.signInWithPassword({ email: email.trim(), password })
    if (error) throw new Error(friendly(error.message))
  },
  async signUp(email, password) {
    const { data, error } = await supabase().auth.signUp({ email: email.trim(), password })
    if (error) throw new Error(friendly(error.message))
    return { confirmationRequired: !data.session }
  },
  async signOut() {
    const { error } = await supabase().auth.signOut()
    if (error) throw new Error(error.message)
    notify()
  },
  async createHousehold(displayName) {
    unwrap(await supabase().rpc('create_household', { p_display_name: displayName }))
    notify()
  },
  async joinHousehold(code, displayName) {
    unwrap(await supabase().rpc('join_household', { p_code: code, p_display_name: displayName }))
    notify()
  },
}
