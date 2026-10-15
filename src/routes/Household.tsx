import { useEffect, useState } from 'react'
import { EmptyState, Page } from '../components/Page'
import { useRepositories } from '../state/DataProvider'
import { useHousehold } from '../state/useHousehold'
import { useSession } from '../state/useSession'
import type { Member } from '../types'

function NameField({ member, onSave }: { member: Member; onSave: (name: string) => void }) {
  const [value, setValue] = useState(member.displayName)
  useEffect(() => setValue(member.displayName), [member.displayName])
  return (
    <div className="field">
      <label className="field__label" htmlFor={`name-${member.id}`}>
        Adult {member.slot} name
      </label>
      <input
        id={`name-${member.id}`}
        className="input"
        value={value}
        maxLength={30}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => value.trim() && value.trim() !== member.displayName && onSave(value)}
      />
    </div>
  )
}

export function Household() {
  const { household, admin, session, mode } = useRepositories()
  const { state: sessionState } = useSession()
  const { data, loading, reload } = useHousehold()
  const [code, setCode] = useState('')
  const [saved, setSaved] = useState(false)
  const [sampleMessage, setSampleMessage] = useState<string>()
  const remote = mode === 'supabase'

  useEffect(() => {
    if (data?.household) setCode(data.household.code)
  }, [data?.household])

  if (loading || !data) return <EmptyState>Loading.</EmptyState>

  async function chooseMe(id: string) {
    await household.setCurrentMemberId(id)
    reload()
  }

  async function loadSamples() {
    setSampleMessage(undefined)
    if (!remote && !window.confirm('Replace everything with the sample data?')) return
    try {
      await admin.loadSampleData()
      window.location.assign('/')
    } catch (err) {
      setSampleMessage(err instanceof Error ? err.message : 'That did not work.')
    }
  }

  return (
    <Page title="Us">
      {remote ? (
        <section className="stack" aria-labelledby="account-heading">
          <h2 id="account-heading">Your account</h2>
          <p>Signed in{sessionState?.status === 'ready' && sessionState.email ? ` as ${sessionState.email}` : ''}.</p>
          <button type="button" className="btn btn--quiet" onClick={() => void session.signOut()}>
            Sign out
          </button>
        </section>
      ) : (
        <section className="stack" aria-labelledby="who-heading">
          <h2 id="who-heading">Who is this?</h2>
          <div className="thumbs" role="radiogroup" aria-labelledby="who-heading">
            {data.members.map((m) => (
              <label key={m.id} className="thumbs__option">
                <input type="radio" name="who" checked={data.current?.id === m.id} onChange={() => void chooseMe(m.id)} />
                <span>{m.displayName}</span>
              </label>
            ))}
          </div>
          <p className="field__hint">New visits are logged under this name on this phone.</p>
        </section>
      )}

      <section className="form" aria-label="Names">
        {data.members.map((m) => (
          <NameField
            key={m.id}
            member={m}
            onSave={async (name) => {
              await household.renameMember(m.id, name)
              reload()
            }}
          />
        ))}
        {remote && data.members.length < 2 && (
          <p className="field__hint">The second adult can join with the household code below.</p>
        )}
      </section>

      {remote ? (
        <section className="stack" aria-labelledby="code-heading">
          <h2 id="code-heading">Household code</h2>
          <p className="field__static">{data.household?.code}</p>
          <p className="field__hint">Share this with the other adult. They enter it after creating their own account.</p>
        </section>
      ) : (
        <form
          className="form"
          onSubmit={async (e) => {
            e.preventDefault()
            if (!code.trim()) return
            await household.setCode(code)
            setSaved(true)
            reload()
          }}
        >
          <div className="field">
            <label className="field__label" htmlFor="code">
              Household code
            </label>
            <input
              id="code"
              className="input"
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setSaved(false)
              }}
            />
            <p className="field__hint">Both adults use the same code. There are no accounts yet, so it is only saved on this phone.</p>
          </div>
          <button type="submit" className="btn btn--quiet">
            Save code
          </button>
          <p className="field__hint" role="status">
            {saved ? 'Saved.' : ''}
          </p>
        </form>
      )}

      <section className="stack">
        <h2>Sample data</h2>
        <p className="field__hint">
          {remote
            ? 'Adds a few invented places so you can try the app. Only works while your journal is empty.'
            : 'Puts the example places back and removes anything you added.'}
        </p>
        <button type="button" className="btn btn--quiet" onClick={() => void loadSamples()}>
          {remote ? 'Add sample places' : 'Reset sample data'}
        </button>
        <p className="field__hint" role="status">
          {sampleMessage}
        </p>
      </section>
    </Page>
  )
}
