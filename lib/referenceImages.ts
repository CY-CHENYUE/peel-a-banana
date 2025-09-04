// 静态参考图片路径配置
type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9'

// 参考图片路径映射
const referenceImagePaths: Record<AspectRatio, string> = {
  '1:1': '/reference-images/reference-1-1.png',
  '3:4': '/reference-images/reference-3-4.png',
  '4:3': '/reference-images/reference-4-3.png',
  '9:16': '/reference-images/reference-9-16.png',
  '16:9': '/reference-images/reference-16-9.png',
}

// 目标尺寸配置
const dimensions: Record<AspectRatio, { width: number; height: number }> = {
  '1:1': { width: 1024, height: 1024 },
  '3:4': { width: 864, height: 1184 },
  '4:3': { width: 1184, height: 864 },
  '9:16': { width: 768, height: 1344 },
  '16:9': { width: 1344, height: 768 },
}

// 缓存已加载的图片数据URL
const cachedDataURLs: Record<AspectRatio, string | null> = {
  '1:1': null,
  '3:4': null,
  '4:3': null,
  '9:16': null,
  '16:9': null,
}

// 将图片路径转换为data URL（用于API调用）
async function loadImageAsDataURL(imagePath: string): Promise<string> {
  const response = await fetch(imagePath)
  const blob = await response.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// 获取指定比例的参考图片路径
export function getReferenceImagePath(ratio: AspectRatio): string {
  return referenceImagePaths[ratio]
}

// 获取指定比例的参考图片Data URL（带缓存）
export async function getReferenceImageDataURL(ratio: AspectRatio): Promise<string> {
  // 如果已缓存，直接返回
  if (cachedDataURLs[ratio]) {
    return cachedDataURLs[ratio]!
  }
  
  // 加载并缓存
  const dataURL = await loadImageAsDataURL(referenceImagePaths[ratio])
  cachedDataURLs[ratio] = dataURL
  console.log(`Loaded and cached reference image for ${ratio}`)
  return dataURL
}

// 获取指定比例的尺寸
export function getTargetDimensions(ratio: AspectRatio): { width: number; height: number } {
  return dimensions[ratio]
}

// 预加载所有参考图片（可选）
export async function preloadAllReferenceImages(): Promise<void> {
  const promises = Object.keys(referenceImagePaths).map(async (ratio) => {
    await getReferenceImageDataURL(ratio as AspectRatio)
  })
  await Promise.all(promises)
  console.log('All reference images preloaded')
}