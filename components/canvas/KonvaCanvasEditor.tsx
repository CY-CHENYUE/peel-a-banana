'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Stage, Layer, Line, Rect, Image as KImage, Transformer } from 'react-konva'
import Konva from 'konva'
import useAppStore from '@/stores/useAppStore'
import { cn } from '@/lib/utils'
import PeelingBananaLoader from './PeelingBananaLoader'

interface KonvaCanvasEditorProps {
  className?: string
}

// 单独的图片组件，用于处理图片加载和变换
const URLImage = ({ image, isSelected, onSelect, onChange }: any) => {
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const imageRef = useRef<any>()
  const trRef = useRef<any>()

  useEffect(() => {
    const loadImage = () => {
      const img = new Image()
      img.src = image.src
      img.onload = () => {
        setImg(img)
      }
    }
    loadImage()
  }, [image.src])

  useEffect(() => {
    if (isSelected && trRef.current) {
      // 附加变换器
      trRef.current.nodes([imageRef.current])
      trRef.current.getLayer().batchDraw()
    }
  }, [isSelected])

  return (
    <>
      {img && (
        <>
          <KImage
            image={img}
            x={image.x}
            y={image.y}
            width={image.width}
            height={image.height}
            ref={imageRef}
            draggable
            onClick={onSelect}
            onTap={onSelect}
            onDragEnd={(e) => {
              onChange({
                ...image,
                x: e.target.x(),
                y: e.target.y(),
              })
            }}
            onTransformEnd={(e) => {
              const node = imageRef.current
              const scaleX = node.scaleX()
              const scaleY = node.scaleY()

              // 重置缩放，将其应用到宽高
              node.scaleX(1)
              node.scaleY(1)
              
              onChange({
                ...image,
                x: node.x(),
                y: node.y(),
                width: Math.max(5, node.width() * scaleX),
                height: Math.max(5, node.height() * scaleY),
              })
            }}
          />
          {isSelected && (
            <Transformer
              ref={trRef}
              boundBoxFunc={(oldBox, newBox) => {
                // 限制最小尺寸
                if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
                  return oldBox
                }
                return newBox
              }}
            />
          )}
        </>
      )}
    </>
  )
}

