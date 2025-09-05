interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png'
}

export async function compressImage(
  dataUrl: string,
  options: CompressionOptions = {}
): Promise<string> {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.7,
    format = 'webp'
  } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      let { width, height } = img

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      canvas.width = width
      canvas.height = height

      ctx.drawImage(img, 0, 0, width, height)

      const mimeType = format === 'webp' ? 'image/webp' : 
                      format === 'jpeg' ? 'image/jpeg' : 'image/png'
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const reader = new FileReader()
            reader.onloadend = () => {
              resolve(reader.result as string)
            }
            reader.onerror = reject
            reader.readAsDataURL(blob)
          } else {
            reject(new Error('Failed to compress image'))
          }
        },
        mimeType,
        quality
      )
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = dataUrl
  })
}

export function estimateBase64Size(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1] || ''
  return base64.length * 0.75
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

export function canUseWebP(): boolean {
  if (typeof window === 'undefined') return false
  
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const ctx = canvas.getContext('2d')
  if (!ctx) return false
  
  ctx.fillStyle = 'red'
  ctx.fillRect(0, 0, 1, 1)
  
  const dataUrl = canvas.toDataURL('image/webp')
  return dataUrl.indexOf('image/webp') === 5
}

export async function compressImageBatch<T extends { url: string }>(
  images: T[],
  options: CompressionOptions = {}
): Promise<T[]> {
  const compressionOptions = {
    ...options,
    format: canUseWebP() ? 'webp' as const : 'jpeg' as const
  }

  const compressedImages = await Promise.all(
    images.map(async (image) => {
      try {
        const compressedUrl = await compressImage(image.url, compressionOptions)
        return { ...image, url: compressedUrl } as T
      } catch (error) {
        console.warn('Failed to compress image, using original:', error)
        return image
      }
    })
  )

  return compressedImages
}