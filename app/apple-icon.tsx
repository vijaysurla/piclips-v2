import { ImageResponse } from 'next/og'
 
// Route segment config
export const runtime = 'edge'
 
// Image metadata
export const size = {
  width: 180,
  height: 180,
}
 
// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 24,
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'black',
        }}
      >
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/piclips-logo-notext-6KLIQIuOqCezKNINO6Kb8fAmsqCiYW.png"
          alt="Piclips Logo"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
        />
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}

