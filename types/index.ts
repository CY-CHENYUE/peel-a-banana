export interface Tag {
  id: number
  category: 'character' | 'fun' | 'scene' | 'art' | 'effect'
  label: string
  emoji: string
  description: string
  prompt: string
  keywords: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedTime: string
  isSelected: boolean
  isModified: boolean
  originalPrompt: string | null
}

export interface HistoryItem {
  id: string
  timestamp: Date
  originalImage: string
  generatedImage: string
  prompt: string
  tag?: Tag
}

export type PromptSource = 'ai' | 'custom' | 'modified'

export type DrawingTool = 'brush' | 'eraser'

export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9' | 'custom'

export interface CanvasLayer {
  id: string
  name: string
  visible: boolean
  opacity: number
  locked: boolean
  data?: string // Base64 image data
}

export interface CanvasState {
  aspectRatio: AspectRatio
  canvasWidth: number
  canvasHeight: number
  currentTool: DrawingTool
  brushSize: number
  currentColor: string
  eraserSize: number
  layers: CanvasLayer[]
  activeLayerId: string | null
  history: string[] // Canvas state snapshots
  historyIndex: number
}

export interface AppState {
  uploadedImage: File | null
  imagePreview: string | null
  tags: Tag[]
  selectedTag: Tag | null
  activeCategory: string
  currentPrompt: string
  originalPrompt: string
  promptSource: PromptSource
  isGenerating: boolean
  generatedImage: string | null
  history: HistoryItem[]
  canvas: CanvasState
}

export interface GeminiAnalysis {
  tags: Tag[]
  imageDescription: string
  suggestedCategories: string[]
}