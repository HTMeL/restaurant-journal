import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CuisineIcon } from '../components/CuisineIcon'
import { Chip } from '../components/FormControls'
import { PlusIcon } from '../components/Icons'
import { EmptyState, Page } from '../components/Page'
import { PlaceCard } from '../components/PlaceCard'
import { cuisineLabel } from '../lib/cuisines'
import { applyFilters, cuisinesPresent, FILTERS, sortSummaries, type FilterId } from '../lib/filters'
import type { Cuisine } from '../types'
import { usePlaceSummaries } from '../state/usePlaceSummaries'

/** Home screen. Places you've been, most recent first, narrowed by quick chips. */
export function FridayView() {
  const { data, loading, error, reload } = usePlaceSummaries()
  const [active, setActive] = useState<FilterId[]>([])
  const [cuisine, setCuisine] = useState<Cuisine>()
  const [cuisineOpen, setCuisineOpen] = useState(false)

  const been = useMemo(() => sortSummaries((data ?? []).filter((s) => s.place.status === 'been')), [data])
  const shown = useMemo(() => applyFilters(been, active, cuisine), [been, active, cuisine])
  const cuisines = useMemo(() => cuisinesPresent(been), [been])

  const toggle = (id: FilterId) =>
    setActive((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))

  return (
    <Page title="Where to tonight">
      {loading ? (
        <EmptyState>Loading.</EmptyState>
      ) : error ? (
        <div>
          <EmptyState>Your places could not be loaded.</EmptyState>
          <button type="button" className="btn btn--quiet" onClick={reload}>
            Try again
          </button>
        </div>
      ) : been.length === 0 ? (
        <EmptyState>No places yet. Log your first one when you are ready.</EmptyState>
      ) : (
        <>
          <div className="chips chips--scroll chips--compact" role="group" aria-label="Filters">
            {cuisines.length > 0 && (
              <button
                type="button"
                className="chip chip--icon"
                aria-pressed={cuisine !== undefined}
                aria-expanded={cuisineOpen}
                aria-controls="cuisine-options"
                onClick={() => setCuisineOpen((o) => !o)}
              >
                {cuisine && <CuisineIcon cuisine={cuisine} />}
                {cuisine ? cuisineLabel(cuisine) : 'Cuisine'}
              </button>
            )}
            {FILTERS.map((f) => (
              <Chip key={f.id} pressed={active.includes(f.id)} onClick={() => toggle(f.id)}>
                {f.label}
              </Chip>
            ))}
          </div>
          {cuisineOpen && (
            <div id="cuisine-options" className="chips chips--scroll chips--compact" role="group" aria-label="Cuisine">
              {cuisines.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="chip chip--icon"
                  aria-pressed={cuisine === c}
                  onClick={() => setCuisine(cuisine === c ? undefined : c)}
                >
                  <CuisineIcon cuisine={c} />
                  {cuisineLabel(c)}
                </button>
              ))}
            </div>
          )}
          {shown.length === 0 ? (
            <div>
              <EmptyState>Nothing matches all of those yet.</EmptyState>
              <button type="button" className="btn btn--quiet" onClick={() => {
                  setActive([])
                  setCuisine(undefined)
                }}>
                Clear filters
              </button>
            </div>
          ) : (
            <ul className="cards" aria-label={`${shown.length} places`}>
              {shown.map((s) => (
                <PlaceCard key={s.place.id} summary={s} />
              ))}
            </ul>
          )}
        </>
      )}
      <Link to="/log" className="btn btn--primary fab">
        <PlusIcon />
        <span>Log a visit</span>
      </Link>
    </Page>
  )
}
