'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { AiOutlineUpload } from 'react-icons/ai'
import { appwriteService } from '@/lib/appwriteService'
import { useState, useEffect } from 'react'
import { Search } from '../../components/Search'

export default function TopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await appwriteService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error checking user:', error);
        setUser(null);
      }
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    try {
      await appwriteService.logout();
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await appwriteService.loginWithGoogle();
      // After initiating login, the user will be redirected to the auth-callback page
    } catch (error) {
      console.error('Google Sign-In error:', error);
    }
  };

  return (
    <div className="fixed top-0 w-full bg-white z-30 border-b h-[60px]">
      <div className="flex items-center justify-between h-full px-4 mx-auto max-w-[1150px]">
        <Link href="/">
          <img className="w-[115px]" src="/images/iclips-logo-transparent.png" alt="PiClips" />
        </Link>

        <div className="flex-grow mx-4">
          <Search />
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="font-medium text-[15px]">
                Welcome, {user.profile?.name || user.user?.name || 'User'}
              </span>
              <Link 
                href="/upload"
                className="flex items-center border border-[#1a1819] rounded-sm px-3 py-[6px] hover:bg-[#d6191e] hover:text-white transition-colors"
              >
                <AiOutlineUpload size="20" color="#1a1819"/>
                <span className="px-2 font-medium text-[15px]">Upload</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center border border-[#1a1819] rounded-sm px-3 py-[6px] hover:bg-[#d6191e] hover:text-white transition-colors"
              >
                <span className="px-2 font-medium text-[15px]">Logout</span>
              </button>
            </>
          ) : (
            <button 
              onClick={handleGoogleSignIn}
              className="flex items-center px-3 py-[6px] bg-[#d6191e] text-white rounded-sm hover:bg-[#d6191e]/90 transition-colors"
            >
              <span className="px-2 font-medium text-[15px]">Sign in with Google</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}









































