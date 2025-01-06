'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Share2, MoreHorizontal, LinkIcon, Pencil, Camera } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { appwriteService, Profile, Post } from '@/lib/appwriteService'

export default function ProfilePage() {
  const params = useParams()
  const userId = params.id as string
  const [profile, setProfile] = useState<Profile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [activeTab, setActiveTab] = useState('videos')
  const [editedProfile, setEditedProfile] = useState<Profile | null>(null)
  const [newAvatar, setNewAvatar] = useState<File | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const userProfile = await appwriteService.getProfile(userId)
        setProfile(userProfile)
        setEditedProfile(userProfile)

        const userPosts = await appwriteService.getPosts()
        const filteredPosts = userPosts.filter(post => post.user_id === userId)
        setPosts(filteredPosts)
      } catch (error) {
        console.error('Error fetching profile data:', error)
      }
    }

    fetchProfileData()
  }, [userId])

  const handleEditProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editedProfile) return

    try {
      let updatedProfile = { ...editedProfile }

      if (newAvatar) {
        const fileId = await appwriteService.uploadFile(newAvatar)
        updatedProfile.image = fileId
      }

      await appwriteService.updateProfile(editedProfile.$id, updatedProfile)
      setProfile(updatedProfile)
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewAvatar(e.target.files[0])
      setEditedProfile(prev => prev ? {...prev, image: URL.createObjectURL(e.target.files![0])} : null)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  if (!profile) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <div className="pt-[60px] ml-[75px] lg:ml-[220px] pb-20">
      <div className="max-w-[1150px] mx-auto p-4">
        {/* Profile Header */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="w-24 h-24 border-2">
              <AvatarImage src={appwriteService.getFileView(profile.image)} />
              <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-grow">
            <h1 className="text-2xl font-bold mb-1">{profile.name}</h1>
            <p className="text-lg mb-3">@{profile.name.toLowerCase().replace(/\s+/g, '')}</p>
            <div className="flex items-center gap-3">
              <Button 
                size="lg" 
                variant={isFollowing ? "outline" : "default"}
                className={isFollowing ? "" : "bg-[#F02C56] hover:bg-[#F02C56]/90"}
                onClick={() => setIsFollowing(!isFollowing)}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="lg" className="gap-2">
                    <Pencil className="h-4 w-4" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit profile</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleEditProfile} className="space-y-4">
                    <div className="flex justify-center">
                      <div className="relative">
                        <Avatar className="w-24 h-24 border-2">
                          <AvatarImage src={editedProfile?.image ? appwriteService.getFileView(editedProfile.image) : undefined} />
                          <AvatarFallback>{editedProfile?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <Button
                          type="button"
                          size="icon"
                          variant="secondary"
                          className="absolute bottom-0 right-0 rounded-full"
                          onClick={triggerFileInput}
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={handleAvatarChange}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={editedProfile?.name}
                        onChange={(e) => setEditedProfile(prev => prev ? {...prev, name: e.target.value} : null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={editedProfile?.bio}
                        onChange={(e) => setEditedProfile(prev => prev ? {...prev, bio: e.target.value} : null)}
                      />
                    </div>
                    <Button type="submit" className="w-full bg-[#F02C56] hover:bg-[#F02C56]/90">
                      Save changes
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
              <Button size="icon" variant="outline">
                <Share2 className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="outline">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Report</DropdownMenuItem>
                  <DropdownMenuItem>Block</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mt-6 border-b pb-6">
          <div className="flex items-center gap-2">
            <span className="font-bold">{profile.following || 0}</span>
            <span className="text-gray-500">Following</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold">{profile.followers || 0}</span>
            <span className="text-gray-500">Followers</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold">{profile.likes || 0}</span>
            <span className="text-gray-500">Likes</span>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-4 max-w-[500px]">
          <p className="whitespace-pre-line">{profile.bio}</p>
          {profile.website && (
            <Link 
              href={`https://${profile.website}`} 
              className="flex items-center gap-1 text-[#F02C56] mt-2 hover:underline"
            >
              <LinkIcon className="h-4 w-4" />
              {profile.website}
            </Link>
          )}
        </div>

        {/* Videos Grid */}
        <Tabs defaultValue="videos" className="mt-8">
          <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b rounded-none">
            <TabsTrigger 
              value="videos" 
              className="flex items-center gap-2 px-2 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:shadow-none"
              onClick={() => setActiveTab('videos')}
            >
              Videos
            </TabsTrigger>
            <TabsTrigger 
              value="liked" 
              className="flex items-center gap-2 px-2 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:shadow-none"
              onClick={() => setActiveTab('liked')}
            >
              Liked
            </TabsTrigger>
          </TabsList>
          <TabsContent value="videos" className="mt-6">
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {posts.map((post) => (
                <div 
                  key={post.$id} 
                  className="group relative aspect-[3/4] bg-gray-100 rounded-md overflow-hidden cursor-pointer"
                >
                  <video
                    src={post.video_url}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="text-white text-center">
                      <p className="font-semibold">View video</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="liked" className="mt-6">
            <div className="text-center py-20">
              <p className="text-lg text-gray-500">This user's liked videos are private</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}











