'use client'

import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { appwriteService } from '@/lib/appwriteService'

export function UserInfo() {
  const { user, isLoading } = useAuth()

  if (isLoading) return <div>Loading...</div>
  if (!user) return null

  const avatarSrc = user.profile?.image 
    ? appwriteService.getFileView(user.profile.image)
    : undefined

  return (
    <div className="flex items-center space-x-2">
      <Avatar>
        <AvatarImage src={avatarSrc} alt={user.user.name} />
        <AvatarFallback>{user.user.name.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div>
        <p className="text-sm font-medium">{user.user.name}</p>
        <p className="text-xs text-gray-500">@{user.profile?.name || user.user.name.toLowerCase().replace(/\s+/g, '')}</p>
      </div>
    </div>
  )
}































