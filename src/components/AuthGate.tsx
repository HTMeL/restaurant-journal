import type { ReactNode } from 'react'
import { HouseholdSetup } from '../routes/HouseholdSetup'
import { NewPassword } from '../routes/NewPassword'
import { SignIn } from '../routes/SignIn'
import { useSession } from '../state/useSession'
import { EmptyState } from './Page'

/** Shows sign-in, then household setup, before the app itself. Local mode goes straight through. */
export function AuthGate({ children }: { children: ReactNode }) {
  const { state, error } = useSession()
  if (error) return <EmptyState>We could not reach the server. Check your connection and refresh.</EmptyState>
  if (!state) return <EmptyState>Loading.</EmptyState>
  if (state.status === 'recovering') return <NewPassword />
  if (state.status === 'signedOut') return <SignIn />
  if (state.status === 'needsHousehold') return <HouseholdSetup email={state.email} />
  return <>{children}</>
}
