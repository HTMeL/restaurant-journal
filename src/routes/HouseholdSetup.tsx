import { useState, type FormEvent } from 'react'
import { Page } from '../components/Page'
import { useRepositories } from '../state/DataProvider'

/** Shown once, after a first sign-in: start a household or join one with a code. */
export function HouseholdSetup({ email }: { email: string }) {
  const { session } = useRepositories()
  const [mode, setMode] = useState<'create' | 'join'>('create')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError(undefined)
    if (!name.trim()) return setError('Add your name.')
    if (mode === 'join' && !code.trim()) return setError('Add the household code.')
    setBusy(true)
    try {
      if (mode === 'create') await session.createHousehold(name)
      else await session.joinHousehold(code, name)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That did not work. Please try again.')
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <Page title="Your household">
        <p className="field__hint">
          Two adults share one list. One of you starts the household and shares its code; the other joins with it.
        </p>
        <div className="segmented" role="group" aria-label="Start or join">
          <button type="button" className="segmented__btn" aria-pressed={mode === 'create'} onClick={() => setMode('create')}>
            Start a household
          </button>
          <button type="button" className="segmented__btn" aria-pressed={mode === 'join'} onClick={() => setMode('join')}>
            Join with a code
          </button>
        </div>
        <form className="form" onSubmit={submit} noValidate>
          <div className="field">
            <label className="field__label" htmlFor="member-name">
              Your name
            </label>
            <input id="member-name" className="input" maxLength={30} value={name} onChange={(e) => setName(e.target.value)} />
            <p className="field__hint">Shown next to the visits you log. No children's names.</p>
          </div>
          {mode === 'join' && (
            <div className="field">
              <label className="field__label" htmlFor="household-code">
                Household code
              </label>
              <input
                id="household-code"
                className="input"
                autoCapitalize="characters"
                autoComplete="off"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
          )}
          <p className="action-bar__status" role="alert">
            {error}
          </p>
          <button type="submit" className="btn btn--primary" disabled={busy}>
            {busy ? 'One moment' : mode === 'create' ? 'Start household' : 'Join household'}
          </button>
        </form>
        <p className="field__hint">
          Signed in as {email}.{' '}
          <button type="button" className="btn btn--text" onClick={() => void session.signOut()}>
            Sign out
          </button>
        </p>
      </Page>
    </div>
  )
}
