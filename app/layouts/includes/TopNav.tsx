'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { AiOutlineUpload } from 'react-icons/ai'
import { appwriteService } from '@/lib/appwriteService'
import { useState, useEffect } from 'react'

export default function TopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await appwriteService.getCurrentUser();
      setUser(currentUser);
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
    } catch (error) {
      console.error('Google Sign-In error:', error);
    }
  };

  return (
    <div className="fixed top-0 w-full bg-white z-30 border-b h-[60px]">
      <div className="flex items-center justify-between h-full px-4 mx-auto max-w-[1150px]">
        <Link href="/">
          <img className="w-[115px]" src="/images/piclips-logo-transparent.png" alt="PiClips" />
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link 
                href="/upload"
                className="flex items-center border rounded-sm px-3 py-[6px] hover:bg-gray-100"
              >
                <AiOutlineUpload size="20" color="#000000"/>
                <span className="px-2 font-medium text-[15px]">Upload</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center border rounded-sm px-3 py-[6px] hover:bg-gray-100"
              >
                <span className="px-2 font-medium text-[15px]">Logout</span>
              </button>
            </>
          ) : (
            <button 
              onClick={handleGoogleSignIn}
              className="flex items-center px-3 py-[6px] bg-[#F02C56] text-white rounded-sm hover:bg-[#F02C56]/90"
            >
              <span className="px-2 font-medium text-[15px]">Sign in with Google</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}































