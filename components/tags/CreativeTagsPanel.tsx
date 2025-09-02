'use client'

import { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import useAppStore from '@/stores/useAppStore'
import CategoryFilter from './CategoryFilter'
import TagCard from './TagCard'

export default function CreativeTagsPanel() {
  const { 
    tags, 
    selectedTag, 
    activeCategory, 
    setActiveCategory,
    fillPromptFromTag 
  } = useAppStore()
  
  const [showAll, setShowAll] = useState(false)

  // Filter tags by category
  const filteredTags = useMemo(() => {
    if (activeCategory === 'all') return tags
    return tags.filter(tag => tag.category === activeCategory)
  }, [tags, activeCategory])

  // Display tags (limited or all)
  const displayTags = showAll ? filteredTags : filteredTags.slice(0, 4)

  const handleTagClick = (tag: typeof tags[0]) => {
    // Single selection only - no deselection
    fillPromptFromTag(tag)
    
    // Smooth scroll to prompt editor
    const editor = document.getElementById('prompt-editor')
    if (editor) {
      editor.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  if (tags.length === 0) {
    return (
      <div className="w-full p-8 rounded-xl bg-gradient-to-br from-banana-50 to-white border border-banana-200">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-banana-400 mx-auto mb-4" />
          <p className="text-neutral-600">上传图片后，AI 将为您生成创意方案</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-700 flex items-center gap-1">
          <span>🎯</span>
          AI创意方案
        </h3>
        <span className="text-xs text-neutral-500">
          共{filteredTags.length}个
        </span>
      </div>

      {/* Category Filter */}
      <CategoryFilter 
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Tags Grid */}
      <div className="grid grid-cols-2 gap-2">
        {displayTags.map((tag) => (
          <TagCard
            key={tag.id}
            tag={tag}
            isSelected={selectedTag?.id === tag.id}
            onClick={() => handleTagClick(tag)}
          />
        ))}
      </div>

      {/* Show More Button */}
      {filteredTags.length > 4 && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setShowAll(!showAll)}
            className={cn(
              "flex items-center gap-1 px-3 py-1 rounded-full",
              "border border-banana-300 bg-white",
              "text-banana-600 hover:bg-banana-50",
              "transition-all duration-200",
              "text-xs"
            )}
          >
            {showAll ? (
              <>
                <ChevronUp className="w-3 h-3" />
                收起
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" />
                更多({filteredTags.length - 4})
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}