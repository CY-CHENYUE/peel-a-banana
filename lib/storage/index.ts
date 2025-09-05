import { StorageService, ImageRecord } from './types'
import { LocalStorageAdapter } from './localStorageAdapter'

// 存储管理器 - 单例模式
class StorageManager implements StorageService {
  private static instance: StorageManager
  private storage: StorageService
  
  private constructor() {
    // 现在使用 LocalStorage
    this.storage = new LocalStorageAdapter()
    
    // 将来切换到数据库，只需要改这一行：
    // this.storage = new DatabaseAdapter()
  }
  
  // 获取单例实例
  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager()
    }
    return StorageManager.instance
  }
  
  // 代理所有存储方法
  async saveImage(record: ImageRecord): Promise<void> {
    return this.storage.saveImage(record)
  }
  
  async getImages(userId?: string): Promise<ImageRecord[]> {
    return this.storage.getImages(userId)
  }
  
  async deleteImage(id: string): Promise<void> {
    return this.storage.deleteImage(id)
  }
  
  async clearAll(): Promise<void> {
    return this.storage.clearAll()
  }
  
  // 便捷方法：创建图片记录
  createImageRecord(url: string, prompt: string, userId?: string): ImageRecord {
    return {
      id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
      url,
      prompt,
      timestamp: Date.now(),
      userId,
      metadata: {
        // 可以添加更多元数据
      }
    }
  }
}

// 导出单例实例
export const storage = StorageManager.getInstance()

// 导出类型
export type { ImageRecord } from './types'