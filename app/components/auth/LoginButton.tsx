'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import appwriteService from '@/lib/appwriteService'
import styles from '../styles/LoginButton.module.css'

export default function LoginButton(): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const router = useRouter()

  const handleLogin = async (): Promise<void> => {
    try {
      setIsLoading(true)
      await appwriteService.login()
      // The user will be redirected to the OAuth provider, so we don't need to handle success here
    } catch (error) {
      console.error('Login failed', error)
      setIsLoading(false)
    }
  }

  return (
    <button 
      className={styles.loginButton} 
      onClick={handleLogin} 
      disabled={isLoading}
      aria-busy={isLoading}
    >
      {isLoading ? 'Signing in...' : 'Sign in with Google'}
    </button>
  )
}







