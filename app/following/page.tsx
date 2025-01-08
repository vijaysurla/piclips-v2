'use client'

import { useState, useEffect, useRef } from 'react'
import { AiOutlineHeart, AiFillHeart, AiOutlineComment } from 'react-icons/ai'
import { BiMusic } from 'react-icons/bi'
import { Volume2, VolumeX, Share2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { appwriteService, Post, Profile } from '@/lib/appwriteService'
import { ShareDialog } from "@/components/ShareDialog"
import { Toaster } from "@/components/ui/toaster"
import { Button } from "@/components/ui/button"

interface EnhancedPost extends Post {
  user?: Profile;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isFollowing: boolean;
}

export default function Following() {
  const [posts, setPosts] = useState<EnhancedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const router = useRouter()
  const observerRef = useRef<IntersectionObserver | null>(null)
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement }>({})
  const [soundStates, setSoundStates] = useState<{ [key: string]: boolean }>({})
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<EnhancedPost | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const user = await appwriteService.getCurrentUser()
      setCurrentUser(user)
    }
    checkUser()
  }, [])

  useEffect(() => {
    const fetchFollowedPosts = async () => {
      if (!currentUser || !currentUser.user) {
        setLoading(false)
        return
      }

      try {
        const followedUsers = await appwriteService.getFollowedUsers(currentUser.user.$id)
        const allPosts = await appwriteService.getPosts(100)
        const followedPosts = allPosts.filter(post => followedUsers.includes(post.user_id))

        const enhancedPosts = await Promise.all(followedPosts.map(async (post) => {
          const userProfile = await appwriteService.getProfile(post.user_id)
          const likeCount = await appwriteService.getLikeCount(post.$id)
          const commentCount = await appwriteService.getCommentCount(post.$id)
          const isLiked = await appwriteService.hasUserLikedPost(currentUser.user.$id, post.$id)

          return {
            ...post,
            user: userProfile || undefined,
            likeCount,
            commentCount,
            isLiked,
            isFollowing: true
          }
        }))

        setPosts(enhancedPosts)
        setSoundStates(enhancedPosts.reduce((acc, post) => ({...acc, [post.$id]: false}), {}))
      } catch (error) {
        console.error('Error fetching followed posts:', error)
      } finally {
        setLoading(false)
      }
    }

    if (currentUser) {
      fetchFollowedPosts()
    }
  }, [currentUser])

  const handleLike = async (post: EnhancedPost) => {
    if (!currentUser || !currentUser.user) {
      router.push('/login')
      return
    }

    try {
      if (post.isLiked) {
        const likes = await appwriteService.getLikes(post.$id)
        const userLike = likes.find(like => like.user_id === currentUser.user.$id)
        if (userLike) {
          await appwriteService.deleteLike(userLike.$id)
        }
      } else {
        await appwriteService.createLike(currentUser.user.$id, post.$id)
      }

      setPosts(prevPosts => prevPosts.map(p => {
        if (p.$id === post.$id) {
          return {
            ...p,
            likeCount: post.isLiked ? p.likeCount - 1 : p.likeCount + 1,
            isLiked: !p.isLiked
          }
        }
        return p
      }))
    } catch (error) {
      console.error('Error handling like:', error)
    }
  }

  const toggleSound = (postId: string) => {
    const video = videoRefs.current[postId]
    if (video) {
      video.muted = !video.muted
      setSoundStates(prev => ({...prev, [postId]: !video.muted}))
    }
  }

  const handleShare = (post: EnhancedPost) => {
    setSelectedPost(post)
    setShareDialogOpen(true)
  }

  const handleCommentClick = (post: EnhancedPost) => {
    router.push(`/post/${post.$id}/${post.user_id}`)
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold mb-4">No posts from followed users</h2>
        <p className="text-gray-600 mb-4">Start following users to see their posts here!</p>
        <Button onClick={() => router.push('/')}>Explore Posts</Button>
      </div>
    )
  }

  return (
    <main className="mt-[60px]">
      <div className="w-[calc(100%-75px)] lg:w-[calc(100%-220px)] ml-[75px] lg:ml-[220px]">
        <div className="max-w-[1000px] mx-auto">
          <div className="px-28 py-8">
            {posts.map((post) => (
              <div key={post.$id} className="flex border-b pb-12 mb-8">
                <div className="flex-shrink-0 mr-6">
                  <Link href={`/profile/${post.user_id}`}>
                    <div className="w-[60px] h-[60px] bg-gray-200 rounded-full overflow-hidden">
                      <img
                        src={post.user?.image ? appwriteService.getFileView(post.user.image) : "/placeholder.svg"}
                        alt="User avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>
                </div>
                <div className="flex-grow max-w-[600px]">
                  <div className="flex items-center justify-between pb-4">
                    <div>
                      <Link href={`/profile/${post.user_id}`} className="block">
                        <span className="font-bold text-[16px] hover:underline block">
                          {post.user?.name || "User"}
                        </span>
                        <span className="text-[14px] text-gray-500 block">
                          @{post.user?.name?.toLowerCase().replace(/\s+/g, '') || "user"}
                        </span>
                      </Link>
                    </div>
                  </div>
                  <div className="text-[15px] mb-4">
                    {post.text}
                  </div>
                  <div className="text-[14px] text-gray-500 flex items-center font-semibold mb-4">
                    <BiMusic size="17"/>
                    <span className="px-1">Original sound - {post.user?.name || "User"}</span>
                  </div>
                  <div className="flex">
                    <div 
                      className="relative min-h-[480px] max-h-[580px] w-[280px] bg-black rounded-xl overflow-hidden cursor-pointer"
                      onClick={() => router.push(`/post/${post.$id}/${post.user_id}`)}
                    >
                      <video
                        ref={(el) => { if (el) videoRefs.current[post.$id] = el }}
                        className="absolute inset-0 w-full h-full object-cover"
                        src={post.video_url}
                        loop
                        muted
                        playsInline
                      />
                      <button
                        className="absolute bottom-4 right-4 bg-black bg-opacity-50 rounded-full p-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleSound(post.$id)
                        }}
                      >
                        {soundStates[post.$id] ? (
                          <Volume2 className="w-5 h-5 text-white" />
                        ) : (
                          <VolumeX className="w-5 h-5 text-white" />
                        )}
                      </button>
                    </div>
                    <div className="ml-8">
                      <div className="flex flex-col gap-5">
                        <div className="text-center">
                          <button 
                            onClick={() => handleLike(post)}
                            className="rounded-full bg-gray-100 p-3 hover:bg-gray-200 cursor-pointer"
                          >
                            {post.isLiked ? (
                              <AiFillHeart size="25" className="text-red-500"/>
                            ) : (
                              <AiOutlineHeart size="25" color="#111111"/>
                            )}
                          </button>
                          <span className="text-xs text-gray-800 font-semibold block mt-2">
                            {post.likeCount}
                          </span>
                        </div>
                        <div className="text-center">
                          <button 
                            onClick={() => handleCommentClick(post)}
                            className="rounded-full bg-gray-100 p-3 hover:bg-gray-200 cursor-pointer"
                          >
                            <AiOutlineComment size="25" color="#111111"/>
                          </button>
                          <span className="text-xs text-gray-800 font-semibold block mt-2">
                            {post.commentCount}
                          </span>
                        </div>
                        <div className="text-center">
                          <button 
                            onClick={() => handleShare(post)}
                            className="rounded-full bg-gray-100 p-3 hover:bg-gray-200 cursor-pointer"
                          >
                            <Share2 className="h-6 w-6" />
                          </button>
                          <span className="text-xs text-gray-800 font-semibold block mt-2">
                            Share
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
      {selectedPost && (
        <ShareDialog
          postId={selectedPost.$id}
          userId={selectedPost.user_id}
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
        />
      )}
      <Toaster />
    </main>
  )
}





