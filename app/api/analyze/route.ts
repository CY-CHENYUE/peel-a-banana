import { NextRequest, NextResponse } from 'next/server'
import { analyzeImageWithOpenRouter } from '@/lib/gemini-openrouter'

export async function POST(request: NextRequest) {
  try {
    const { images } = await request.json()
    
    if (!images || !images.length) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      )
    }

    // Analyze all uploaded images together for better context
    // This allows the AI to understand relationships between multiple images
    const tags = await analyzeImageWithOpenRouter(images)
    
    return NextResponse.json({ tags })
  } catch (error) {
    console.error('Error in analyze API:', error)
    
    // Return empty array with error message instead of misleading mock data
    return NextResponse.json({ 
      tags: [],
      error: true,
      message: 'AI分析失败，请重试' 
    }, { status: 500 })
  }
}