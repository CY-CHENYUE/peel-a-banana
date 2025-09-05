// 图片记录的数据结构
export interface ImageRecord {
  id: string
  url: string
  prompt: string
  timestamp: number
  userId?: string      // 预留：用户ID
  metadata?: {         // 预留：其他元数据
    width?: number
    height?: number
    aspectRatio?: string
    model?: string
  }
}

// 存储服务接口 - 所有存储实现都必须遵循这个接口
export interface StorageService {
  // 保存一张图片
  saveImage(record: ImageRecord): Promise<void>
  
  // 获取所有图片（可选按用户ID筛选）
  getImages(userId?: string): Promise<ImageRecord[]>
  
  // 删除指定ID的图片
  deleteImage(id: string): Promise<void>
  
  // 清空所有图片
  clearAll(): Promise<void>
}