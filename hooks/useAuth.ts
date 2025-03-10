import { useState, useEffect } from 'react'
import { appwriteService } from '@/lib/appwriteService'
import { Models } from 'appwrite'
import { Profile } from '@/lib/appwriteService'

type User = {
  user: Models.User<Models.Preferences>;
  profile: Profile | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await appwriteService.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Error checking user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()
  }, [])

  const login = async () => {
    setIsLoading(true)
    try {
      await appwriteService.loginWithGoogle()
      const currentUser = await appwriteService.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await appwriteService.logout()
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return { user, isLoading, login, logout }
}











































