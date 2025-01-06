'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import TopNav from './includes/TopNav'
import SideNav from './includes/SideNav'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
      setIsLoading(false)
  }, [])

  const showSideNav = pathname !== '/test-database'

  return (
      <>
          <TopNav />
          <div className={`flex justify-between mx-auto w-full lg:px-2.5 px-0 ${!isLoading ? 'max-w-[1140px]' : ''}`}>
              {showSideNav && <SideNav />}
              <div className={`flex-grow ${showSideNav ? 'ml-[75px] lg:ml-[220px]' : ''}`}>
                  {children}
              </div>
          </div>
      </>
  )
}



