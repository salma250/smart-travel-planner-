'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../../../../components/Navbar'
import Footer from '../../../../components/Footer'

export default function ItineraryPage(){
  const router = useRouter()
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const params = new URLSearchParams(window.location.search)
    const id = params.get('id') || window.location.pathname.split('/')[2]
    if(!id){
      const s = sessionStorage.getItem('current_trip')
      if(s){ setTrip(JSON.parse(s)); setLoading(false); return }
      setLoading(false); return
    }

    (async ()=>{
      try{
        const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL||'http://localhost:4000'}/api/trips/${id}`)
        if(r.ok){ const json = await r.json(); setTrip(json) }
      }catch(e){ console.error(e) }
      setLoading(false)
    })()
  },[])

  if(loading) return <div className="min-h-screen bg-[#080c14] flex items-center justify-center text-white">Loading itinerary...</div>

  const days = trip?.daysList || trip?.days || []

  return (
    <div className="min-h-screen bg-[#080c14] text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
        <h1 className="text-3xl font-bold mb-6">Day-by-day itinerary</h1>
        <div className="space-y-6">
          {Array.isArray(days) && days.length ? days.map((d,i)=> (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="text-lg font-semibold">Day {i+1}</div>
                <div className="text-sm text-slate-400">{d.date || ''}</div>
              </div>
              <div className="text-sm text-slate-200">
                {d.title || d.summary || d.activities?.map(a=>a.name).join(', ') || 'Activities for the day.'}
              </div>
            </div>
          )) : (
            <div className="text-slate-400">No itinerary found for this trip.</div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
