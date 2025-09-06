'use client'

import { useState, useEffect } from 'react'
import { Download, X, ChevronLeft, ChevronRight, Expand, Plus, Check } from 'lucide-react'
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
  const [canvasImages, setCanvasImages] = useState<Set<string>>(new Set())
  
  // 定期检查画布上的图片状态
  useEffect(() => {
    const checkCanvasImages = () => {
      const win = window as unknown as { canvasHasImage?: (imageId: string) => boolean }
      if (win.canvasHasImage) {
        const newCanvasImages = new Set<string>()
        generatedHistory.forEach(image => {
          if (win.canvasHasImage!(image.id)) {
            newCanvasImages.add(image.id)
          }
        })
        setCanvasImages(newCanvasImages)
      }
    }
    
    // 初始检查
    checkCanvasImages()
    
    // 设置定时器定期检查
    const interval = setInterval(checkCanvasImages, 500)
    
    return () => clearInterval(interval)
  }, [generatedHistory])
  
  // 如果没有历史记录，显示占位符
  if (generatedHistory.length === 0) {
    return (
      <div className="w-full h-24 bg-gradient-to-b from-white to-yellow-50/30 rounded-xl shadow-xl border border-yellow-100/50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-1">🎨</div>
          <p className="text-xs text-neutral-500">生成的图片将在这里显示</p>
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

  const handleAddToCanvas = (image: GeneratedImage, e: React.MouseEvent) => {
    e.stopPropagation()
    // 只有不在画布上的图片才能添加
    if (!canvasImages.has(image.id)) {
      const win = window as unknown as { canvasAddImage?: (img: { id: string; preview: string }) => boolean }
      if (win.canvasAddImage) {
        win.canvasAddImage({ id: image.id, preview: image.url })
      }
    }
  }

  return (
    <>
      <div className="w-full bg-gradient-to-b from-white to-yellow-50/30 rounded-xl shadow-xl border border-yellow-100/50 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-neutral-700">生成历史</h3>
          <span className="text-[10px] text-neutral-500">{generatedHistory.length} 张图片</span>
        </div>
        
        {/* 横向滚动容器 */}
        <div className="relative">
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-yellow-300 scrollbar-track-yellow-100">
            {generatedHistory.map((image) => {
              const isOnCanvas = canvasImages.has(image.id)
              
              return (
                <div
                  key={image.id}
                  className="flex-shrink-0 relative group cursor-pointer"
                  onClick={() => setSelectedImage(image)}
                >
                  {/* 图片缩略图 - 更小尺寸 */}
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-white to-neutral-50 border border-yellow-200/50 hover:border-yellow-400 transition-all hover:shadow-xl shadow-md">
                    <img
                      src={image.url}
                      alt={`Generated ${image.id}`}
                      className={cn(
                        "w-full h-full object-cover",
                        isOnCanvas && "opacity-75"
                      )}
                    />
                  </div>
                  
                  {/* 悬浮操作按钮 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/30 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-xl flex items-center justify-center gap-1.5">
                    {/* 添加到画布按钮 */}
                    <button
                      onClick={(e) => handleAddToCanvas(image, e)}
                      className={cn(
                        "p-1.5 rounded-full shadow-lg hover:scale-110 transition-all duration-200 hover:shadow-xl",
                        isOnCanvas 
                          ? "bg-gray-500/90 cursor-default" 
                          : "bg-yellow-400 hover:bg-yellow-500"
                      )}
                      title={isOnCanvas ? "已在画布上" : "添加到画布"}
                      disabled={isOnCanvas}
                    >
                      {isOnCanvas ? (
                        <Check className="w-3 h-3 text-white" />
                      ) : (
                        <Plus className="w-3 h-3 text-white" />
                      )}
                    </button>
                    
                    <button
                      onClick={(e) => handleDownload(image, e)}
                      className="p-1.5 bg-white rounded-full shadow-lg hover:scale-110 transition-all duration-200 hover:shadow-xl"
                      title="下载"
                    >
                      <Download className="w-3 h-3 text-neutral-700" />
                    </button>
                    
                    <button
                      onClick={(e) => handleDelete(image.id, e)}
                      className="p-1.5 bg-red-500 rounded-full shadow-lg hover:scale-110 transition-all duration-200 hover:shadow-xl"
                      title="删除"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 大图查看器 */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[9998] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={selectedImage.url}
              alt="Generated"
              className="max-w-[90vw] max-h-[90vh] w-auto h-auto object-contain rounded-lg"
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
            
            {/* 提示词显示 - 移到图片外部底部 */}
            {selectedImage.prompt && (
              <div className="absolute bottom-4 left-[5vw] right-[5vw] max-w-[90vw] p-3 bg-white/90 backdrop-blur-sm rounded-lg" style={{ top: 'auto', bottom: '20px' }}>
                <p className="text-xs text-neutral-700 line-clamp-2 text-center">{selectedImage.prompt}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}