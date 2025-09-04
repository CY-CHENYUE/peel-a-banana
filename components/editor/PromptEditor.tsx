'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Wand2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import useAppStore from '@/stores/useAppStore'
import { getReferenceImageDataURL } from '@/lib/referenceImages'
import { AspectRatio } from '@/types'

export default function PromptEditor() {
  const {
    currentPrompt,
    isGenerating,
    uploadedImages,
    setCurrentPrompt,
    setIsGenerating,
    setGeneratedImage,
    setShowCelebration,
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
      // Get canvas data and target dimensions
      const storeState = useAppStore.getState()
      const { canvasDataURL, canvas: { aspectRatio }, targetWidth, targetHeight } = storeState
      
      console.log('Canvas data exists:', !!canvasDataURL)
      console.log('Target dimensions:', targetWidth, 'x', targetHeight, 'for aspect ratio:', aspectRatio)
      
      // 使用预生成的参考图
      const referenceImages: Array<{data: string, type: string, description: string}> = []
      let fullPrompt = ''
      
      if (canvasDataURL) {
        // 图1：画布内容
        referenceImages.push({
          data: canvasDataURL,
          type: 'canvas',
          description: 'Content to transform (Figure 1)'
        })
        
        // 图2：使用预生成的白底参考图
        const aspectRatioReference = await getReferenceImageDataURL(aspectRatio as AspectRatio)
        referenceImages.push({
          data: aspectRatioReference,
          type: 'aspect_ratio',
          description: `Target ${aspectRatio} template (Figure 2)`
        })
        
        // 有用户输入时，明确说明要生成图片并转换内容
        fullPrompt = `Generate an image. Transform the content of Figure 1 into: ${localPrompt}. Redraw it onto Figure 2, extending the scene to fit the aspect ratio of Figure 2. Completely clear the content of Figure 2 and only retain its aspect ratio.`
      } else {
        // 没有画布内容时，使用预生成的白底参考图
        const aspectRatioReference = await getReferenceImageDataURL(aspectRatio as AspectRatio)
        referenceImages.push({
          data: aspectRatioReference,
          type: 'aspect_ratio',
          description: `${aspectRatio} aspect ratio template`
        })
        
        fullPrompt = `Generate an image: ${localPrompt}. The image must match the exact dimensions and aspect ratio of the provided template (${aspectRatio}).`
      }
      
      console.log('Final prompt:', fullPrompt)
      console.log('Number of reference images:', referenceImages.length)
      
      // Call API with target dimensions
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          referenceImages: referenceImages,
          dimensions: {
            width: targetWidth,
            height: targetHeight
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
        setShowCelebration(true) // 触发庆祝动画
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