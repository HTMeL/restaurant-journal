import { useState, type FormEvent } from 'react'
import diningIcon from '../assets/dining-icon.svg'
import { useRepositories } from '../state/DataProvider'

/** Email and password. Signing in or creating an account; the app shows this until someone is signed in. */
export function SignIn() {
  const { session } = useRepositories()
  const [mode, setMode] = useState<'signIn' | 'signUp' | 'reset'>('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string>()
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError(undefined)
    setMessage(undefined)
    if (!email.trim()) return setError('Add your email.')
    if (mode === 'reset') {
      setBusy(true)
      try {
        await session.requestPasswordReset(email)
        // Same message whether or not the address has an account, so it can't be used to look people up.
        setMessage('If there is an account for that email, a reset link is on its way. Check your inbox.')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'That did not work. Please try again.')
      } finally {
        setBusy(false)
      }
      return
    }
    if (mode === 'signUp' && password.length < 8) return setError('Use a password with at least 8 characters.')
    if (!password) return setError('Add your password.')
    setBusy(true)
    try {
      if (mode === 'signIn') {
        await session.signIn(email, password)
      } else {
        const { confirmationRequired } = await session.signUp(email, password)
        if (confirmationRequired) {
          setMode('signIn')
          setPassword('')
          setMessage('Check your email for a confirmation link, then sign in.')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That did not work. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <div className="page">
        <header className="hero">
          <div className="hero__icon">
            <img src={diningIcon} alt="" width={60} height={60} />
          </div>
          <h1 className="hero__title">
            Your dining story
            <br />
            starts here
          </h1>
          <p className="hero__text">
            Log every meal, savor every memory,
            <br />
            Your dining story for the places that work for you family starts here
          </p>
        </header>
        {mode === 'reset' ? (
          <div>
            <h2>Reset your password</h2>
            <p className="field__hint">Enter your email and we will send you a link to choose a new one.</p>
          </div>
        ) : (
          <div className="segmented" role="group" aria-label="Sign in or create an account">
            <button type="button" className="segmented__btn" aria-pressed={mode === 'signIn'} onClick={() => setMode('signIn')}>
              Sign in
            </button>
            <button type="button" className="segmented__btn" aria-pressed={mode === 'signUp'} onClick={() => setMode('signUp')}>
              Create account
            </button>
          </div>
        )}
        <form className="form" onSubmit={submit} noValidate>
          <div className="field">
            <label className="field__label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="input"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {mode !== 'reset' && (
            <div className="field">
              <label className="field__label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                className="input"
                type="password"
                autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {mode === 'signUp' && <p className="field__hint">At least 8 characters.</p>}
              {mode === 'signIn' && (
                <button
                  type="button"
                  className="btn btn--text link-button"
                  onClick={() => {
                    setMode('reset')
                    setError(undefined)
                    setMessage(undefined)
                  }}
                >
                  Forgot password?
                </button>
              )}
            </div>
          )}
          <p className="field__hint" role="status">
            {message}
          </p>
          <p className="action-bar__status" role="alert">
            {error}
          </p>
          <button type="submit" className="btn btn--primary" disabled={busy}>
            {busy ? 'One moment' : mode === 'signIn' ? 'Sign in' : mode === 'signUp' ? 'Create account' : 'Send reset link'}
          </button>
          {mode === 'reset' && (
            <button
              type="button"
              className="btn btn--text"
              onClick={() => {
                setMode('signIn')
                setError(undefined)
                setMessage(undefined)
              }}
            >
              Back to sign in
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
