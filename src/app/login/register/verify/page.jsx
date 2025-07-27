"use client"

import { useState } from "react"
import { supabase } from "../../../../lib/supabaseClient"

export default function VerifyEmailPage() {
  const [showInput, setShowInput] = useState(false)
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  const handleResend = async () => {
    if (!email) {
      setMessage("Please enter your email.")
      return
    }

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    })

    if (error) {
      setMessage("Error: " + error.message)
    } else {
      setMessage("✅ Confirmation email resent!")
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-bold">Check your email</h1>
        <p>
          We’ve sent you a confirmation email. Please click the link in that email to verify your account.
        </p>

        <a href="/login" className="text-blue-500 hover:underline block">
          Back to Login
        </a>

        {!showInput ? (
          <button
            onClick={() => setShowInput(true)}
            className="text-sm text-blue-500 hover:underline mt-2"
          >
            Didn't get the email? Resend confirmation
          </button>
        ) : (
          <div className="transition-all duration-300 ease-in-out mt-4 space-y-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="p-2 border border-neutral-300 dark:border-neutral-700 rounded w-full bg-white dark:bg-neutral-800"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              onClick={handleResend}
              className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600"
            >
              Resend Email
            </button>
          </div>
        )}

        {message && <p className="text-sm mt-2 text-green-500">{message}</p>}
      </div>
    </div>
  )
}
