'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BiSolidCloudUpload } from 'react-icons/bi'
import { PiKnifeLight } from 'react-icons/pi'
import { AiOutlineLoading } from 'react-icons/ai'
import Image from 'next/image'
import { appwriteService } from '@/lib/appwriteService'

export default function Upload() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [fileDisplay, setFileDisplay] = useState<string>('')
  const [caption, setCaption] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await appwriteService.getCurrentUser();
      if (!currentUser) {
        router.push('/');
      } else {
        setUser(currentUser);
      }
    };
    checkUser();
  }, [router]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('video/')) {
        setError('Please select a video file')
        return
      }
      
      if (file.size > 2 * 1024 * 1024 * 1024) {
        setError('File size must be less than 2GB')
        return
      }

      setFile(file)
      setFileDisplay(URL.createObjectURL(file))
      setError(null)
    }
  }

  const clearVideo = () => {
    if (fileDisplay) {
      URL.revokeObjectURL(fileDisplay)
    }
    setFile(null)
    setFileDisplay('')
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDiscard = () => {
    clearVideo()
    setCaption('')
    setError(null)
  }

  const handlePost = async () => {
    if (!file) {
      setError('Please select a video')
      return
    }

    if (!caption.trim()) {
      setError('Please add a caption')
      return
    }

    if (!user) {
      setError('You must be logged in to post')
      return
    }

    try {
      setIsUploading(true)
      setError(null)

      console.log('Starting file upload...')
      // Upload the video file
      const fileId = await appwriteService.uploadFile(file)
      console.log('File uploaded successfully. File ID:', fileId)

      // Get the file URL
      console.log('Getting file view URL...')
      const fileViewUrl = appwriteService.getFileView(fileId)
      console.log('File view URL:', fileViewUrl.href)

      // Create the post
      console.log('Creating post...')
      const post = await appwriteService.createPost(user.$id, fileViewUrl.href, caption)
      console.log('Post created successfully:', post)

      router.push('/')
    } catch (err) {
      console.error('Error in handlePost:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload video')
    } finally {
      setIsUploading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  if (!user) {
    return null;
  }

  return (
    <div className="w-full max-w-[1280px] mx-auto mt-[80px] p-6">
      <div className="flex flex-col items-start w-full">
        <h1 className="text-[24px] font-semibold mb-2">Upload video</h1>
        <p className="text-gray-400 mb-6">Post a video to your account</p>

        <div className="grid md:grid-cols-2 gap-6 w-full">
          <div className="flex flex-col items-center">
            {!fileDisplay ? (
              <div 
                className="flex flex-col items-center justify-center w-[260px] h-[458px] text-center border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={triggerFileInput}
              >
                <BiSolidCloudUpload size={40} className="text-gray-400 mb-4" />
                <p className="mb-2 text-[16px]">
                  <span className="font-semibold">Select video to upload</span>
                </p>
                <p className="text-gray-500 text-[13px]">Or drag and drop a file</p>
                <ul className="mt-8 text-gray-400 text-[13px] space-y-1">
                  <li>MP4 or WebM</li>
                  <li>720x1280 resolution or higher</li>
                  <li>Up to 10 minutes</li>
                  <li>Less than 2 GB</li>
                </ul>
                <button 
                  className="mt-8 px-8 py-2.5 text-white bg-[#F02C56] rounded-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    triggerFileInput()
                  }}
                >
                  Select file
                </button>
                <input 
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="video/*"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="relative w-[260px] h-[458px] bg-black rounded-[32px]">
                  <Image
                    src="/images/mobile-case.png"
                    alt="Mobile frame"
                    width={260}
                    height={458}
                    className="absolute top-0 left-0 z-20 pointer-events-none"
                    priority
                    style={{ width: 'auto', height: 'auto' }}
                  />
                  <video
                    ref={videoRef}
                    src={fileDisplay}
                    className="absolute inset-0 w-full h-full object-cover rounded-[32px] bg-black pt-[1px] pb-[10px] z-10"
                    autoPlay
                    loop
                    muted
                  />
                  <Image
                    src="/images/tiktok-logo.png"
                    alt="TikTok Logo"
                    width={40}
                    height={40}
                    className="absolute bottom-4 right-4 z-30"
                    priority
                  />
                </div>
              </div>
            )}
            {fileDisplay && (
              <div className="w-full mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-gray-400 text-[13px]">
                    {file?.name}
                  </span>
                </div>
                <button 
                  onClick={clearVideo}
                  className="text-[13px] hover:underline"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <PiKnifeLight size={20} className="text-gray-600" />
                  <span className="font-semibold">Divide videos and edit</span>
                </div>
                <button className="text-[#F02C56] font-semibold">
                  Edit
                </button>
              </div>
              <p className="text-gray-400 text-[13px]">
                You can quickly divide videos into multiple parts, remove redundant parts and turn landscape videos into portrait videos
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-semibold">Caption</label>
                <span className="text-gray-400 text-[12px]">{caption.length}/150</span>
              </div>
              <input 
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={150}
                className="w-full px-4 py-3 border rounded-md focus:outline-none"
                placeholder="Add caption"
              />
            </div>

            {error && (
              <div className="text-[#F02C56] text-sm">{error}</div>
            )}

            <div className="flex items-center gap-4">
              <button 
                onClick={handleDiscard}
                className="px-8 py-2.5 border hover:bg-gray-50 rounded-sm"
              >
                Discard
              </button>
              <button 
                onClick={handlePost}
                disabled={!file || isUploading}
                className="px-8 py-2.5 text-white bg-[#F02C56] rounded-sm disabled:opacity-50 min-w-[100px] flex items-center justify-center"
              >
                {isUploading ? (
                  <AiOutlineLoading className="animate-spin" size={20} />
                ) : (
                  'Post'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}















































