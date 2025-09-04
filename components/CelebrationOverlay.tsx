'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface CelebrationOverlayProps {
  show: boolean
  onComplete?: () => void
}

export default function CelebrationOverlay({ show, onComplete }: CelebrationOverlayProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [bananas, setBananas] = useState<Array<{ id: number; left: number; delay: number; size: string; duration: number }>>([])

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      
      // 生成随机香蕉 - 增加到50个！
      const newBananas = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100, // 0-100% 的随机位置
        delay: Math.random() * 3, // 0-3秒的随机延迟，让香蕉雨持续更久
        size: ['text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl'][Math.floor(Math.random() * 6)],
        duration: 2 + Math.random() * 3, // 2-5秒的掉落时间，速度更多样
      }))
      setBananas(newBananas)

      // 5秒后自动关闭（给更多香蕉时间掉落）
      const timer = setTimeout(() => {
        setIsVisible(false)
        onComplete?.()
      }, 5000)

      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [show, onComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
      {/* 半透明背景 */}
      <div className="absolute inset-0 bg-black/5 animate-fade-in" />

      {/* 香蕉雨 - 壮观的香蕉雨效果 */}
      {bananas.map((banana) => (
        <div
          key={banana.id}
          className={cn(
            "absolute -top-20",
            banana.size,
            "animate-banana-fall",
            "drop-shadow-lg" // 添加阴影让香蕉更立体
          )}
          style={{
            left: `${banana.left}%`,
            animationDelay: `${banana.delay}s`,
            animationDuration: `${banana.duration}s`,
            zIndex: Math.floor(Math.random() * 10), // 随机层级，更有层次感
          }}
        >
          🍌
        </div>
      ))}

      {/* 角落的欢呼猴子 */}
      <div className="absolute bottom-10 right-10 animate-bounce">
        <div className="text-6xl transform rotate-12">🐵</div>
        <div className="text-2xl absolute -top-8 -right-2 animate-pulse">✨</div>
        <div className="text-2xl absolute -top-8 -left-2 animate-pulse" style={{ animationDelay: '0.5s' }}>✨</div>
      </div>
      
      {/* 左下角的猴子 */}
      <div className="absolute bottom-10 left-10 animate-bounce" style={{ animationDelay: '0.3s' }}>
        <div className="text-6xl transform -rotate-12">🙈</div>
        <div className="text-xl absolute -top-6 right-0">🎊</div>
      </div>
    </div>
  )
}