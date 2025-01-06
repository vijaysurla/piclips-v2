'use client'

import { useState, useEffect } from 'react'
import { appwriteService } from '@/lib/appwriteService'

export default function TestComments() {
  const [posts, setPosts] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [selectedPost, setSelectedPost] = useState<string | null>(null)
  const [comments, setComments] = useState<any[]>([])

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const fetchedPosts = await appwriteService.getPosts(5)
      setPosts(fetchedPosts)
    } catch (error) {
      console.error('Error fetching posts:', error)
    }
  }

  const handlePostSelect = async (postId: string) => {
    setSelectedPost(postId)
    try {
      const fetchedComments = await appwriteService.getComments(postId)
      setComments(fetchedComments)
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPost || !newComment.trim()) return

    try {
      await appwriteService.createComment(selectedPost, newComment)
      setNewComment('')
      handlePostSelect(selectedPost) // Refresh comments
    } catch (error) {
      console.error('Error creating comment:', error)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Test Comments</h1>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Posts</h2>
          {posts.map((post) => (
            <div 
              key={post.$id} 
              className={`p-2 border mb-2 cursor-pointer ${selectedPost === post.$id ? 'bg-gray-100' : ''}`}
              onClick={() => handlePostSelect(post.$id)}
            >
              <p>{post.text}</p>
            </div>
          ))}
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Comments</h2>
          {selectedPost ? (
            <>
              <form onSubmit={handleCommentSubmit} className="mb-4">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment"
                  className="w-full p-2 border rounded"
                />
                <button 
                  type="submit" 
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Post Comment
                </button>
              </form>
              {comments.map((comment) => (
                <div key={comment.$id} className="p-2 border mb-2">
                  <p>{comment.text}</p>
                </div>
              ))}
            </>
          ) : (
            <p>Select a post to view and add comments</p>
          )}
        </div>
      </div>
    </div>
  )
}

