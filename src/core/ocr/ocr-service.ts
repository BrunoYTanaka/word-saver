export interface OcrProgress {
  status: string
  progress: number
}

export interface OcrResult {
  text: string
  confidence: number
}

const MAX_DIMENSION = 1800

/**
 * Downscales large photos before OCR — phone cameras routinely produce
 * 3000px+ images, which cost far more Tesseract time/memory than the
 * accuracy gain is worth for text recognition.
 */
async function downscaleImage(file: File | Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(
    1,
    MAX_DIMENSION / Math.max(bitmap.width, bitmap.height)
  )

  if (scale === 1) {
    bitmap.close()
    return file
  }

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    return file
  }

  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob ?? file), 'image/jpeg', 0.9)
  })
}

/**
 * Runs OCR fully client-side (Tesseract.js/WASM) — this app has no backend,
 * so there is no server-side vision API to call. Loaded via dynamic import
 * so the WASM/model payload never lands in the main bundle.
 */
export async function recognizeImage(
  image: File | Blob,
  onProgress?: (progress: OcrProgress) => void
): Promise<OcrResult> {
  const [{ createWorker }, processedImage] = await Promise.all([
    import('tesseract.js'),
    downscaleImage(image)
  ])

  const worker = await createWorker('eng+por', undefined, {
    logger: (message) =>
      onProgress?.({ status: message.status, progress: message.progress })
  })

  try {
    const { data } = await worker.recognize(processedImage)
    return { text: data.text, confidence: data.confidence }
  } finally {
    await worker.terminate()
  }
}
