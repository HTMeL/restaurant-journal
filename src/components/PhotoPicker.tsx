import { useRef, useState } from 'react'
import { processPhoto, type ProcessedPhoto } from '../lib/image'
import { PhotoImage } from './PhotoImage'

interface Props {
  existingPhotoIds: string[]
  newPhotos: ProcessedPhoto[]
  onAdd: (photos: ProcessedPhoto[]) => void
  onRemoveExisting: (id: string) => void
  onRemoveNew: (index: number) => void
}

export function PhotoPicker({ existingPhotoIds, newPhotos, onAdd, onRemoveExisting, onRemoveNew }: Props) {
  const cameraRef = useRef<HTMLInputElement>(null)
  const libraryRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return
    setBusy(true)
    setError(undefined)
    try {
      const processed = await Promise.all(Array.from(files).map(processPhoto))
      onAdd(processed)
    } catch {
      setError("That photo couldn't be added. Try another.")
    } finally {
      setBusy(false)
    }
  }

  const input = (ref: typeof cameraRef, capture: boolean) => (
    <input
      ref={ref}
      type="file"
      accept="image/*"
      multiple={!capture}
      {...(capture ? { capture: 'environment' as const } : {})}
      hidden
      onChange={(e) => {
        void handleFiles(e.target.files)
        e.target.value = ''
      }}
    />
  )

  const total = existingPhotoIds.length + newPhotos.length

  return (
    <div className="field">
      <span className="field__label" id="photos-label">
        Photos
      </span>
      <p className="field__hint">Food and the space work best. Skip close-ups of the kids.</p>
      <div className="row" role="group" aria-labelledby="photos-label">
        <button type="button" className="btn btn--quiet" onClick={() => cameraRef.current?.click()} disabled={busy}>
          Take a photo
        </button>
        <button type="button" className="btn btn--quiet" onClick={() => libraryRef.current?.click()} disabled={busy}>
          Choose from library
        </button>
        {input(cameraRef, true)}
        {input(libraryRef, false)}
      </div>
      <p className="field__hint" role="status">
        {busy ? 'Preparing photo.' : error}
      </p>
      {total > 0 && (
        <ul className="thumbs-grid">
          {existingPhotoIds.map((id) => (
            <li key={id}>
              <PhotoImage photoId={id} alt="Saved photo" />
              <button type="button" className="thumbs-grid__remove" aria-label="Remove photo" onClick={() => onRemoveExisting(id)}>
                ×
              </button>
            </li>
          ))}
          {newPhotos.map((p, i) => (
            <li key={p.previewUrl}>
              <img className="photo" src={p.previewUrl} alt="New photo" />
              <button type="button" className="thumbs-grid__remove" aria-label="Remove photo" onClick={() => onRemoveNew(i)}>
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
