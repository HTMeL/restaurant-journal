import { useState, type FormEvent } from 'react'
import { AGE_TAGS, RATING_DEFS } from '../lib/ratings'
import type { ProcessedPhoto } from '../lib/image'
import { todayISO } from '../lib/dates'
import type { VisitFields } from '../services/visits'
import type { AgeTag, Cuisine, Id, Member, Place, Rating, RatingKey, Thumb, Vote } from '../types'
import { Chip, CuisinePicker, ThumbToggle, TapRating } from './FormControls'
import { PhotoPicker } from './PhotoPicker'

export interface VisitFormInitial {
  placeName: string
  thumb?: Thumb
  date: string
  ratings: Partial<Record<RatingKey, Rating>>
  note: string
  kidAges: AgeTag[]
  votes: Record<Id, Vote>
  photoIds: Id[]
}

export interface VisitFormSubmit {
  placeName: string
  cuisine?: Cuisine
  fields: VisitFields
  keepPhotoIds: Id[]
  removePhotoIds: Id[]
  newPhotos: ProcessedPhoto[]
}

interface Props {
  initial: VisitFormInitial
  /** When set, the place is fixed (logging for a known place, or editing a visit). */
  lockedPlace?: Place
  places: Place[]
  members: Member[]
  /** Who is holding the phone. Recorded as the author of a new visit. */
  loggedBy: Member
  startOpen?: boolean
  editing?: boolean
  submitLabel: string
  onSubmit: (v: VisitFormSubmit) => Promise<void>
}

export function VisitForm({ initial, lockedPlace, places, members, loggedBy, startOpen, editing, submitLabel, onSubmit }: Props) {
  const [placeName, setPlaceName] = useState(initial.placeName)
  const [thumb, setThumb] = useState(initial.thumb)
  const [date, setDate] = useState(initial.date)
  const [ratings, setRatings] = useState(initial.ratings)
  const [cuisine, setCuisine] = useState<Cuisine>()
  const [note, setNote] = useState(initial.note)
  const [kidAges, setKidAges] = useState(initial.kidAges)
  const [votes, setVotes] = useState(initial.votes)
  const [keepIds, setKeepIds] = useState(initial.photoIds)
  const [removeIds, setRemoveIds] = useState<Id[]>([])
  const [newPhotos, setNewPhotos] = useState<ProcessedPhoto[]>([])
  const [error, setError] = useState<string>()
  const [saving, setSaving] = useState(false)

  const today = todayISO()
  const known = places.find((p) => p.name.trim().toLowerCase() === placeName.trim().toLowerCase())

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!placeName.trim()) return setError('Add the place name.')
    if (!thumb) return setError('Choose thumbs up or thumbs down.')
    setError(undefined)
    setSaving(true)
    try {
      await onSubmit({
        placeName,
        cuisine,
        fields: { date: date || today, loggedBy: loggedBy.id, thumb, ratings, note, kidAges, votes },
        keepPhotoIds: keepIds,
        removePhotoIds: removeIds,
        newPhotos,
      })
    } catch {
      setError("That didn't save. Please try again.")
      setSaving(false)
    }
  }

  const setRating = (key: RatingKey, r: Rating | undefined) =>
    setRatings((cur) => {
      const next = { ...cur }
      if (r) next[key] = r
      else delete next[key]
      return next
    })

  const setVote = (id: Id, v: Vote) =>
    setVotes((cur) => {
      const next = { ...cur }
      if (next[id] === v) delete next[id]
      else next[id] = v
      return next
    })

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {lockedPlace ? (
        <div className="field">
          <span className="field__label">Place</span>
          <p className="field__static">{lockedPlace.name}</p>
        </div>
      ) : (
        <div className="field">
          <label className="field__label" htmlFor="place-name">
            Place name
          </label>
          <input
            id="place-name"
            className="input"
            list="known-places"
            value={placeName}
            onChange={(e) => setPlaceName(e.target.value)}
            autoComplete="off"
            autoFocus
          />
          <datalist id="known-places">
            {places.map((p) => (
              <option key={p.id} value={p.name} />
            ))}
          </datalist>
          {known && (
            <p className="field__hint">
              {known.status === 'want' ? 'On your Want to try list. This will move it to Been.' : 'Already in your journal. This adds a new visit.'}
            </p>
          )}
        </div>
      )}

      <ThumbToggle value={thumb} onChange={setThumb} />

      <div className="field">
        <label className="field__label" htmlFor="visit-date">
          Date
        </label>
        <input id="visit-date" className="input" type="date" value={date} max={today} onChange={(e) => setDate(e.target.value)} />
      </div>

      <details className="details" open={startOpen}>
        <summary>Add details (optional)</summary>
        <div className="details__body">
          {!lockedPlace && !known?.cuisine && (
            <fieldset className="field">
              <legend className="field__label">Cuisine</legend>
              <CuisinePicker value={cuisine} onChange={setCuisine} />
            </fieldset>
          )}
          {RATING_DEFS.map((def) => (
            <TapRating key={def.key} def={def} value={ratings[def.key]} onChange={(r) => setRating(def.key, r)} />
          ))}

          <fieldset className="field">
            <legend className="field__label">Kids' ages at the time</legend>
            <div className="chips">
              {AGE_TAGS.map((t) => (
                <Chip
                  key={t.value}
                  pressed={kidAges.includes(t.value)}
                  onClick={() => setKidAges((cur) => (cur.includes(t.value) ? cur.filter((a) => a !== t.value) : [...cur, t.value]))}
                >
                  {t.label}
                </Chip>
              ))}
            </div>
          </fieldset>

          <fieldset className="field">
            <legend className="field__label">Would you go back?</legend>
            {members.map((m) => (
              <div key={m.id} className="vote">
                <span>{m.displayName}</span>
                <div className="segmented segmented--compact">
                  {(['yes', 'no'] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      className="segmented__btn"
                      aria-pressed={votes[m.id] === v}
                      aria-label={`${m.displayName}: ${v === 'yes' ? 'would go back' : 'would not go back'}`}
                      onClick={() => setVote(m.id, v)}
                    >
                      {v === 'yes' ? 'Yes' : 'No'}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </fieldset>

          <div className="field">
            <label className="field__label" htmlFor="visit-note">
              One-line note
            </label>
            <input id="visit-note" className="input" maxLength={140} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          <PhotoPicker
            existingPhotoIds={keepIds}
            newPhotos={newPhotos}
            onAdd={(p) => setNewPhotos((cur) => [...cur, ...p])}
            onRemoveExisting={(id) => {
              setKeepIds((cur) => cur.filter((x) => x !== id))
              setRemoveIds((cur) => [...cur, id])
            }}
            onRemoveNew={(i) => setNewPhotos((cur) => cur.filter((_, idx) => idx !== i))}
          />
        </div>
      </details>

      <div className="action-bar">
        <p className="action-bar__status" role="alert">
          {error}
        </p>
        <p className="field__hint">{editing ? "Logged by" : "Logging as"} {loggedBy.displayName}</p>
        <button type="submit" className="btn btn--primary btn--block" disabled={saving}>
          {saving ? 'Saving' : submitLabel}
        </button>
      </div>
    </form>
  )
}
