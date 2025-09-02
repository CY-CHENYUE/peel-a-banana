'use client'

import { Square, Smartphone, Monitor, Tablet, RectangleHorizontal, Settings } from 'lucide-react'
import useAppStore from '@/stores/useAppStore'
import { cn } from '@/lib/utils'
import { AspectRatio } from '@/types'

const ratioOptions: Array<{
  id: AspectRatio
  label: string
  icon: React.ElementType
  description: string
}> = [
  { id: '1:1', label: '1:1', icon: Square, description: '正方形' },
  { id: '3:4', label: '3:4', icon: Tablet, description: '竖版' },
  { id: '4:3', label: '4:3', icon: RectangleHorizontal, description: '横版' },
  { id: '9:16', label: '9:16', icon: Smartphone, description: '手机竖屏' },
  { id: '16:9', label: '16:9', icon: Monitor, description: '宽屏' }
]

export default function AspectRatioSelector() {
  const { canvas: { aspectRatio }, setAspectRatio } = useAppStore()

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-neutral-700">画布比例</h3>
        <Settings className="w-4 h-4 text-neutral-400" />
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {ratioOptions.map(({ id, label, icon: Icon, description }) => (
          <button
            key={id}
            onClick={() => setAspectRatio(id)}
            className={cn(
              "flex flex-col items-center gap-1 p-3 rounded-lg transition-all",
              "border text-xs",
              aspectRatio === id ? [
                "bg-banana-50 border-banana-400 text-banana-700",
                "shadow-md"
              ] : [
                "bg-white border-neutral-200 text-neutral-600",
                "hover:bg-neutral-50 hover:border-neutral-300"
              ]
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
            <span className="text-[10px] opacity-75">{description}</span>
          </button>
        ))}
        
        {/* Custom Size Option */}
        <button
          onClick={() => setAspectRatio('custom')}
          className={cn(
            "flex flex-col items-center gap-1 p-3 rounded-lg transition-all",
            "border text-xs",
            aspectRatio === 'custom' ? [
              "bg-banana-50 border-banana-400 text-banana-700",
              "shadow-md"
            ] : [
              "bg-white border-neutral-200 text-neutral-600",
              "hover:bg-neutral-50 hover:border-neutral-300"
            ]
          )}
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">自定义</span>
          <span className="text-[10px] opacity-75">任意尺寸</span>
        </button>
      </div>

      {/* Current Size Display */}
      <div className="mt-3 pt-3 border-t border-neutral-100">
        <div className="flex items-center justify-between text-xs text-neutral-600">
          <span>当前尺寸：</span>
          <span className="font-mono font-medium">
            {useAppStore((state) => state.canvas.canvasWidth)} × {useAppStore((state) => state.canvas.canvasHeight)}
          </span>
        </div>
      </div>
    </div>
  )
}