'use client'

import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Models } from 'appwrite'

export function UserInfo() {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return null

  const userProfile = user.prefs as { avatar?: string, username?: string }

  return (
    <div className="flex items-center space-x-2">
      <Avatar>
        <AvatarImage src={userProfile.avatar || ''} alt={user.name} />
        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <p className="text-sm font-medium">{user.name}</p>
        <p className="text-xs text-gray-500">@{userProfile.username || user.name.toLowerCase().replace(/\s+/g, '')}</p>
      </div>
    </div>
  )
}













