import { useEffect, useState } from 'react'
import { useRepositories } from '../state/DataProvider'
import { PlateIcon } from './Icons'

/** Shows a stored photo, or a quiet neutral placeholder when there isn't one. */
export function PhotoImage({ photoId, alt = '', className = '' }: { photoId?: string; alt?: string; className?: string }) {
  const { photos } = useRepositories()
  const [url, setUrl] = useState<string>()

  useEffect(() => {
    let cancelled = false
    setUrl(undefined)
    if (photoId) {
      photos.getUrl(photoId).then((u) => {
        if (!cancelled) setUrl(u)
      })
    }
    return () => {
      cancelled = true
    }
  }, [photoId, photos])

  if (!url) {
    return (
      <div className={`photo photo--empty ${className}`} aria-hidden="true">
        <PlateIcon />
      </div>
    )
  }
  return <img className={`photo ${className}`} src={url} alt={alt} loading="lazy" />
}
