'use client'

import { useState } from 'react'
import { createProfile, getProfiles, updateProfile, deleteProfile } from '@/lib/appwrite'
import { Button } from '@/components/ui/button'
import { AppwriteException } from 'appwrite'

export default function TestDatabase() {
  const [testResults, setTestResults] = useState<string[]>([])

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, result])
    console.log(result) // Add console logging for each result
  }

  const runTests = async () => {
    setTestResults([]) // Clear previous results

    addResult('Starting tests...')
    
    // Log configuration
    const config = {
      endpoint: process.env.NEXT_PUBLIC_ENDPOINT,
      projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
      databaseId: process.env.NEXT_PUBLIC_DATABASE_ID
    }
    addResult(`Configuration: ${JSON.stringify(config, null, 2)}`)
    addResult(`Collection ID: 67798ec30020fe07379`) // Log the collection ID

    try {
      // Test Create operation
      addResult('\nTesting create operation...')
      const newProfile = await createProfile('Test User', 'https://example.com/avatar.jpg')
      addResult(`Profile created successfully with ID: ${newProfile.$id}`)

      // Test Read operation
      addResult('\nTesting read operation...')
      const profiles = await getProfiles()
      addResult(`Profiles fetched successfully. Total profiles: ${profiles.total}`)
      addResult(`Profile list: ${JSON.stringify(profiles.documents.map(p => ({ id: p.$id, name: p.name })), null, 2)}`)

      // Test Update operation
      addResult('\nTesting update operation...')
      const updatedProfile = await updateProfile(newProfile.$id, { name: 'Updated Test User' })
      addResult(`Profile updated successfully. New name: ${updatedProfile.name}`)

      // Test Delete operation
      addResult('\nTesting delete operation...')
      await deleteProfile(newProfile.$id)
      addResult(`Profile deleted successfully: ${newProfile.$id}`)

      // Verify deletion
      addResult('\nVerifying deletion...')
      const profilesAfterDelete = await getProfiles()
      addResult(`Profiles after delete: ${profilesAfterDelete.total}`)

    } catch (error) {
      console.error('Test error:', error)
      if (error instanceof AppwriteException) {
        addResult(`\nAppwrite Error:`)
        addResult(`Message: ${error.message}`)
        addResult(`Code: ${error.code}`)
        addResult(`Type: ${error.type}`)
        if (error.response) {
          addResult(`Response: ${JSON.stringify(error.response, null, 2)}`)
        }
      } else if (error instanceof Error) {
        addResult(`\nError during tests:`)
        addResult(`Message: ${error.message}`)
        addResult(`Stack: ${error.stack}`)
      } else {
        addResult(`\nUnknown error: ${String(error)}`)
      }
    }

    addResult('\nTests completed.')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Database Operations Test</h1>
        <Button onClick={runTests} className="w-full mb-4">Run Tests</Button>
        <div className="mt-4 space-y-2">
          <h2 className="text-xl font-semibold mb-2">Test Results:</h2>
          <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap">
            {testResults.length === 0 ? (
              <p className="text-gray-500">No tests run yet. Click "Run Tests" to start.</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="mb-1">{result}</div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}























