import { create } from 'zustand'
import { Tag, HistoryItem, PromptSource, CanvasState, DrawingTool, AspectRatio, CanvasLayer } from '@/types'

interface AppStore {
  // Image state
  uploadedImages: Array<{ id: string; file: File; preview: string }>
  selectedImageId: string | null
  addUploadedImage: (file: File, preview: string) => void
  removeUploadedImage: (id: string) => void
  selectImage: (id: string) => void
  clearAllImages: () => void
  
  // Tags state
  tags: Tag[]
  selectedTag: Tag | null
  activeCategory: string
  setTags: (tags: Tag[]) => void
  selectTag: (tag: Tag) => void
  setActiveCategory: (category: string) => void
  
  // Prompt state
  currentPrompt: string
  originalPrompt: string
  promptSource: PromptSource
  setCurrentPrompt: (prompt: string) => void
  setOriginalPrompt: (prompt: string) => void
  setPromptSource: (source: PromptSource) => void
  revertToOriginal: () => void
  
  // Generation state
  isGenerating: boolean
  generatedImage: string | null
  canvasDataURL: string | null
  setIsGenerating: (generating: boolean) => void
  setGeneratedImage: (image: string | null) => void
  setCanvasDataURL: (dataURL: string | null) => void
  
  // History
  history: HistoryItem[]
  addToHistory: (item: HistoryItem) => void
  clearHistory: () => void
  
  // Canvas state
  canvas: CanvasState
  setCanvasTool: (tool: DrawingTool) => void
  setCanvasColor: (color: string) => void
  setBrushSize: (size: number) => void
  setEraserSize: (size: number) => void
  setAspectRatio: (ratio: AspectRatio) => void
  setCanvasSize: (width: number, height: number) => void
  addCanvasLayer: (layer: CanvasLayer) => void
  removeCanvasLayer: (layerId: string) => void
  setActiveLayer: (layerId: string) => void
  updateLayer: (layerId: string, updates: Partial<CanvasLayer>) => void
  addToCanvasHistory: (snapshot: string) => void
  canUndo: () => boolean
  canRedo: () => boolean
  undoCanvas: () => void
  redoCanvas: () => void
  
  // Actions
  reset: () => void
  fillPromptFromTag: (tag: Tag) => void
}

const initialCanvasState: CanvasState = {
  aspectRatio: '3:4',
  canvasWidth: 864,
  canvasHeight: 1184,
  currentTool: 'brush',
  brushSize: 5,
  currentColor: '#000000',
  eraserSize: 10,
  layers: [
    {
      id: 'background',
      name: '背景',
      visible: true,
      opacity: 1,
      locked: false
    }
  ],
  activeLayerId: 'background',
  history: [],
  historyIndex: -1
}

