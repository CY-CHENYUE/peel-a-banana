'use client'

import { useEffect, useRef, useState } from 'react'
import useAppStore from '@/stores/useAppStore'
import { cn } from '@/lib/utils'
import PeelingBananaLoader from './PeelingBananaLoader'

interface CanvasEditorProps {
  className?: string
}

export default function CanvasEditor({ className }: CanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [canvasScale, setCanvasScale] = useState(1)
  const [isRestoringHistory, setIsRestoringHistory] = useState(false)
  
  const {
    canvas: {
      canvasWidth,
      canvasHeight,
      currentTool,
      brushSize,
      currentColor,
      eraserSize,
      aspectRatio,
      history,
      historyIndex
    },
    addToCanvasHistory,
    undoCanvas,
    redoCanvas,
    canUndo,
    canRedo,
    setCanvasDataURL,
    generatedImage,
    setGeneratedImage,
    isGenerating
  } = useAppStore()

  // Check if canvas is empty
  const isCanvasEmpty = () => {
    if (!canvasRef.current || !contextRef.current) return true
    const imageData = contextRef.current.getImageData(0, 0, canvasWidth, canvasHeight)
    const pixels = imageData.data
    
    // Check if all pixels are white (255,255,255)
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i]
      const g = pixels[i + 1]
      const b = pixels[i + 2]
      const a = pixels[i + 3]
      
      // If we find a non-white pixel with some opacity
      if (a > 0 && (r !== 255 || g !== 255 || b !== 255)) {
        return false
      }
    }
    return true
  }

  // Get canvas data as base64
  const getCanvasDataURL = () => {
    if (!canvasRef.current || isCanvasEmpty()) return null
    return canvasRef.current.toDataURL('image/png')
  }

  // Update canvas data URL when canvas changes
  const updateCanvasDataURL = () => {
    const dataURL = getCanvasDataURL()
    console.log('Updating canvas data URL, has data:', !!dataURL)
    setCanvasDataURL(dataURL)
  }

  // Calculate canvas scale to fit container
  useEffect(() => {
    if (!containerRef.current) return
    
    const containerWidth = containerRef.current.clientWidth - 32 // padding
    const containerHeight = 600 // fixed height
    
    const scaleX = containerWidth / canvasWidth
    const scaleY = containerHeight / canvasHeight
    const scale = Math.min(scaleX, scaleY) // Allow scaling both up and down to fit container
    
    setCanvasScale(scale)
  }, [canvasWidth, canvasHeight, aspectRatio])

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = canvasWidth
    canvas.height = canvasHeight
    
    const context = canvas.getContext('2d')
    if (!context) return
    
    // Set white background
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvasWidth, canvasHeight)
    
    // Set drawing properties
    context.lineCap = 'round'
    context.lineJoin = 'round'
    
    contextRef.current = context
    
    // Immediately update canvas data URL
    const dataURL = canvas.toDataURL('image/png')
    setCanvasDataURL(dataURL)
    console.log('Canvas initialized with dimensions:', canvasWidth, 'x', canvasHeight)
    
    // Also save to history
    if (history.length === 0) {
      addToCanvasHistory(dataURL)
    }
  }, [canvasWidth, canvasHeight])

  // Handle undo/redo - restore canvas from history
  const applyHistoryState = (index: number) => {
    const canvas = canvasRef.current
    const context = contextRef.current
    if (!canvas || !context || !history[index]) return
    
    setIsRestoringHistory(true)
    const img = new Image()
    img.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height)
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.drawImage(img, 0, 0)
      // Reset flag after restoration is complete
      setTimeout(() => setIsRestoringHistory(false), 100)
    }
    img.src = history[index]
  }

  // Update drawing settings
  useEffect(() => {
    if (!contextRef.current) return
    
    if (currentTool === 'brush') {
      contextRef.current.globalCompositeOperation = 'source-over'
      contextRef.current.strokeStyle = currentColor
      contextRef.current.lineWidth = brushSize
    } else if (currentTool === 'eraser') {
      contextRef.current.globalCompositeOperation = 'destination-out'
      contextRef.current.lineWidth = eraserSize
    }
    // Text tool settings are applied when actually rendering text
  }, [currentTool, brushSize, currentColor, eraserSize])

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / canvasScale
    const y = (e.clientY - rect.top) / canvasScale
    
    return { x, y }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!contextRef.current) return
    
    const { x, y } = getMousePos(e)
    
    if (currentTool === 'brush' || currentTool === 'eraser') {
      contextRef.current.beginPath()
      contextRef.current.moveTo(x, y)
      setIsDrawing(true)
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current) return
    if (currentTool !== 'brush' && currentTool !== 'eraser') return
    
    const { x, y } = getMousePos(e)
    
    contextRef.current.lineTo(x, y)
    contextRef.current.stroke()
  }

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false)
      saveCanvasState()
    }
  }

  // Save canvas state for history
  const saveCanvasState = () => {
    const canvas = canvasRef.current
    // Don't save if we're in the middle of restoring
    if (!canvas || isRestoringHistory) return
    
    const dataURL = canvas.toDataURL()
    addToCanvasHistory(dataURL)
    // Update canvas data URL for image generation
    updateCanvasDataURL()
  }

  // Clear canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current
    const context = contextRef.current
    if (!canvas || !context) return
    
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    saveCanvasState()
  }

  // Export canvas as image
  const exportCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const dataURL = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = 'peel-a-banana-canvas.png'
    link.href = dataURL
    link.click()
  }

  // Display generated image on canvas
  useEffect(() => {
    if (generatedImage && canvasRef.current && contextRef.current) {
      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current
        const context = contextRef.current
        if (!canvas || !context) return
        
        // Save current state before drawing new image (for undo)
        if (!isCanvasEmpty()) {
          saveCanvasState()
        }
        
        // Log image and canvas dimensions for debugging
        console.log('Generated image dimensions:', img.width, 'x', img.height)
        console.log('Canvas dimensions:', canvas.width, 'x', canvas.height)
        
        // Clear canvas and draw generated image
        context.clearRect(0, 0, canvas.width, canvas.height)
        context.fillStyle = '#ffffff'
        context.fillRect(0, 0, canvas.width, canvas.height)
        
        // Calculate scale to fit image completely within canvas (letterbox/pillarbox)
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height)
        const scaledWidth = img.width * scale
        const scaledHeight = img.height * scale
        
        // Center the image on canvas
        const x = (canvas.width - scaledWidth) / 2
        const y = (canvas.height - scaledHeight) / 2
        
        // Draw the image scaled and centered
        context.drawImage(img, x, y, scaledWidth, scaledHeight)
        
        // Save to history
        saveCanvasState()
        
        // Clear generated image state
        setGeneratedImage(null)
      }
      img.src = generatedImage
    }
  }, [generatedImage])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo: Cmd/Ctrl + Z
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        if (canUndo()) {
          const newIndex = historyIndex - 1
          undoCanvas()
          applyHistoryState(newIndex)
        }
      }
      // Redo: Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y
      else if (((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') || 
               ((e.metaKey || e.ctrlKey) && e.key === 'y')) {
        e.preventDefault()
        if (canRedo()) {
          const newIndex = historyIndex + 1
          redoCanvas()
          applyHistoryState(newIndex)
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canUndo, canRedo, undoCanvas, redoCanvas, historyIndex])

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative bg-neutral-100 rounded-xl p-4",
        "flex items-center justify-center",
        "min-h-[650px]",
        className
      )}
    >
      <div className="relative">
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className={cn(
            "border-2 border-neutral-300 rounded-lg shadow-lg bg-white",
            currentTool === 'brush' && "cursor-crosshair",
            currentTool === 'eraser' && "cursor-crosshair"
          )}
          style={{
            width: canvasWidth * canvasScale,
            height: canvasHeight * canvasScale
          }}
        />
        
        {/* Canvas info */}
        <div className="absolute -top-8 left-0 text-xs text-neutral-500">
          {canvasWidth} × {canvasHeight} {canvasScale < 1 && `(${Math.round(canvasScale * 100)}%)`}
        </div>
        
        {/* Canvas overlay for additional UI */}
        {isDrawing && (
          <div className="absolute top-2 left-2 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
            {currentTool === 'eraser' ? '擦除中...' : '绘制中...'}
          </div>
        )}
        
        {/* 生成中的加载动画 */}
        {isGenerating && <PeelingBananaLoader />}
      </div>

      {/* Quick Actions */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={clearCanvas}
          className="px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50 transition-colors"
        >
          清空画布
        </button>
        <button
          onClick={exportCanvas}
          className="px-3 py-1.5 bg-banana-400 text-white rounded-lg text-sm hover:bg-banana-500 transition-colors"
        >
          导出图片
        </button>
      </div>
      
      {/* Keyboard shortcuts hint */}
      <div className="absolute bottom-4 right-4 text-xs text-neutral-400">
        撤销: Cmd/Ctrl+Z | 重做: Cmd/Ctrl+Shift+Z
      </div>
    </div>
  )
}