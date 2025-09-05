import { StorageService, ImageRecord } from './types'

// LocalStorage 实现 - 将来可以替换成数据库实现
export class LocalStorageAdapter implements StorageService {
  private readonly STORAGE_KEY = 'peel-a-banana-images'
  private readonly MAX_IMAGES = 50  // 最多保存50张图片
  
  // 保存图片记录
  async saveImage(record: ImageRecord): Promise<void> {
    try {
      const images = await this.getImages()
      
      // 添加新图片
      images.push(record)
      
      // 只保留最新的50张
      const recentImages = images.slice(-this.MAX_IMAGES)
      
      // 保存到 localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(recentImages))
      }
    } catch (error) {
      console.error('Failed to save image to localStorage:', error)
      throw error
    }
  }
  
  // 获取所有图片
  async getImages(userId?: string): Promise<ImageRecord[]> {
    try {
      if (typeof window === 'undefined') {
        return []
      }
      
      const data = localStorage.getItem(this.STORAGE_KEY)
      if (!data) {
        return []
      }
      
      const images: ImageRecord[] = JSON.parse(data)
      
      // 如果提供了 userId，则筛选该用户的图片（为将来准备）
      if (userId) {
        return images.filter(img => img.userId === userId)
      }
      
      return images
    } catch (error) {
      console.error('Failed to get images from localStorage:', error)
      return []
    }
  }
  
  // 删除指定图片
  async deleteImage(id: string): Promise<void> {
    try {
      const images = await this.getImages()
      const filteredImages = images.filter(img => img.id !== id)
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredImages))
      }
    } catch (error) {
      console.error('Failed to delete image from localStorage:', error)
      throw error
    }
  }
  
  // 清空所有图片
  async clearAll(): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(this.STORAGE_KEY)
      }
    } catch (error) {
      console.error('Failed to clear localStorage:', error)
      throw error
    }
  }
}