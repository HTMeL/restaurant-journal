import { Link } from 'react-router-dom'
import { cuisineLabel } from '../lib/cuisines'
import { formatVisitDate } from '../lib/dates'
import type { PlaceSummary } from '../types'
import { CuisineIcon } from './CuisineIcon'
import { PhotoImage } from './PhotoImage'
import { SignalBadge } from './SignalBadge'

/** The surface of a card: photo, name, go-back signal, last visit. Nothing more. */
export function PlaceCard({ summary }: { summary: PlaceSummary }) {
  const { place, signal, lastVisit, coverPhotoId } = summary
  return (
    <li>
      <Link to={`/place/${place.id}`} className="card">
        <PhotoImage photoId={coverPhotoId} className="card__photo" />
        <span className="card__body">
          <span className="card__name">{place.name}</span>
          {signal && <SignalBadge signal={signal} />}
          <span className="card__meta cuisine">
            {place.cuisine && (
              <span className="cuisine cuisine--nowrap">
                <CuisineIcon cuisine={place.cuisine} />
                {cuisineLabel(place.cuisine)}
              </span>
            )}
            {lastVisit && <span>Last visit {formatVisitDate(lastVisit.date)}</span>}
          </span>
        </span>
      </Link>
    </li>
  )
}
