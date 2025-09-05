'use client'

import { useState } from 'react'
import { Monitor, Smartphone, ChevronRight } from 'lucide-react'

export default function MobileWarning() {
  const [showAnyway, setShowAnyway] = useState(false)

  if (showAnyway) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[10000] bg-gradient-to-br from-yellow-50 via-white to-orange-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 text-6xl animate-bounce-slow opacity-20">🍌</div>
        <div className="absolute top-40 right-20 text-4xl animate-spin-slow opacity-20">🍌</div>
        <div className="absolute bottom-20 left-1/4 text-5xl animate-wobble opacity-20">🍌</div>
        <div className="absolute bottom-40 right-1/3 text-3xl animate-pulse-slow opacity-20">🍌</div>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          {/* Animated banana */}
          <div className="text-center mb-8">
            <div className="inline-block relative">
              <div className="text-8xl animate-wobble">🍌</div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
            哎呀，这个香蕉太大了！
          </h1>

          {/* Main message */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2 border-yellow-200/50 mb-6">
            <p className="text-gray-700 text-center mb-4 text-lg">
              剥香蕉需要用<span className="font-semibold text-yellow-600">大屏幕</span>才能施展哦！
            </p>
            
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="flex flex-col items-center">
                <Smartphone className="w-12 h-12 text-red-400 mb-2" />
                <span className="text-xs text-gray-500">手机/平板</span>
                <span className="text-xl">❌</span>
              </div>
              
              <ChevronRight className="w-6 h-6 text-gray-400" />
              
              <div className="flex flex-col items-center">
                <Monitor className="w-12 h-12 text-green-500 mb-2" />
                <span className="text-xs text-gray-500">电脑</span>
                <span className="text-xl">✅</span>
              </div>
            </div>

            <div className="border-t border-yellow-200 pt-4">
              <p className="text-sm text-gray-600 text-center mb-2">
                🎨 画布编辑需要精确的鼠标控制
              </p>
              <p className="text-sm text-gray-600 text-center mb-2">
                🖱️ 拖拽、绘画等功能需要桌面环境
              </p>
              <p className="text-sm text-gray-600 text-center">
                💻 请使用电脑浏览器访问获得最佳体验
              </p>
            </div>
          </div>

          {/* URL display */}
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-4 mb-6">
            <p className="text-xs text-gray-600 text-center mb-2">在电脑浏览器中访问：</p>
            <div className="bg-white rounded-lg px-4 py-2 text-center font-mono text-sm text-gray-800 border border-yellow-300">
              https://peel-a-banana.vercel.app/
            </div>
          </div>

          {/* Force continue button (not recommended) */}
          <div className="text-center">
            <button
              onClick={() => setShowAnyway(true)}
              className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors"
            >
              仍要继续（不推荐）
            </button>
          </div>

          {/* Fun tip */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              💡 小贴士：香蕉在大屏幕上剥起来更过瘾！
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}