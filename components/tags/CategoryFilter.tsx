'use client'

import { cn } from '@/lib/utils'

interface Category {
  id: string
  label: string
  emoji: string
}

const categories: Category[] = [
  { id: 'all', label: '全部', emoji: '🎯' },
  { id: 'character', label: '人物', emoji: '👤' },
  { id: 'fun', label: '趣味', emoji: '🎪' },
  { id: 'scene', label: '场景', emoji: '🌍' },
  { id: 'art', label: '艺术', emoji: '🎨' },
  { id: 'effect', label: '特效', emoji: '✨' },
]

interface CategoryFilterProps {
  activeCategory: string
  onCategoryChange: (category: string) => void
}

export default function CategoryFilter({ 
  activeCategory, 
  onCategoryChange 
}: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      <span className="text-sm text-neutral-600 mr-2">分类:</span>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-full",
            "text-sm font-medium whitespace-nowrap",
            "transition-all duration-200",
            activeCategory === category.id ? [
              "bg-gradient-to-r from-banana-400 to-banana-500",
              "text-white shadow-md",
              "scale-105"
            ] : [
              "bg-white border border-neutral-200",
              "text-neutral-700 hover:text-banana-600",
              "hover:border-banana-300 hover:bg-banana-50"
            ]
          )}
        >
          <span className="text-sm">{category.emoji}</span>
          <span>{category.label}</span>
        </button>
      ))}
    </div>
  )
}