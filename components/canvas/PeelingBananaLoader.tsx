'use client'

import { useEffect, useState } from 'react'

export default function PeelingBananaLoader() {
  const [dotIndex, setDotIndex] = useState(0)
  
  // 动画循环
  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDotIndex((prev) => (prev + 1) % 4)
    }, 500)
    
    return () => {
      clearInterval(dotInterval)
    }
  }, [])
  
  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 rounded-xl">
      {/* 全屏毛玻璃背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/80 via-white/70 to-orange-50/80 backdrop-blur-md rounded-xl" />
      
      {/* 主要内容区 */}
      <div className="relative flex flex-col items-center gap-12">
        {/* 猴子圆形轨迹动画 */}
        <div className="relative w-48 h-48">
          {/* 轨迹圆圈 */}
          <div className="absolute inset-4 rounded-full border-2 border-yellow-200/30" />
          
          {/* 旋转的猴子 */}
          <div className="absolute inset-0 animate-spin-slow">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="text-6xl animate-bounce-slow">🐵</div>
            </div>
          </div>
          
          {/* 中心装饰 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-200/20 to-orange-200/20 animate-pulse" />
          </div>
          
          {/* 对称的香蕉 - 4个方向 */}
          <div className="absolute inset-0">
            {/* 上 */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl opacity-60 animate-pulse" style={{ animationDelay: '0s' }}>🍌</div>
            {/* 右 */}
            <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 text-3xl opacity-60 animate-pulse" style={{ animationDelay: '0.25s' }}>🍌</div>
            {/* 下 */}
            <div className="absolute bottom-0 left-1/2 translate-y-1/2 -translate-x-1/2 text-3xl opacity-60 animate-pulse" style={{ animationDelay: '0.5s' }}>🍌</div>
            {/* 左 */}
            <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 text-3xl opacity-60 animate-pulse" style={{ animationDelay: '0.75s' }}>🍌</div>
          </div>
        </div>
        
        {/* 极简加载指示器 */}
        <div className="flex gap-2">
          <span className={`w-2 h-2 rounded-full bg-yellow-400 transition-all duration-300 ${dotIndex === 0 ? 'scale-150 opacity-100' : 'scale-100 opacity-40'}`} />
          <span className={`w-2 h-2 rounded-full bg-yellow-400 transition-all duration-300 ${dotIndex === 1 ? 'scale-150 opacity-100' : 'scale-100 opacity-40'}`} />
          <span className={`w-2 h-2 rounded-full bg-yellow-400 transition-all duration-300 ${dotIndex === 2 ? 'scale-150 opacity-100' : 'scale-100 opacity-40'}`} />
          <span className={`w-2 h-2 rounded-full bg-yellow-400 transition-all duration-300 ${dotIndex === 3 ? 'scale-150 opacity-100' : 'scale-100 opacity-40'}`} />
        </div>
      </div>
    </div>
  )
}