'use client'

import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function UserInfo() {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return null

  return (
    <div className="flex items-center space-x-2">
      <Avatar>
        <AvatarImage src={user.image} alt={user.name} />
        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <p className="text-sm font-medium">{user.name}</p>
        <p className="text-xs text-gray-500">@{user.username}</p>
      </div>
    </div>
  )
}











