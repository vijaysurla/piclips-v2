'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { appwriteService } from '@/lib/appwriteService'

export default function AuthCallback() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Auth callback initiated');
        await appwriteService.handleAuthCallback()
        console.log('Auth callback successful, redirecting to home');
        router.push('/')
      } catch (error) {
        console.error('Auth callback error:', error)
        setError('Authentication failed. Please try again.')
        setTimeout(() => {
          console.log('Redirecting to login page due to error');
          router.push('/login')
        }, 3000)
      }
    }

    handleCallback()
  }, [router])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
          <p className="text-red-500 mb-4">{error}</p>
          <p>Redirecting to login page...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Processing authentication...</h1>
        <p>Please wait while we complete the sign-in process.</p>
      </div>
    </div>
  )
}









