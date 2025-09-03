// OpenRouter implementation for Gemini image analysis
export interface TagSuggestion {
  id: number
  category: 'character' | 'fun' | 'scene' | 'art' | 'effect'
  label: string
  emoji: string
  description: string
  prompt: string
  keywords: string[]
  isSelected: boolean
  isModified: boolean
  originalPrompt: string | null
}

// Clean markdown formatting from text
function cleanMarkdown(text: string): string {
  if (!text) return text
  // Remove ** bold markers
  return text.replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/_{1,2}/g, '') // Remove underscores
    .replace(/~{1,2}/g, '') // Remove strikethrough
    .replace(/`/g, '') // Remove code markers
    .trim()
}

// Parse structured text response into tags
function parseStructuredText(text: string): any[] {
  const tags = []
  const tagRegex = /标签#\d+:[\s\S]*?(?=标签#\d+:|$)/g
  const matches = text.match(tagRegex) || []
  
  for (const match of matches) {
    try {
      const tag: any = {}
      
      // Extract fields using regex
      const categoryMatch = match.match(/类别[:：]\s*(\w+)/i)
      const labelMatch = match.match(/名称[:：]\s*(.+)/i)
      const emojiMatch = match.match(/表情[:：]\s*(.+)/i)
      const descMatch = match.match(/描述[:：]\s*(.+)/i)
      const promptMatch = match.match(/提示词[:：]\s*(.+)/i)
      const keywordsMatch = match.match(/关键词[:：]\s*(.+)/i)
      
      if (categoryMatch) tag.category = cleanMarkdown(categoryMatch[1].trim())
      if (labelMatch) tag.label = cleanMarkdown(labelMatch[1].trim())
      if (emojiMatch) tag.emoji = cleanMarkdown(emojiMatch[1].trim())
      if (descMatch) tag.description = cleanMarkdown(descMatch[1].trim())
      if (promptMatch) tag.prompt = cleanMarkdown(promptMatch[1].trim())
      if (keywordsMatch) {
        const kwText = keywordsMatch[1].trim()
        tag.keywords = kwText.split(/[,，、]/).map(k => cleanMarkdown(k.trim()))
      }
      
      // Only add if we have at least label and description
      if (tag.label && tag.description) {
        tags.push(tag)
      }
    } catch (e) {
      console.error('Error parsing tag:', e)
    }
  }
  
  return tags
}

// Analyze image(s) using Gemini via OpenRouter
export async function analyzeImageWithOpenRouter(images: string | string[]): Promise<TagSuggestion[]> {
  // 从环境变量读取配置
  const API_KEY = process.env.OPENROUTER_API_KEY!
  const API_URL = process.env.OPENROUTER_API_URL!
  const MODEL = process.env.OPENROUTER_ANALYZE_MODEL!
  const TEMPERATURE = parseFloat(process.env.OPENROUTER_ANALYZE_TEMPERATURE!)
  const MAX_TOKENS = parseInt(process.env.OPENROUTER_ANALYZE_MAX_TOKENS!)

  try {
    // Handle single or multiple images
    const imageArray = Array.isArray(images) ? images : [images]
    // Don't process the image URL - use it directly as is
    const imageContents = imageArray.map(img => ({
      type: 'image_url' as const,
      image_url: {
        url: img // Use the original data URL without any processing
      }
    }))

    const requestBody = {
      model: MODEL,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `分析${imageArray.length > 1 ? '这些图片' : '这张图片'}，为用户生成6个有趣的AI图片编辑创意。

首先简要描述你看到的内容。

然后生成6个创意编辑方案，每个方案用以下格式：

标签#N:
类别: character/fun/scene/art/effect之一
名称: 2-4个中文字
表情: 一个emoji
描述: 基于图片内容的创意描述
提示词: [英文提示词]
关键词: 3个词

重要信息：
- 这些提示词将被 Nano Banana (Gemini 2.5 Flash Image) 使用
- Nano Banana 擅长理解详细的叙事描述，能融合多张图片，保持角色一致性，理解艺术风格和摄影术语
- 不要只是简单地"transform"某物，而是创造有故事性、有氛围、有细节的场景

${imageArray.length > 1 ? `特别注意：你收到了${imageArray.length}张图片，请创造性地利用它们之间的关系。可以融合它们的元素、创建故事序列、组合不同特征，或者发现它们之间有趣的联系。` : ''}

发挥你的想象力，根据图片具体内容生成独特有趣的提示词。每个提示词都应该充满细节和创意，让生成的图片富有视觉冲击力。`
            },
            ...imageContents
          ]
        }
      ],
      temperature: TEMPERATURE,
      max_tokens: MAX_TOKENS
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Peel a Banana'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenRouter API error:', errorText)
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    // Better logging to see the actual response structure
    console.log('OpenRouter analysis response:', JSON.stringify(data, null, 2))

    // Extract the generated content
    const generatedText = data.choices?.[0]?.message?.content
    if (!generatedText) {
      console.error('No content in response. Message object:', JSON.stringify(data.choices?.[0]?.message, null, 2))
      throw new Error('No content generated')
    }

    console.log('AI Response (first 500 chars):', generatedText.substring(0, 500))

    // Parse the response - try multiple formats
    let tags = []
    
    // First try JSON parsing
    try {
      if (generatedText.includes('"tags"')) {
        const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          tags = parsed.tags || []
        }
      }
    } catch (e) {
      console.log('JSON parsing failed, trying text parsing')
    }
    
    // If JSON parsing failed, parse structured text
    if (tags.length === 0) {
      tags = parseStructuredText(generatedText)
    }
    
    // If still no tags, return empty array with message
    if (tags.length === 0) {
      console.warn('Could not parse any tags from response')
      return []
    }

    // Add IDs and ensure all required fields
    return tags.map((tag: any, index: number) => ({
      id: index + 1,
      category: tag.category || 'fun',
      label: tag.label || '创意效果',
      emoji: tag.emoji || '✨',
      description: tag.description || '有趣的图片效果',
      prompt: tag.prompt || 'Creative image transformation',
      keywords: tag.keywords || ['创意', '效果', '转换'],
      isSelected: false,
      isModified: false,
      originalPrompt: null
    }))
  } catch (error) {
    console.error('Error in analyzeImageWithOpenRouter:', error)
    
    // Return fallback tags if API fails completely
    const fallbackTags = [
      {
        id: 1,
        category: 'fun' as const,
        label: '卡通化',
        emoji: '🎨',
        description: '将您的图片变成卡通风格',
        prompt: 'Transform your image into cartoon style with vibrant colors and smooth textures',
        keywords: ['卡通', '动画', '趣味'],
        isSelected: false,
        isModified: false,
        originalPrompt: null
      },
      {
        id: 2,
        category: 'art' as const,
        label: '油画',
        emoji: '🖼️',
        description: '将您的图片变成油画风格',
        prompt: 'Transform your image into oil painting style with visible brush strokes',
        keywords: ['油画', '艺术', '经典'],
        isSelected: false,
        isModified: false,
        originalPrompt: null
      }
    ]
    
    // Don't throw error, return fallback tags
    console.log('Returning fallback tags due to error')
    return fallbackTags
  }
}