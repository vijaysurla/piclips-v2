'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, MessageCircle, Share2, Music2, Trash2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Mock data - replace with real data fetching
const POST_DATA = {
  id: '1',
  user: {
    id: '1',
    name: 'User 1',
    username: '@user1',
    avatar: '/placeholder.svg',
    date: 'date here'
  },
  description: 'this is some text',
  song: 'original sound - User 1',
  likes: 123,
  comments: 4,
  videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
}

const COMMENTS = [
  { 
    id: 1, 
    user: { 
      id: '1', 
      name: 'User 1', 
      avatar: '/placeholder.svg',
      date: 'date here'
    }, 
    text: 'this is some text'
  }
]

const CURRENT_USER_ID = '1' // This would normally come from your auth system

export default function PostPage() {
  const router = useRouter()
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [comments, setComments] = useState(COMMENTS)
  const [newComment, setNewComment] = useState('')
  const [isPostingComment, setIsPostingComment] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Hide sidebar when on post page
    document.body.style.overflow = 'hidden'
    const sidebar = document.querySelector('[data-sidebar="sidebar"]') as HTMLElement
    if (sidebar) {
      sidebar.style.display = 'none'
    }

    return () => {
      document.body.style.overflow = ''
      if (sidebar) {
        sidebar.style.display = ''
      }
    }
  }, [])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && videoRef.current) {
        videoRef.current.pause()
        setIsPlaying(false)
      }
    }

    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleLike = () => {
    setIsLiked(!isLiked)
  }

  const deletePost = () => {
    // Implement post deletion logic here
    console.log('Deleting post:', POST_DATA.id)
    router.push('/')
  }

  const deleteComment = (commentId: number) => {
    setComments(comments.filter(comment => comment.id !== commentId))
  }

  const handlePostComment = async () => {
    if (!newComment.trim() || isPostingComment) return

    setIsPostingComment(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

      const newCommentObj = {
        id: comments.length + 1,
        user: {
          id: CURRENT_USER_ID,
          name: 'User 1',
          avatar: '/placeholder.svg',
          date: 'just now'
        },
        text: newComment
      }

      setComments(prev => [newCommentObj, ...prev])
      setNewComment('')
    } finally {
      setIsPostingComment(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black flex lg:p-4 z-50">
      {/* Close Button */}
      <button 
        onClick={() => router.back()} 
        className="fixed top-4 left-4 z-50 text-white hover:bg-white/10 rounded-full p-2"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Main Content */}
      <div className="flex w-full h-full">
        {/* Video Section */}
        <div className="relative flex-1 flex items-center justify-center bg-black">
          <video
            ref={videoRef}
            src={POST_DATA.videoUrl}
            className="h-full w-full object-contain cursor-pointer"
            loop
            onClick={togglePlay}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {!isPlaying && (
              <div className="text-white bg-black/50 rounded-full p-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="w-[400px] bg-white flex flex-col">
          {/* User Info */}
          <div className="p-4 border-b">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={POST_DATA.user.avatar} />
                  <AvatarFallback>U1</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <Link href={`/profile/${POST_DATA.user.id}`} className="font-semibold hover:underline">
                      {POST_DATA.user.name}
                    </Link>
                    <span className="text-sm text-gray-500">• {POST_DATA.user.date}</span>
                  </div>
                  <p className="mt-1">{POST_DATA.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Music2 className="h-4 w-4" />
                    <span className="text-sm">{POST_DATA.song}</span>
                  </div>
                </div>
              </div>
              {POST_DATA.user.id === CURRENT_USER_ID && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:text-red-600"
                  onClick={deletePost}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Interaction Buttons */}
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-full ${isLiked ? 'text-[#F02C56]' : ''}`}
                  onClick={toggleLike}
                >
                  <Heart className={`h-6 w-6 ${isLiked ? 'fill-current' : ''}`} />
                </Button>
                <span>{POST_DATA.likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MessageCircle className="h-6 w-6" />
                </Button>
                <span>{POST_DATA.comments}</span>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment.id} className="p-4 flex items-start justify-between group hover:bg-gray-50">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.user.avatar} />
                    <AvatarFallback>U1</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{comment.user.name}</span>
                      <span className="text-sm text-gray-500">• {comment.user.date}</span>
                    </div>
                    <p className="text-sm mt-1">{comment.text}</p>
                  </div>
                </div>
                {comment.user.id === CURRENT_USER_ID && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-600"
                    onClick={() => deleteComment(comment.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Comment Input */}
          <div className="border-t p-4">
            <div className="flex items-center gap-2">
              <Input 
                placeholder="Add comment..." 
                className="flex-1"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handlePostComment()
                  }
                }}
              />
              <Button 
                className="bg-[#F02C56] hover:bg-[#F02C56]/90 text-white px-8"
                onClick={handlePostComment}
                disabled={!newComment.trim() || isPostingComment}
              >
                {isPostingComment ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}









