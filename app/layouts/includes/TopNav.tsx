'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { AiOutlineUpload } from 'react-icons/ai'
import { appwriteService } from '@/lib/appwriteService'
import { useState, useEffect } from 'react'

export default function TopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [testResults, setTestResults] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await appwriteService.getCurrentUser();
      setUser(currentUser);
    };
    checkUser();
  }, []);

  const handleTestAppwrite = async () => {
  setIsLoading(true);
  setTestResults(null);
  try {
    console.log('Starting Appwrite tests...');

    // Test file upload
    console.log('Testing file upload...');
    const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const fileId = await appwriteService.uploadFile(testFile);
    console.log('File uploaded successfully. File ID:', fileId);

    // Test file URL generation
    console.log('Testing file URL generation...');
    const fileUrl = appwriteService.getFileView(fileId);
    console.log('Generated file URL:', fileUrl.toString());

    // Test post creation
    console.log('Testing post creation...');
    const testPost = await appwriteService.createPost(user.$id, fileUrl.toString(), 'Test post');
    console.log('Post created successfully:', testPost);

    // Test post retrieval
    console.log('Testing post retrieval...');
    const posts = await appwriteService.getPosts(1);
    console.log('Retrieved posts:', posts);

    setTestResults('Appwrite tests completed successfully. Check console for details.');
  } catch (error) {
    console.error('Error in Appwrite tests:', error);
    setTestResults(`Error in Appwrite tests: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    setIsLoading(false);
  }
};

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
          <img className="w-[115px]" src="/images/tiktok-logo.png" alt="TikTok" />
        </Link>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleTestAppwrite}
            disabled={isLoading}
            className="flex items-center border rounded-sm px-3 py-[6px] hover:bg-gray-100 disabled:opacity-50"
          >
            <span className="px-2 font-medium text-[15px]">
              {isLoading ? 'Testing...' : 'Test Appwrite'}
            </span>
          </button>
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
              className="flex items-center border rounded-sm px-3 py-[6px] hover:bg-gray-100"
            >
              <span className="px-2 font-medium text-[15px]">Sign in with Google</span>
            </button>
          )}
        </div>
      </div>
      {testResults && (
        <div className="absolute top-full left-0 right-0 bg-white p-4 border-t">
          {testResults}
        </div>
      )}
    </div>
  )
}





























