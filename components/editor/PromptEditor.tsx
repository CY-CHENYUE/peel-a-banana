'use client'

import { useState } from 'react'
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
      
      // Prepare images array
      const images: string[] = []
      const hasCanvasContent = !!canvasDataURL
      
      if (hasCanvasContent) {
        images.push(canvasDataURL)
      }
      
      if (uploadedImages.length > 0) {
        uploadedImages.forEach(img => images.push(img.preview))
      }
      
      // Always add blank reference for aspect ratio
      images.push(aspectRatioReference)
      
      // Construct prompt with aspect ratio hint
      let aspectRatioHint = ''
      if (aspectRatio === '1:1') {
        aspectRatioHint = 'Generate a square image with 1:1 aspect ratio.'
      } else if (aspectRatio === '16:9') {
        aspectRatioHint = 'Generate a wide landscape image with 16:9 aspect ratio.'
      } else if (aspectRatio === '9:16') {
        aspectRatioHint = 'Generate a tall portrait image with 9:16 aspect ratio.'
      } else if (aspectRatio === '4:3') {
        aspectRatioHint = 'Generate a landscape image with 4:3 aspect ratio.'
      } else if (aspectRatio === '3:4') {
        aspectRatioHint = 'Generate a portrait image with 3:4 aspect ratio.'
      }
      
      let fullPrompt = localPrompt
      
      // Add context based on inputs
      if (hasCanvasContent && uploadedImages.length > 0) {
        fullPrompt = `Using the hand-drawn sketch in the first image and the reference photo(s), ${localPrompt}. Maintain the composition and structure from the sketch while applying the style and details from the reference. ${aspectRatioHint} The last image is a blank canvas showing the desired output dimensions.`
      } else if (hasCanvasContent) {
        fullPrompt = `Based on the hand-drawn sketch in the image, ${localPrompt}. Transform the sketch into a detailed, polished image while preserving the original composition. ${aspectRatioHint} The last image is a blank canvas showing the desired output dimensions.`
      } else if (uploadedImages.length > 0) {
        fullPrompt = `Using the provided reference image(s), ${localPrompt}. ${aspectRatioHint} The last image is a blank canvas showing the desired output dimensions.`
      } else {
        fullPrompt = `${localPrompt}. ${aspectRatioHint} The image is a blank canvas showing the desired output dimensions.`
      }
      
      console.log('Final prompt:', fullPrompt)
      console.log('Number of images:', images.length)
      
      // Call API
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          images: images,
          width: canvasWidth,
          height: canvasHeight
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