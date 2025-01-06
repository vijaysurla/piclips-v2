'use client'

import { useState } from 'react'
import { Client, Databases, ID, Models } from 'appwrite'
import { Button } from '@/components/ui/button'

const endpoint = process.env.NEXT_PUBLIC_ENDPOINT || ''
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || ''
const databaseId = process.env.NEXT_PUBLIC_DATABASE_ID || ''

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)

const databases = new Databases(client)

export default function TestAppwriteBasic() {
  const [results, setResults] = useState<string[]>([])

  const addResult = (result: string) => {
    setResults(prev => [...prev, result])
    console.log(result)
  }

  const runTests = async () => {
    setResults([])
    addResult('Starting basic Appwrite tests...')

    try {
      // 1. Verify SDK initialization
      addResult(`Appwrite SDK initialized with:
        Endpoint: ${endpoint}
        Project ID: ${projectId}
        Database ID: ${databaseId}`)

      // 2. List collections in the specified database
      addResult('\nListing collections in database:')
      try {
        const collectionsList = await databases.listCollections(databaseId)
        addResult(`Found ${collectionsList.total} collection(s)`)
        collectionsList.collections.forEach((collection: Models.Collection) => {
          addResult(`- ${collection.name} (${collection.$id})`)
        })
      } catch (error: any) {
        addResult(`Error listing collections: ${error.message}`)
        if (error.response) {
          addResult(`Error details: ${JSON.stringify(error.response, null, 2)}`)
        }
      }

      // 3. Create a test collection
      const testCollectionId = ID.unique()
      addResult('\nCreating test collection:')
      try {
        const newCollection = await databases.createCollection(
          databaseId,
          testCollectionId,
          'Test Collection'
        )
        addResult(`Test collection created: ${newCollection.name} (${newCollection.$id})`)

        // 4. Create a string attribute in the test collection
        addResult('\nCreating string attribute in test collection:')
        await databases.createStringAttribute(
          databaseId,
          testCollectionId,
          'name',
          255,
          true
        )
        addResult('String attribute "name" created successfully')

        // Wait for the attribute to be ready
        await new Promise(resolve => setTimeout(resolve, 1000))

        // 5. Create a document in the test collection
        addResult('\nCreating test document:')
        const newDocument = await databases.createDocument(
          databaseId,
          testCollectionId,
          ID.unique(),
          { name: 'Test Document' }
        )
        addResult(`Test document created: ${newDocument.$id}`)

        // 6. Retrieve the created document
        addResult('\nRetrieving test document:')
        const retrievedDocument = await databases.getDocument(
          databaseId,
          testCollectionId,
          newDocument.$id
        )
        addResult(`Retrieved document: ${JSON.stringify(retrievedDocument)}`)

        // 7. Update the document
        addResult('\nUpdating test document:')
        const updatedDocument = await databases.updateDocument(
          databaseId,
          testCollectionId,
          newDocument.$id,
          { name: 'Updated Test Document' }
        )
        addResult(`Updated document: ${JSON.stringify(updatedDocument)}`)

        // 8. Delete the document
        addResult('\nDeleting test document:')
        await databases.deleteDocument(databaseId, testCollectionId, newDocument.$id)
        addResult('Test document deleted successfully')

        // 9. Delete the test collection
        addResult('\nDeleting test collection:')
        await databases.deleteCollection(databaseId, testCollectionId)
        addResult('Test collection deleted successfully')

      } catch (error: any) {
        addResult(`Error in collection operations: ${error.message}`)
        if (error.response) {
          addResult(`Error details: ${JSON.stringify(error.response, null, 2)}`)
        }
      }

    } catch (error: any) {
      addResult(`\nError occurred: ${error.message}`)
      if (error.response) {
        addResult(`Error details: ${JSON.stringify(error.response, null, 2)}`)
      }
    }

    addResult('\nBasic Appwrite tests completed.')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Basic Appwrite Tests</h1>
        <Button onClick={runTests} className="w-full mb-4">Run Basic Tests</Button>
        <div className="mt-4 space-y-2">
          <h2 className="text-xl font-semibold mb-2">Test Results:</h2>
          <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap">
            {results.length === 0 ? (
              <p className="text-gray-500">No tests run yet. Click "Run Basic Tests" to start.</p>
            ) : (
              results.map((result, index) => (
                <div key={index} className="mb-1">{result}</div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}















