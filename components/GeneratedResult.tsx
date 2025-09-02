'use client'

import { Download, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import useAppStore from '@/stores/useAppStore'

export default function GeneratedResult() {
  const { generatedImage, isGenerating, currentPrompt, setGeneratedImage } = useAppStore()

  const handleDownload = () => {
    if (!generatedImage) return
    
    const link = document.createElement('a')
    link.href = generatedImage
    link.download = `nano-banana-${Date.now()}.png`
    link.click()
  }

  const handleClose = () => {
    setGeneratedImage(null)
  }

  if (!isGenerating && !generatedImage) return null

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-700">生成结果</h3>
        {generatedImage && (
          <button
            onClick={handleClose}
            className="p-1 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-neutral-500" />
          </button>
        )}
      </div>

      {isGenerating ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-banana-500 animate-spin mb-3" />
          <p className="text-sm text-neutral-600">AI 正在创作中...</p>
          <p className="text-xs text-neutral-400 mt-1">请稍候片刻</p>
        </div>
      ) : generatedImage ? (
        <div className="space-y-3">
          {/* Generated Image */}
          <div className="relative rounded-lg overflow-hidden bg-neutral-100">
            <img
              src={generatedImage}
              alt="Generated"
              className="w-full h-auto"
            />
          </div>

          {/* Prompt Used */}
          {currentPrompt && (
            <div className="p-2 bg-neutral-50 rounded-lg">
              <p className="text-xs text-neutral-500 mb-1">使用的提示词:</p>
              <p className="text-xs text-neutral-700 line-clamp-2">{currentPrompt}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className={cn(
                "flex-1 flex items-center justify-center gap-2",
                "px-3 py-2 rounded-lg",
                "bg-banana-400 text-white",
                "hover:bg-banana-500 transition-colors",
                "text-sm font-medium"
              )}
            >
              <Download className="w-4 h-4" />
              下载图片
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}