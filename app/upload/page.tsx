'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BiSolidCloudUpload } from 'react-icons/bi'
import { PiKnifeLight } from 'react-icons/pi'
import { AiOutlineLoading } from 'react-icons/ai'
import Image from 'next/image'
import { appwriteService } from '@/lib/appwriteService'
import { validateVideoFormat, getVideoMetadata, formatFileSize, supportedVideoFormats } from '@/lib/videoUtils'
import { VideoEditor } from '@/components/VideoEditor'
import { toast } from "@/components/ui/use-toast"

export default function Upload() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [fileDisplay, setFileDisplay] = useState<string>('')
  const [caption, setCaption] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file format
      if (!validateVideoFormat(file)) {
        setError(`Unsupported video format. Please use one of: ${supportedVideoFormats.join(', ')}`)
        return
      }
      
      // Check file size (2GB limit)
      if (file.size > 2 * 1024 * 1024 * 1024) {
        setError('File size must be less than 2GB')
        return
      }

      try {
        // Get video metadata
        const metadata = await getVideoMetadata(file)
        
        // Check video dimensions
        if (metadata.width < 720 || metadata.height < 1280) {
          setError('Video resolution must be at least 720x1280')
          return
        }

        // Check video duration (10 minutes max)
        if (metadata.duration > 600) {
          setError('Video duration must be less than 10 minutes')
          return
        }

        setFile(file)
        setFileDisplay(URL.createObjectURL(file))
        setError(null)

        toast({
          title: "Video validated successfully",
          description: `Size: ${formatFileSize(file.size)}, Duration: ${Math.round(metadata.duration)}s`,
        })
      } catch (err) {
        setError('Failed to validate video. Please try another file.')
        console.error('Video validation error:', err)
      }
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
    if (!file && !fileDisplay) {
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

      // Upload the video file
      let fileToUpload: File;
      if (file instanceof File) {
        fileToUpload = file;
      } else if (fileDisplay) {
        const blob = await fetch(fileDisplay).then(r => r.blob());
        fileToUpload = new File([blob], 'video.mp4', { type: 'video/mp4' });
      } else {
        throw new Error('No file to upload');
      }
      const fileId = await appwriteService.uploadFile(fileToUpload)

      // Get the file URL
      const fileViewUrl = appwriteService.getFileView(fileId)

      // Create the post
      await appwriteService.createPost(user.user.$id, fileViewUrl, caption)

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
                  <li>MP4, WebM, or OGG</li>
                  <li>720x1280 resolution or higher</li>
                  <li>Up to 10 minutes</li>
                  <li>Less than 2 GB</li>
                </ul>
                <button 
                  className="mt-8 px-8 py-2.5 text-white bg-[#d6191e] hover:bg-[#d6191e]/90 rounded-sm transition-colors"
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
                  accept="video/mp4,video/webm,video/ogg"
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
                    src="/images/piclips-logo-transparent-3.png"
                    alt="PiClips Logo"
                    width={60}
                    height={60}
                    className="absolute bottom-4 right-4 z-30 bg-white bg-opacity-50 rounded-full p-1"
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
                <button 
                  className="text-[#d6191e] font-semibold"
                  onClick={() => setIsEditing(true)}
                >
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
              <div className="text-[#d6191e] text-sm">{error}</div>
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
                className="px-8 py-2.5 text-white bg-[#d6191e] hover:bg-[#d6191e]/90 rounded-sm disabled:opacity-50 min-w-[100px] flex items-center justify-center transition-colors"
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
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-3xl w-full">
            <VideoEditor
              videoSrc={fileDisplay}
              onSave={(editedVideo) => {
                setFileDisplay(URL.createObjectURL(editedVideo))
                setIsEditing(false)
              }}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

























































