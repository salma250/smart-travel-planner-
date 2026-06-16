import { useEffect, useState } from 'react'
import { getTrips } from '../services/api'
import Loader from '../components/Loader'
import ErrorMessage from '../components/ErrorMessage'

export default function Trips(){
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(()=>{
    let mounted = true
    getTrips().then(res=>{ if(mounted){ setTrips(Array.isArray(res) ? res : (res.trips||[])); setLoading(false) } }).catch(err=>{ if(mounted){ setError(err.message||'Failed to load'); setLoading(false) } })
    return ()=> mounted = false
  },[])

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-semibold mb-4">Trips</h2>
      {loading && <Loader />}
      {error && <ErrorMessage message={error} />}
      {!loading && !error && (
        <div className="grid md:grid-cols-3 gap-4">
          {trips.map(t=> (
            <div key={t.id} className="bg-white rounded-xl p-4 shadow hover:shadow-lg transition">
              <div className="font-semibold">{t.title || t.destination}</div>
              <div className="text-sm text-gray-500">Budget: {t.budget || 'N/A'}</div>
              <div className="text-sm text-gray-500">{t.start_date} → {t.end_date}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
