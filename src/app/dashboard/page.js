"use client"
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
      }
    }

    getUser()
  }, [router])

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
        <div className="w-full border-b border-neutral-200 dark:border-neutral-700 px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold">Corey’s Webpage</div>
        <nav className="space-x-6">
          <a href="/" className="hover:underline">Home</a>
          <a href="/dashboard" className="hover:underline">Dashboard</a>
          <button
          onClick={async () => {
            await supabase.auth.signOut()
            router.push('/login')
          }}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
        </nav>
      </div>
      <h1 className="text-xl font-bold">Welcome, {user?.email}</h1>
        
    </div>
  )
}
