'use client'

import { useEffect, useState } from 'react'

export function useDeviceDetection() {
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkDevice = () => {
      // Check user agent
      const userAgent = navigator.userAgent.toLowerCase()
      const mobileKeywords = [
        'android', 'webos', 'iphone', 'ipad', 'ipod', 
        'blackberry', 'iemobile', 'opera mini', 'mobile',
        'tablet', 'palm', 'windows phone', 'kindle'
      ]
      
      const isMobileUserAgent = mobileKeywords.some(keyword => 
        userAgent.includes(keyword)
      )

      // Check screen size
      const isMobileScreen = window.innerWidth <= 1024 // Include tablets
      
      // Check touch support
      const isTouchDevice = 'ontouchstart' in window || 
        navigator.maxTouchPoints > 0

      // Combine all checks (more strict for this app)
      // We want to ensure it's a desktop with proper mouse support
      const result = isMobileUserAgent || (isMobileScreen && isTouchDevice)
      
      setIsMobile(result)
      setIsLoading(false)
    }

    // Initial check
    checkDevice()

    // Re-check on resize
    const handleResize = () => {
      checkDevice()
    }

    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return { isMobile, isLoading }
}