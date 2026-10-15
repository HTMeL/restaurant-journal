import { Link, useParams } from 'react-router-dom'
import { CuisineIcon } from '../components/CuisineIcon'
import { CuisinePicker } from '../components/FormControls'
import { PhotoImage } from '../components/PhotoImage'
import { EmptyState, Page } from '../components/Page'
import { SignalBadge } from '../components/SignalBadge'
import { cuisineLabel } from '../lib/cuisines'
import { formatVisitDate } from '../lib/dates'
import { AGE_TAGS, RATING_DEFS, ratingLabel } from '../lib/ratings'
import { summarize } from '../lib/filters'
import { useRepositories } from '../state/DataProvider'
import { useAsync } from '../state/useAsync'
import { useHousehold } from '../state/useHousehold'
import type { Member, Visit } from '../types'

function VisitEntry({ visit, members }: { visit: Visit; members: Member[] }) {
  const name = (id: string) => members.find((m) => m.id === id)?.displayName ?? 'Someone'
  const ratingLabels = RATING_DEFS.flatMap((d) => {
    const r = visit.ratings[d.key]
    return r ? [`${d.label}: ${ratingLabel(d.key, r)}`] : []
  })
  const ages = visit.kidAges.map((a) => AGE_TAGS.find((t) => t.value === a)?.label).filter(Boolean)
  const votes = members.flatMap((m) => {
    const v = visit.votes[m.id]
    return v ? [`${m.displayName}: ${v === 'yes' ? 'would go back' : 'would not go back'}`] : []
  })

  return (
    <li className="visit">
      <div className="visit__head">
        <strong>{formatVisitDate(visit.date)}</strong>
        <span className="visit__thumb">{visit.thumb === 'up' ? 'Worked for us' : 'Not for us'}</span>
      </div>
      <p className="card__meta">Logged by {name(visit.loggedBy)}</p>
      {visit.note && <p>{visit.note}</p>}
      {ratingLabels.length > 0 && (
        <ul className="tags">
          {ratingLabels.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      )}
      {ages.length > 0 && <p className="card__meta">Kids then: {ages.join(', ')}</p>}
      {votes.length > 0 && <p className="card__meta">{votes.join('. ')}.</p>}
      {visit.photoIds.length > 0 && (
        <ul className="thumbs-grid">
          {visit.photoIds.map((id) => (
            <li key={id}>
              <PhotoImage photoId={id} alt="Photo from this visit" />
            </li>
          ))}
        </ul>
      )}
      <Link to={`/visit/${visit.id}`} className="link">
        Add or edit details
      </Link>
    </li>
  )
}

export function PlaceDetail() {
  const { placeId = '' } = useParams()
  const repos = useRepositories()
  const hh = useHousehold()
  const { data, loading, reload } = useAsync(async () => {
    const place = await repos.places.get(placeId)
    if (!place) return undefined
    return summarize([place], await repos.visits.listByPlace(placeId))[0]
  }, [placeId])

  if (loading || hh.loading) return <EmptyState>Loading.</EmptyState>
  if (!data) return <EmptyState>That place couldn't be found.</EmptyState>
  const { place, visits, signal } = data

  return (
    <Page title={place.name}>
      <Link to="/" className="link">
        Back to places
      </Link>
      {signal && <SignalBadge signal={signal} />}
      <details className="details">
        <summary className="cuisine">
          {place.cuisine ? (
            <>
              <CuisineIcon cuisine={place.cuisine} />
              {cuisineLabel(place.cuisine)}
            </>
          ) : (
            'Add cuisine'
          )}
        </summary>
        <div className="details__body">
          <CuisinePicker
            value={place.cuisine}
            onChange={async (c) => {
              await repos.places.update(place.id, { cuisine: c })
              reload()
            }}
          />
        </div>
      </details>
      {place.status === 'want' && (
        <p>
          On your Want to try list.
          {place.foundNote ? ` Found: ${place.foundNote}.` : ''}
        </p>
      )}
      <Link to={`/log?place=${place.id}`} className="btn btn--primary">
        {place.status === 'want' ? 'We went. Log a visit' : 'Log another visit'}
      </Link>
      {visits.length > 0 && (
        <section className="stack" aria-label="Visits">
          <h2>Visits</h2>
          <ul className="visits">
            {visits.map((v) => (
              <VisitEntry key={v.id} visit={v} members={hh.data?.members ?? []} />
            ))}
          </ul>
        </section>
      )}
    </Page>
  )
}
