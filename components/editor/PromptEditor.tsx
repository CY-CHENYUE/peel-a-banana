'use client'

import { useState, useEffect } from 'react'
import { 
  Trash2, 
  RotateCcw, 
  Copy, 
  Sparkles, 
  Palette,
  Edit3,
  Check,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import useAppStore from '@/stores/useAppStore'

// 创建纯白色参考图片用于比例控制
const createBlankReferenceImage = (width: number, height: number): string => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (ctx) {
    // 根据Google官方文档：使用完全纯白色背景，不需要任何边框或标记
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
  }
  return canvas.toDataURL('image/png')
}

// 根据画布尺寸获取标准比例参考图片
const getAspectRatioReference = (canvasWidth: number, canvasHeight: number): string => {
  // 根据文档：使用目标尺寸创建空白参考图片
  // 直接使用画布尺寸作为参考图片尺寸
  console.log(`Creating blank reference image: ${canvasWidth}x${canvasHeight}`)
  return createBlankReferenceImage(canvasWidth, canvasHeight)
}

export default function PromptEditor() {
  const {
    currentPrompt,
    originalPrompt,
    promptSource,
    selectedTag,
    isGenerating,
    uploadedImages,
    setCurrentPrompt,
    setPromptSource,
    revertToOriginal,
    setIsGenerating,
    setGeneratedImage,
    addToHistory
  } = useAppStore()

  const [isCopied, setIsCopied] = useState(false)
  const [charCount, setCharCount] = useState(0)
  const maxChars = 500

  useEffect(() => {
    setCharCount(currentPrompt.length)
  }, [currentPrompt])

  const handlePromptChange = (value: string) => {
    if (value.length <= maxChars) {
      setCurrentPrompt(value)
      if (value && !originalPrompt) {
        setPromptSource('custom')
      }
    }
  }

  const handleClear = () => {
    setCurrentPrompt('')
    setPromptSource('custom')
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentPrompt)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleGenerate = async () => {
    if (!currentPrompt || isGenerating) return
    
    setIsGenerating(true)
    
    try {
      // Get canvas data and dimensions
      const storeState = useAppStore.getState()
      const { canvasDataURL, canvas: { canvasWidth, canvasHeight, aspectRatio }, selectedImageId } = storeState
      
      console.log('Store state canvas data URL exists:', !!canvasDataURL)
      console.log('Canvas data URL length:', canvasDataURL?.length || 0)
      
      // Canvas dimensions are already based on 1024, use them directly
      console.log('Canvas size (for generation):', canvasWidth, 'x', canvasHeight)
      
      // 根据文档，在提示词中添加比例控制指令
      let aspectRatioHint = ''
      if (canvasWidth === 1344 && canvasHeight === 768) {
        aspectRatioHint = '16:9'
      } else if (canvasWidth === 768 && canvasHeight === 1344) {
        aspectRatioHint = '9:16'
      } else if (canvasWidth === 864 && canvasHeight === 1184) {
        aspectRatioHint = '3:4'
      } else if (canvasWidth === 1184 && canvasHeight === 864) {
        aspectRatioHint = '4:3'
      } else if (canvasWidth === 1024 && canvasHeight === 1024) {
        aspectRatioHint = '1:1'
      }
      
      // 根据Google官方文档，动态生成提示词
      // 计算实际输入图片数（画布内容 + 上传图片）
      const hasCanvasContent = !!canvasDataURL // 如果画布为空，canvasDataURL 会是 null
      const totalInputImages = uploadedImages.length + (hasCanvasContent ? 1 : 0)
      
      let enhancedPrompt = ''
      
      if (totalInputImages === 0) {
        // 无任何输入图片，只有空白参考图片
        enhancedPrompt = `Generate image with exact dimensions ${canvasWidth}x${canvasHeight} pixels (aspect ratio ${aspectRatioHint || 'custom'}). ${currentPrompt}`
      } else if (totalInputImages === 1) {
        // 1张输入图片 + 1张空白参考图片
        enhancedPrompt = `Redraw the content of Figure 1 onto Figure 2, add content to Figure 1 to fit the aspect ratio of Figure 2 (${canvasWidth}x${canvasHeight}), completely clear the content of Figure 2, and only retain the aspect ratio of Figure 2. ${currentPrompt}`
      } else if (totalInputImages === 2) {
        // 2张输入图片 + 1张空白参考图片
        enhancedPrompt = `Combine Figure 1 and Figure 2, redraw them onto Figure 3, add content to fit the aspect ratio of Figure 3 (${canvasWidth}x${canvasHeight}), completely clear the content of Figure 3, and only retain the aspect ratio of Figure 3. ${currentPrompt}`
      } else {
        // 多张输入图片 + 1张空白参考图片
        const lastFigure = totalInputImages + 1
        enhancedPrompt = `Combine Figures 1 to ${totalInputImages}, redraw them onto Figure ${lastFigure}, add content to fit the aspect ratio of Figure ${lastFigure} (${canvasWidth}x${canvasHeight}), completely clear the content of Figure ${lastFigure}, and only retain the aspect ratio of Figure ${lastFigure}. ${currentPrompt}`
      }
      
      console.log('📝 动态提示词生成完成：', enhancedPrompt)
      
      // Prepare reference images array
      const referenceImages = []
      let figureIndex = 1
      
      // 1. 添加画布内容（如果有内容）
      if (hasCanvasContent) {
        console.log('Adding canvas content as Figure 1')
        referenceImages.push({
          type: 'canvas',
          data: canvasDataURL,
          description: `Canvas drawing (Figure ${figureIndex})`
        })
        figureIndex++
      }
      
      // 2. 添加上传的图片（如果有）
      if (uploadedImages.length > 0) {
        console.log(`Adding ${uploadedImages.length} uploaded reference images`)
        uploadedImages.forEach((img, index) => {
          referenceImages.push({
            type: 'reference',
            data: img.preview,
            description: `Reference image (Figure ${figureIndex})`
          })
          console.log(`  - Added reference image as Figure ${figureIndex}`)
          figureIndex++
        })
      }
      
      // 3. 最后：添加纯白色比例控制参考图片
      // 根据Google官方文档，空白参考图片应该放在最后
      const blankReference = getAspectRatioReference(canvasWidth, canvasHeight)
      referenceImages.push({
        type: 'aspect_ratio',
        data: blankReference,
        description: `Blank aspect ratio reference (Figure ${figureIndex})`
      })
      
      // 调试：验证空白图片尺寸
      const img = new Image()
      img.onload = () => {
        console.log(`🔍 空白参考图片实际尺寸: ${img.width}×${img.height}`)
        if (img.width !== canvasWidth || img.height !== canvasHeight) {
          console.error('⚠️ 空白图片尺寸不匹配！')
        }
      }
      img.src = blankReference
      
      console.log('🔍 空白参考图片 Data URL (可在新标签页打开验证):', blankReference.substring(0, 100) + '...')
      console.log('   完整 URL 请在浏览器控制台右键 -> Copy string contents')
      
      // 验证空白图片生成
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
      console.log(`🎯 目标尺寸: ${canvasWidth}x${canvasHeight} (${aspectRatioHint || 'custom'})`)
      console.log(`📦 空白参考图片大小: ${blankReference.length} bytes`)
      console.log(`🖼️ 输入图片: ${hasCanvasContent ? '画布内容 ' : ''}${uploadedImages.length > 0 ? `+ ${uploadedImages.length}张上传图片` : ''}${totalInputImages === 0 ? '无' : ''}`)
      console.log(`📷 发送 ${referenceImages.length} 张图片 (最后一张是空白比例控制图)`)
      console.log(`📑 图片顺序: ${referenceImages.map(r => r.type).join(' -> ')}`)
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
      
      console.log(`Aspect ratio control: ${canvasWidth}x${canvasHeight} (${aspectRatioHint || 'custom'})`)
      
      // Call generate API with multiple reference images
      console.log('Sending to API with prompt:', enhancedPrompt)
      console.log('Canvas dimensions:', canvasWidth, 'x', canvasHeight)
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: enhancedPrompt,
          referenceImages, // Multiple reference images
          dimensions: { width: canvasWidth, height: canvasHeight } // Use canvas dimensions directly
        })
      })
      
      // Check if response is ok and has content
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON')
      }
      
      const data = await response.json()
      
      if (data.imageUrl) {
        // Store generated image
        setGeneratedImage(data.imageUrl)
        
        // Add to history
        addToHistory({
          id: Date.now().toString(),
          timestamp: new Date(),
          originalImage: uploadedImages[0]?.preview || null,
          generatedImage: data.imageUrl,
          prompt: currentPrompt,
          tag: selectedTag
        })
        
        if (!data.success) {
          console.log('Development mode:', data.message)
        }
      }
    } catch (error) {
      console.error('Error generating image:', error)
      alert('生成失败：API 配额已用完，请稍后重试或升级到付费计划')
    } finally {
      setIsGenerating(false)
    }
  }

  const isModified = originalPrompt && currentPrompt !== originalPrompt
  const canGenerate = currentPrompt && !isGenerating

  return (
    <div id="prompt-editor" className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
          <span>💡</span>
          创意工作台
        </h2>
        {promptSource === 'ai' && selectedTag && (
          <span className="text-sm text-neutral-500 flex items-center gap-1">
            <Sparkles className="w-4 h-4" />
            AI推荐 - {selectedTag.label}
          </span>
        )}
        {promptSource === 'modified' && selectedTag && (
          <span className="text-sm text-neutral-500 flex items-center gap-1">
            <Edit3 className="w-4 h-4" />
            基于 {selectedTag.label} 修改
          </span>
        )}
        {promptSource === 'custom' && (
          <span className="text-sm text-neutral-500 flex items-center gap-1">
            <Edit3 className="w-4 h-4" />
            自定义创意
          </span>
        )}
      </div>

      {/* Main Editor */}
      <div className="relative">
        <textarea
          value={currentPrompt}
          onChange={(e) => handlePromptChange(e.target.value)}
          placeholder="在这里输入或编辑您的创意...&#10;&#10;点击上方的AI标签获取灵感，或直接输入您的想法"
          className={cn(
            "w-full min-h-[150px] p-4 rounded-xl",
            "border-2 transition-all duration-200",
            "resize-none focus:outline-none",
            "text-neutral-800 placeholder:text-neutral-400",
            currentPrompt ? [
              "border-banana-300 bg-white",
              "focus:border-banana-400 focus:shadow-banana"
            ] : [
              "border-neutral-200 bg-neutral-50",
              "focus:border-banana-300 focus:bg-white"
            ]
          )}
        />
        
        {/* Character Count */}
        <div className="absolute bottom-2 right-2 text-xs text-neutral-500">
          <span className={charCount > maxChars * 0.9 ? "text-warning" : ""}>
            {charCount}
          </span>
          /{maxChars}
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between text-sm text-neutral-600">
        <div className="flex items-center gap-4">
          <span>📊 状态: {charCount}/500字</span>
          <span>🌐 语言: English</span>
          {canGenerate && <span>⏱️ 预计耗时: 10-15秒</span>}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            disabled={!currentPrompt}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg",
              "text-sm font-medium transition-all duration-200",
              currentPrompt ? [
                "bg-white border border-neutral-300",
                "text-neutral-700 hover:bg-neutral-50",
                "hover:border-neutral-400"
              ] : [
                "bg-neutral-100 border border-neutral-200",
                "text-neutral-400 cursor-not-allowed"
              ]
            )}
          >
            <Trash2 className="w-4 h-4" />
            清空
          </button>

          <button
            onClick={revertToOriginal}
            disabled={!isModified}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg",
              "text-sm font-medium transition-all duration-200",
              isModified ? [
                "bg-white border border-neutral-300",
                "text-neutral-700 hover:bg-neutral-50",
                "hover:border-neutral-400"
              ] : [
                "bg-neutral-100 border border-neutral-200",
                "text-neutral-400 cursor-not-allowed"
              ]
            )}
          >
            <RotateCcw className="w-4 h-4" />
            恢复原始
          </button>

          <button
            onClick={handleCopy}
            disabled={!currentPrompt}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg",
              "text-sm font-medium transition-all duration-200",
              currentPrompt ? [
                "bg-white border border-neutral-300",
                "text-neutral-700 hover:bg-neutral-50",
                "hover:border-neutral-400"
              ] : [
                "bg-neutral-100 border border-neutral-200",
                "text-neutral-400 cursor-not-allowed"
              ]
            )}
          >
            {isCopied ? (
              <Check className="w-4 h-4 text-success" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {isCopied ? '已复制' : '复制'}
          </button>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-xl",
            "font-semibold transition-all duration-200",
            "text-white",
            canGenerate ? [
              "bg-gradient-to-r from-banana-400 to-banana-500",
              "hover:from-banana-500 hover:to-banana-600",
              "shadow-banana hover:shadow-xl",
              "hover:scale-105 active:scale-100",
              "animate-pulse-slow"
            ] : [
              "bg-neutral-300 cursor-not-allowed"
            ]
          )}
        >
          <Palette className="w-5 h-5" />
          生成图片
        </button>
      </div>

      {/* Helper Tips */}
      {uploadedImages.length === 0 && currentPrompt && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
          <p className="text-sm text-blue-700">
            提示：未上传图片时将使用纯空白参考图片测试比例控制
          </p>
        </div>
      )}
    </div>
  )
}