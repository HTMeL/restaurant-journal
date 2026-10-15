/** Browser-side photo prep: shrink to ~1200px on the long edge and re-encode as JPEG. */

export const MAX_EDGE = 1200
export const JPEG_QUALITY = 0.8

export interface ProcessedPhoto {
  blob: Blob
  width: number
  height: number
  /** Object URL for showing a preview before the photo is saved. */
  previewUrl: string
}

export function fitWithin(width: number, height: number, maxEdge = MAX_EDGE) {
  const longest = Math.max(width, height)
  if (longest <= maxEdge) return { width, height }
  const scale = maxEdge / longest
  return { width: Math.round(width * scale), height: Math.round(height * scale) }
}

async function decode(file: File): Promise<{ source: CanvasImageSource; width: number; height: number }> {
  if ('createImageBitmap' in window) {
    // 'from-image' applies the EXIF rotation phones add to camera photos.
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    return { source: bitmap, width: bitmap.width, height: bitmap.height }
  }
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    return { source: img, width: img.naturalWidth, height: img.naturalHeight }
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function processPhoto(file: File): Promise<ProcessedPhoto> {
  const { source, width, height } = await decode(file)
  const size = fitWithin(width, height)
  const canvas = document.createElement('canvas')
  canvas.width = size.width
  canvas.height = size.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not prepare the photo')
  ctx.drawImage(source, 0, 0, size.width, size.height)
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not prepare the photo'))), 'image/jpeg', JPEG_QUALITY),
  )
  return { blob, ...size, previewUrl: URL.createObjectURL(blob) }
}
