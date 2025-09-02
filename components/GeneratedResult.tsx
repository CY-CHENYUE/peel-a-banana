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
    link.download = `peel-a-banana-${Date.now()}.png`
    link.click()
  }

  const handleClose = () => {
    setGeneratedImage(null)
  }

  // 只在有生成结果时显示
  if (!generatedImage) return null

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-700">生成结果</h3>
        <button
          onClick={handleClose}
          className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-neutral-500" />
        </button>
      </div>

      {generatedImage && (
        <div className="space-y-4">
          {/* Generated Image */}
          <div className="relative rounded-xl overflow-hidden bg-neutral-100">
            <img
              src={generatedImage}
              alt="Generated"
              className="w-full h-auto"
            />
            
            {/* Hover Overlay with Download */}
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={handleDownload}
                className="p-3 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
              >
                <Download className="w-6 h-6 text-neutral-700" />
              </button>
            </div>
          </div>

          {/* Prompt Used - More subtle */}
          {currentPrompt && (
            <div className="px-3 py-2 bg-neutral-50 rounded-lg">
              <p className="text-xs text-neutral-600 line-clamp-2">{currentPrompt}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}