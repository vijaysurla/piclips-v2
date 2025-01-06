'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function AuthFailure() {
  const router = useRouter()

  useEffect(() => {
    // Log the failure for debugging
    console.error('Authentication failed')
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Authentication Failed</h1>
      <p className="text-gray-600 mb-6">There was a problem signing you in.</p>
      <div className="space-x-4">
        <Button 
          variant="outline" 
          onClick={() => router.push('/')}
        >
          Return Home
        </Button>
        <Button 
          onClick={() => router.push('/login')}
          className="bg-[#EF2950] hover:bg-[#F02C56] text-white"
        >
          Try Again
        </Button>
      </div>
    </div>
  )
}



