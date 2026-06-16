'use client';
import { useEffect, useMemo, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { destinationKey, generateTravelPlan } from '../../services/api';

const TYPE_COLORS = {
  Activity: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
  Restaurant: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
};

function Stars({ n }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i < n ? 'text-amber-400' : 'text-white/20'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

function readStoredPlan({ destination, budget, days, travelers, styles }) {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem('current_travel_plan');
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    const sameDestination = destinationKey(parsed?.destination?.city) === destinationKey(destination);
    const sameInputs =
      Number(parsed?.inputs?.budget) === Number(budget) &&
      Number(parsed?.inputs?.days) === Number(days) &&
      Number(parsed?.inputs?.travelers) === Number(travelers) &&
      (parsed?.inputs?.styles || []).join('|') === (styles || []).join('|');
    if (sameDestination && sameInputs) {
      return parsed;
    }
  } catch (e) {
    console.error(e);
  }
  return null;
}

function TripContent() {
  const router = useRouter();
  const params = useSearchParams();
  const destination = params.get('destination') || '';
  const budget = params.get('budget') || '15000';
  const days = params.get('days') || '7';
  const travelers = params.get('travelers') || '2';
  const styles = useMemo(() => (params.get('styles') || '').split(',').filter(Boolean), [params]);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFlight, setSelectedFlight] = useState(1);
  const [selectedHotel, setSelectedHotel] = useState(1);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    let cancelled = false;
    async function loadPlan() {
      setLoading(true);
      setError('');
      try {
        const stored = readStoredPlan({ destination, budget, days, travelers, styles });
        if (stored) {
          if (!cancelled) setPlan(stored);
          return;
        }
        const generated = await generateTravelPlan({ destination, budget, days, travelers, styles });
        sessionStorage.setItem('current_travel_plan', JSON.stringify(generated));
        if (!cancelled) setPlan(generated);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not load the travel plan.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadPlan();
    return () => {
      cancelled = true;
    };
  }, [destination, budget, days, travelers, styles]);

  if (loading) {
    return <div className="min-h-screen bg-[#080c14] flex items-center justify-center text-white">Loading destination-specific results...</div>;
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-[#080c14] text-white">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-28">
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-red-200">{error || 'No travel plan found.'}</div>
        </div>
      </div>
    );
  }

  const city = plan.destination.city;
  const flights = plan.flights || [];
  const hotels = plan.hotels || [];
  const breakdown = plan.budget?.breakdown || [];
  const totalSpent = plan.budget?.estimated_total || 0;
  const remaining = plan.budget?.remaining || 0;
  const selectedFlightData = flights.find((f) => f.id === selectedFlight) || flights[0];
  const selectedHotelData = hotels.find((h) => h.id === selectedHotel) || hotels[0];
  const planQuery = new URLSearchParams({
    destination: city,
    budget: String(plan.inputs.budget),
    days: String(plan.inputs.days),
    travelers: String(plan.inputs.travelers),
    styles: (plan.inputs.styles || []).join(','),
  }).toString();

  return (
    <div className="min-h-screen bg-[#080c14] text-white">
      <Navbar />
      <div className="relative h-72 overflow-hidden">
        <img src={plan.destination.image} alt={city} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080c14] via-[#080c14]/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-6 lg:px-12 pb-8 max-w-7xl mx-auto">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-green-500/20 border border-green-500/30 text-green-400 text-xs px-3 py-1 rounded-full">Trip generated</span>
                <span className="text-slate-400 text-sm">{plan.inputs.travelers} travelers · {plan.inputs.days} days · {plan.destination.country}</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white">{city}</h1>
              <p className="text-slate-300 mt-3 max-w-2xl">{plan.destination.description}</p>
            </div>
            <button onClick={() => router.push('/')} className="hidden md:flex items-center gap-2 text-sm text-slate-400 hover:text-white bg-white/10 border border-white/15 rounded-xl px-4 py-2.5 transition-all hover:bg-white/15">
              Regenerate
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
        <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 mb-10 w-fit">
          {['overview', 'flights', 'hotels', 'budget'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white'}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-white">Budget overview</h2>
                <span className={`text-sm font-medium ${remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {remaining >= 0 ? `${remaining.toLocaleString()} MAD remaining` : `${Math.abs(remaining).toLocaleString()} MAD over budget`}
                </span>
              </div>
              <div className="h-3 rounded-full overflow-hidden flex gap-0.5 mb-4">
                {breakdown.map((item) => (
                  <div key={item.label} className={`${item.color} h-full`} style={{ width: `${Math.max(8, Math.round((item.amount / Math.max(totalSpent, 1)) * 100))}%` }} />
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {breakdown.map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-sm">
                    <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <div>
                      <div className="text-white/70">{item.label}</div>
                      <div className="text-white font-medium">{item.amount.toLocaleString()} MAD</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Recommended flights to {city}</h2>
                <span className="text-xs text-slate-400">{flights.length} options found</span>
              </div>
              <div className="space-y-3">
                {flights.map((flight) => (
                  <div key={flight.id} onClick={() => setSelectedFlight(flight.id)} className={`border rounded-2xl p-5 cursor-pointer transition-all ${selectedFlight === flight.id ? 'border-indigo-500 bg-indigo-600/10' : 'border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/5'}`}>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full border-2 transition-all ${selectedFlight === flight.id ? 'border-indigo-400 bg-indigo-400' : 'border-white/30'}`} />
                        <div className="text-sm font-medium text-slate-300">{flight.airline}</div>
                      </div>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full border text-green-400 bg-green-400/10 border-green-400/20">{flight.badge}</span>
                    </div>
                    <div className="mt-4 flex items-center gap-6">
                      <div className="text-center"><div className="text-2xl font-bold text-white">{flight.dep}</div><div className="text-xs text-slate-400 mt-1">{flight.from} · {flight.fromCity}</div></div>
                      <div className="flex-1 text-center"><div className="text-xs text-slate-500">{flight.duration}</div><div className="border-t border-dashed border-slate-600 my-2" /><div className="text-xs text-slate-500">{flight.stops}</div></div>
                      <div className="text-center"><div className="text-2xl font-bold text-white">{flight.arr}</div><div className="text-xs text-slate-400 mt-1">{flight.to} · {flight.toCity}</div></div>
                      <div className="text-right ml-auto"><div className="text-2xl font-bold text-white">{flight.price.toLocaleString()}</div><div className="text-xs text-slate-400">MAD / person</div></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Hotels in {city}</h2>
                <span className="text-xs text-slate-400">{hotels.length} options found</span>
              </div>
              <div className="space-y-3">
                {hotels.map((hotel) => (
                  <div key={hotel.id} onClick={() => setSelectedHotel(hotel.id)} className={`border rounded-2xl overflow-hidden cursor-pointer transition-all flex ${selectedHotel === hotel.id ? 'border-indigo-500 bg-indigo-600/10' : 'border-white/10 bg-white/3 hover:border-white/20'}`}>
                    <img src={hotel.photo} alt={hotel.name} className="w-36 h-32 object-cover flex-shrink-0" />
                    <div className="p-5 flex-1 flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1"><h3 className="font-semibold text-white">{hotel.name}</h3><span className="text-xs px-2 py-0.5 rounded-full border text-indigo-400 bg-indigo-400/10 border-indigo-400/20">{hotel.badge}</span></div>
                        <div className="text-sm text-slate-400 mb-2">{hotel.area}</div>
                        <Stars n={hotel.stars} />
                        <div className="flex items-center gap-2 mt-2"><span className="text-sm font-medium text-white">{hotel.rating}</span><span className="text-xs text-slate-400">({hotel.reviews} reviews)</span></div>
                        <div className="flex flex-wrap gap-1.5 mt-3">{hotel.amenities.map((a) => <span key={a} className="text-xs bg-white/8 text-slate-300 px-2 py-0.5 rounded-md">{a}</span>)}</div>
                      </div>
                      <div className="text-right flex-shrink-0"><div className="text-xl font-bold text-white">{hotel.price.toLocaleString()}</div><div className="text-xs text-slate-400">MAD/night</div><div className="text-sm text-slate-300 mt-1">{hotel.total.toLocaleString()} total</div><div className="text-xs text-slate-500">{hotel.nights} nights</div></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Destination recommendations</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {plan.recommendations.map((item) => (
                  <div key={item.title} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${TYPE_COLORS[item.type] || TYPE_COLORS.Activity}`}>{item.type}</span>
                    <h3 className="font-semibold text-white mt-3">{item.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">{item.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-24">
              <h3 className="font-semibold text-white mb-5">Trip summary</h3>
              <div className="space-y-4 mb-6">
                {[
                  { label: 'Flight', val: `${selectedFlightData?.price?.toLocaleString() || '-'} MAD x ${plan.inputs.travelers}` },
                  { label: 'Hotel', val: `${selectedHotelData?.total?.toLocaleString() || '-'} MAD` },
                  { label: 'Duration', val: `${plan.inputs.days} days` },
                  { label: 'Travelers', val: `${plan.inputs.travelers} people` },
                ].map(({ label, val }) => (
                  <div key={label} className="flex items-center justify-between text-sm"><span className="text-slate-400">{label}</span><span className="text-white font-medium">{val}</span></div>
                ))}
                <div className="border-t border-white/10 pt-4 flex items-center justify-between"><span className="text-slate-300 font-medium">Total estimated</span><span className="text-white font-bold text-lg">{totalSpent.toLocaleString()} MAD</span></div>
              </div>
              <button onClick={() => router.push(`/itinerary?${planQuery}`)} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2">
                View day-by-day itinerary
              </button>
              <button onClick={() => router.push(`/chat?${planQuery}`)} className="w-full mt-3 border border-white/15 text-slate-300 hover:text-white hover:border-white/30 font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
                Ask AI assistant
              </button>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="relative h-48 bg-slate-800 flex items-center justify-center">
                <img src={plan.destination.image} alt={`${city} map preview`} className="w-full h-full object-cover opacity-50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white">{city} results only</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function TripPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080c14] flex items-center justify-center text-white">Loading...</div>}>
      <TripContent />
    </Suspense>
  );
}
