// Native Gemini API implementation
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

// Analyze image using Gemini Vision API
export async function analyzeImageWithGemini(imageBase64: string): Promise<TagSuggestion[]> {
  const API_KEY = process.env.GEMINI_API_KEY
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`

  try {
    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')

    const requestBody = {
      contents: [{
        parts: [
          {
            text: `分析这张图片，并生成15个创意转换方案。要求返回JSON格式，包含tags数组。

每个方案包含以下字段：
- category: 类别（character/fun/scene/art/effect之一）
- label: 简短的中文名称（2-4个字）
- emoji: 代表性的emoji
- description: 中文描述（10-20字）
- prompt: 详细的英文提示词（用于图片生成，要详细描述转换效果）
- keywords: 3个中文关键词数组
- difficulty: 难度（easy/medium/hard）
- estimatedTime: 预计时间（如"5-8秒"）

要求覆盖5个类别，每个类别3个方案：
- character（人物造型）：服装、发型、风格转换
- fun（趣味效果）：卡通化、夸张化、有趣的变换
- scene（场景转换）：不同环境、背景、氛围
- art（艺术风格）：油画、水彩、素描等艺术风格
- effect（特殊效果）：光效、滤镜、科幻效果

返回格式示例：
{
  "tags": [
    {
      "category": "character",
      "label": "晚礼服",
      "emoji": "👗",
      "description": "变身红毯明星",
      "prompt": "Transform into red carpet celebrity with elegant evening gown",
      "keywords": ["礼服", "红毯", "华丽"],
      "difficulty": "medium",
      "estimatedTime": "10-15秒"
    }
  ]
}`
          },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
        responseMimeType: "application/json"
      }
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', errorText)
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    console.log('Gemini response:', data)

    // Extract the generated content
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!generatedText) {
      throw new Error('No content generated')
    }

    // Parse the JSON response
    const parsed = JSON.parse(generatedText)
    const tags = parsed.tags || []

    // Add IDs and ensure all required fields
    return tags.map((tag: any, index: number) => ({
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
    console.error('Error in analyzeImageWithGemini:', error)
    throw error
  }
}