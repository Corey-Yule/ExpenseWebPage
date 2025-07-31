"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Linkedin } from "lucide-react";

export default function HomePage() {
  const [session, setSession] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen to auth changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
      {/* Top nav bar */}
      <div className="w-full border-b border-neutral-200 dark:border-neutral-700 px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold">Finance Visualiser</div>
        <nav className="space-x-6 flex items-center">
          <a href="/" className="hover:underline">
            Home
          </a>

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
                router.push("/settings");
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Settings
            </button>
          ) : (
            <>
              <a href="/login" className="hover:underline">
                Login
              </a>
              <a href="/login/register" className="hover:underline">
                Register
              </a>
            </>
          )}
        </nav>
      </div>

      {/* Main content */}
      <main className="flex-grow max-w-3xl mx-auto mt-20 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome To Your Personal Finance Visualiser</h1>
        <p className="text-neutral-800 dark:text-neutral-400 mb-6">
          This is a public homepage. Feel free to look around — login is only needed for private pages such as using the finance visualiser and overviews.  
          This website is built for using our finance dashboard, which can be accessed after signing up/logging in. 
          Note: When using our overviewer everything is interchangeable meaning you can change all of the inputted information.
        </p>
        <p className="text-neutral-800 dark:text-neutral-400 font-bold mb-6">
          DISCLAIMER: All information is private and handled in accordance with UK GDPR. It will not be shared. See{" "}
          <a
            href="https://www.gov.uk/data-protection"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-blue-600"
          >
            UK data protection guidance
          </a>
          .
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
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-neutral-200 dark:border-neutral-700 py-6">
        <div className="max-w-3xl mx-auto px-6 text-center text-sm text-neutral-600 dark:text-neutral-400 space-y-2">
          <div className="flex justify-center gap-6">
            <a
              href="https://www.linkedin.com/in/corey-yule-19382b27a/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:underline"
            >
              <Linkedin className="h-4 w-4" aria-label="LinkedIn" />
              <span>LinkedIn</span>
            </a>
            <a
              href="mailto:coreyyule22@gmail.com"
              className="inline-flex items-center gap-1 hover:underline"
            >
              <svg aria-hidden="true" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2 4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4zm2.2.5v.01L12 11.3l7.8-6.79V4H4.2zm0 2.9v10.6h15.6V7.4l-7.8 6.79L4.2 7.4z" />
              </svg>
              <span>Coreyyule22@gmail.com</span>
            </a>
          </div>
          <p>Created and founded by Corey Yule</p>
        </div>
      </footer>
    </div>
  );
}
