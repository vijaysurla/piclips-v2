'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AiOutlineHome } from 'react-icons/ai'
import { RiGroupLine } from 'react-icons/ri'
import { BsCameraVideo } from 'react-icons/bs'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function SideNav() {
  const pathname = usePathname()

  const menuItems = [
    {
      icon: AiOutlineHome,
      name: 'For You',
      path: '/',
      color: '#EF2950'
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
                  ${pathname === item.path ? 'text-[#EF2950]' : ''}
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

          <div className="flex flex-col gap-2">
            <Link href="/profile/test" className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-md">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>TU</AvatarFallback>
              </Avatar>
              <div className="hidden lg:block">
                <p className="font-semibold text-sm">Test User</p>
                <p className="text-gray-600 text-xs">Test User</p>
              </div>
            </Link>
          </div>

          <button className="hidden lg:block text-[#EF2950] text-[13px] px-2 py-2 hover:underline">
            See all
          </button>

          <Separator className="my-2" />

          <h3 className="hidden lg:block text-[14px] px-2 text-gray-600 font-semibold mb-2">
            Following accounts
          </h3>

          <div className="flex flex-col gap-2">
            <Link href="/profile/test" className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-md">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>TU</AvatarFallback>
              </Avatar>
              <div className="hidden lg:block">
                <p className="font-semibold text-sm">Test User</p>
                <p className="text-gray-600 text-xs">Test User</p>
              </div>
            </Link>
          </div>

          <button className="hidden lg:block text-[#EF2950] text-[13px] px-2 py-2 hover:underline">
            See more
          </button>

          <Separator className="hidden lg:block my-2" />

          <div className="hidden lg:block text-[11px] text-gray-500">
            <p className="px-2 py-1">About Newsroom TikTok Shop Contact Careers ByteDance</p>
            <p className="px-2 py-1">TikTok for Good Advertise Developers Transparency TikTok Rewards TikTok Browse TikTok Embeds</p>
            <p className="px-2 py-1">Help Safety Terms Privacy Creator Portal Community Guidelines</p>
            <p className="px-2 py-1">© 2024 TikTok</p>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}



