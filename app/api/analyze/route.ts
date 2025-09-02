import { NextRequest, NextResponse } from 'next/server'
import { analyzeImageWithGemini } from '@/lib/gemini-native'

export async function POST(request: NextRequest) {
  try {
    const { images } = await request.json()
    
    if (!images || !images.length) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      )
    }

    // For now, analyze the first image
    // In the future, we could analyze multiple images
    const primaryImage = images[0]
    
    // Analyze image and get tags
    const tags = await analyzeImageWithGemini(primaryImage)
    
    return NextResponse.json({ tags })
  } catch (error) {
    console.error('Error in analyze API:', error)
    
    // Return mock data if API fails (for development)
    const mockTags = [
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
        label: '赛博朋克',
        emoji: '🤖',
        description: '未来科技风格造型',
        prompt: 'Transform into cyberpunk character with neon hair, holographic clothing, augmented reality glasses, futuristic makeup with glowing elements, tech implants, in neo-Tokyo street setting',
        keywords: ['科技', '未来', '霓虹'],
        difficulty: 'hard',
        estimatedTime: '15-20秒',
        isSelected: false,
        isModified: false,
        originalPrompt: null
      },
      {
        id: 3,
        category: 'character',
        label: '古装仙侠',
        emoji: '🏮',
        description: '中国古代仙侠风格',
        prompt: 'Transform into ancient Chinese immortal cultivator, flowing silk robes, long hair with ornate hairpins, mystical aura, floating in clouds, traditional Chinese painting style',
        keywords: ['古装', '仙侠', '中国风'],
        difficulty: 'medium',
        estimatedTime: '12-15秒',
        isSelected: false,
        isModified: false,
        originalPrompt: null
      },
      {
        id: 4,
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
        id: 5,
        category: 'fun',
        label: '乐高风格',
        emoji: '🧱',
        description: '变成乐高积木人物',
        prompt: 'Transform into LEGO minifigure style, blocky geometric shapes, plastic texture, bright primary colors, simplified features, toy-like appearance',
        keywords: ['乐高', '积木', '玩具'],
        difficulty: 'easy',
        estimatedTime: '5-8秒',
        isSelected: false,
        isModified: false,
        originalPrompt: null
      },
      {
        id: 6,
        category: 'fun',
        label: '表情包',
        emoji: '😂',
        description: '制作搞笑表情包',
        prompt: 'Transform into exaggerated meme style with funny facial expression, big eyes, distorted features for comedic effect, vibrant colors, internet meme aesthetic',
        keywords: ['表情', '搞笑', '夸张'],
        difficulty: 'easy',
        estimatedTime: '3-5秒',
        isSelected: false,
        isModified: false,
        originalPrompt: null
      },
      {
        id: 7,
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
        id: 8,
        category: 'scene',
        label: '太空漫游',
        emoji: '🚀',
        description: '在宇宙星空中遨游',
        prompt: 'Place subject floating in outer space, surrounded by stars, nebulas, and planets, wearing futuristic space suit, Earth visible in background, cosmic lighting',
        keywords: ['太空', '宇宙', '星际'],
        difficulty: 'hard',
        estimatedTime: '15-20秒',
        isSelected: false,
        isModified: false,
        originalPrompt: null
      },
      {
        id: 9,
        category: 'scene',
        label: '海底世界',
        emoji: '🐠',
        description: '探索神秘的海底世界',
        prompt: 'Place subject underwater in vibrant coral reef, surrounded by colorful tropical fish, rays of sunlight filtering through water, bubbles floating up, aquatic atmosphere',
        keywords: ['海洋', '珊瑚', '潜水'],
        difficulty: 'medium',
        estimatedTime: '12-15秒',
        isSelected: false,
        isModified: false,
        originalPrompt: null
      },
      {
        id: 10,
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
        id: 11,
        category: 'art',
        label: '水墨画',
        emoji: '🖌️',
        description: '中国传统水墨画风格',
        prompt: 'Transform into traditional Chinese ink painting style, black and white with subtle colors, flowing brushwork, minimalist composition, zen aesthetic',
        keywords: ['水墨', '国画', '禅意'],
        difficulty: 'medium',
        estimatedTime: '10-12秒',
        isSelected: false,
        isModified: false,
        originalPrompt: null
      },
      {
        id: 12,
        category: 'art',
        label: '波普艺术',
        emoji: '🎭',
        description: '安迪沃霍尔波普风格',
        prompt: 'Transform into Andy Warhol pop art style, bold contrasting colors, repeated patterns, screen print effect, vibrant commercial art aesthetic',
        keywords: ['波普', '流行', '鲜艳'],
        difficulty: 'easy',
        estimatedTime: '8-10秒',
        isSelected: false,
        isModified: false,
        originalPrompt: null
      },
      {
        id: 13,
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
      },
      {
        id: 14,
        category: 'effect',
        label: '梦幻光晕',
        emoji: '🌟',
        description: '柔美的梦幻光晕效果',
        prompt: 'Add soft dreamy light leaks, bokeh effects, pastel color grading, ethereal glow, romantic atmosphere, lens flare, magical ambiance',
        keywords: ['梦幻', '柔光', '浪漫'],
        difficulty: 'easy',
        estimatedTime: '8-10秒',
        isSelected: false,
        isModified: false,
        originalPrompt: null
      },
      {
        id: 15,
        category: 'effect',
        label: '故障艺术',
        emoji: '📺',
        description: '数字故障风格效果',
        prompt: 'Apply glitch art effect with digital distortion, RGB color separation, pixel sorting, data moshing, corrupted digital aesthetic, vaporwave influence',
        keywords: ['故障', '数字', '扭曲'],
        difficulty: 'medium',
        estimatedTime: '10-12秒',
        isSelected: false,
        isModified: false,
        originalPrompt: null
      }
    ]
    
    return NextResponse.json({ 
      tags: mockTags,
      isMock: true,
      message: 'Using mock data due to API error' 
    })
  }
}