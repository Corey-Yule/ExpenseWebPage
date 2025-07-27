"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { supabase } from "../../../../lib/supabaseClient"

export default function ConfirmEmailPage() {
  const [status, setStatus] = useState("Verifying...")
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const confirmEmail = async () => {
      const code = searchParams.get("code") // Supabase v2 tokens
      if (!code) {
        setStatus("No confirmation code found.")
        return
      }

      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error(error)
        setStatus("Email confirmation failed: " + error.message)
      } else {
        setStatus("✅ Email confirmed! Redirecting...")
        setTimeout(() => router.push("/dashboard"), 3000)
      }
    }

    confirmEmail()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-bold mb-4">Email Confirmation</h1>
        <p>{status}</p>
      </div>
    </div>
  )
}
