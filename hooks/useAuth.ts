import { useState, useEffect } from 'react'
import { appwriteService } from '@/lib/appwriteService'
import { useRouter } from 'next/navigation'
import { Models } from 'appwrite'

export function useAuth() {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    const checkUserStatus = async () => {
      try {
        const currentUser = await appwriteService.getCurrentUser()
        if (mounted) {
          setUser(currentUser)
        }
      } catch (error) {
        console.error('Session error:', error)
        if (mounted) {
          setUser(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    checkUserStatus()

    return () => {
      mounted = false
    }
  }, [])

  const logout = async () => {
    try {
      await appwriteService.logout()
      setUser(null)
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return { user, loading, logout }
}



































