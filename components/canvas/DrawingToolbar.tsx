'use client'

import { useState } from 'react'
import { 
  Paintbrush, 
  Eraser,
  Undo2,
  Redo2,
  Square,
  Smartphone,
  Monitor,
  Tablet,
  RectangleHorizontal,
  Trash2,
  Download,
  Palette,
  MousePointer
} from 'lucide-react'
import { ChromePicker } from 'react-color'
import useAppStore from '@/stores/useAppStore'
import { cn } from '@/lib/utils'
import { DrawingTool, AspectRatio } from '@/types'
import Portal from '@/components/ui/Portal'

export default function DrawingToolbar() {
  const {
    canvas: { currentTool, brushSize, eraserSize, currentColor, aspectRatio, history, historyIndex },
    setCanvasTool,
    setBrushSize,
    setEraserSize,
    setCanvasColor,
    setAspectRatio,
    canUndo,
    canRedo,
    undoCanvas,
    redoCanvas,
    setCanvasDataURL,
    addToCanvasHistory
  } = useAppStore()
  
  const [showBrushSize, setShowBrushSize] = useState(false)
  const [showEraserSize, setShowEraserSize] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showRatios, setShowRatios] = useState(false)

  const tools: Array<{
    id: DrawingTool
    icon: React.ElementType
    label: string
    onClick?: () => void
  }> = [
    {
      id: 'select',
      icon: MousePointer,
      label: '选择',
      onClick: () => {
        setCanvasTool('select')
        setShowBrushSize(false)
        setShowEraserSize(false)
      }
    },
    { 
      id: 'brush', 
      icon: Paintbrush, 
      label: '画笔',
      onClick: () => {
        setCanvasTool('brush')
        setShowBrushSize(!showBrushSize)
        setShowEraserSize(false)
      }
    },
    { 
      id: 'eraser', 
      icon: Eraser, 
      label: '橡皮擦',
      onClick: () => {
        setCanvasTool('eraser')
        setShowEraserSize(!showEraserSize)
        setShowBrushSize(false)
      }
    },
  ]

  const actionTools = [
    { 
      id: 'undo', 
      icon: Undo2, 
      label: '撤销',
      onClick: () => {
        // 使用 KonvaCanvasEditor 暴露的撤销方法
        if ((window as unknown as {canvasUndo?: () => void}).canvasUndo) {
          (window as unknown as {canvasUndo: () => void}).canvasUndo()
        }
      },
      disabled: !canUndo()
    },
    { 
      id: 'redo', 
      icon: Redo2, 
      label: '重做',
      onClick: () => {
        // 使用 KonvaCanvasEditor 暴露的重做方法
        if ((window as unknown as {canvasRedo?: () => void}).canvasRedo) {
          (window as unknown as {canvasRedo: () => void}).canvasRedo()
        }
      },
      disabled: !canRedo()
    }
  ]

  const canvasActions = [
    { 
      id: 'clear', 
      icon: Trash2, 
      label: '清空',
      onClick: () => {
        // Try Konva's clear method first, fallback to native canvas
        if ((window as unknown as {canvasClear?: () => void}).canvasClear) {
          (window as unknown as {canvasClear: () => void}).canvasClear()
        } else {
          const canvas = document.querySelector('canvas') as HTMLCanvasElement
          const context = canvas?.getContext('2d')
          if (canvas && context) {
            context.clearRect(0, 0, canvas.width, canvas.height)
            context.fillStyle = '#ffffff'
            context.fillRect(0, 0, canvas.width, canvas.height)
            
            // Save the cleared state to store
            const dataURL = canvas.toDataURL()
            addToCanvasHistory(dataURL)
            setCanvasDataURL(dataURL)
          }
        }
      }
    },
    { 
      id: 'export', 
      icon: Download, 
      label: '导出',
      onClick: () => {
        // Try Konva's export method first, fallback to native canvas
        if ((window as unknown as {canvasExport?: () => void}).canvasExport) {
          (window as unknown as {canvasExport: () => void}).canvasExport()
        } else {
          const canvas = document.querySelector('canvas') as HTMLCanvasElement
          if (canvas) {
            const dataURL = canvas.toDataURL('image/png')
            const link = document.createElement('a')
            link.download = 'peel-a-banana-canvas.png'
            link.href = dataURL
            link.click()
          }
        }
      }
    }
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

  const quickColors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF']

  return (
    <div className="flex flex-col items-center gap-4 px-2 relative z-50">
      {/* Drawing Tools */}
      <div className="space-y-1">
        {tools.map(({ id, icon: Icon, label, onClick }) => (
          <div key={id} className="relative">
            <button
              onClick={onClick}
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200",
                "border-2 bg-white hover:bg-gradient-to-br hover:from-yellow-50 hover:to-orange-50 group",
                "text-neutral-600 hover:text-neutral-800 shadow-sm hover:shadow-md",
                currentTool === id ? 
                  "bg-gradient-to-br from-yellow-400 to-orange-400 text-white border-yellow-400 shadow-lg scale-105" :
                  "border-yellow-200/50"
              )}
              title={label}
            >
              <Icon className="w-5 h-5" />
            </button>
            
            {/* Brush Size Popup */}
            {id === 'brush' && showBrushSize && currentTool === 'brush' && (
              <Portal>
                <div 
                  className="fixed inset-0 z-[9998]" 
                  onClick={() => setShowBrushSize(false)}
                />
                <div className="fixed z-[9999] w-48" style={{ left: '6rem', top: '100px' }}>
                  <div className="bg-white rounded-lg shadow-xl p-3 border-2 border-neutral-300">
                    <div className="text-sm font-semibold text-neutral-800 mb-2">画笔大小</div>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-xs font-medium text-neutral-700 text-center mt-1">{brushSize}px</div>
                  </div>
                </div>
              </Portal>
            )}
            
            {/* Eraser Size Popup */}
            {id === 'eraser' && showEraserSize && currentTool === 'eraser' && (
              <Portal>
                <div 
                  className="fixed inset-0 z-[9998]" 
                  onClick={() => setShowEraserSize(false)}
                />
                <div className="fixed z-[9999] w-48" style={{ left: '6rem', top: '160px' }}>
                  <div className="bg-white rounded-lg shadow-xl p-3 border-2 border-neutral-300">
                    <div className="text-sm font-semibold text-neutral-800 mb-2">橡皮擦大小</div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={eraserSize}
                      onChange={(e) => setEraserSize(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-xs font-medium text-neutral-700 text-center mt-1">{eraserSize}px</div>
                  </div>
                </div>
              </Portal>
            )}
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="w-12 h-px bg-gradient-to-r from-transparent via-yellow-300 to-transparent" />

      {/* History Actions */}
      <div className="space-y-1">
        {actionTools.map(({ id, icon: Icon, label, onClick, disabled }) => (
          <div key={id} className="relative">
            <button
              onClick={onClick}
              disabled={disabled}
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group",
                "border-2 border-yellow-200/50 bg-white text-neutral-600 shadow-sm",
                disabled ? "opacity-30 cursor-not-allowed" : "hover:bg-gradient-to-br hover:from-yellow-50 hover:to-orange-50 hover:shadow-md hover:text-neutral-800"
              )}
              title={label}
            >
              <Icon className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="w-12 h-px bg-gradient-to-r from-transparent via-yellow-300 to-transparent" />

      {/* Color Picker */}
      <div className="relative">
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="w-12 h-12 rounded-xl border-2 border-yellow-200/50 cursor-pointer hover:border-yellow-300 transition-all duration-200 group shadow-md hover:shadow-lg hover:scale-105"
          style={{ backgroundColor: currentColor }}
          title="选择颜色"
        />
        
        {/* Color Picker Popup */}
        {showColorPicker && (
          <Portal>
            <div 
              className="fixed inset-0 z-[9998]" 
              onClick={() => setShowColorPicker(false)}
            />
            <div className="fixed z-[9999]" style={{ left: '6rem', top: '50%', transform: 'translateY(-50%)' }}>
              <div className="bg-white rounded-lg shadow-xl p-4 border-2 border-neutral-300">
                <div className="text-base font-semibold text-neutral-800 mb-3">选择颜色</div>
                
                {/* Quick Colors */}
                <div className="mb-4">
                  <div className="text-xs font-medium text-neutral-600 mb-2">快速选择</div>
                  <div className="flex gap-1.5">
                    {quickColors.map(color => (
                      <button
                        key={color}
                        onClick={() => {
                          setCanvasColor(color)
                          setShowColorPicker(false)
                        }}
                        className={cn(
                          "w-7 h-7 rounded-md border-2 transition-all hover:scale-110",
                          currentColor === color ? "border-yellow-400 shadow-md" : "border-neutral-300"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Color Picker */}
                <div className="border-t pt-3">
                  <ChromePicker
                    color={currentColor}
                    onChange={(color) => setCanvasColor(color.hex)}
                    disableAlpha
                  />
                </div>
                
                {/* Current Color Display */}
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="font-medium text-neutral-600">当前颜色</span>
                  <span className="font-mono font-semibold text-neutral-800">{currentColor}</span>
                </div>
              </div>
            </div>
          </Portal>
        )}
      </div>

      {/* Divider */}
      <div className="w-12 h-px bg-gradient-to-r from-transparent via-yellow-300 to-transparent" />

      {/* Aspect Ratio Button */}
      <div className="relative">
        <button
          onClick={() => setShowRatios(!showRatios)}
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group",
            "border-2 border-yellow-200/50 bg-white hover:bg-gradient-to-br hover:from-yellow-50 hover:to-orange-50 text-neutral-600 shadow-sm hover:shadow-md",
            showRatios && "bg-gradient-to-br from-yellow-100 to-orange-100 border-yellow-400 scale-105"
          )}
          title={`比例: ${aspectRatio}`}
        >
          {ratioOptions.find(r => r.id === aspectRatio)?.icon && (
            <>
              {(() => {
                const Icon = ratioOptions.find(r => r.id === aspectRatio)!.icon
                return <Icon className="w-5 h-5" />
              })()}
            </>
          )}
        </button>
        
        {/* Ratio Picker Popup */}
        {showRatios && (
          <Portal>
            <div 
              className="fixed inset-0 z-[9998]" 
              onClick={() => setShowRatios(false)}
            />
            <div className="fixed z-[9999]" style={{ left: '6rem', bottom: '10rem' }}>
              <div className="bg-white rounded-lg shadow-xl p-3 border-2 border-neutral-300">
                <div className="text-sm font-semibold text-neutral-800 mb-2">选择比例</div>
                <div className="space-y-1">
                  {ratioOptions.map(({ id, icon: Icon, label }) => (
                    <button
                      key={id}
                      onClick={() => {
                        setAspectRatio(id)
                        setShowRatios(false)
                      }}
                      className={cn(
                        "w-full px-3 py-2 rounded-lg flex items-center gap-2 transition-all",
                        "border border-neutral-200 hover:bg-neutral-50",
                        aspectRatio === id && "bg-yellow-400 text-white border-yellow-400"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-xs font-semibold">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Portal>
        )}
      </div>

      {/* Divider */}
      <div className="w-12 h-px bg-gradient-to-r from-transparent via-yellow-300 to-transparent" />

      {/* Canvas Actions */}
      <div className="space-y-1">
        {canvasActions.map(({ id, icon: Icon, label, onClick }) => (
          <div key={id} className="relative">
            <button
              onClick={onClick}
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 border-2 border-yellow-200/50 bg-white hover:bg-gradient-to-br hover:from-yellow-50 hover:to-orange-50 group text-neutral-600 shadow-sm hover:shadow-md hover:scale-105"
              title={label}
            >
              <Icon className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}