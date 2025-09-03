'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Wand2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import useAppStore from '@/stores/useAppStore'

// 创建纯白色参考图片用于比例控制
const createBlankReferenceImage = (width: number, height: number): string => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
  }
  return canvas.toDataURL('image/png')
}

// 检查画布是否为空（只有白色背景）
const isCanvasEmpty = (canvasDataURL: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(true)
        return
      }
      
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const pixels = imageData.data
      
      let nonWhiteCount = 0
      
      // Check if all pixels are white (with tolerance for compression artifacts)
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i]
        const g = pixels[i + 1]
        const b = pixels[i + 2]
        const a = pixels[i + 3]
        
        // If we find any non-white pixel (with tolerance for compression)
        // Consider pixels with RGB values < 253 as non-white to handle compression artifacts
        if (a > 0 && (r < 253 || g < 253 || b < 253)) {
          nonWhiteCount++
          if (nonWhiteCount > 100) {  // If more than 100 non-white pixels, it's definitely not empty
            resolve(false)
            return
          }
        }
      }
      
      // If we found some non-white pixels but less than 100, treat as empty (likely artifacts)
      resolve(nonWhiteCount === 0 || nonWhiteCount < 100)
    }
    img.src = canvasDataURL
  })
}

export default function PromptEditor() {
  const {
    currentPrompt,
    isGenerating,
    uploadedImages,
    setCurrentPrompt,
    setIsGenerating,
    setGeneratedImage,
    setCurrentPrompt: savePromptToStore
  } = useAppStore()

  const [localPrompt, setLocalPrompt] = useState(currentPrompt)
  
  // 同步 store 中的 currentPrompt 到本地状态
  useEffect(() => {
    setLocalPrompt(currentPrompt)
  }, [currentPrompt])

  const handleGenerate = async () => {
    if (!localPrompt.trim() || isGenerating) return
    
    // Save prompt to store
    setCurrentPrompt(localPrompt)
    setIsGenerating(true)
    
    try {
      // Get canvas data and dimensions
      const storeState = useAppStore.getState()
      const { canvasDataURL, canvas: { canvasWidth, canvasHeight, aspectRatio } } = storeState
      
      console.log('Canvas data exists:', !!canvasDataURL)
      console.log('Canvas dimensions:', canvasWidth, 'x', canvasHeight)
      
      // Create aspect ratio reference
      const aspectRatioReference = createBlankReferenceImage(canvasWidth, canvasHeight)
      
      // Prepare reference images array in the format expected by API
      const referenceImages: Array<{data: string, type: string, description: string}> = []
      
      // Check if canvas has actual content (not just white background)
      let hasCanvasContent = false
      if (canvasDataURL) {
        hasCanvasContent = !(await isCanvasEmpty(canvasDataURL))
        console.log('Canvas has actual content:', hasCanvasContent)
      }
      
      if (hasCanvasContent && canvasDataURL) {
        referenceImages.push({
          data: canvasDataURL,
          type: 'canvas',
          description: '用户手绘草图'
        })
      }
      
      if (uploadedImages.length > 0) {
        uploadedImages.forEach((img, index) => {
          referenceImages.push({
            data: img.preview,
            type: 'reference',
            description: `参考图片 ${index + 1}`
          })
        })
      }
      
      // Always add blank reference for aspect ratio
      referenceImages.push({
        data: aspectRatioReference,
        type: 'aspect_ratio',
        description: `目标比例 ${aspectRatio} (${canvasWidth}x${canvasHeight})`
      })
      
      // Construct prompt based on number of content images
      let fullPrompt = ''
      
      // Count total content images (canvas + uploaded)
      const contentImageCount = (hasCanvasContent ? 1 : 0) + uploadedImages.length
      
      if (contentImageCount === 1) {
        // Single content image - use Figure 1 and Figure 2 format
        fullPrompt = `Redraw the content of Figure 1 onto Figure 2, add content to Figure 1 to fit the aspect ratio of Figure 2, completely clear the content of Figure 2, and only retain the aspect ratio of Figure 2. ${localPrompt}`
      } else if (contentImageCount > 1) {
        // Multiple content images - combine all onto the last figure
        fullPrompt = `Redraw and combine the content from all previous figures onto the last figure, adjusting the composition to fit the aspect ratio of the last figure. The last figure is a blank template that defines the target ${aspectRatio} aspect ratio. ${localPrompt}`
      } else {
        // No content images, just text-to-image with aspect ratio
        fullPrompt = `${localPrompt}. Generate the image to fit the aspect ratio shown in the provided blank template (${aspectRatio}).`
      }
      
      console.log('Final prompt:', fullPrompt)
      console.log('Number of reference images:', referenceImages.length)
      
      // Call API
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          referenceImages: referenceImages,
          dimensions: {
            width: canvasWidth,
            height: canvasHeight
          }
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl)
        console.log('Image generated successfully')
      } else {
        throw new Error('No image URL in response')
      }
    } catch (error) {
      console.error('Generation error:', error)
      alert(`生成失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">创作提示词</h3>
        <span className={cn(
          "text-xs px-2 py-0.5 rounded-full font-medium",
          localPrompt.length > 400 ? "bg-orange-100 text-orange-700" : "bg-yellow-100 text-yellow-700"
        )}>
          {localPrompt.length}/500
        </span>
      </div>

      {/* Prompt Input */}
      <div className="relative">
        <textarea
          value={localPrompt}
          onChange={(e) => setLocalPrompt(e.target.value)}
          placeholder="描述你想要生成的图像..."
          className={cn(
            "w-full min-h-[120px] p-4 rounded-xl",
            "bg-gradient-to-br from-yellow-50/50 to-orange-50/50 border-2 border-yellow-200/50",
            "focus:bg-white focus:border-yellow-400 focus:outline-none focus:shadow-lg",
            "text-sm text-neutral-700 placeholder-neutral-500",
            "resize-none transition-all duration-200"
          )}
          maxLength={500}
        />
        
        {/* Magic Wand Button */}
        <button
          className="absolute top-3 right-3 p-2 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 transition-all shadow-md hover:shadow-lg transform hover:scale-110"
          title="AI 优化提示词"
        >
          <Wand2 className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Quick Templates */}
      <div className="flex flex-wrap gap-2">
        {['写实风格', '卡通风格', '油画风格', '赛博朋克'].map((style) => (
          <button
            key={style}
            onClick={() => {
              const stylePrompts = {
                '写实风格': 'photorealistic, highly detailed, professional photography',
                '卡通风格': 'cartoon style, animated, colorful, cute',
                '油画风格': 'oil painting style, artistic, textured brushstrokes',
                '赛博朋克': 'cyberpunk style, neon lights, futuristic, high-tech'
              }
              setLocalPrompt(prev => prev + (prev ? ', ' : '') + stylePrompts[style as keyof typeof stylePrompts])
            }}
            className="px-3 py-1.5 text-xs bg-gradient-to-r from-yellow-100 to-orange-100 hover:from-yellow-200 hover:to-orange-200 rounded-lg transition-all hover:shadow-md transform hover:scale-105 font-medium text-neutral-700"
          >
            {style}
          </button>
        ))}
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!localPrompt.trim() || isGenerating}
        className={cn(
          "w-full py-3 rounded-xl font-medium transition-all",
          "flex items-center justify-center gap-2",
          (!localPrompt.trim() || isGenerating)
            ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
            : "bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:from-yellow-500 hover:to-orange-500 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
        )}
      >
        <Sparkles className="w-5 h-5" />
        {isGenerating ? 'AI 生成中...' : 'AI 生成图片'}
      </button>
    </div>
  )
}