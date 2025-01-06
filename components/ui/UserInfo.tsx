'use client'

import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Models } from 'appwrite'

// Define a type for the user object
type User = Models.User<{
  avatar?: string;
  username?: string;
}>

export function UserInfo() {
  const { user, isLoading } = useAuth()

  if (isLoading) return <div>Loading...</div>
  if (!user) return null

  // Cast the user to our defined type
  const typedUser = user as User

  return (
    <div className="flex items-center space-x-2">
      <Avatar>
        <AvatarImage src={typedUser.prefs?.avatar || ''} alt={typedUser.name} />
        <AvatarFallback>{typedUser.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <p className="text-sm font-medium">{typedUser.name}</p>
        <p className="text-xs text-gray-500">@{typedUser.prefs?.username || typedUser.name.toLowerCase().replace(/\s+/g, '')}</p>
      </div>
    </div>
  )
}















