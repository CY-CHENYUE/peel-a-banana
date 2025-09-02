'use client'

import Header from '@/components/Header'
import CanvasEditor from '@/components/canvas/CanvasEditor'
import DrawingToolbar from '@/components/canvas/DrawingToolbar'
import ImageGallery from '@/components/canvas/ImageGallery'
import PromptEditor from '@/components/editor/PromptEditor'
import GeneratedResult from '@/components/GeneratedResult'
import useAppStore from '@/stores/useAppStore'

// Mock data for testing (will be replaced by API)
import { Tag } from '@/types'

const mockTags: Tag[] = [
  {
    id: 1,
    category: 'character',
    label: '晚礼服',
    emoji: '👗',
    description: '变身红毯明星，穿着华丽晚礼服',
    prompt: 'Transform the person into a red carpet celebrity wearing an elegant floor-length evening gown in deep emerald green with sequins, diamond jewelry, professional makeup, standing in glamorous pose with photographers in background, dramatic lighting, high fashion photography style',
    keywords: ['礼服', '红毯', '华丽'],
    difficulty: 'medium',
    estimatedTime: '10-15秒',
    isSelected: false,
    isModified: false,
    originalPrompt: null
  },
  {
    id: 2,
    category: 'character',
    label: '新发型',
    emoji: '💇‍♀️',
    description: '尝试不同的发型和颜色',
    prompt: 'Change the person hairstyle to long wavy platinum blonde hair with purple highlights, voluminous curls, professional salon styling, glamorous look, maintaining original face features',
    keywords: ['发型', '染发', '造型'],
    difficulty: 'easy',
    estimatedTime: '8-10秒',
    isSelected: false,
    isModified: false,
    originalPrompt: null
  },
  {
    id: 3,
    category: 'fun',
    label: '卡通化',
    emoji: '🎭',
    description: '变成可爱的卡通角色',
    prompt: 'Transform into Disney Pixar style 3D cartoon character with big expressive eyes, smooth skin, vibrant colors, cute proportions, cheerful expression, maintaining recognizable features',
    keywords: ['卡通', '动画', '可爱'],
    difficulty: 'easy',
    estimatedTime: '5-8秒',
    isSelected: false,
    isModified: false,
    originalPrompt: null
  },
  {
    id: 4,
    category: 'scene',
    label: '樱花场景',
    emoji: '🌸',
    description: '置身于浪漫的樱花园',
    prompt: 'Place the subject in a beautiful Japanese cherry blossom garden during full bloom, pink sakura petals falling, soft spring sunlight, traditional Japanese architecture in background, dreamy atmosphere',
    keywords: ['樱花', '日本', '春天'],
    difficulty: 'medium',
    estimatedTime: '12-15秒',
    isSelected: false,
    isModified: false,
    originalPrompt: null
  },
  {
    id: 5,
    category: 'art',
    label: '油画风格',
    emoji: '🎨',
    description: '经典油画艺术风格',
    prompt: 'Convert to classical oil painting style like Van Gogh, visible brush strokes, rich textures, vibrant impressionist colors, artistic composition, museum quality artwork',
    keywords: ['油画', '艺术', '梵高'],
    difficulty: 'medium',
    estimatedTime: '10-12秒',
    isSelected: false,
    isModified: false,
    originalPrompt: null
  },
  {
    id: 6,
    category: 'effect',
    label: '霓虹光效',
    emoji: '✨',
    description: '炫酷的霓虹灯光效果',
    prompt: 'Add cyberpunk neon lighting effects, glowing edges, purple and cyan color scheme, futuristic atmosphere, blade runner style, dramatic shadows and highlights',
    keywords: ['霓虹', '赛博朋克', '光效'],
    difficulty: 'hard',
    estimatedTime: '15-20秒',
    isSelected: false,
    isModified: false,
    originalPrompt: null
  }
]

export default function Home() {
  const { 
    uploadedImages
  } = useAppStore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-banana-50 via-white to-banana-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Three Column Layout */}
        <div className="grid grid-cols-12 gap-6 mb-8">
          {/* Left Column - Drawing Tools */}
          <div className="col-span-2 space-y-4">
            <DrawingToolbar />
          </div>

          {/* Middle Column - Canvas */}
          <div className="col-span-7 space-y-4">
            {/* Canvas Editor */}
            <CanvasEditor className="min-h-[600px]" />
          </div>

          {/* Right Column - Image Gallery and Results */}
          <div className="col-span-3 space-y-4">
            <ImageGallery />
            
            {/* Generated Result */}
            <GeneratedResult />
          </div>
        </div>

        {/* Bottom Section - Prompt Editor */}
        <div className="space-y-6">
          {/* Prompt Editor */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
            <PromptEditor />
          </div>
        </div>
      </main>
    </div>
  )
}