'use client'

import { X, Plus, Image as ImageIcon, Sparkles } from 'lucide-react'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import useAppStore from '@/stores/useAppStore'
import { cn } from '@/lib/utils'
import CreativeTagsPanel from '@/components/tags/CreativeTagsPanel'

export default function ImageGallery() {
  const { 
    uploadedImages, 
    selectedImageId,
    addUploadedImage,
    removeUploadedImage,
    selectImage,
    tags,
    setTags
  } = useAppStore()
  
  const [isAnalyzing, setIsAnalyzing] = useState(false)

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

  const selectedImage = uploadedImages.find(img => img.id === selectedImageId)

  // AI analysis using real API
  const handleAnalyzeImages = async () => {
    if (uploadedImages.length === 0) return
    
    setIsAnalyzing(true)
    
    try {
      // Prepare images for API (use preview which is base64)
      const images = uploadedImages.map(img => img.preview)
      
      // Call analyze API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ images })
      })
      
      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.tags) {
        setTags(data.tags)
        if (data.isMock) {
          console.log('Using mock data:', data.message)
        }
      } else {
        throw new Error('No tags received')
      }
    } catch (error) {
      console.error('Error analyzing images:', error)
      // You could show an error toast here
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      <div className="bg-white rounded-lg border border-neutral-200 p-3 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-medium text-neutral-700">参考图片</h3>
          <span className="text-xs text-neutral-500">
            {uploadedImages.length}/5
          </span>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          {uploadedImages.map((img) => (
            <div
              key={img.id}
              className={cn(
                "relative group cursor-pointer rounded overflow-hidden",
                "border-2 transition-all",
                selectedImageId === img.id 
                  ? "border-banana-400 shadow-md" 
                  : "border-neutral-200 hover:border-neutral-300"
              )}
              onClick={() => selectImage(img.id)}
            >
              <img
                src={img.preview}
                alt="Uploaded"
                className="w-full h-16 object-cover"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeUploadedImage(img.id)
                }}
                className="absolute top-1 right-1 p-0.5 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-neutral-600" />
              </button>
            </div>
          ))}
          
          {/* Add More Button */}
          {uploadedImages.length < 5 && (
            <div
              {...getRootProps()}
              className={cn(
                "flex items-center justify-center rounded cursor-pointer",
                "border-2 border-dashed transition-all h-16",
                isDragActive
                  ? "border-banana-400 bg-banana-50"
                  : "border-neutral-300 hover:border-banana-300 hover:bg-neutral-50"
              )}
            >
              <input {...getInputProps()} />
              <div className="text-center">
                <Plus className="w-5 h-5 text-neutral-400 mx-auto" />
                <span className="text-[10px] text-neutral-500">添加</span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* AI Analysis Button */}
      {uploadedImages.length > 0 && tags.length === 0 && (
        <button
          onClick={handleAnalyzeImages}
          disabled={isAnalyzing}
          className={cn(
            "w-full py-2 rounded-lg text-sm font-medium transition-all",
            "flex items-center justify-center gap-2",
            isAnalyzing
              ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
              : "bg-gradient-to-r from-banana-400 to-banana-500 text-white hover:shadow-md"
          )}
        >
          <Sparkles className="w-4 h-4" />
          {isAnalyzing ? 'AI 分析中...' : 'AI 分析图片'}
        </button>
      )}

      {/* Creative Tags Panel */}
      {tags.length > 0 && (
        <CreativeTagsPanel />
      )}
    </div>
  )
}