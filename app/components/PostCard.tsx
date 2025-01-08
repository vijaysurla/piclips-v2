'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { appwriteService } from '@/lib/appwriteService'
import { Post, Profile } from '@/lib/appwriteService'
import { useRouter } from 'next/navigation'

interface PostCardProps {
  post: Post
  currentUser: any // Update this type as needed
}

export default function PostCard({ post, currentUser }: PostCardProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const fetchProfileAndLikes = async () => {
      try {
        const userProfile = await appwriteService.getProfile(post.user_id)
        setProfile(userProfile)

        const likes = await appwriteService.getLikes(post.$id)
        setLikeCount(likes.length)

        if (currentUser && currentUser.user) {
          const userLiked = likes.some(like => like.user_id === currentUser.user.$id)
          setIsLiked(userLiked)
        }
      } catch (error) {
        console.error('Error fetching profile and likes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileAndLikes()
  }, [post.user_id, post.$id, currentUser])

  const handleLike = async () => {
    if (!currentUser || !currentUser.user) {
      // Redirect to login or show login prompt
      router.push('/login')
      return
    }

    try {
      if (isLiked) {
        // Unlike the post
        const likes = await appwriteService.getLikes(post.$id)
        const userLike = likes.find(like => like.user_id === currentUser.user.$id)
        if (userLike) {
          await appwriteService.deleteLike(userLike.$id)
        }
        setLikeCount(prev => prev - 1)
      } else {
        // Like the post
        await appwriteService.createLike(currentUser.user.$id, post.$id)
        setLikeCount(prev => prev + 1)
      }
      setIsLiked(!isLiked)
    } catch (error) {
      console.error('Error handling like:', error)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <div className="flex items-center mb-4">
        <Link href={`/profile/${post.user_id}`}>
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden mr-3">
            {profile?.image && (
              <img 
                src={appwriteService.getFileView(profile.image)} 
                alt={profile.name} 
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </Link>
        <div>
          <Link href={`/profile/${post.user_id}`}>
            <h3 className="font-semibold">{profile?.name || 'User'}</h3>
          </Link>
          <p className="text-gray-500 text-sm">@{profile?.name?.toLowerCase().replace(/\s+/g, '') || 'user'}</p>
        </div>
      </div>
      <p className="mb-4">{post.text}</p>
      <video
        src={post.video_url}
        controls
        className="w-full rounded-lg"
        preload="metadata"
      />
      <div className="flex items-center gap-4 mt-4">
        <button className="flex items-center gap-1" onClick={handleLike}>
          <span>{likeCount}</span> {isLiked ? 'Unlike' : 'Like'}
        </button>
        <button className="flex items-center gap-1" onClick={() => router.push(`/post/${post.$id}/${post.user_id}`)}>
          <span>0</span> comments
        </button>
        <button className="flex items-center gap-1">
          <span>0</span> shares
        </button>
      </div>
    </div>
  )
}











