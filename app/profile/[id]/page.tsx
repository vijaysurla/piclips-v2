'use client'

import { useState, useRef } from 'react'
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

// Mock data - replace with real data fetching
const PROFILE_DATA = {
  id: '1',
  name: 'Sarah Williams',
  username: '@sarahcreates',
  avatar: '/placeholder.svg',
  bio: '✨ Digital Creator\n🎨 Sharing creative content\n🌟 New videos every week',
  following: 234,
  followers: '13.5K',
  likes: '2.1M',
  website: 'www.example.com',
  videos: Array(12).fill({
    id: 1,
    thumbnail: '/placeholder.svg',
    views: '2.3K',
  })
}

export default function ProfilePage() {
  const [isFollowing, setIsFollowing] = useState(false)
  const [activeTab, setActiveTab] = useState('videos')
  const [editedProfile, setEditedProfile] = useState(PROFILE_DATA)
  const [newAvatar, setNewAvatar] = useState<File | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleEditProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Here you would typically send the editedProfile data to your backend
    console.log('Profile updated:', editedProfile)
    if (newAvatar) {
      console.log('New avatar:', newAvatar)
      // Here you would upload the new avatar file
    }
    // Update the PROFILE_DATA
    Object.assign(PROFILE_DATA, editedProfile)
    // Close the dialog
    setIsDialogOpen(false)
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewAvatar(e.target.files[0])
      setEditedProfile({
        ...editedProfile,
        avatar: URL.createObjectURL(e.target.files[0])
      })
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="pt-[60px] ml-[75px] lg:ml-[220px] pb-20">
      <div className="max-w-[1150px] mx-auto p-4">
        {/* Profile Header */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="w-24 h-24 border-2">
              <AvatarImage src={editedProfile.avatar} />
              <AvatarFallback>SW</AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-grow">
            <h1 className="text-2xl font-bold mb-1">{editedProfile.name}</h1>
            <p className="text-lg mb-3">{editedProfile.username}</p>
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
                          <AvatarImage src={editedProfile.avatar} />
                          <AvatarFallback>SW</AvatarFallback>
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
                        value={editedProfile.name}
                        onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={editedProfile.username}
                        onChange={(e) => setEditedProfile({...editedProfile, username: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={editedProfile.bio}
                        onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={editedProfile.website}
                        onChange={(e) => setEditedProfile({...editedProfile, website: e.target.value})}
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
            <span className="font-bold">{editedProfile.following}</span>
            <span className="text-gray-500">Following</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold">{editedProfile.followers}</span>
            <span className="text-gray-500">Followers</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold">{editedProfile.likes}</span>
            <span className="text-gray-500">Likes</span>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-4 max-w-[500px]">
          <p className="whitespace-pre-line">{editedProfile.bio}</p>
          <Link 
            href={`https://${editedProfile.website}`} 
            className="flex items-center gap-1 text-[#F02C56] mt-2 hover:underline"
          >
            <LinkIcon className="h-4 w-4" />
            {editedProfile.website}
          </Link>
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
              {PROFILE_DATA.videos.map((video, i) => (
                <div 
                  key={i} 
                  className="group relative aspect-[3/4] bg-gray-100 rounded-md overflow-hidden cursor-pointer"
                >
                  <img
                    src={video.thumbnail}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="text-white text-center">
                      <p className="font-semibold">{video.views} views</p>
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









