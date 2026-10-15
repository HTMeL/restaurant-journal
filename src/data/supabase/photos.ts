import type { Photo } from '../../types'
import type { PhotoRepository } from '../repositories'
import { householdId, supabase, unwrap } from './client'

const BUCKET = 'photos'
const URL_LIFETIME_S = 3600

// Signed URLs are cached (for a bit less than their lifetime) so a list of cards
// doesn't ask Supabase for the same URL on every render.
const urlCache = new Map<string, { url: Promise<string | undefined>; expires: number }>()

export const photos: PhotoRepository = {
  async add(input) {
    const hid = await householdId()
    const id = crypto.randomUUID()
    const path = `${hid}/${id}.jpg`

    unwrap(await supabase().storage.from(BUCKET).upload(path, input.blob, { contentType: 'image/jpeg' }))
    try {
      unwrap(
        await supabase().from('photos').insert({
          id,
          household_id: hid,
          visit_id: input.visitId,
          storage_path: path,
          width: input.width,
          height: input.height,
        }),
      )
    } catch (err) {
      await supabase().storage.from(BUCKET).remove([path]) // don't leave an orphaned file
      throw err
    }
    const photo: Photo = {
      id,
      visitId: input.visitId,
      blob: input.blob,
      storagePath: path,
      width: input.width,
      height: input.height,
      createdAt: new Date().toISOString(),
    }
    return photo
  },

  getUrl(id) {
    const hit = urlCache.get(id)
    if (hit && hit.expires > Date.now()) return hit.url
    const url = (async () => {
      const { data: row } = await supabase().from('photos').select('storage_path').eq('id', id).maybeSingle()
      if (!row) return undefined
      const { data, error } = await supabase().storage.from(BUCKET).createSignedUrl(row.storage_path, URL_LIFETIME_S)
      return error ? undefined : data.signedUrl
    })()
    urlCache.set(id, { url, expires: Date.now() + (URL_LIFETIME_S - 600) * 1000 })
    void url.then((u) => {
      if (!u) urlCache.delete(id)
    })
    return url
  },

  async remove(id) {
    const row = unwrap(await supabase().from('photos').select('storage_path').eq('id', id).maybeSingle())
    unwrap(await supabase().from('photos').delete().eq('id', id))
    if (row) await supabase().storage.from(BUCKET).remove([row.storage_path])
    urlCache.delete(id)
  },
}
