import OpenAI from 'openai'

// Create Gemini client using OpenAI SDK
const gemini = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  baseURL: process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta',
  defaultHeaders: {
    'x-goog-api-key': process.env.GEMINI_API_KEY || ''
  }
})

export interface TagSuggestion {
  id: number
  category: 'character' | 'fun' | 'scene' | 'art' | 'effect'
  label: string
  emoji: string
  description: string
  prompt: string
  keywords: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedTime: string
}

// Analyze image and generate creative tags
export async function analyzeImageAndGenerateTags(imageBase64: string): Promise<TagSuggestion[]> {
  try {
    const response = await gemini.chat.completions.create({
      model: 'gemini-2.0-flash-exp',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `分析这张图片，并生成15个创意转换方案。要求：
1. 覆盖5个类别，每个类别3个方案：
   - character（人物造型）：服装、发型、风格转换
   - fun（趣味效果）：卡通化、夸张化、有趣的变换
   - scene（场景转换）：不同环境、背景、氛围
   - art（艺术风格）：油画、水彩、素描等艺术风格
   - effect（特殊效果）：光效、滤镜、科幻效果

2. 每个方案包含：
   - label：简短的中文名称（2-4个字）
   - emoji：代表性的emoji
   - description：中文描述（10-20字）
   - prompt：详细的英文提示词（用于图片生成）
   - keywords：3个中文关键词
   - difficulty：难度（easy/medium/hard）
   - estimatedTime：预计时间（如"5-8秒"）

返回JSON数组格式。`
            },
            {
              type: 'image_url',
              image_url: {
                url: imageBase64
              }
            }
          ]
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
      max_tokens: 2000
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response from Gemini')

    const data = JSON.parse(content)
    const tags = data.tags || data.suggestions || []

    // Add IDs and ensure all fields are present
    return tags.map((tag: {category?: string, value?: string}, index: number) => ({
      id: index + 1,
      category: tag.category || 'fun',
      label: tag.label || '创意效果',
      emoji: tag.emoji || '✨',
      description: tag.description || '有趣的图片效果',
      prompt: tag.prompt || 'Creative image transformation',
      keywords: tag.keywords || ['创意', '效果', '转换'],
      difficulty: tag.difficulty || 'medium',
      estimatedTime: tag.estimatedTime || '10-15秒',
      isSelected: false,
      isModified: false,
      originalPrompt: null
    }))
  } catch (error) {
    console.error('Error analyzing image:', error)
    throw new Error('Failed to analyze image')
  }
}

// Generate image using prompt
export async function generateImage(prompt: string, referenceImage?: string): Promise<string> {
  try {
    // Note: Gemini's image generation API (Imagen 3) might have different endpoint
    // This is a placeholder implementation
    const response = await gemini.images.generate({
      model: 'imagen-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      response_format: 'b64_json'
    })

    const imageData = response.data[0]?.b64_json
    if (!imageData) throw new Error('No image generated')

    return `data:image/png;base64,${imageData}`
  } catch (error) {
    console.error('Error generating image:', error)
    // For now, return a placeholder or mock response
    // In production, you would integrate with the actual Imagen API
    throw new Error('Image generation is not yet available')
  }
}

export default gemini