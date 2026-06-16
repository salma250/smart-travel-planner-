'use client'
import CitiesList from '@/components/CitiesList'

export default function CitiesPage() {
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-2 text-white">Destinations (API test)</h1>
      <p className="text-slate-400 mb-8">
        Cities loaded from FastAPI → PostgreSQL/SQLite. If you see cards below, the full stack works.
      </p>
      <CitiesList />
    </div>
  )
}
