'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AiOutlineHome } from 'react-icons/ai'
import { RiGroupLine } from 'react-icons/ri'
import { BsCameraVideo } from 'react-icons/bs'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { appwriteService } from '@/lib/appwriteService'
import MenuItemFollow from './MenuItemFollow'

export default function SideNav() {
  const pathname = usePathname()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [followingUsers, setFollowingUsers] = useState<any[]>([])
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true)
      try {
        const user = await appwriteService.getCurrentUser()
        setCurrentUser(user)

        let following: string[] = []
        if (user) {
          following = await appwriteService.getFollowedUsers(user.user.$id)
          const followingProfiles = await Promise.all(
            following.map((userId: string) => appwriteService.getProfile(userId))
          )
          setFollowingUsers(followingProfiles)
        }

        // Fetch all users for suggested accounts
        const allUsers = await appwriteService.searchUsers('')
        
        // Filter out the current user and users already being followed
        const filteredUsers = allUsers.filter((u: any) => 
          (!user || u.$id !== user.user.$id) && !following.includes(u.$id)
        )

        // Shuffle the filtered users and take the first 5
        const shuffled = filteredUsers.sort(() => 0.5 - Math.random())
        setSuggestedUsers(shuffled.slice(0, 5))

      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const menuItems = [
    {
      icon: AiOutlineHome,
      name: 'For You',
      path: '/',
      color: '#d6191e'
    },
    {
      icon: RiGroupLine,
      name: 'Following',
      path: '/following',
    },
    {
      icon: BsCameraVideo,
      name: 'LIVE',
      path: '/live',
    },
  ]

  return (
    <div 
      className={`
        fixed z-20 bg-white pt-[70px] h-full lg:border-r w-[75px] overflow-auto
        ${pathname === '/' ? 'lg:w-[310px]' : 'lg:w-[220px]'}
        ${pathname === '/upload' ? 'hidden' : 'block'}
      `}
    >
      <ScrollArea className="h-full w-full">
        <div className="px-2">
          {menuItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <Button
                variant="ghost"
                size="lg"
                className={`w-full justify-start gap-2 hover:bg-gray-100 mb-1
                  ${pathname === item.path ? 'text-[#d6191e]' : ''}
                `}
              >
                <item.icon size="24" />
                <span className="hidden lg:inline-block font-semibold">
                  {item.name}
                </span>
              </Button>
            </Link>
          ))}
        </div>

        <Separator className="my-2" />

        <div className="px-2">
          <h3 className="hidden lg:block text-[14px] px-2 text-gray-600 font-semibold mb-2">
            Suggested accounts
          </h3>

          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <div className="flex flex-col gap-2">
              {suggestedUsers.map((user) => (
                <MenuItemFollow key={user.$id} user={user} />
              ))}
            </div>
          )}

          {suggestedUsers.length > 5 && (
            <button className="hidden lg:block text-[#d6191e] text-[13px] px-2 py-2 hover:underline">
              See all
            </button>
          )}

          {currentUser && followingUsers.length > 0 && (
            <>
              <Separator className="my-2" />

              <h3 className="hidden lg:block text-[14px] px-2 text-gray-600 font-semibold mb-2">
                Following accounts
              </h3>

              <div className="flex flex-col gap-2">
                {followingUsers.map((user) => (
                  <MenuItemFollow key={user.$id} user={user} />
                ))}
              </div>

              {followingUsers.length > 5 && (
                <button className="hidden lg:block text-[#d6191e] text-[13px] px-2 py-2 hover:underline">
                  See more
                </button>
              )}
            </>
          )}

          <Separator className="hidden lg:block my-2" />

          <div className="hidden lg:block text-[11px] text-gray-500">
            <p className="px-2 py-1">22/7Clips: Bringing the Pi Community Together Through Creative Expression</p>
            <p className="px-2 py-1">Short-form video platform for the Pi community. Share your talents, passions, and daily life with the world.</p>
            <p className="px-2 py-1">Explore trending challenges, participate in contests, and earn rewards.</p>
            <p className="px-2 py-1">© 2024 22/7Clips</p>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}







