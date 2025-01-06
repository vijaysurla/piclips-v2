'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

export function LoginButton() {
  const { login, isLoading } = useAuth()

  const handleLogin = async () => {
    try {
      await login()
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  return (
    <Button onClick={handleLogin} disabled={isLoading}>
      {isLoading ? 'Logging in...' : 'Login with Google'}
    </Button>
  )
}

