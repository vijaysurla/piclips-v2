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
        console.error('Auth callback error:', error)
        router.push('/auth/failure')
      }
    }

    handleCallback()
  }, [router])

  return <div>Processing authentication...</div>
}



