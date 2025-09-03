import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, referenceImages, dimensions } = body
    
    console.log('[API] Received request:', {
      hasPrompt: !!prompt,
      referenceImagesCount: referenceImages?.length || 0,
      dimensions: dimensions
    })
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'No prompt provided' },
        { status: 400 }
      )
    }

    // Use OpenRouter to access Gemini 2.5 Flash Image Preview
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
    const API_URL = 'https://openrouter.ai/api/v1/chat/completions'

    // Build message content
    const content = []
    
    // Add text prompt
    content.push({
      type: 'text',
      text: prompt
    })
    
    // Add all reference images
    if (referenceImages && referenceImages.length > 0) {
      console.log(`[API] Processing ${referenceImages.length} reference images`)
      for (let i = 0; i < referenceImages.length; i++) {
        const refImage = referenceImages[i]
        content.push({
          type: 'image_url',
          image_url: {
            url: refImage.data // Already in data URL format
          }
        })
        console.log(`[API] Added image ${i + 1}/${referenceImages.length}: ${refImage.type} - ${refImage.description}`)
      }
      console.log(`[API] Last image is: ${referenceImages[referenceImages.length - 1].description}`)
    }

    // Build request body using OpenAI format with modalities for image generation
    const requestBody = {
      model: 'google/gemini-2.5-flash-image-preview',
      messages: [{
        role: 'user',
        content: content
      }],
      modalities: ["image", "text"],  // Required for image generation
      temperature: 0.9,
      max_tokens: 8192
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('[API] Generating image via OpenRouter with Gemini 2.5 Flash Image Preview...')
    console.log('[API] Mode:', referenceImages && referenceImages.length > 0 ? 'Image + Text-to-Image (editing)' : 'Text-to-Image')
    console.log('[API] Target dimensions:', dimensions?.width, 'x', dimensions?.height)
    console.log('[API] Number of images in content:', content.filter(c => c.type === 'image_url').length)
    console.log('[API] Prompt includes aspect ratio hint:', prompt.includes('aspect ratio'))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // Make API request to OpenRouter
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Peel a Banana'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenRouter API error:', errorText)
      
      // Parse error for better handling
      try {
        const errorData = JSON.parse(errorText)
        if (response.status === 429) {
          return NextResponse.json(
            { 
              error: 'API 配额超限',
              message: errorData.error?.message || '请求过于频繁，请稍后重试',
              retryAfter: '60s'
            },
            { status: 429 }
          )
        }
        
        // Handle other errors
        return NextResponse.json(
          { 
            error: 'API 请求失败',
            message: errorData.error?.message || `请求失败: ${response.status}`
          },
          { status: response.status }
        )
      } catch (e) {
        // If error parsing fails, continue with generic error
      }
      
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    // 限制日志输出长度，避免太长的base64数据
    const logData = JSON.parse(JSON.stringify(data))
    if (logData.choices?.[0]?.message?.images) {
      logData.choices[0].message.images = logData.choices[0].message.images.map((img: any) => {
        if (img.image_url?.url?.startsWith('data:')) {
          return { ...img, image_url: { url: `data:... (${img.image_url.url.length} chars)` }}
        }
        return img
      })
    }
    if (Array.isArray(logData.choices?.[0]?.message?.content)) {
      logData.choices[0].message.content = logData.choices[0].message.content.map((part: any) => {
        if (part.type === 'image_url' && part.image_url?.url?.startsWith('data:')) {
          return { ...part, image_url: { url: `data:... (${part.image_url.url.length} chars)` }}
        }
        return part
      })
    }
    console.log('[API] OpenRouter response:', JSON.stringify(logData, null, 2))

    // OpenRouter returns OpenAI format response
    // Check if there are multiple content parts (text + image)
    const message = data.choices?.[0]?.message
    
    if (!message) {
      throw new Error('No message in response')
    }

    // Check for images in the message
    let imageData = null
    let textContent = message.content
    
    // Check if message has images array (Gemini 2.5 Flash Image Preview response format)
    if (message.images && Array.isArray(message.images) && message.images.length > 0) {
      // Get the first image
      const firstImage = message.images[0]
      if (firstImage.type === 'image_url' && firstImage.image_url?.url) {
        imageData = firstImage.image_url.url
      }
    }
    
    // Also check content array format (alternative response format)
    if (!imageData && Array.isArray(message.content)) {
      for (const part of message.content) {
        if (part.type === 'image_url' && part.image_url?.url) {
          const url = part.image_url.url
          if (url.startsWith('data:')) {
            imageData = url
          }
        } else if (part.type === 'text') {
          textContent = part.text
        }
      }
    }
    
    console.log('Image data found:', !!imageData)
    console.log('Text content:', textContent)
    
    // Use actual image if available, otherwise use placeholder
    let imageUrl
    
    if (imageData) {
      // We have actual image data from the model
      imageUrl = imageData
    } else {
      // No image data - generate placeholder
      // This might happen if the model returns only text
      const placeholderImage = `data:image/svg+xml;base64,${Buffer.from(`
        <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#FFA500;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="1024" height="1024" fill="url(#bg)"/>
          <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="32" fill="white" text-anchor="middle">
            🎨 AI 响应
          </text>
          <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="18" fill="white" text-anchor="middle" opacity="0.9">
            ${textContent ? '模型返回了文本描述' : '等待图像生成'}
          </text>
          <foreignObject x="10%" y="60%" width="80%" height="30%">
            <div xmlns="http://www.w3.org/1999/xhtml" style="color: white; font-size: 14px; text-align: center; opacity: 0.8;">
              ${textContent ? textContent.substring(0, 200) + '...' : ''}
            </div>
          </foreignObject>
        </svg>
      `).toString('base64')}`
      
      imageUrl = placeholderImage
    }
    
    return NextResponse.json({ 
      success: true,
      imageUrl,
      prompt,
      timestamp: new Date().toISOString(),
      mode: referenceImages && referenceImages.length > 0 ? 'edit' : 'generate'
    })
  } catch (error) {
    console.error('Error in generate API:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate image',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}