'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, MessageCircle, Share2, Music2, Trash2, X, Volume2, VolumeX } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { appwriteService, Post, Comment, Profile } from '@/lib/appwriteService'

interface EnhancedPost extends Post {
  user?: Profile;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
}

export default function PostPage() {
  const router = useRouter()
  const params = useParams()
  const [post, setPost] = useState<EnhancedPost | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isPostingComment, setIsPostingComment] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const checkUser = async () => {
      const user = await appwriteService.getCurrentUser()
      setCurrentUser(user)
    }
    checkUser()
  }, [])

  useEffect(() => {
    const fetchPost = async () => {
      if (!params.postId) {
        console.error('No postId provided')
        return
      }

      try {
        console.log('Fetching post with ID:', params.postId)
        const fetchedPost = await appwriteService.getPost(params.postId as string)
        console.log('Fetched post:', fetchedPost)

        const userProfile = await appwriteService.getProfile(fetchedPost.user_id)
        console.log('Fetched user profile:', userProfile)

        const likes = await appwriteService.getLikes(params.postId as string)
        const comments = await appwriteService.getComments(params.postId as string)
        const isLiked = currentUser ? likes.some(like => like.user_id === currentUser.user.$id) : false

        const enhancedComments = await Promise.all(comments.map(async (comment) => {
          const commentUserProfile = await appwriteService.getProfile(comment.user_id);
          return { ...comment, user: commentUserProfile };
        }));

        const enhancedPost: EnhancedPost = {
          ...fetchedPost,
          user: userProfile || undefined,
          likeCount: likes.length,
          commentCount: comments.length,
          isLiked
        };

        console.log('Setting enhanced post:', enhancedPost);
        setPost(enhancedPost);
        setComments(enhancedComments);
      } catch (error) {
        console.error('Error fetching post:', error)
        router.push('/')
      }
    }

    fetchPost()
  }, [params.postId, currentUser, router])

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

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(videoRef.current.muted)
    }
  }

  const toggleLike = async () => {
    if (!post || !currentUser || !currentUser.user) return

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

      setPost(prev => {
        if (!prev) return null
        return {
          ...prev,
          likeCount: prev.isLiked ? prev.likeCount - 1 : prev.likeCount + 1,
          isLiked: !prev.isLiked
        }
      })
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const deletePost = async () => {
    if (!post || !currentUser || post.user_id !== currentUser.user.$id) return

    try {
      await appwriteService.deletePost(post.$id)
      router.push('/')
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  const deleteComment = async (commentId: string) => {
    if (!currentUser) return

    try {
      await appwriteService.deleteComment(commentId)
      setComments(prev => prev.filter(comment => comment.$id !== commentId))
      setPost(prev => {
        if (!prev) return null
        return {
          ...prev,
          commentCount: prev.commentCount - 1
        }
      })
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  const handlePostComment = async () => {
    if (!newComment.trim() || isPostingComment || !post || !currentUser) return;

    setIsPostingComment(true);
    try {
      const comment = await appwriteService.createComment(
        currentUser.user.$id,
        post.$id,
        newComment.trim()
      );
      
      const userProfile = await appwriteService.getProfile(currentUser.user.$id);
      const enhancedComment = {
        ...comment,
        user: userProfile
      };

      setComments(prev => [enhancedComment, ...prev]);
      setNewComment('');
      setPost(prev => {
        if (!prev) return null;
        return {
          ...prev,
          commentCount: prev.commentCount + 1
        };
      });
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setIsPostingComment(false);
    }
  };

  if (!post) {
    return <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>
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
            src={post.video_url}
            className="h-full w-full object-contain cursor-pointer"
            loop
            muted={isMuted}
            autoPlay
            playsInline
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
          <button
            className="absolute bottom-4 right-4 bg-black bg-opacity-50 rounded-full p-2"
            onClick={toggleMute}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-white" />
            ) : (
              <Volume2 className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        {/* Comments Section */}
        <div className="w-[400px] bg-white flex flex-col">
          {/* User Info */}
          <div className="p-4 border-b">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.user?.image ? appwriteService.getFileView(post.user.image) : "/placeholder.svg"} />
                  <AvatarFallback>{post.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <Link href={`/profile/${post.user_id}`} className="font-semibold hover:underline">
                      {post.user?.name || "User"}
                    </Link>
                    <span className="text-sm text-gray-500">• {new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-1">{post.text}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Music2 className="h-4 w-4" />
                    <span className="text-sm">original sound - {post.user?.name || "User"}</span>
                  </div>
                </div>
              </div>
              {currentUser && post.user_id === currentUser.user.$id && (
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
                  className={`rounded-full ${post.isLiked ? 'text-[#d6191e]' : ''}`}
                  onClick={toggleLike}
                >
                  <Heart className={`h-6 w-6 ${post.isLiked ? 'fill-current' : ''}`} />
                </Button>
                <span>{post.likeCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MessageCircle className="h-6 w-6" />
                </Button>
                <span>{post.commentCount}</span>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full ml-auto">
                <Share2 className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment.$id} className="p-4 flex items-start justify-between group hover:bg-gray-50">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.user?.image ? appwriteService.getFileView(comment.user.image) : "/placeholder.svg"} />
                    <AvatarFallback>{comment.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{comment.user?.name || "User"}</span>
                      <span className="text-sm text-gray-500">• {new Date(comment.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm mt-1">{comment.text}</p>
                  </div>
                </div>
                {currentUser && comment.user_id === currentUser.user.$id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-600"
                    onClick={() => deleteComment(comment.$id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Comment Input */}
          {currentUser && (
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
                  className="bg-[#d6191e] hover:bg-[#d6191e]/90 text-white px-8"
                  onClick={handlePostComment}
                  disabled={!newComment.trim() || isPostingComment}
                >
                  {isPostingComment ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}





















