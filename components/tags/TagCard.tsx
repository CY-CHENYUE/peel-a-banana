'use client'

import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tag } from '@/types'

interface TagCardProps {
  tag: Tag
  isSelected: boolean
  onClick: () => void
}

export default function TagCard({ tag, isSelected, onClick }: TagCardProps) {
  return (
    <button
        onClick={onClick}
        className={cn(
          "relative w-full p-2 rounded-lg",
          "border transition-all duration-200",
          "flex flex-col items-center gap-1",
          "group",
          isSelected ? [
            "bg-gradient-to-br from-banana-400 to-banana-500",
            "border-banana-600 shadow-banana",
            "scale-105"
          ] : [
            "bg-gradient-to-br from-banana-50 to-banana-100",
            "border-transparent hover:border-banana-300",
            "hover:shadow-lg hover:-translate-y-1"
          ]
        )}
      >
        {/* Selected Badge */}
        {isSelected && (
          <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-banana-600 text-white text-xs rounded-full font-semibold">
            已选择
          </span>
        )}

        {/* Content */}
        <span className="text-xl">{tag.emoji}</span>
        <h3 className={cn(
          "font-medium text-xs",
          isSelected ? "text-white" : "text-neutral-800"
        )}>
          {tag.label}
        </h3>
        <span className={cn(
          "text-[10px]",
          isSelected ? "text-banana-100" : "text-neutral-500"
        )}>
          {tag.estimatedTime}
        </span>

        {/* Sparkle Icon for AI */}
        <Sparkles className={cn(
          "absolute top-1 right-1 w-3 h-3",
          isSelected ? "text-banana-200" : "text-banana-400",
          "opacity-50"
        )} />
    </button>
  )
}