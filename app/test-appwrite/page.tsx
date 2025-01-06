'use client'

import { useEffect, useState } from 'react'
import { client } from '@/lib/appwrite'

export default function TestAppwrite() {
  const [config, setConfig] = useState<any>(null)

  useEffect(() => {
    setConfig({
      endpoint: process.env.NEXT_PUBLIC_ENDPOINT,
      project: process.env.NEXT_PUBLIC_PROJECT_ID,
      NEXT_PUBLIC_APPWRITE_ENDPOINT: process.env.NEXT_PUBLIC_ENDPOINT,
      NEXT_PUBLIC_APPWRITE_PROJECT_ID: process.env.NEXT_PUBLIC_PROJECT_ID,
      NEXT_PUBLIC_APPWRITE_DATABASE_ID: process.env.NEXT_PUBLIC_DATABASE_ID
    })
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Appwrite Configuration Test</h1>
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(config, null, 2)}
      </pre>
    </div>
  )
}





