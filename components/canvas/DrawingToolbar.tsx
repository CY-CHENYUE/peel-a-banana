'use client'

import { useState } from 'react'
import { 
  Paintbrush, 
  Eraser,
  Undo2,
  Redo2,
  Palette,
  Square,
  Smartphone,
  Monitor,
  Tablet,
  RectangleHorizontal,
  Settings
} from 'lucide-react'
import { ChromePicker } from 'react-color'
import useAppStore from '@/stores/useAppStore'
import { cn } from '@/lib/utils'
import { DrawingTool, AspectRatio } from '@/types'

export default function DrawingToolbar() {
  const {
    canvas: { currentTool, brushSize, eraserSize, currentColor, aspectRatio, canvasWidth, canvasHeight, history, historyIndex },
    setCanvasTool,
    setBrushSize,
    setEraserSize,
    setCanvasColor,
    setAspectRatio,
    canUndo,
    canRedo,
    undoCanvas,
    redoCanvas
  } = useAppStore()
  
  const [showColorPicker, setShowColorPicker] = useState(false)

  const tools: Array<{
    id: DrawingTool
    icon: React.ElementType
    label: string
  }> = [
    { id: 'brush', icon: Paintbrush, label: '画笔' },
    { id: 'eraser', icon: Eraser, label: '橡皮擦' }
  ]

  const ratioOptions: Array<{
    id: AspectRatio
    label: string
    icon: React.ElementType
  }> = [
    { id: '1:1', label: '1:1', icon: Square },
    { id: '3:4', label: '3:4', icon: Tablet },
    { id: '4:3', label: '4:3', icon: RectangleHorizontal },
    { id: '9:16', label: '9:16', icon: Smartphone },
    { id: '16:9', label: '16:9', icon: Monitor }
  ]

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-xl border border-neutral-200 shadow-sm">
      {/* Tool Selection */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-neutral-700">工具</h3>
        <div className="grid grid-cols-2 gap-2">
          {tools.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setCanvasTool(id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
                "border text-sm font-medium",
                currentTool === id ? [
                  "bg-banana-400 border-banana-500 text-white",
                  "shadow-md"
                ] : [
                  "bg-white border-neutral-300 text-neutral-700",
                  "hover:bg-neutral-50 hover:border-neutral-400"
                ]
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Brush Size (only show for brush tool) */}
      {currentTool === 'brush' && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-neutral-700">画笔大小</h3>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="50"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-neutral-600 w-8">{brushSize}</span>
          </div>
          <div className="flex justify-between text-xs text-neutral-500">
            <span>细</span>
            <span>粗</span>
          </div>
        </div>
      )}

      {/* Eraser Size (only show for eraser tool) */}
      {currentTool === 'eraser' && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-neutral-700">橡皮擦大小</h3>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="5"
              max="100"
              value={eraserSize}
              onChange={(e) => setEraserSize(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-neutral-600 w-8">{eraserSize}</span>
          </div>
        </div>
      )}

      {/* Color Picker */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-neutral-700">颜色</h3>
        <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="w-full h-12 rounded-lg border-2 border-neutral-300 flex items-center gap-3 px-3 hover:border-neutral-400 transition-colors"
          >
            <div 
              className="w-8 h-8 rounded-md border border-neutral-300"
              style={{ backgroundColor: currentColor }}
            />
            <span className="text-sm text-neutral-600">{currentColor}</span>
            <Palette className="w-4 h-4 ml-auto text-neutral-500" />
          </button>
          
          {showColorPicker && (
            <div className="absolute top-full mt-2 z-50">
              <div 
                className="fixed inset-0" 
                onClick={() => setShowColorPicker(false)}
              />
              <ChromePicker
                color={currentColor}
                onChange={(color) => setCanvasColor(color.hex)}
                disableAlpha
              />
            </div>
          )}
        </div>

        {/* Quick Colors */}
        <div className="flex gap-2">
          {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'].map(color => (
            <button
              key={color}
              onClick={() => setCanvasColor(color)}
              className={cn(
                "w-8 h-8 rounded-md border-2 transition-all",
                currentColor === color ? "border-neutral-800 scale-110" : "border-neutral-300"
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Aspect Ratio */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-neutral-700">画布比例</h3>
        <div className="grid grid-cols-2 gap-1">
          {ratioOptions.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setAspectRatio(id)}
              className={cn(
                "flex items-center justify-center gap-1 px-2 py-1.5 rounded-md transition-all",
                "border text-xs font-medium",
                aspectRatio === id ? [
                  "bg-banana-50 border-banana-400 text-banana-700",
                  "shadow-sm"
                ] : [
                  "bg-white border-neutral-200 text-neutral-600",
                  "hover:bg-neutral-50 hover:border-neutral-300"
                ]
              )}
            >
              <Icon className="w-3 h-3" />
              <span>{label}</span>
            </button>
          ))}
          <button
            onClick={() => setAspectRatio('custom')}
            className={cn(
              "flex items-center justify-center gap-1 px-2 py-1.5 rounded-md transition-all",
              "border text-xs font-medium",
              aspectRatio === 'custom' ? [
                "bg-banana-50 border-banana-400 text-banana-700",
                "shadow-sm"
              ] : [
                "bg-white border-neutral-200 text-neutral-600",
                "hover:bg-neutral-50 hover:border-neutral-300"
              ]
            )}
          >
            <Settings className="w-3 h-3" />
            <span>自定义</span>
          </button>
        </div>
        <div className="text-xs text-neutral-500 text-center">
          {canvasWidth} × {canvasHeight}
        </div>
      </div>

      {/* History Controls */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-neutral-700">历史</h3>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (canUndo()) {
                const newIndex = historyIndex - 1
                undoCanvas()
                // Trigger canvas restoration
                const canvas = document.querySelector('canvas') as HTMLCanvasElement
                const context = canvas?.getContext('2d')
                if (canvas && context && history[newIndex]) {
                  const img = new Image()
                  img.onload = () => {
                    context.clearRect(0, 0, canvas.width, canvas.height)
                    context.fillStyle = '#ffffff'
                    context.fillRect(0, 0, canvas.width, canvas.height)
                    context.drawImage(img, 0, 0)
                  }
                  img.src = history[newIndex]
                }
              }
            }}
            disabled={!canUndo()}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg",
              "border text-sm font-medium transition-all",
              canUndo() ? [
                "bg-white border-neutral-300 text-neutral-700",
                "hover:bg-neutral-50 hover:border-neutral-400",
                "active:scale-95 active:bg-neutral-100"
              ] : [
                "bg-neutral-100 border-neutral-200 text-neutral-400",
                "cursor-not-allowed"
              ]
            )}
          >
            <Undo2 className="w-4 h-4" />
            撤销
          </button>
          <button
            onClick={() => {
              if (canRedo()) {
                const newIndex = historyIndex + 1
                redoCanvas()
                // Trigger canvas restoration
                const canvas = document.querySelector('canvas') as HTMLCanvasElement
                const context = canvas?.getContext('2d')
                if (canvas && context && history[newIndex]) {
                  const img = new Image()
                  img.onload = () => {
                    context.clearRect(0, 0, canvas.width, canvas.height)
                    context.fillStyle = '#ffffff'
                    context.fillRect(0, 0, canvas.width, canvas.height)
                    context.drawImage(img, 0, 0)
                  }
                  img.src = history[newIndex]
                }
              }
            }}
            disabled={!canRedo()}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg",
              "border text-sm font-medium transition-all",
              canRedo() ? [
                "bg-white border-neutral-300 text-neutral-700",
                "hover:bg-neutral-50 hover:border-neutral-400",
                "active:scale-95 active:bg-neutral-100"
              ] : [
                "bg-neutral-100 border-neutral-200 text-neutral-400",
                "cursor-not-allowed"
              ]
            )}
          >
            <Redo2 className="w-4 h-4" />
            重做
          </button>
        </div>
      </div>
    </div>
  )
}