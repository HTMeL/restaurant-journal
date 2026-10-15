import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { EmptyState, Page } from '../components/Page'
import { VisitForm, type VisitFormInitial } from '../components/VisitForm'
import { todayISO } from '../lib/dates'
import { logVisit, updateVisit } from '../services/visits'
import { useRepositories } from '../state/DataProvider'
import { useAsync } from '../state/useAsync'
import { useHousehold } from '../state/useHousehold'

/** New visit: /log, or /log?place=<id> when the place is already known. */
export function LogVisit() {
  const repos = useRepositories()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const placeId = params.get('place') ?? undefined
  const hh = useHousehold()
  const places = useAsync(() => repos.places.list())

  if (hh.loading || places.loading || !hh.data?.current || !places.data) return <EmptyState>Loading.</EmptyState>
  const locked = placeId ? places.data.find((p) => p.id === placeId) : undefined

  const initial: VisitFormInitial = {
    placeName: locked?.name ?? '',
    date: todayISO(),
    ratings: {},
    note: '',
    kidAges: [],
    votes: {},
    photoIds: [],
  }

  return (
    <Page title={locked ? 'Log a visit' : 'Log a place'}>
      <VisitForm
        initial={initial}
        lockedPlace={locked}
        places={places.data}
        members={hh.data.members}
        loggedBy={hh.data.current}
        submitLabel="Save"
        onSubmit={async (v) => {
          const { place } = await logVisit(repos, {
            placeId: locked?.id,
            placeName: v.placeName,
            cuisine: v.cuisine,
            fields: v.fields,
            photos: v.newPhotos,
          })
          navigate(`/place/${place.id}`, { replace: true })
        }}
      />
    </Page>
  )
}

/** Add or change details on a visit that is already saved. */
export function EditVisit() {
  const repos = useRepositories()
  const navigate = useNavigate()
  const { visitId = '' } = useParams()
  const hh = useHousehold()
  const data = useAsync(async () => {
    const visit = await repos.visits.get(visitId)
    const place = visit && (await repos.places.get(visit.placeId))
    return { visit, place }
  }, [visitId])

  if (hh.loading || data.loading || !hh.data?.current) return <EmptyState>Loading.</EmptyState>
  const { visit, place } = data.data ?? {}
  if (!visit || !place) return <EmptyState>That visit couldn't be found.</EmptyState>

  const initial: VisitFormInitial = {
    placeName: place.name,
    thumb: visit.thumb,
    date: visit.date,
    ratings: visit.ratings,
    note: visit.note ?? '',
    kidAges: visit.kidAges,
    votes: visit.votes,
    photoIds: visit.photoIds,
  }

  return (
    <Page title="Visit details">
      <VisitForm
        initial={initial}
        lockedPlace={place}
        places={[]}
        members={hh.data.members}
        loggedBy={hh.data.members.find((m) => m.id === visit.loggedBy) ?? hh.data.current}
        startOpen
        editing
        submitLabel="Save changes"
        onSubmit={async (v) => {
          await updateVisit(repos, visit.id, {
            fields: v.fields,
            keepPhotoIds: v.keepPhotoIds,
            removePhotoIds: v.removePhotoIds,
            newPhotos: v.newPhotos,
          })
          navigate(`/place/${place.id}`, { replace: true })
        }}
      />
    </Page>
  )
}
