"use client"
import React, { useEffect, useState } from 'react'
import { getCities, checkDbHealth } from '../services/api'

export default function CitiesList(){
  const [cities, setCities] = useState([])
  const [dbStatus, setDbStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(()=>{
    let mounted = true
    Promise.all([getCities(), checkDbHealth()])
      .then(([citiesData, health]) => {
        if(!mounted) return
        setCities(Array.isArray(citiesData) ? citiesData : [])
        setDbStatus(health)
      })
      .catch(err => { if(mounted) setError(err.message || String(err)) })
      .finally(()=> { if(mounted) setLoading(false) })
    return ()=> { mounted = false }
  }, [])

  if(loading) return <div className="text-center">Loading cities from backend...</div>
  if(error) return <div className="text-red-500">Error: {error}</div>

  return (
    <div>
      {dbStatus && (
        <div className="mb-4 p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm">
          Backend DB: {dbStatus.status} — {dbStatus.database}
        </div>
      )}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {cities.map(c => (
          <article key={c.id} className="bg-white/80 dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold">{c.city}, {c.country}</h3>
            {c.short_description && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{c.short_description}</p>
            )}
            <div className="mt-3 text-sm text-gray-700 dark:text-gray-200 space-y-1">
              <div><strong>Region:</strong> {c.region || '—'}</div>
              <div><strong>Budget:</strong> {c.budget_level || '—'}</div>
              <div className="flex gap-3 mt-1">
                <span className="inline-block bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">Nature: {c.nature ?? '—'}</span>
                <span className="inline-block bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">Beaches: {c.beaches ?? '—'}</span>
                <span className="inline-block bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">Nightlife: {c.nightlife ?? '—'}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
