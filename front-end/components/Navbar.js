'use client'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="w-full flex items-center justify-between px-8 py-4 border-b border-white/10 bg-black/30 backdrop-blur-md">
      <Link href="/" className="text-white font-bold text-xl">
        ✈️ Smart Travel
      </Link>

      <div className="flex items-center gap-6">
        <Link href="/" className="text-slate-300 hover:text-white text-sm">
          Home
        </Link>
        <Link href="/trip" className="text-slate-300 hover:text-white text-sm">
          Plan a trip
        </Link>
        <Link href="/chat" className="text-slate-300 hover:text-white text-sm">
          AI assistant
        </Link>

        {user ? (
          <>
            <span className="text-slate-300 text-sm">{user.name || user.email}</span>
            <button
              onClick={logout}
              className="text-sm text-red-400 hover:text-red-300"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-slate-300 hover:text-white text-sm">
              Sign in
            </Link>
            <Link
              href="/register"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-xl"
            >
              Get started
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}