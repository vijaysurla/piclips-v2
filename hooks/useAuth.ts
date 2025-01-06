import { useState, useEffect } from 'react'
import { databases, client } from '@/lib/appwrite'
import { useRouter } from 'next/navigation'
import { ID, Query } from 'appwrite'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    const checkUserStatus = async () => {
      try {
        // Since we've removed Google auth, we'll need to implement a new way to check user status
        // For now, we'll just set the user to null
        if (mounted) {
          setUser(null)
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
    // Implement logout logic if needed
    setUser(null)
    router.push('/')
  }

  return { user, loading, logout }
}

































