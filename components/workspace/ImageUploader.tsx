'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import useAppStore from '@/stores/useAppStore'

export default function ImageUploader() {
  const { uploadedImages, addUploadedImage } = useAppStore()
  const [isDragActive, setIsDragActive] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        addUploadedImage(file, e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [addUploadedImage])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => setIsDragActive(false)
  })


  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative w-full h-full min-h-[200px] rounded-xl border-2 border-dashed",
        "flex flex-col items-center justify-center gap-4",
        "cursor-pointer transition-all duration-200",
        "bg-gradient-to-br from-banana-50 to-white",
        isDragActive ? [
          "border-banana-400 bg-banana-100",
          "scale-[1.02]"
        ] : [
          "border-neutral-300 hover:border-banana-300",
          "hover:bg-banana-50"
        ]
      )}
    >
      <input {...getInputProps()} />
      
      <div className={cn(
        "p-2 rounded-full",
        "bg-gradient-to-br from-banana-100 to-banana-200",
        "transition-transform duration-200",
        isDragActive && "scale-110"
      )}>
        {isDragActive ? (
          <ImageIcon className="w-6 h-6 text-banana-600" />
        ) : (
          <Upload className="w-6 h-6 text-banana-600" />
        )}
      </div>
      
      <div className="text-center px-2">
        <p className="text-xs font-medium text-neutral-700">
          {isDragActive ? '释放上传' : '点击或拖拽'}
        </p>
        <p className="text-[10px] text-neutral-500 mt-1">
          JPG/PNG/WEBP
        </p>
      </div>
    </div>
  )
}