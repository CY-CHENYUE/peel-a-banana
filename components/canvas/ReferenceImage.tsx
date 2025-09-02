'use client'

import { X, Maximize2, Image as ImageIcon } from 'lucide-react'
import { useState } from 'react'
import useAppStore from '@/stores/useAppStore'
import { cn } from '@/lib/utils'

export default function ReferenceImage() {
  const { imagePreview, setImagePreview } = useAppStore()
  const [showLarge, setShowLarge] = useState(false)

  if (!imagePreview) {
    return null
  }

  return (
    <>
      {/* Thumbnail View */}
      <div className="bg-white rounded-lg border border-neutral-200 p-2 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-neutral-700">参考图片</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowLarge(true)}
              className="p-1 hover:bg-neutral-100 rounded transition-colors"
              title="查看大图"
            >
              <Maximize2 className="w-3 h-3 text-neutral-600" />
            </button>
            <button
              onClick={() => setImagePreview(null)}
              className="p-1 hover:bg-neutral-100 rounded transition-colors"
              title="移除图片"
            >
              <X className="w-3 h-3 text-neutral-600" />
            </button>
          </div>
        </div>
        
        {/* Thumbnail Image */}
        <div className="relative w-full h-32 bg-neutral-50 rounded overflow-hidden">
          <img
            src={imagePreview}
            alt="Reference"
            className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setShowLarge(true)}
          />
        </div>
      </div>

      {/* Large View Modal */}
      {showLarge && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setShowLarge(false)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img
              src={imagePreview}
              alt="Reference Large"
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setShowLarge(false)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-neutral-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}