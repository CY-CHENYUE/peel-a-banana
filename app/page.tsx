'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import Header from '@/components/Header'
import DrawingToolbar from '@/components/canvas/DrawingToolbar'
import ImageGallery from '@/components/canvas/ImageGallery'
import PromptEditor from '@/components/editor/PromptEditor'
import GeneratedResult from '@/components/GeneratedResult'
import GeneratedGallery from '@/components/GeneratedGallery'
import CelebrationOverlay from '@/components/CelebrationOverlay'
import MobileWarning from '@/components/MobileWarning'
import useAppStore from '@/stores/useAppStore'
import { preloadAllReferenceImages } from '@/lib/referenceImages'
import { useDeviceDetection } from '@/hooks/useDeviceDetection'

// 动态导入 Konva 组件，禁用 SSR
const KonvaCanvasEditor = dynamic(
  () => import('@/components/canvas/KonvaCanvasEditor'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-yellow-600">加载画布中...</div>
      </div>
    )
  }
)

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
    uploadedImages,
    showCelebration,
    setShowCelebration,
    loadHistoryFromStorage
  } = useAppStore()

  const { isMobile, isLoading } = useDeviceDetection()

  // Preload all reference images and load history on component mount
  useEffect(() => {
    // 加载参考图片
    preloadAllReferenceImages().then(() => {
      console.log('All reference images preloaded successfully')
    }).catch(error => {
      console.error('Error preloading reference images:', error)
    })
    
    // 从存储加载历史记录
    loadHistoryFromStorage().then(() => {
      console.log('History loaded from storage')
    }).catch(error => {
      console.error('Error loading history:', error)
    })
  }, [])

  // Show loading state while checking device
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">🍌</div>
          <p className="text-gray-600">正在准备香蕉...</p>
        </div>
      </div>
    )
  }

  // Show mobile warning if on mobile device
  if (isMobile) {
    return <MobileWarning />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl" />
      </div>
      
      <Header />
      
      <main className="flex h-[calc(100vh-64px)]">
        {/* Left Sidebar - Tools */}
        <aside className="w-24 bg-white/80 backdrop-blur-md border-r border-yellow-200/50 shadow-lg relative">
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-50/50 to-orange-50/50 pointer-events-none" />
          <div className="flex flex-col items-center py-6 relative z-10">
            <DrawingToolbar />
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Canvas Section */}
          <div className="flex-1 p-4 overflow-hidden flex flex-col">
            <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col gap-4">
              {/* Canvas - 占用大部分空间 */}
              <div className="flex-1 flex items-center justify-center">
                <KonvaCanvasEditor />
              </div>
              
              {/* Generated Images Gallery - 紧凑高度 */}
              <div className="flex-shrink-0">
                <GeneratedGallery />
              </div>
            </div>
          </div>

          {/* Right Panel - Upload & Generate */}
          <div className="w-96 p-8 pl-0 overflow-y-auto flex flex-col">
            <div className="flex-1 space-y-6">
              {/* Image Upload Card */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-yellow-100/50 hover:shadow-2xl transition-all duration-300">
                <ImageGallery />
              </div>
              
              {/* Prompt Input Card */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-yellow-100/50 hover:shadow-2xl transition-all duration-300">
                <PromptEditor />
              </div>
              
              {/* Generated Result */}
              <GeneratedResult />
            </div>
            
            {/* 底部署名 - 融入右侧面板底部 */}
            <div className="mt-4 pt-3 border-t border-neutral-100">
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-[10px] text-yellow-600/60 font-medium">Way to AGI</span>
                <span className="text-[10px] text-yellow-400/40">|</span>
                <span className="text-[10px] text-neutral-400">CY-CHENYUE</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* 庆祝动画覆盖层 */}
      <CelebrationOverlay 
        show={showCelebration} 
        onComplete={() => setShowCelebration(false)}
      />
    </div>
  )
}