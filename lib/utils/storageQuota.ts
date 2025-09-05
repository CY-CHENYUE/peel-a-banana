interface QuotaInfo {
  used: number
  available: number
  total: number
  percentUsed: number
}

export async function getStorageQuota(): Promise<QuotaInfo | null> {
  if (typeof window === 'undefined') return null

  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      const used = estimate.usage || 0
      const total = estimate.quota || 0
      const available = total - used
      const percentUsed = total > 0 ? (used / total) * 100 : 0

      return {
        used,
        available,
        total,
        percentUsed
      }
    }
  } catch (error) {
    console.warn('Storage quota API not available:', error)
  }

  return null
}

export function getLocalStorageSize(): number {
  if (typeof window === 'undefined') return 0

  let totalSize = 0
  
  try {
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const value = localStorage.getItem(key) || ''
        totalSize += key.length + value.length
      }
    }
  } catch (error) {
    console.error('Failed to calculate localStorage size:', error)
  }

  return totalSize * 2
}

export function getItemSize(key: string): number {
  if (typeof window === 'undefined') return 0

  try {
    const value = localStorage.getItem(key) || ''
    return (key.length + value.length) * 2
  } catch (error) {
    console.error('Failed to get item size:', error)
    return 0
  }
}

export function isStorageAvailable(requiredBytes: number = 0): boolean {
  if (typeof window === 'undefined') return false

  try {
    const testKey = '__storage_test__'
    const testValue = 'x'.repeat(Math.max(10, requiredBytes / 2))
    
    localStorage.setItem(testKey, testValue)
    localStorage.removeItem(testKey)
    return true
  } catch (error) {
    if (error instanceof DOMException && (
      error.code === 22 ||
      error.code === 1014 ||
      error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
    )) {
      return false
    }
    throw error
  }
}

export function clearOldestItems<T extends { timestamp?: number }>(
  targetKey: string, 
  maxItems: number = 10,
  getTimestamp?: (item: T) => number
): boolean {
  if (typeof window === 'undefined') return false

  try {
    const data = localStorage.getItem(targetKey)
    if (!data) return true

    const items = JSON.parse(data) as T[]
    if (!Array.isArray(items)) return false

    if (items.length <= maxItems) return true

    const sortedItems = [...items].sort((a, b) => {
      const timestampA = getTimestamp ? getTimestamp(a) : a.timestamp || 0
      const timestampB = getTimestamp ? getTimestamp(b) : b.timestamp || 0
      return timestampB - timestampA
    })

    const recentItems = sortedItems.slice(0, maxItems)
    localStorage.setItem(targetKey, JSON.stringify(recentItems))
    
    return true
  } catch (error) {
    console.error('Failed to clear oldest items:', error)
    return false
  }
}

export function trySetItemWithFallback(
  key: string,
  value: string,
  maxRetries: number = 3
): boolean {
  if (typeof window === 'undefined') return false

  for (let i = 0; i < maxRetries; i++) {
    try {
      localStorage.setItem(key, value)
      return true
    } catch (error) {
      if (error instanceof DOMException && (
        error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
      )) {
        console.warn(`Storage quota exceeded, attempt ${i + 1}/${maxRetries}`)
        
        const cleared = clearLargestItems(1)
        if (!cleared) {
          console.error('Unable to free up storage space')
          return false
        }
      } else {
        throw error
      }
    }
  }

  return false
}

function clearLargestItems(count: number = 1): boolean {
  if (typeof window === 'undefined') return false

  try {
    const items: Array<{ key: string, size: number }> = []
    
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        items.push({
          key,
          size: getItemSize(key)
        })
      }
    }

    items.sort((a, b) => b.size - a.size)

    for (let i = 0; i < Math.min(count, items.length); i++) {
      if (!items[i].key.includes('peel-a-banana-images')) {
        localStorage.removeItem(items[i].key)
        console.log(`Removed ${items[i].key} to free up ${items[i].size} bytes`)
      }
    }

    return true
  } catch (error) {
    console.error('Failed to clear largest items:', error)
    return false
  }
}