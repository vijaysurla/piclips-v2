'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { X } from 'lucide-react'
import { Facebook, Twitter, Linkedin, Send, Share2, MessageCircle, Code2 } from 'lucide-react'
import { FaWhatsapp, FaTelegram, FaReddit, FaPinterest } from "react-icons/fa"

interface ShareDialogProps {
  postId: string
  userId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  isProfile?: boolean
}

export function ShareDialog({ postId, userId, open, onOpenChange, isProfile }: ShareDialogProps) {
  const shareUrl = isProfile
  ? `${process.env.NEXT_PUBLIC_APP_URL}/profile/${userId}`
  : `${process.env.NEXT_PUBLIC_APP_URL}/post/${postId}/${userId}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast({
        title: "Link copied",
        description: "The video link has been copied to your clipboard.",
      })
    } catch (err) {
      console.error('Could not copy text: ', err)
    }
  }

  const shareOptions = [
    {
      name: 'Repost',
      icon: Share2,
      onClick: () => {
        // Implement repost functionality
      },
    },
    {
      name: 'Send to friends',
      icon: Send,
      onClick: () => {
        // Implement send to friends functionality
      },
    },
    {
      name: 'Embed',
      icon: Code2,
      onClick: () => {
        // Implement embed functionality
      },
    },
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      onClick: () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareUrl)}`, '_blank')
      },
    },
    {
      name: 'Facebook',
      icon: Facebook,
      onClick: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')
      },
    },
    {
      name: 'X',
      icon: Twitter,
      onClick: () => {
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`, '_blank')
      },
    },
    {
      name: 'Telegram',
      icon: FaTelegram,
      onClick: () => {
        window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}`, '_blank')
      },
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      onClick: () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')
      },
    },
    {
      name: 'Reddit',
      icon: FaReddit,
      onClick: () => {
        window.open(`https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}`, '_blank')
      },
    },
    {
      name: 'Pinterest',
      icon: FaPinterest,
      onClick: () => {
        window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}`, '_blank')
      },
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            Share {isProfile ? 'Profile' : 'Post'}
          </DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-2 bg-secondary p-2 rounded-lg">
          <Input
            defaultValue={shareUrl}
            readOnly
            className="border-0 bg-transparent focus-visible:ring-0"
          />
          <Button
            type="submit"
            size="sm"
            className="px-3"
            onClick={copyToClipboard}
          >
            <span className="sr-only">Copy</span>
            <Code2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-5 gap-4 py-4">
          {shareOptions.map((option) => (
            <button
              key={option.name}
              onClick={option.onClick}
              className="flex flex-col items-center gap-1 text-center"
            >
              <div className="rounded-full bg-secondary p-3 hover:bg-secondary/80">
                <option.icon className="h-5 w-5" />
              </div>
              <span className="text-xs">{option.name}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}



