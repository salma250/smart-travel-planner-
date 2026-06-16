'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'

export default function RegisterPage(){
  const router = useRouter()
  const { register } = useAuth()
  const [name,setName] = useState('')
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [confirm,setConfirm] = useState('')
  const [error,setError] = useState(null)
  const [loading,setLoading] = useState(false)

  const handle = async (e)=>{
    e.preventDefault()
    if(password !== confirm){ setError('Passwords do not match'); return }
    setError(null)
    setLoading(true)
    try{
      await register(name,email,password)
      router.push('/')
    }catch(e){
      const raw = String(e?.message || '')
      const m = raw.toLowerCase()
      let friendly = 'Erreur lors de la création du compte.'
      if(m.includes('duplicate') || m.includes('exists') || (m.includes('email') && m.includes('exists'))) friendly = "Un compte avec cet e‑mail existe déjà."
      else if(m.includes('password') && m.includes('weak')) friendly = 'Le mot de passe est trop faible.'
      else if(m.includes('required') || m.includes('empty') || m.includes('missing')) friendly = 'Veuillez remplir tous les champs requis.'
      else if(m.includes('email') && (m.includes('invalid') || m.includes('format'))) friendly = "Adresse e‑mail invalide."
      else if(m.includes('postgres') || (m.includes('authentication') && m.includes('postgres'))) friendly = 'Erreur de connexion à la base de données. Vérifiez la configuration du serveur.'
      else if(raw) friendly = raw
      setError(friendly)
    }
    finally{ setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-white flex items-center justify-center">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8">
        <h2 className="text-2xl font-semibold mb-4">Create account</h2>
        {error && <div className="mb-3 text-sm text-red-400">{error}</div>}
        <form onSubmit={handle} className="space-y-4">
          <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Full name" type="text" required className="w-full bg-white/6 px-4 py-3 rounded-xl text-black placeholder-slate-500" />
          <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" type="email" required className="w-full bg-white/6 px-4 py-3 rounded-xl text-black placeholder-slate-500" />
          <input value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" type="password" required className="w-full bg-white/6 px-4 py-3 rounded-xl text-black placeholder-slate-500" />
          <input value={confirm} onChange={(e)=>setConfirm(e.target.value)} placeholder="Confirm password" type="password" required className="w-full bg-white/6 px-4 py-3 rounded-xl text-black placeholder-slate-500" />
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl">
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <div className="text-sm text-slate-400 mt-4">Already have an account? <a href="/login" className="text-indigo-400">Sign in</a></div>
      </div>
    </div>
  )
}
