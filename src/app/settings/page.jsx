"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabaseClient"
import { useRouter } from "next/navigation"
import Navbar from ".././components/Navbar"; 

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
      <Navbar/>
      

      {/* Main content */}
      <div className="max-w-2xl mx-auto mt-20 px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Settings</h1>
        <p className="text-neutral-600 dark:text-neutral-300 mb-6">
            
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
