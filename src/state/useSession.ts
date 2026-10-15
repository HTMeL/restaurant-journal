import { useEffect, useState } from 'react'
import type { SessionState } from '../data/repositories'
import { useRepositories } from './DataProvider'

/** Current sign-in state. Refreshes whenever the session changes. */
export function useSession() {
  const { session } = useRepositories()
  const [state, setState] = useState<SessionState>()
  const [error, setError] = useState<Error>()

  useEffect(() => {
    let cancelled = false
    const load = () =>
      session.getState().then(
        (s) => {
          if (cancelled) return
          setState(s)
          setError(undefined)
        },
        (e: unknown) => {
          if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)))
        },
      )
    void load()
    const off = session.subscribe(() => void load())
    return () => {
      cancelled = true
      off()
    }
  }, [session])

  return { state, error }
}
