'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AiOutlineHeart, AiOutlineComment, AiOutlineShareAlt } from 'react-icons/ai'
import { BiMusic } from 'react-icons/bi'
import { appwriteService } from '@/lib/appwriteService'
// import { useAuth } from '@/hooks/useAuth' // Removed useAuth import

interface Post {
  $id: string;
  user_id: string;
  video_url: string;
  text: string;
  created_at: string;
  user?: {
    name: string;
    username: string;
    avatar: string;
  };
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  // const { user } = useAuth() // Removed user state

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const fetchedPosts = await appwriteService.getPosts(10)
        setPosts(fetchedPosts)
      } catch (error) {
        console.error('Error fetching posts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <main className="mt-[60px]">
      <div className="w-[calc(100%-75px)] lg:w-[calc(100%-220px)] ml-[75px] lg:ml-[220px]">
        <div className="max-w-[1000px] mx-auto">
          <div className="px-28 py-8">
            {posts.map((post) => (
              <div key={post.$id} className="flex border-b pb-12 mb-8">
                <div className="flex-shrink-0 mr-6">
                  <Link href={`/profile/${post.$id}`}>
                    <div className="w-[60px] h-[60px] bg-gray-200 rounded-full overflow-hidden">
                      <img
                        src="/placeholder.svg"
                        alt="User avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>
                </div>
                <div className="flex-grow max-w-[600px]">
                  <div className="flex items-center justify-between pb-4">
                    <div>
                      <Link href={`/profile/${post.$id}`} className="block">
                        <span className="font-bold text-[16px] hover:underline block">
                          User
                        </span>
                        <span className="text-[14px] text-gray-500 block">
                          @user
                        </span>
                      </Link>
                    </div>
                    {/* Removed conditional rendering of Follow button */}
                  </div>
                  <div className="text-[15px] mb-4">
                    {post.text}
                  </div>
                  <div className="text-[14px] text-gray-500 flex items-center font-semibold mb-4">
                    <BiMusic size="17"/>
                    <span className="px-1">Original sound - User</span>
                  </div>
                  <div className="flex">
                    <div className="relative min-h-[480px] max-h-[580px] w-[280px] bg-black rounded-xl overflow-hidden">
                      <video
                        className="absolute inset-0 w-full h-full object-cover"
                        src={post.video_url}
                        controls
                        loop
                        muted
                        playsInline
                      />
                    </div>
                    <div className="ml-8">
                      <div className="flex flex-col gap-5">
                        <div className="text-center">
                          <button className="rounded-full bg-gray-100 p-3 hover:bg-gray-200 cursor-pointer">
                            <AiOutlineHeart size="25" color="#111111"/>
                          </button>
                          <span className="text-xs text-gray-800 font-semibold block mt-2">
                            0
                          </span>
                        </div>
                        <div className="text-center">
                          <button className="rounded-full bg-gray-100 p-3 hover:bg-gray-200 cursor-pointer">
                            <AiOutlineComment size="25" color="#111111"/>
                          </button>
                          <span className="text-xs text-gray-800 font-semibold block mt-2">
                            0
                          </span>
                        </div>
                        <div className="text-center">
                          <button className="rounded-full bg-gray-100 p-3 hover:bg-gray-200 cursor-pointer">
                            <AiOutlineShareAlt size="25" color="#111111"/>
                          </button>
                          <span className="text-xs text-gray-800 font-semibold block mt-2">
                            0
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}




































