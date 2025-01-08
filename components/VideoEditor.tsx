'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface VideoEditorProps {
  videoSrc: string
  onSave: (editedVideo: Blob) => void
  onCancel: () => void
}

const filters = [
  { name: 'None', value: 'none' },
  { name: 'Grayscale', value: 'grayscale(100%)' },
  { name: 'Sepia', value: 'sepia(100%)' },
  { name: 'Invert', value: 'invert(100%)' },
]

export function VideoEditor({ videoSrc, onSave, onCancel }: VideoEditorProps) {
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [filter, setFilter] = useState('none')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.onloadedmetadata = () => {
        if (videoRef.current) {
          setDuration(videoRef.current.duration)
          setEndTime(videoRef.current.duration)
        }
      }
    }
  }, [videoSrc])

  useEffect(() => {
    const updateTime = () => {
      if (videoRef.current) {
        setCurrentTime(videoRef.current.currentTime)
      }
    }

    if (videoRef.current) {
      videoRef.current.addEventListener('timeupdate', updateTime)
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('timeupdate', updateTime)
      }
    }
  }, [])

  const handleStartTimeChange = (newStartTime: number[]) => {
    setStartTime(newStartTime[0])
    if (videoRef.current) {
      videoRef.current.currentTime = newStartTime[0]
    }
  }

  const handleEndTimeChange = (newEndTime: number[]) => {
    setEndTime(newEndTime[0])
  }

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter)
  }

  const applyChanges = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.filter = filter

        video.currentTime = startTime
        video.onseeked = () => {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

          canvas.toBlob((blob) => {
            if (blob) {
              onSave(blob)
            }
          }, 'video/mp4')
        }
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <video
          ref={videoRef}
          src={videoSrc}
          className="w-full"
          style={{ filter }}
          controls
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Start: {startTime.toFixed(2)}s</span>
          <span>End: {endTime.toFixed(2)}s</span>
        </div>
        <Slider
          min={0}
          max={duration}
          step={0.01}
          value={[startTime, endTime]}
          onValueChange={([newStart, newEnd]) => {
            handleStartTimeChange([newStart])
            handleEndTimeChange([newEnd])
          }}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Filter:</label>
        <Select value={filter} onValueChange={handleFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a filter" />
          </SelectTrigger>
          <SelectContent>
            {filters.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={applyChanges}>Apply Changes</Button>
      </div>
    </div>
  )
}









