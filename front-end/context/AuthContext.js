'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }){
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(()=>{
    try{
      const t = localStorage.getItem('wandr_token')
      const u = localStorage.getItem('wandr_user')
      if(t){ setToken(t) }
      if(u){ setUser(JSON.parse(u)) }
    }catch(e){}
    setLoading(false)
  },[])

  const login = async (email, password) => {
    const res = await apiLogin(email, password)
    const token = res?.access_token || res?.token
    if(token){
      setToken(token)
      setUser(res.user || null)
      return res
    }
    throw new Error(res?.message || 'Login failed')
  }

  const register = async (name, email, password) => {
    const res = await apiRegister(name, email, password)
    const token = res?.access_token || res?.token
    if(token){
      setToken(token)
      setUser(res.user || null)
      return res
    }
    throw new Error(res?.message || 'Register failed')
  }

  const logout = () => {
    apiLogout()
    setToken(null)
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(){
  return useContext(AuthContext)
}

export default AuthContext
