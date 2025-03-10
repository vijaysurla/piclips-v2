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

export default function Home() {
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
    const fetchPosts = async () => {
      try {
        const fetchedPosts = await appwriteService.getPosts(10)
        const enhancedPosts = await Promise.all(fetchedPosts.map(async (post) => {
          const userProfile = await appwriteService.getProfile(post.user_id)
          const likeCount = await appwriteService.getLikeCount(post.$id)
          const commentCount = await appwriteService.getCommentCount(post.$id)
          const likes = await appwriteService.getLikes(post.$id)
          const isLiked = currentUser && currentUser.user ? likes.some(like => like.user_id === currentUser.user.$id) : false
          const isFollowing = currentUser && currentUser.user ? await appwriteService.isFollowing(currentUser.user.$id, post.user_id) : false

          return {
            ...post,
            user: userProfile || undefined,
            likeCount,
            commentCount,
            isLiked,
            isFollowing
          }
        }))
        setPosts(enhancedPosts)
        setSoundStates(enhancedPosts.reduce((acc, post) => ({...acc, [post.$id]: false}), {}))
      } catch (error) {
        console.error('Error fetching posts:', error)
      } finally {
        setLoading(false)
      }
    }

    if (currentUser) {
      fetchPosts()
    }
  }, [currentUser])

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    }

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        const video = entry.target as HTMLVideoElement
        if (entry.isIntersecting) {
          video.play().catch((error) => console.error('Error playing video:', error))
        } else {
          video.pause()
        }
      })
    }

    observerRef.current = new IntersectionObserver(handleIntersect, options)

    Object.values(videoRefs.current).forEach((video) => {
      if (video) observerRef.current?.observe(video)
    })

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [posts])

  const handleLike = async (post: EnhancedPost) => {
    if (!currentUser || !currentUser.user) {
      router.push('/login');
      return;
    }

    try {
      if (post.isLiked) {
        const likes = await appwriteService.getLikes(post.$id);
        const userLike = likes.find(like => like.user_id === currentUser.user.$id);
        if (userLike) {
          await appwriteService.deleteLike(userLike.$id);
        }
      } else {
        await appwriteService.createLike(currentUser.user.$id, post.$id);
      }

      setPosts(prevPosts => prevPosts.map(p => {
        if (p.$id === post.$id) {
          return {
            ...p,
            likeCount: post.isLiked ? p.likeCount - 1 : p.likeCount + 1,
            isLiked: !p.isLiked
          };
        }
        return p;
      }));
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const handleFollow = async (post: EnhancedPost) => {
    if (!currentUser || !currentUser.user) {
      router.push('/login');
      return;
    }

    try {
      setPosts(prevPosts => prevPosts.map(p => {
        if (p.user_id === post.user_id) {
          return { ...p, isFollowing: !p.isFollowing };
        }
        return p;
      }));

      if (post.isFollowing) {
        await appwriteService.unfollowUser(currentUser.user.$id, post.user_id);
      } else {
        await appwriteService.followUser(currentUser.user.$id, post.user_id);
      }
    } catch (error) {
      console.error('Error handling follow:', error);
      // Revert the optimistic update if there's an error
      setPosts(prevPosts => prevPosts.map(p => {
        if (p.user_id === post.user_id) {
          return { ...p, isFollowing: !p.isFollowing };
        }
        return p;
      }));
    }
  };

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
                    {currentUser && currentUser.user && currentUser.user.$id !== post.user_id && (
                      <Button
                        onClick={() => handleFollow(post)}
                        variant={post.isFollowing ? "outline" : "default"}
                        size="lg"
                        className={`${
                          post.isFollowing
                            ? "border-[#1a1819] hover:bg-[#1a1819] hover:text-white"
                            : "bg-[#d6191e] hover:bg-[#d6191e]/90 text-white"
                        }`}
                      >
                        {post.isFollowing ? 'Following' : 'Follow'}
                      </Button>
                    )}
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














































































