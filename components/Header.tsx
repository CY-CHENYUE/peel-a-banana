'use client'

import { History, BookOpen, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeaderProps {
  onHistoryClick?: () => void
  onTutorialClick?: () => void
  onAboutClick?: () => void
}

export default function Header({ 
  onHistoryClick, 
  onTutorialClick, 
  onAboutClick 
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-banana-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-3xl">🍌</span>
            <h1 className="text-xl font-bold bg-gradient-to-r from-banana-400 to-banana-600 bg-clip-text text-transparent">
              Peel a Banana
            </h1>
            <span className="text-xs text-neutral-500 ml-2">剥开图像编辑创意的新维度</span>
          </div>
          
          {/* Navigation */}
          <nav className="flex items-center gap-2">
            <button
              onClick={onHistoryClick}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "text-neutral-700 hover:text-banana-600",
                "hover:bg-banana-50 transition-colors",
                "text-sm font-medium"
              )}
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">历史</span>
            </button>
            
            <button
              onClick={onTutorialClick}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "text-neutral-700 hover:text-banana-600",
                "hover:bg-banana-50 transition-colors",
                "text-sm font-medium"
              )}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">教程</span>
            </button>
            
            <button
              onClick={onAboutClick}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "text-neutral-700 hover:text-banana-600",
                "hover:bg-banana-50 transition-colors",
                "text-sm font-medium"
              )}
            >
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">关于</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}