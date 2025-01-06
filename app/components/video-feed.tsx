'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AiOutlineHeart, AiOutlineMessage, AiOutlineShareAlt } from 'react-icons/ai'
import { BsMusicNote } from 'react-icons/bs'

const MOCK_VIDEOS = [
  {
    id: 1,
    user: {
      id: '1',
      name: 'Test User',
      username: '@testuser',
      avatar: '/placeholder.svg'
    },
    description: 'Check out this amazing video! #trending #viral',
    song: 'Original Sound - Test User',
    likes: 1234,
    comments: 88,
    shares: 44,
    videoUrl: '/placeholder.svg?height=600&width=400',
  },
  {
    id: 2,
    user: {
      id: '2',
      name: 'Another User',
      username: '@anotheruser',
      avatar: '/placeholder.svg'
    },
    description: 'Another cool video for you all! #fun #dance',
    song: 'Popular Song - Artist Name',
    likes: 2345,
    comments: 120,
    shares: 67,
    videoUrl: '/placeholder.svg?height=600&width=400',
  },
]

export function VideoFeed() {
  const [videos] = useState(MOCK_VIDEOS)

  return (
    <div className="flex flex-col items-center gap-14 pt-4">
      {videos.map((video) => (
        <div key={video.id} className="flex max-w-[600px] w-full">
          <Link href={`/profile/${video.user.id}`} className="flex-shrink-0 mr-3">
            <img
              src={video.user.avatar}
              alt={`${video.user.name}'s avatar`}
              className="w-14 h-14 rounded-full"
            />
          </Link>

          <div className="flex-grow">
            <div className="flex items-start justify-between">
              <div>
                <Link href={`/profile/${video.user.id}`} className="font-bold hover:underline">
                  {video.user.name}
                </Link>
                <Link href={`/profile/${video.user.id}`} className="text-sm text-gray-500 ml-1 hover:underline">
                  {video.user.username}
                </Link>
                <p className="text-sm mt-1">{video.description}</p>
                <p className="text-sm flex items-center gap-1 mt-1">
                  <BsMusicNote className="w-3 h-3" />
                  {video.song}
                </p>
              </div>
              <button className="px-4 py-1 border border-[#EF2950] text-[#EF2950] rounded-md text-sm font-semibold hover:bg-[#FEF0F2]">
                Follow
              </button>
            </div>

            <div className="flex mt-4">
              <div className="flex-grow relative">
                <img
                  src={video.videoUrl}
                  alt="Video thumbnail"
                  className="rounded-lg max-h-[600px] object-cover bg-black"
                />
              </div>
              <div className="flex flex-col gap-4 ml-4">
                <button className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <AiOutlineHeart className="w-6 h-6" />
                  </div>
                  <span className="text-xs mt-1">{video.likes}</span>
                </button>
                <button className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <AiOutlineMessage className="w-6 h-6" />
                  </div>
                  <span className="text-xs mt-1">{video.comments}</span>
                </button>
                <button className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <AiOutlineShareAlt className="w-6 h-6" />
                  </div>
                  <span className="text-xs mt-1">{video.shares}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}



