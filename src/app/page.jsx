"use client"

import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const [session, setSession] = useState(null)
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen to auth changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
      {/* Top nav bar */}
      <div className="w-full border-b border-neutral-200 dark:border-neutral-700 px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold">Corey’s Webpage</div>
        <nav className="space-x-6 flex items-center">
  <a href="/" className="hover:underline">Home</a>

  {session && (
    <a href="/dashboard" className="hover:underline">
      Dashboard
    </a>
  )}

  {session && (
    <a href="/userSetup" className="hover:underline">
      Finance Information
    </a>
  )}

  {session ? (
    <button
      onClick={async () => {
        await supabase.auth.signOut()
        router.push('/login')
      }}
      className="bg-red-500 text-white px-4 py-2 rounded"
    >
      Logout
    </button>
  ) : (
    <>
      <a href="/login" className="hover:underline">Login</a>
      <a href="/login/register" className="hover:underline">Register</a>
    </>
  )}
</nav>

      </div>

      {/* Main content */}
      <div className="max-w-2xl mx-auto mt-20 px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to Corey's Webpage</h1>
        <p className="text-neutral-600 dark:text-neutral-300 mb-6">
          This is a public homepage. Feel free to look around — login is only needed for private pages.  
          This website is built for using our finance dashboard, which can be accessed after signing up/logging in. 
        </p>

        {session ? (
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-block bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600"
          >
            Go to Dashboard
          </button>
        ) : (
          <a
            href="/login"
            className="inline-block bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600"
          >
            Get Started
          </a>
          
        )}
      </div>
    </div>
  )
}
