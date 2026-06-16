'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { destinationKey, generateTravelPlan } from '@/services/api';

const TYPE_COLORS = {
  transport: 'bg-slate-600/20 border-slate-500/30 text-slate-400',
  activity: 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400',
  restaurant: 'bg-amber-600/20 border-amber-500/30 text-amber-400',
  hotel: 'bg-green-600/20 border-green-500/30 text-green-400',
};

const DOT_COLORS = {
  transport: 'bg-slate-400',
  activity: 'bg-indigo-400',
  restaurant: 'bg-amber-400',
  hotel: 'bg-green-400',
};

function eventIcon(type) {
  return {
    transport: '→',
    activity: '•',
    restaurant: '○',
    hotel: '□',
  }[type] || '•';
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

function ItineraryContent() {
  const searchParams = useSearchParams();
  const destination = searchParams.get('destination') || '';
  const budget = searchParams.get('budget') || 15000;
  const daysParam = searchParams.get('days') || 7;
  const travelers = searchParams.get('travelers') || 2;
  const styles = (searchParams.get('styles') || '').split(',').filter(Boolean);
  const [plan, setPlan] = useState(null);
  const [activeDay, setActiveDay] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function loadPlan() {
      setLoading(true);
      setError('');
      try {
        const stored = readStoredPlan({ destination, budget, days: daysParam, travelers, styles });
        if (stored) {
          if (!cancelled) setPlan(stored);
          return;
        }
        const generated = await generateTravelPlan({
          destination,
          budget,
          days: daysParam,
          travelers,
          styles,
        });
        sessionStorage.setItem('current_travel_plan', JSON.stringify(generated));
        if (!cancelled) setPlan(generated);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not load itinerary.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadPlan();
    return () => {
      cancelled = true;
    };
  }, [destination, searchParams]);

  if (loading) return <div className="min-h-screen bg-[#080c14] flex items-center justify-center text-white">Loading itinerary...</div>;
  if (error || !plan) return <div className="min-h-screen bg-[#080c14] flex items-center justify-center text-red-200">{error || 'No itinerary found.'}</div>;

  const days = plan.itinerary || [];
  const day = days[activeDay] || days[0];
  const city = plan.destination.city;
  const spentPct = Math.min(100, Math.round((day.spent / Math.max(day.budget, 1)) * 100));

  return (
    <div className="min-h-screen bg-[#080c14] text-white">
      <Navbar />

      <div className="relative h-64 overflow-hidden">
        <img key={activeDay} src={day.photo} alt={`${city} ${day.theme}`} className="w-full h-full object-cover transition-opacity duration-500 opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080c14] via-[#080c14]/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-6 lg:px-12 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm text-indigo-400 font-medium">Day {day.day} of {days.length}</span>
            <span className="text-slate-500">·</span>
            <span className="text-sm text-slate-400">{day.date}</span>
          </div>
          <h1 className="text-3xl font-bold text-white">{day.theme}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          {days.map((d, i) => (
            <button key={d.day} onClick={() => setActiveDay(i)} className={`flex-shrink-0 rounded-xl px-4 py-3 text-center border transition-all ${activeDay === i ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-white'}`}>
              <div className="text-xs font-medium mb-1">Day {d.day}</div>
              <div className="text-xs opacity-70 whitespace-nowrap">{d.date.split(',')[0]}</div>
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-6">
              <img src={day.photo} alt={day.theme} className="w-full h-48 object-cover opacity-60" />
              <div className="p-5">
                <h2 className="text-xl font-semibold text-white mb-1">{city} itinerary</h2>
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-slate-400">{day.date}</span>
                  <span className={day.spent > day.budget ? 'text-red-400' : 'text-green-400'}>{day.spent} / {day.budget} MAD</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${day.spent > day.budget ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${spentPct}%` }} />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              {Object.entries(TYPE_COLORS).map(([type, cls]) => (
                <span key={type} className={`text-xs px-3 py-1 rounded-full border capitalize ${cls}`}>{type}</span>
              ))}
            </div>

            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-px bg-white/10" />
              <div className="space-y-4">
                {day.events.map((event, i) => (
                  <div key={`${event.time}-${i}`} className="relative flex gap-6 group">
                    <div className={`relative z-10 w-3 h-3 rounded-full mt-4 flex-shrink-0 ml-4 ring-4 ring-[#080c14] ${DOT_COLORS[event.type] || DOT_COLORS.activity}`} />
                    <div className="flex-1 bg-white/3 border border-white/8 rounded-2xl p-4 hover:bg-white/6 hover:border-white/15 transition-all group-hover:translate-x-1 duration-200">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl mt-0.5">{eventIcon(event.type)}</span>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-slate-500 font-mono">{event.time}</span>
                              {event.duration && <span className="text-xs bg-white/8 text-slate-400 px-2 py-0.5 rounded-md">{event.duration}</span>}
                              <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${TYPE_COLORS[event.type] || TYPE_COLORS.activity}`}>{event.type}</span>
                            </div>
                            <h3 className="font-semibold text-white">{event.title}</h3>
                            <p className="text-sm text-slate-400 mt-0.5">{event.sub}</p>
                          </div>
                        </div>
                        {event.price > 0 && <div className="flex-shrink-0 text-right"><div className="text-base font-bold text-white">{event.price}</div><div className="text-xs text-slate-500">MAD</div></div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="font-semibold text-white mb-4">Day {day.day} at a glance</h3>
              <div className="space-y-3">
                {[
                  { label: 'Activities', count: day.events.filter((e) => e.type === 'activity').length, color: 'text-indigo-400' },
                  { label: 'Restaurants', count: day.events.filter((e) => e.type === 'restaurant').length, color: 'text-amber-400' },
                ].map(({ label, count, color }) => (
                  <div key={label} className="flex items-center justify-between text-sm"><span className="text-slate-400">{label}</span><span className={`font-bold ${color}`}>{count}</span></div>
                ))}
                <div className="border-t border-white/10 pt-3 flex items-center justify-between text-sm"><span className="text-slate-300 font-medium">Day total</span><span className="text-white font-bold">{day.spent} MAD</span></div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="font-semibold text-white mb-4">Overall trip progress</h3>
              <div className="space-y-2">
                {days.map((d, i) => (
                  <div key={d.day} onClick={() => setActiveDay(i)} className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all ${activeDay === i ? 'bg-indigo-600/15' : 'hover:bg-white/5'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${activeDay === i ? 'bg-indigo-600 text-white' : 'bg-white/10 text-slate-400'}`}>{d.day}</div>
                    <div className="flex-1 min-w-0"><div className="text-xs text-slate-400 truncate">{d.theme}</div><div className="h-1 bg-white/10 rounded-full mt-1 overflow-hidden"><div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.round((d.spent / Math.max(d.budget, 1)) * 100)}%` }} /></div></div>
                    <div className="text-xs text-slate-500 flex-shrink-0">{d.spent}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
              <div className="text-sm font-semibold text-amber-300 mb-2">Local tip for {city}</div>
              <div className="text-sm text-amber-200/70 leading-relaxed">{day.tip}</div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function ItineraryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080c14] flex items-center justify-center text-white">Loading...</div>}>
      <ItineraryContent />
    </Suspense>
  );
}
