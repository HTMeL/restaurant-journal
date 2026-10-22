import { useState, type FormEvent } from 'react'
import { Page } from '../components/Page'
import { useRepositories } from '../state/DataProvider'

/** Shown after someone opens the link in a password reset email. */
export function NewPassword() {
  const { session } = useRepositories()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError(undefined)
    if (password.length < 8) return setError('Use a password with at least 8 characters.')
    if (password !== confirm) return setError('The two passwords do not match.')
    setBusy(true)
    try {
      await session.updatePassword(password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That did not work. Please try again.')
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <Page title="Choose a new password">
        <form className="form" onSubmit={submit} noValidate>
          <div className="field">
            <label className="field__label" htmlFor="new-password">
              New password
            </label>
            <input
              id="new-password"
              className="input"
              type="password"
              autoComplete="new-password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="field__hint">At least 8 characters.</p>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="confirm-password">
              Confirm new password
            </label>
            <input
              id="confirm-password"
              className="input"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <p className="action-bar__status" role="alert">
            {error}
          </p>
          <button type="submit" className="btn btn--primary" disabled={busy}>
            {busy ? 'One moment' : 'Save new password'}
          </button>
        </form>
        <button type="button" className="btn btn--text" onClick={() => void session.signOut()}>
          Back to sign in
        </button>
      </Page>
    </div>
  )
}
