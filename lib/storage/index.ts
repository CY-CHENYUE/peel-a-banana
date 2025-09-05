import { StorageService, ImageRecord } from './types'
import { IndexedDBAdapter } from './indexedDBAdapter'

// 存储管理器 - 单例模式（个人项目版本）
class StorageManager implements StorageService {
  private static instance: StorageManager
  private storage: StorageService
  
  private constructor() {
    // 只使用 IndexedDB
    this.storage = new IndexedDBAdapter()
  }
  
  // 获取单例实例
  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager()
    }
    return StorageManager.instance
  }
  
  // 保存单个图片
  async saveImage(record: ImageRecord): Promise<void> {
    return this.storage.saveImage(record)
  }
  
  // 保存所有图片（推荐使用）
  async saveAllImages(images: ImageRecord[]): Promise<void> {
    // 限制最多保存50张图片
    const MAX_IMAGES = 50
    const limitedImages = images.slice(-MAX_IMAGES)
    
    // @ts-expect-error - saveAllImages is a new method not in the original interface
    if (this.storage.saveAllImages) {
      // @ts-expect-error - saveAllImages is a new method not in the original interface
      return this.storage.saveAllImages(limitedImages)
    }
    
    // 兼容旧版本：清空后重新保存所有
    await this.storage.clearAll()
    for (const image of limitedImages) {
      await this.storage.saveImage(image)
    }
  }
  
  // 获取所有图片
  async getImages(userId?: string): Promise<ImageRecord[]> {
    try {
      return await this.storage.getImages(userId)
    } catch (error) {
      console.error('Failed to get images:', error)
      // 如果 IndexedDB 不可用，返回空数组
      return []
    }
  }
  
  // 删除指定图片
  async deleteImage(id: string): Promise<void> {
    return this.storage.deleteImage(id)
  }
  
  // 清空所有图片
  async clearAll(): Promise<void> {
    return this.storage.clearAll()
  }
}

// 导出单例
export const storage = StorageManager.getInstance()