const useAppStore = create<AppStore>((set, get) => ({
  // Initial state
  uploadedImages: [],
  selectedImageId: null,
  tags: [],
  selectedTag: null,
  activeCategory: 'all',
  currentPrompt: '',
  originalPrompt: '',
  promptSource: 'ai',
  isGenerating: false,
  generatedImage: null,
  canvasDataURL: null,
  history: [],
  canvas: initialCanvasState,
  
  // Image actions
  addUploadedImage: (file, preview) => {
    const id = Date.now().toString()
    set((state) => ({
      uploadedImages: [...state.uploadedImages, { id, file, preview }],
      selectedImageId: id
    }))
  },
  removeUploadedImage: (id) => set((state) => {
    const newImages = state.uploadedImages.filter(img => img.id !== id)
    return {
      uploadedImages: newImages,
      selectedImageId: state.selectedImageId === id 
        ? (newImages[0]?.id || null)
        : state.selectedImageId
    }
  }),
  selectImage: (id) => set({ selectedImageId: id }),
  clearAllImages: () => set({ uploadedImages: [], selectedImageId: null }),
  
  // Tags actions
  setTags: (tags) => set({ tags }),
  selectTag: (tag) => set({ selectedTag: tag }),
  setActiveCategory: (category) => set({ activeCategory: category }),
  
  // Prompt actions
  setCurrentPrompt: (prompt) => {
    const { originalPrompt } = get()
    const isModified = originalPrompt && prompt !== originalPrompt
    set({ 
      currentPrompt: prompt,
      promptSource: isModified ? 'modified' : get().promptSource
    })
  },
  setOriginalPrompt: (prompt) => set({ originalPrompt: prompt }),
  setPromptSource: (source) => set({ promptSource: source }),
  revertToOriginal: () => {
    const { originalPrompt } = get()
    set({ 
      currentPrompt: originalPrompt,
      promptSource: 'ai'
    })
  },
  
  // Generation actions
  setIsGenerating: (generating) => set({ isGenerating: generating }),
  setGeneratedImage: (image) => set({ generatedImage: image }),
  setCanvasDataURL: (dataURL) => set({ canvasDataURL: dataURL }),
  
  // History actions
  addToHistory: (item) => set((state) => ({
    history: [item, ...state.history].slice(0, 20) // Keep last 20 items
  })),
  clearHistory: () => set({ history: [] }),
  
  // Canvas actions
  setCanvasTool: (tool) => set((state) => ({
    canvas: { ...state.canvas, currentTool: tool }
  })),
  setCanvasColor: (color) => set((state) => ({
    canvas: { ...state.canvas, currentColor: color }
  })),
  setBrushSize: (size) => set((state) => ({
    canvas: { ...state.canvas, brushSize: size }
  })),
  setEraserSize: (size) => set((state) => ({
    canvas: { ...state.canvas, eraserSize: size }
  })),
  setAspectRatio: (ratio) => {
    const dimensions = {
      '1:1': { width: 1024, height: 1024 },
      '3:4': { width: 864, height: 1184 },
      '4:3': { width: 1184, height: 864 },
      '9:16': { width: 768, height: 1344 },
      '16:9': { width: 1344, height: 768 },
      'custom': { width: 1024, height: 1024 }
    }
    const { width, height } = dimensions[ratio]
    set((state) => ({
      canvas: { ...state.canvas, aspectRatio: ratio, canvasWidth: width, canvasHeight: height }
    }))
  },
  setCanvasSize: (width, height) => set((state) => ({
    canvas: { ...state.canvas, canvasWidth: width, canvasHeight: height }
  })),
  addCanvasLayer: (layer) => set((state) => ({
    canvas: { ...state.canvas, layers: [...state.canvas.layers, layer] }
  })),
  removeCanvasLayer: (layerId) => set((state) => ({
    canvas: { 
      ...state.canvas, 
      layers: state.canvas.layers.filter(l => l.id !== layerId)
    }
  })),
  setActiveLayer: (layerId) => set((state) => ({
    canvas: { ...state.canvas, activeLayerId: layerId }
  })),
  updateLayer: (layerId, updates) => set((state) => ({
    canvas: {
      ...state.canvas,
      layers: state.canvas.layers.map(l => 
        l.id === layerId ? { ...l, ...updates } : l
      )
    }
  })),
  addToCanvasHistory: (snapshot) => set((state) => {
    const newHistory = state.canvas.history.slice(0, state.canvas.historyIndex + 1)
    newHistory.push(snapshot)
    return {
      canvas: {
        ...state.canvas,
        history: newHistory.slice(-50), // Keep last 50 states
        historyIndex: newHistory.length - 1
      }
    }
  }),
  canUndo: () => get().canvas.historyIndex > 0,
  canRedo: () => get().canvas.historyIndex < get().canvas.history.length - 1,
  undoCanvas: () => set((state) => {
    if (state.canvas.historyIndex > 0) {
      return {
        canvas: {
          ...state.canvas,
          historyIndex: state.canvas.historyIndex - 1
        }
      }
    }
    return state
  }),
  redoCanvas: () => set((state) => {
    if (state.canvas.historyIndex < state.canvas.history.length - 1) {
      return {
        canvas: {
          ...state.canvas,
          historyIndex: state.canvas.historyIndex + 1
        }
      }
    }
    return state
  }),
  
  // Complex actions
  reset: () => set({
    uploadedImages: [],
    selectedImageId: null,
    tags: [],
    selectedTag: null,
    activeCategory: 'all',
    currentPrompt: '',
    originalPrompt: '',
    promptSource: 'ai',
    isGenerating: false,
    generatedImage: null,
    canvas: initialCanvasState
  }),
  
  fillPromptFromTag: (tag) => {
    set({
      selectedTag: tag,
      currentPrompt: tag.prompt,
      originalPrompt: tag.prompt,
      promptSource: 'ai'
    })
  }
}))

export default useAppStore