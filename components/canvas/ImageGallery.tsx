'use client'

import { Upload, X, Plus, Check, Sparkles, RefreshCw, AlertCircle, Palette, MapPin, Sun, Puzzle, User, Wand2, Clock, Lightbulb } from 'lucide-react'
import { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import useAppStore from '@/stores/useAppStore'
import { cn } from '@/lib/utils'

// 分类配置
const categoryConfig = {
  style: { icon: Palette, color: 'purple', label: '风格' },
  scene: { icon: MapPin, color: 'blue', label: '场景' },
  mood: { icon: Sun, color: 'yellow', label: '氛围' },
  element: { icon: Puzzle, color: 'green', label: '元素' },
  character: { icon: User, color: 'pink', label: '人物' },
  effect: { icon: Wand2, color: 'indigo', label: '特效' },
  time: { icon: Clock, color: 'orange', label: '时空' },
  creative: { icon: Lightbulb, color: 'red', label: '创意' }
}

// 获取分类样式
const getCategoryStyle = (category: string) => {
  const config = categoryConfig[category as keyof typeof categoryConfig]
  if (!config) return { bgClass: 'bg-neutral-100', textClass: 'text-neutral-600', borderClass: 'border-neutral-200' }
  
  const colorMap = {
    purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
    green: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
    pink: { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
    red: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' }
  }
  
  return colorMap[config.color as keyof typeof colorMap] || { bg: 'bg-neutral-100', text: 'text-neutral-600', border: 'border-neutral-200' }
}

export default function ImageGallery() {
  const { 
    uploadedImages,
    addUploadedImage,
    removeUploadedImage,
    analyzedTags,
    selectedTagId,
    setAnalyzedTags,
    selectAnalyzedTag,
    setCurrentPrompt
  } = useAppStore()
  
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)
  const [canvasImages, setCanvasImages] = useState<Set<string>>(new Set())
  
  // 定期检查画布上的图片状态
  useEffect(() => {
    const checkCanvasImages = () => {
      const win = window as unknown as { canvasHasImage?: (imageId: string) => boolean }
      if (win.canvasHasImage) {
        const newCanvasImages = new Set<string>()
        uploadedImages.forEach(img => {
          if (win.canvasHasImage!(img.id)) {
            newCanvasImages.add(img.id)
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
  }, [uploadedImages])

  // Analyze all uploaded images
  const analyzeImages = async () => {
    if (uploadedImages.length === 0) return
    
    setIsAnalyzing(true)
    setAnalyzeError(null)
    try {
      const imageDataArray = uploadedImages.map(img => img.preview)
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: imageDataArray })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setAnalyzedTags(data.tags || [])
        // Clear previous selection when new tags are generated
        selectAnalyzedTag(null)
        setCurrentPrompt('')
        setAnalyzeError(null)
      } else if (data.error) {
        // Handle API error response
        setAnalyzeError(data.message || 'AI分析失败，请重试')
        setAnalyzedTags([])
      }
    } catch (error) {
      console.error('Failed to analyze images:', error)
      setAnalyzeError('网络错误，请检查连接后重试')
      setAnalyzedTags([])
    } finally {
      setIsAnalyzing(false)
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Process files one by one to avoid race conditions
    const processedFiles = new Set<string>()
    
    acceptedFiles.forEach(file => {
      // Create a unique identifier for this file
      const fileId = `${file.name}_${file.size}_${file.lastModified}`
      
      // Skip if already processing this file
      if (processedFiles.has(fileId)) {
        console.log('Skipping duplicate file in batch:', file.name)
        return
      }
      
      processedFiles.add(fileId)
      
      const reader = new FileReader()
      reader.onload = async (e) => {
        const imageData = e.target?.result as string
        // Add a small delay between files to ensure proper processing
        setTimeout(() => {
          addUploadedImage(file, imageData)
        }, processedFiles.size * 10) // Stagger uploads by 10ms each
      }
      reader.onerror = () => {
        console.error('Failed to read file:', file.name)
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
        <h3 className="text-sm font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">素材库</h3>
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
            {uploadedImages.map((img) => {
              const isOnCanvas = canvasImages.has(img.id)
              
              return (
                <div
                  key={img.id}
                  className={cn(
                    "relative group rounded-lg overflow-hidden shadow-md transition-all transform",
                    isOnCanvas 
                      ? "hover:shadow-lg cursor-default" 
                      : "hover:shadow-xl hover:scale-105 cursor-pointer"
                  )}
                  onClick={() => {
                    // 只有不在画布上的图片才能添加
                    if (!isOnCanvas) {
                      const win = window as unknown as { canvasAddImage?: (img: { id: string; preview: string }) => boolean }
                      if (win.canvasAddImage) {
                        win.canvasAddImage(img)
                      }
                    }
                  }}
                  title={isOnCanvas ? "图片已在画布上" : "点击添加到画布"}
                >
                  <img
                    src={img.preview}
                    alt="Uploaded"
                    className={cn(
                      "w-full h-20 object-cover",
                      isOnCanvas && "opacity-75"
                    )}
                  />
                  
                  {/* Overlay with Icon */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {isOnCanvas ? (
                      <div className="bg-gray-500/90 rounded-full p-2.5 shadow-lg">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <div className="bg-white/90 rounded-full p-2.5 shadow-lg">
                        <Plus className="w-5 h-5 text-yellow-600" />
                      </div>
                    )}
                  </div>
                
                  
                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation() // 阻止触发添加到画布
                      removeUploadedImage(img.id)
                    }}
                    className="absolute top-1 right-1 p-1 bg-white/90 backdrop-blur-sm rounded opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 z-10"
                  >
                    <X className="w-3 h-3 text-neutral-600 hover:text-red-500" />
                  </button>
                </div>
              )
            })}
            
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

      {/* Analysis */}
      {uploadedImages.length > 0 && (
        <>
          {/* Analysis Section */}
          {!isAnalyzing && analyzedTags.length === 0 && (
            <button
              onClick={analyzeImages}
              className="w-full flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-lg border border-blue-200 transition-all"
            >
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-medium text-blue-700">
                AI 智能分析图片
              </span>
            </button>
          )}
          
          {/* Analysis Status */}
          {isAnalyzing && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
              <p className="text-xs font-medium text-blue-700">
                正在分析图片内容...
              </p>
            </div>
          )}
          
          {/* Error Message */}
          {analyzeError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-xs font-medium text-red-700 flex-1">
                {analyzeError}
              </p>
              <button
                onClick={analyzeImages}
                className="text-xs text-red-600 hover:text-red-700 underline"
              >
                重试
              </button>
            </div>
          )}
          
          {/* Analyzed Tags */}
          {analyzedTags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-neutral-700">智能分析结果</h4>
                <button
                  onClick={analyzeImages}
                  className="p-1 hover:bg-neutral-100 rounded-full transition-all hover:scale-110"
                  title="重新分析"
                >
                  <RefreshCw className="w-3 h-3 text-neutral-500 hover:text-blue-500" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {analyzedTags.map(tag => {
                  const categoryInfo = categoryConfig[tag.category as keyof typeof categoryConfig]
                  const categoryStyle = getCategoryStyle(tag.category)
                  const Icon = categoryInfo?.icon
                  
                  return (
                    <button
                      key={tag.id}
                      onClick={() => {
                        if (selectedTagId === tag.id) {
                          // 取消选择
                          selectAnalyzedTag(null)
                          setCurrentPrompt('')
                        } else {
                          // 选择新标签并填充提示词
                          selectAnalyzedTag(tag.id)
                          setCurrentPrompt(tag.prompt)
                        }
                      }}
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1.5 text-[10px] rounded-lg transition-all border",
                        "hover:scale-105 hover:shadow-md",
                        selectedTagId === tag.id
                          ? "bg-yellow-400 text-white font-semibold shadow-md border-yellow-500"
                          : cn('bg' in categoryStyle ? categoryStyle.bg : categoryStyle.bgClass, 
                               'text' in categoryStyle ? categoryStyle.text : categoryStyle.textClass, 
                               'border' in categoryStyle ? categoryStyle.border : categoryStyle.borderClass, 
                               "hover:opacity-90")
                      )}
                      title={tag.description}
                    >
                      {Icon && <Icon className="w-3 h-3" />}
                      {tag.emoji} 
                      <span className="font-medium">{tag.label}</span>
                      {categoryInfo && (
                        <span className="text-[8px] opacity-75 ml-1">
                          {categoryInfo.label}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}