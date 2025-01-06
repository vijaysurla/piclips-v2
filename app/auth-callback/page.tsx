'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { appwriteService } from '@/lib/appwriteService'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await appwriteService.handleAuthCallback()
        router.push('/')
      } catch (error) {
        console.error('Error handling auth callback:', error)
        router.push('/login')
      }
    }

    handleCallback()
  }, [router])

  return <div>Processing authentication...</div>
}

