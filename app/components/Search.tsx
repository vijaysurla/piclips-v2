import { useState, useEffect, useRef } from 'react'
import { SearchIcon } from 'lucide-react'
import { appwriteService } from '@/lib/appwriteService'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface User {
  $id: string;
  name: string;
  image?: string;
}

export function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const searchUsers = async () => {
      if (query.length > 0) {
        setIsLoading(true)
        try {
          const users = await appwriteService.searchUsers(query)
          setResults(users)
        } catch (error) {
          console.error('Error searching users:', error)
        } finally {
          setIsLoading(false)
        }
      } else {
        setResults([])
      }
    }

    const debounce = setTimeout(() => {
      searchUsers()
    }, 300)

    return () => clearTimeout(debounce)
  }, [query])

  return (
    <div className="relative" ref={searchRef}>
      <div className="flex items-center bg-gray-100 rounded-full p-2">
        <SearchIcon className="h-4 w-4 text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search accounts"
          className="bg-transparent outline-none text-sm w-full"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
        />
      </div>
      {showSuggestions && (results.length > 0 || isLoading) && (
        <div className="absolute mt-2 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto z-10">
          {isLoading ? (
            <div className="p-2 text-center">Loading...</div>
          ) : (
            results.map((user) => (
              <Link key={user.$id} href={`/profile/${user.$id}`}>
                <div className="flex items-center p-2 hover:bg-gray-100 cursor-pointer">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={user.image ? appwriteService.getFileView(user.image) : undefined} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-[#1a1819]">{user.name}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}