export default function KonvaCanvasEditor({ className }: KonvaCanvasEditorProps) {
  const {
    canvas: {
      canvasWidth,
      canvasHeight,
      currentTool,
      brushSize,
      currentColor,
      eraserSize,
      aspectRatio,
    },
    targetWidth,
    targetHeight,
    uploadedImages,
    setCanvasDataURL,
    addToCanvasHistory,
    generatedImage,
    setGeneratedImage,
    isGenerating,
  } = useAppStore()

  const stageRef = useRef<Konva.Stage>(null)
  const isDrawing = useRef(false)
  const [lines, setLines] = useState<any[]>([])
  const [images, setImages] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [processedImageIds, setProcessedImageIds] = useState<Set<string>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)

  // 切换工具时取消选择
  useEffect(() => {
    if (currentTool !== 'select') {
      setSelectedId(null)
    }
  }, [currentTool])

  // 监听上传的图片，自动添加到画布
  useEffect(() => {
    uploadedImages.forEach((uploadedImg, index) => {
      if (!processedImageIds.has(uploadedImg.id)) {
        // 创建 Image 对象以获取原始尺寸
        const img = new Image()
        img.src = uploadedImg.preview
        img.onload = () => {
          // 计算等比例缩放的尺寸
          const maxSize = 200
          const ratio = img.width / img.height
          let width, height
          
          if (ratio > 1) {
            // 横向图片：宽度为最大值，高度按比例缩放
            width = maxSize
            height = maxSize / ratio
          } else {
            // 纵向图片：高度为最大值，宽度按比例缩放
            height = maxSize
            width = maxSize * ratio
          }
          
          // 固定位置：堆叠排列，每张图片偏移30像素
          const baseX = 50
          const baseY = 50
          const offset = index * 30
          
          const newImage = {
            id: uploadedImg.id,
            src: uploadedImg.preview,
            x: Math.min(baseX + offset, canvasWidth - width - 50), // 确保不超出右边界
            y: Math.min(baseY + offset, canvasHeight - height - 50), // 确保不超出下边界
            width: width,
            height: height,
          }
          setImages(prev => [...prev, newImage])
          setProcessedImageIds(prev => new Set(prev).add(uploadedImg.id))
          // 等待渲染完成后保存状态
          setTimeout(() => {
            if (stageRef.current) {
              const dataURL = stageRef.current.toDataURL()
              setCanvasDataURL(dataURL)
              addToCanvasHistory(dataURL)
            }
          }, 100)
        }
      }
    })
  }, [uploadedImages, canvasWidth, canvasHeight, processedImageIds, setCanvasDataURL, addToCanvasHistory])

  // 处理鼠标/触摸事件（绘画）
  const handleMouseDown = (e: any) => {
    if (currentTool !== 'brush' && currentTool !== 'eraser') return
    
    isDrawing.current = true
    const pos = e.target.getStage().getPointerPosition()
    setLines([...lines, { 
      tool: currentTool, 
      points: [pos.x, pos.y],
      color: currentTool === 'eraser' ? '#ffffff' : currentColor,
      width: currentTool === 'eraser' ? eraserSize : brushSize,
    }])
  }

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current) return
    if (currentTool !== 'brush' && currentTool !== 'eraser') return

    const stage = e.target.getStage()
    const point = stage.getPointerPosition()
    const lastLine = lines[lines.length - 1]
    
    // 添加点到最后一条线
    lastLine.points = lastLine.points.concat([point.x, point.y])
    
    // 更新线条
    lines.splice(lines.length - 1, 1, lastLine)
    setLines(lines.concat())
  }

  const handleMouseUp = () => {
    if (isDrawing.current) {
      isDrawing.current = false
      // 保存状态
      saveCanvasState()
    }
  }

  // 保存画布状态
  const saveCanvasState = useCallback(() => {
    if (stageRef.current) {
      // 保存前先取消选择，避免选择框被保存
      const previousSelectedId = selectedId
      setSelectedId(null)
      
      // 等待一帧让UI更新
      setTimeout(() => {
        if (stageRef.current) {
          const dataURL = stageRef.current.toDataURL()
          setCanvasDataURL(dataURL)
          addToCanvasHistory(dataURL)
          // 如果需要，可以恢复选择（可选）
          // setSelectedId(previousSelectedId)
        }
      }, 0)
    }
  }, [setCanvasDataURL, addToCanvasHistory, selectedId])
  
  // 初始化时保存空白画布
  useEffect(() => {
    // 组件挂载后保存初始空白画布
    setTimeout(() => {
      if (stageRef.current) {
        const currentDataURL = useAppStore.getState().canvasDataURL
        if (!currentDataURL) {
          saveCanvasState()
        }
      }
    }, 500)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  
  // 处理删除（Delete键）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedId) {
        setImages(images.filter(img => img.id !== selectedId))
        setSelectedId(null)
        // 删除后保存状态
        setTimeout(() => saveCanvasState(), 100)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedId, images, saveCanvasState])

  // 清空画布
  const clearCanvas = useCallback(() => {
    setLines([])
    setImages([])
    setProcessedImageIds(new Set())
    saveCanvasState()
  }, [saveCanvasState])

  // 导出画布
  const exportCanvas = useCallback(() => {
    if (!stageRef.current) return
    
    const dataURL = stageRef.current.toDataURL()
    const link = document.createElement('a')
    link.download = `canvas-${Date.now()}.png`
    link.href = dataURL
    link.click()
  }, [])

  // 处理生成的图片
  useEffect(() => {
    if (generatedImage) {
      // 不清空现有内容，采用叠加模式
      // 可以选择性地清空绘画线条，保留图片
      // setLines([])  // 如果需要清空手绘内容，可以取消注释
      
      // 按比例缩放图片以适应画布，保持宽高比
      // 使用目标尺寸来计算正确的显示比例
      const scale = Math.min(canvasWidth / targetWidth, canvasHeight / targetHeight)
      const displayWidth = targetWidth * scale
      const displayHeight = targetHeight * scale
      
      // 居中显示
      const x = (canvasWidth - displayWidth) / 2
      const y = (canvasHeight - displayHeight) / 2
      
      const newImage = {
        id: `generated-${Date.now()}`,
        src: generatedImage,
        x: x,
        y: y,
        width: displayWidth,
        height: displayHeight,
      }
      
      console.log(`Adding generated image: ${targetWidth}x${targetHeight} -> ${displayWidth}x${displayHeight} at (${x}, ${y})`)
      
      // 添加到现有图片列表，而不是替换
      setImages(prev => [...prev, newImage])
      setGeneratedImage(null)
      saveCanvasState()
    }
  }, [generatedImage, canvasWidth, canvasHeight, targetWidth, targetHeight, setGeneratedImage, saveCanvasState])

  // 暴露方法给父组件（用于工具栏）
  useEffect(() => {
    // 将清空和导出功能绑定到window对象（临时方案）
    ;(window as any).canvasClear = clearCanvas
    ;(window as any).canvasExport = exportCanvas
    
    return () => {
      delete (window as any).canvasClear
      delete (window as any).canvasExport
    }
  }, [clearCanvas, exportCanvas])

  // 点击舞台空白处取消选择
  const checkDeselect = (e: any) => {
    // 点击空白处或背景层
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.className === 'Rect'
    if (clickedOnEmpty) {
      setSelectedId(null)
    }
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative flex items-center justify-center",
        "w-full h-full",
        className
      )}
    >
      {/* Konva Stage - Fixed size */}
      <div 
        className="bg-white rounded-xl shadow-2xl overflow-hidden inline-block"
      >
        <Stage
          width={canvasWidth}
          height={canvasHeight}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchmove={handleMouseMove}
          onTouchend={handleMouseUp}
          onClick={checkDeselect}
          onTap={checkDeselect}
          ref={stageRef}
          style={{ cursor: currentTool === 'brush' || currentTool === 'eraser' ? 'crosshair' : 'default' }}
        >
          {/* 背景层 */}
          <Layer>
            <Rect fill="white" width={canvasWidth} height={canvasHeight} />
          </Layer>

          {/* 图片层 */}
          <Layer>
            {images.map((image) => (
              <URLImage
                key={image.id}
                image={image}
                isSelected={image.id === selectedId}
                onSelect={() => {
                  if (currentTool === 'select') {
                    setSelectedId(image.id)
                  }
                }}
                onChange={(newAttrs: any) => {
                  const imgs = images.slice()
                  const index = imgs.findIndex(img => img.id === image.id)
                  imgs[index] = newAttrs
                  setImages(imgs)
                  // 变换后保存状态
                  setTimeout(() => saveCanvasState(), 100)
                }}
              />
            ))}
          </Layer>

          {/* 绘画层 */}
          <Layer>
            {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={line.color}
                strokeWidth={line.width}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={
                  line.tool === 'eraser' ? 'destination-out' : 'source-over'
                }
              />
            ))}
          </Layer>
        </Stage>
      </div>

      {/* 生成中的加载动画 */}
      {isGenerating && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-20">
          <PeelingBananaLoader />
        </div>
      )}

      {/* Status Bar - 放在画布内部 */}
      <div 
        className="absolute flex items-center gap-3 pointer-events-none"
        style={{ bottom: '10px', left: '10px' }}
      >
        <span className="text-xs text-neutral-500">
          {aspectRatio} ({targetWidth}×{targetHeight})
        </span>
        <span className="text-xs text-neutral-400">·</span>
        <span className="text-xs text-neutral-500">
          {currentTool === 'select' ? '选择模式' : currentTool === 'brush' ? '绘画模式' : '橡皮擦模式'}
        </span>
      </div>
    </div>
  )
}