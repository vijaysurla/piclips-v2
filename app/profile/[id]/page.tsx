'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
import { toast } from "@/components/ui/use-toast"
import PostCard from '@/app/components/PostCard' // Updated import statement
import { ShareDialog } from "@/components/ShareDialog"
import { Toaster } from "@/components/ui/toaster"

interface EnhancedPost extends Post {
  user?: Profile;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
}

export default function ProfilePage() {
  const params = useParams()
  const userId = params.id as string
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [posts, setPosts] = useState<EnhancedPost[]>([])
  const [likedPosts, setLikedPosts] = useState<EnhancedPost[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [activeTab, setActiveTab] = useState('videos')
  const [editedProfile, setEditedProfile] = useState<Profile | null>(null)
  const [newAvatar, setNewAvatar] = useState<File | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userId) {
        console.error('No user ID provided');
        setError('User ID is missing');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const currentUserData = await appwriteService.getCurrentUser();
        setCurrentUser(currentUserData);

        const userProfile = await appwriteService.getProfile(userId);
        if (userProfile) {
          setProfile(userProfile);
          setEditedProfile({
            ...userProfile,
            bio: userProfile.bio || '',
            user_id: userProfile.user_id // Ensure user_id is always set
          });
        } else {
          setError('User profile not found');
        }

        // Fetch follow status
        if (currentUserData && currentUserData.user.$id !== userId) {
          const followStatus = await appwriteService.isFollowing(currentUserData.user.$id, userId);
          setIsFollowing(followStatus);
        }

        const userPosts = await appwriteService.getPosts();
        const filteredPosts = userPosts.filter(post => post.user_id === userId);
        const enhancedPosts = await Promise.all(filteredPosts.map(async (post) => {
          const likeCount = await appwriteService.getLikeCount(post.$id);
          const commentCount = await appwriteService.getCommentCount(post.$id);
          const isLiked = currentUserData ? await appwriteService.hasUserLikedPost(currentUserData.user.$id, post.$id) : false;
          return { ...post, likeCount, commentCount, isLiked };
        }));
        setPosts(enhancedPosts);

        if (currentUserData && currentUserData.user.$id === userId) {
          console.log('Fetching liked posts for current user');
          try {
            const userLikedPosts = await appwriteService.getLikedPosts(userId);
            console.log('Fetched liked posts:', userLikedPosts);
            setLikedPosts(userLikedPosts);
          } catch (error) {
            console.error('Error fetching liked posts:', error);
            toast({
              title: "Error",
              description: "Failed to load some liked posts. Please try again later.",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setError('Failed to load profile data. Please try again later.');
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);

  const handleEditProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editedProfile || !currentUser || currentUser.user.$id !== userId) return

    try {
      let updatedProfile: Partial<Profile> = {
        name: editedProfile.name,
        bio: editedProfile.bio,
      }

      if (newAvatar) {
        const fileId = await appwriteService.uploadFile(newAvatar)
        updatedProfile.image = fileId
      }

      const result = await appwriteService.updateProfile(editedProfile.$id, updatedProfile)
      setProfile(result)
      setIsDialogOpen(false)
      setNewAvatar(null) // Reset newAvatar after successful update
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setNewAvatar(file)
      const imageUrl = URL.createObjectURL(file)
      setEditedProfile(prev => prev ? {...prev, image: imageUrl} : null)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const canEditProfile = currentUser && currentUser.user && currentUser.user.$id === userId

  const handleFollowToggle = async () => {
    if (!currentUser || !currentUser.user) {
      router.push('/login');
      return;
    }

    try {
      if (isFollowing) {
        await appwriteService.unfollowUser(currentUser.user.$id, userId);
      } else {
        await appwriteService.followUser(currentUser.user.$id, userId);
      }
      setIsFollowing(!isFollowing);

      // Update followers count
      setProfile(prev => {
        if (!prev) return null;
        return {
          ...prev,
          followers: isFollowing ? (prev.followers || 1) - 1 : (prev.followers || 0) + 1
        };
      });
    } catch (error) {
      console.error('Error toggling follow status:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>
  }

  if (!profile) {
    return <div className="flex justify-center items-center min-h-screen">Profile not found</div>
  }

  return (
    <div className="pt-[60px] ml-[75px] lg:ml-[220px] pb-20">
      <div className="max-w-[1150px] mx-auto p-4">
        {/* Profile Header */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="w-24 h-24 border-2">
              <AvatarImage src={profile.image ? appwriteService.getFileView(profile.image) : undefined} />
              <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-grow">
            <h1 className="text-2xl font-bold mb-1">{profile.name}</h1>
            <p className="text-lg mb-3">@{profile.name.toLowerCase().replace(/\s+/g, '')}</p>
            <div className="flex items-center gap-3">
              {canEditProfile ? (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="lg" className="gap-2 border-[#1a1819] hover:bg-[#1a1819] hover:text-white">
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
                            <AvatarImage 
                              src={editedProfile?.image && newAvatar 
                                ? URL.createObjectURL(newAvatar) 
                                : editedProfile?.image 
                                  ? appwriteService.getFileView(editedProfile.image) 
                                  : undefined
                              } 
                            />
                            <AvatarFallback>{editedProfile?.name?.charAt(0)}</AvatarFallback>
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
                          value={editedProfile?.bio || ''}
                          onChange={(e) => setEditedProfile(prev => prev ? {...prev, bio: e.target.value} : null)}
                        />
                      </div>
                      <Button type="submit" className="w-full bg-[#d6191e] hover:bg-[#d6191e]/90 text-white">
                        Save changes
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              ) : (
                <div>
                  {!canEditProfile && currentUser && currentUser.user && (
                    <Button 
                      size="lg" 
                      variant={isFollowing ? "outline" : "default"}
                      className={isFollowing ? "border-[#1a1819] hover:bg-[#1a1819] hover:text-white" : "bg-[#d6191e] hover:bg-[#d6191e]/90 text-white"}
                      onClick={handleFollowToggle}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                  )}
                </div>
              )}
              <Button size="icon" variant="outline" onClick={() => setShareDialogOpen(true)}>
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
              className="flex items-center gap-1 text-[#d6191e] mt-2 hover:underline"
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
                  onClick={() => router.push(`/post/${post.$id}/${post.user_id}`)}
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
            {currentUser && currentUser.user.$id === userId ? (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {likedPosts.length > 0 ? (
                  likedPosts.map((post) => (
                    <div 
                      key={post.$id} 
                      className="group relative aspect-[3/4] bg-gray-100 rounded-md overflow-hidden cursor-pointer"
                      onClick={() => router.push(`/post/${post.$id}/${post.user_id}`)}
                    >
                      <video
                        src={post.video_url}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="text-white text-center">
                          <p className="font-semibold">View liked video</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-20">
                    <p className="text-lg text-gray-500">No liked videos found</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-lg text-gray-500">This user's liked videos are private</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        <ShareDialog
          postId={userId}
          userId={userId}
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          isProfile={true}
        />
        <Toaster />
      </div>
    </div>
  )
}

















































