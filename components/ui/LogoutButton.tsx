'use client'

import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <Button onClick={logout} variant="outline">
      Sign out
    </Button>
  )
}











