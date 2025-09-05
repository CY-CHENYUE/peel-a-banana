import { StorageService, ImageRecord } from './types'

// IndexedDB 实现 - 个人项目存储方案
export class IndexedDBAdapter implements StorageService {
  private readonly DB_NAME = 'PeelABananaDB'
  private readonly DB_VERSION = 1
  private readonly STORE_NAME = 'images'
  private readonly MAX_IMAGES = 50  // 限制最多保存50张图片
  private db: IDBDatabase | null = null
  private isSupported: boolean = false

  constructor() {
    // 检测浏览器是否支持 IndexedDB
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      this.isSupported = true
    } else {
      console.warn('IndexedDB is not supported in this browser')
    }
  }

  // 初始化数据库
  private async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db
    
    if (!this.isSupported) {
      throw new Error('IndexedDB is not supported')
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION)

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error)
        this.isSupported = false
        reject(new Error('无法打开本地存储，请检查浏览器设置'))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve(request.result)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // 创建对象存储
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const objectStore = db.createObjectStore(this.STORE_NAME, { 
            keyPath: 'id' 
          })
          
          // 创建索引
          objectStore.createIndex('timestamp', 'timestamp', { unique: false })
          objectStore.createIndex('userId', 'userId', { unique: false })
        }
      }
    })
  }

  // 保存图片
  async saveImage(record: ImageRecord): Promise<void> {
    const db = await this.initDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite')
      const store = transaction.objectStore(this.STORE_NAME)
      const request = store.put(record)

      request.onsuccess = () => resolve()
      request.onerror = () => {
        console.error('Failed to save image to IndexedDB:', request.error)
        reject(request.error)
      }
    })
  }

  // 保存所有图片（批量操作）
  async saveAllImages(images: ImageRecord[]): Promise<void> {
    // 限制图片数量
    const limitedImages = images.slice(-this.MAX_IMAGES)
    
    const db = await this.initDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite')
      const store = transaction.objectStore(this.STORE_NAME)
      
      // 先清空现有数据
      store.clear()
      
      // 批量添加新数据
      let successCount = 0
      const totalCount = limitedImages.length
      
      limitedImages.forEach(image => {
        const request = store.add(image)
        
        request.onsuccess = () => {
          successCount++
          if (successCount === totalCount) {
            resolve()
          }
        }
        
        request.onerror = () => {
          console.error('Failed to save image:', request.error)
        }
      })
      
      // 如果没有图片，直接resolve
      if (totalCount === 0) {
        resolve()
      }
      
      transaction.onerror = () => {
        console.error('Transaction failed:', transaction.error)
        reject(transaction.error)
      }
    })
  }

  // 获取所有图片
  async getImages(userId?: string): Promise<ImageRecord[]> {
    try {
      const db = await this.initDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readonly')
      const store = transaction.objectStore(this.STORE_NAME)
      
      let request: IDBRequest
      
      if (userId) {
        const index = store.index('userId')
        request = index.getAll(userId)
      } else {
        request = store.getAll()
      }

      request.onsuccess = () => {
        const images = (request.result as ImageRecord[]) || []
        // 按时间戳排序，最新的在前
        images.sort((a, b) => b.timestamp - a.timestamp)
        resolve(images)
      }
      
      request.onerror = () => {
        console.error('Failed to get images from IndexedDB:', request.error)
        reject(request.error)
      }
    })
    } catch (error) {
      console.error('Failed to get images:', error)
      return []  // 返回空数组作为降级方案
    }
  }

  // 删除指定图片
  async deleteImage(id: string): Promise<void> {
    const db = await this.initDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite')
      const store = transaction.objectStore(this.STORE_NAME)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => {
        console.error('Failed to delete image from IndexedDB:', request.error)
        reject(request.error)
      }
    })
  }

  // 清空所有图片
  async clearAll(): Promise<void> {
    const db = await this.initDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite')
      const store = transaction.objectStore(this.STORE_NAME)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => {
        console.error('Failed to clear IndexedDB:', request.error)
        reject(request.error)
      }
    })
  }
}