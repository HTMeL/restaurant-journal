import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { CuisineIcon } from '../components/CuisineIcon'
import { CuisinePicker } from '../components/FormControls'
import { EmptyState, Page } from '../components/Page'
import { cuisineLabel, orderedCuisines } from '../lib/cuisines'
import type { Cuisine } from '../types'
import { useRepositories } from '../state/DataProvider'
import { useAsync } from '../state/useAsync'

export function WantToTry() {
  const { places } = useRepositories()
  const { data, loading, error: loadError, reload } = useAsync(async () =>
    (await places.list()).filter((p) => p.status === 'want').sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  )
  const [name, setName] = useState('')
  const [found, setFound] = useState('')
  const [cuisine, setCuisine] = useState<Cuisine>()
  const [filter, setFilter] = useState<Cuisine>()
  const [error, setError] = useState<string>()

  const present = useMemo(() => orderedCuisines((data ?? []).map((p) => p.cuisine)), [data])
  // Ignore a chosen cuisine once its last place leaves the list.
  const activeFilter = filter && present.includes(filter) ? filter : undefined
  const shown = (data ?? []).filter((p) => !activeFilter || p.cuisine === activeFilter)

  async function add(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return setError('Add the place name.')
    const existing = (await places.list()).find((p) => p.name.trim().toLowerCase() === trimmed.toLowerCase())
    if (existing) return setError(`${existing.name} is already in your journal.`)
    await places.add({ name: trimmed, status: 'want', cuisine, foundNote: found.trim() || undefined })
    setName('')
    setFound('')
    setCuisine(undefined)
    setError(undefined)
    reload()
  }

  async function remove(id: string, placeName: string) {
    if (!window.confirm(`Remove ${placeName} from your list?`)) return
    await places.remove(id)
    reload()
  }

  return (
    <Page title="Want to try">
      <form className="form" onSubmit={add} noValidate>
        <div className="field">
          <label className="field__label" htmlFor="want-name">
            Place name
          </label>
          <input id="want-name" className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="want-found">
            Where did you find it? (optional)
          </label>
          <input id="want-found" className="input" value={found} onChange={(e) => setFound(e.target.value)} />
        </div>
        <fieldset className="field">
          <legend className="field__label">Cuisine (optional)</legend>
          <CuisinePicker value={cuisine} onChange={setCuisine} />
        </fieldset>
        <p className="field__hint" role="alert">
          {error}
        </p>
        <button type="submit" className="btn btn--primary">
          Save to list
        </button>
      </form>

      {loading ? (
        <EmptyState>Loading.</EmptyState>
      ) : loadError ? (
        <EmptyState>Your list could not be loaded. Refresh to try again.</EmptyState>
      ) : data && data.length > 0 ? (
        <>
          {present.length > 1 && (
            <CuisinePicker value={activeFilter} onChange={setFilter} options={present} label="Filter by cuisine" compact />
          )}
          <ul className="list">
            {shown.map((p) => (
              <li key={p.id} className="list__item">
                <div>
                  <p className="card__name">{p.name}</p>
                  {p.cuisine && (
                    <p className="card__meta cuisine">
                      <CuisineIcon cuisine={p.cuisine} size={16} />
                      {cuisineLabel(p.cuisine)}
                    </p>
                  )}
                  {p.foundNote && <p className="card__meta">{p.foundNote}</p>}
                </div>
                <div className="row">
                  <Link to={`/log?place=${p.id}`} className="btn btn--quiet">
                    We went
                  </Link>
                  <button type="button" className="btn btn--text" onClick={() => void remove(p.id, p.name)}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <EmptyState>Nothing saved yet. Add a place you would like to try.</EmptyState>
      )}
    </Page>
  )
}
