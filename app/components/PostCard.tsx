'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { appwriteService } from '@/lib/appwriteService'
import { Post, Profile } from '@/lib/appwriteService'

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userProfile = await appwriteService.getProfile(post.user_id)
        setProfile(userProfile)
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [post.user_id])

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
        <button className="flex items-center gap-1">
          <span>0</span> likes
        </button>
        <button className="flex items-center gap-1">
          <span>0</span> comments
        </button>
        <button className="flex items-center gap-1">
          <span>0</span> shares
        </button>
      </div>
    </div>
  )
}

