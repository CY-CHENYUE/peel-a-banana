'use client'

import { useState } from 'react'
import { Download, X, ChevronLeft, ChevronRight, Expand } from 'lucide-react'
import { cn } from '@/lib/utils'
import useAppStore from '@/stores/useAppStore'

interface GeneratedImage {
  id: string
  url: string
  prompt: string
  timestamp: number
}

export default function GeneratedGallery() {
  const { generatedHistory = [], removeFromHistory } = useAppStore()
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null)
  
  // 如果没有历史记录，显示占位符
  if (generatedHistory.length === 0) {
    return (
      <div className="w-[1000px] mx-auto h-40 bg-gradient-to-b from-white to-yellow-50/30 rounded-2xl shadow-2xl border border-yellow-100/50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">🎨</div>
          <p className="text-sm text-neutral-500">生成的图片将在这里显示</p>
        </div>
      </div>
    )
  }

  const handleDownload = (image: GeneratedImage, e: React.MouseEvent) => {
    e.stopPropagation()
    const link = document.createElement('a')
    link.href = image.url
    link.download = `peel-a-banana-${image.timestamp}.png`
    link.click()
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    removeFromHistory?.(id)
  }

  return (
    <>
      <div className="w-[1000px] mx-auto bg-gradient-to-b from-white to-yellow-50/30 rounded-2xl shadow-2xl border border-yellow-100/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-neutral-700">生成历史</h3>
          <span className="text-xs text-neutral-500">{generatedHistory.length} 张图片</span>
        </div>
        
        {/* 横向滚动容器 */}
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-yellow-300 scrollbar-track-yellow-100">
            {generatedHistory.map((image) => (
              <div
                key={image.id}
                className="flex-shrink-0 relative group cursor-pointer"
                onClick={() => setSelectedImage(image)}
              >
                {/* 图片缩略图 */}
                <div className="w-36 h-36 rounded-xl overflow-hidden bg-gradient-to-br from-white to-neutral-50 border-2 border-yellow-200/50 hover:border-yellow-400 transition-all hover:shadow-2xl hover:-translate-y-1 shadow-lg">
                  <img
                    src={image.url}
                    alt={`Generated ${image.id}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* 悬浮操作按钮 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/30 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-xl flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => handleDownload(image, e)}
                    className="p-2 bg-white rounded-full shadow-xl hover:scale-125 transition-all duration-200 hover:shadow-2xl"
                    title="下载"
                  >
                    <Download className="w-4 h-4 text-neutral-700" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedImage(image)
                    }}
                    className="p-2 bg-white rounded-full shadow-xl hover:scale-125 transition-all duration-200 hover:shadow-2xl"
                    title="查看大图"
                  >
                    <Expand className="w-4 h-4 text-neutral-700" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(image.id, e)}
                    className="p-2 bg-red-500 rounded-full shadow-xl hover:scale-125 transition-all duration-200 hover:shadow-2xl"
                    title="删除"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
                
                {/* 时间标签 */}
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-gradient-to-r from-yellow-400/90 to-orange-400/90 backdrop-blur-sm rounded-lg text-xs text-white font-medium opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg">
                  {new Date(image.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 大图查看器 */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[9998] bg-black/80 flex items-center justify-center p-8"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage.url}
              alt="Generated"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            
            {/* 关闭按钮 */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
            >
              <X className="w-6 h-6 text-neutral-700" />
            </button>
            
            {/* 下载按钮 */}
            <button
              onClick={(e) => handleDownload(selectedImage, e)}
              className="absolute bottom-4 right-4 p-3 bg-yellow-400 rounded-full shadow-lg hover:scale-110 transition-transform"
            >
              <Download className="w-6 h-6 text-white" />
            </button>
            
            {/* 提示词显示 */}
            {selectedImage.prompt && (
              <div className="absolute bottom-4 left-4 right-20 p-3 bg-white/90 backdrop-blur-sm rounded-lg">
                <p className="text-sm text-neutral-700 line-clamp-2">{selectedImage.prompt}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}