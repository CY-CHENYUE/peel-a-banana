'use client'

import { Upload, X, ImageIcon } from 'lucide-react'
import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import useAppStore from '@/stores/useAppStore'
import { cn } from '@/lib/utils'

export default function ImageGallery() {
  const { 
    uploadedImages,
    addUploadedImage,
    removeUploadedImage
  } = useAppStore()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        addUploadedImage(file, e.target?.result as string)
      }
      reader.readAsDataURL(file)
    })
  }, [addUploadedImage])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">参考图片</h3>
        <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-medium">
          {uploadedImages.length}/5
        </span>
      </div>

      {/* Upload Zone */}
      {uploadedImages.length === 0 ? (
        <div
          {...getRootProps()}
          className={cn(
            "relative rounded-2xl border-2 border-dashed transition-all p-8",
            "flex flex-col items-center justify-center cursor-pointer",
            "bg-gradient-to-br from-yellow-50/50 to-orange-50/50",
            isDragActive
              ? "border-yellow-400 bg-yellow-100/50 scale-[1.02] shadow-lg"
              : "border-yellow-200 hover:border-yellow-300 hover:bg-yellow-50/50 hover:shadow-md"
          )}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center gap-3">
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center",
              "bg-gradient-to-br from-yellow-400 to-orange-400 shadow-lg",
              isDragActive && "animate-bounce"
            )}>
              <Upload className="w-8 h-8 text-white" />
            </div>
            
            <div className="text-center">
              <p className="text-sm font-semibold text-neutral-800">
                {isDragActive ? '释放以上传' : '拖拽或点击上传'}
              </p>
              <p className="text-xs text-neutral-600 mt-1">
                支持 JPG、PNG、WebP • 最大 10MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Uploaded Images Grid */}
          <div className="grid grid-cols-3 gap-2">
            {uploadedImages.map((img) => (
              <div
                key={img.id}
                className="relative group rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all transform hover:scale-105"
              >
                <img
                  src={img.preview}
                  alt="Uploaded"
                  className="w-full h-20 object-cover"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Remove Button */}
                <button
                  onClick={() => removeUploadedImage(img.id)}
                  className="absolute top-1 right-1 p-1 bg-white/90 backdrop-blur-sm rounded opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                >
                  <X className="w-3 h-3 text-neutral-600 hover:text-red-500" />
                </button>
                
              </div>
            ))}
            
            {/* Add More Card */}
            {uploadedImages.length < 5 && (
              <div
                {...getRootProps()}
                className={cn(
                  "rounded-lg border-2 border-dashed transition-all h-20",
                  "flex items-center justify-center cursor-pointer",
                  "bg-gradient-to-br from-yellow-50/30 to-orange-50/30",
                  isDragActive
                    ? "border-yellow-400 bg-yellow-100/50 scale-105"
                    : "border-yellow-200 hover:border-yellow-300 hover:bg-yellow-50/50 hover:scale-105"
                )}
              >
                <input {...getInputProps()} />
                <div className="text-center">
                  <Upload className="w-4 h-4 text-neutral-400 mb-1" />
                  <span className="text-[10px] text-neutral-500">添加</span>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Tips */}
      {uploadedImages.length > 0 && (
        <div className="flex items-start gap-2 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200/50">
          <ImageIcon className="w-4 h-4 text-orange-500 mt-0.5" />
          <p className="text-xs font-medium text-orange-700">
            上传的图片将作为AI生成的参考
          </p>
        </div>
      )}
    </div>
  )
}