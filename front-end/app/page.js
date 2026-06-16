'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { generateTravelPlan, normalizeDestination } from '@/services/api';

const DESTINATIONS = [
  {
    city: 'Tokyo',
    country: 'Japan',
    tagline: 'Neon nights & ancient temples',
    temp: '22°C',
    photo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
    tags: ['Culture', 'Food', 'Urban'],
  },
  {
    city: 'Santorini',
    country: 'Greece',
    tagline: 'Cliffside villages & cobalt seas',
    temp: '28°C',
    photo: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80',
    tags: ['Romance', 'Beach', 'Views'],
  },
  {
    city: 'Marrakech',
    country: 'Morocco',
    tagline: 'Spice-scented medinas & riads',
    temp: '30°C',
    photo: 'https://images.unsplash.com/photo-1597211684565-dca64d72bdfe?w=800&q=80',
    tags: ['Culture', 'Shopping', 'History'],
  },
  {
    city: 'New York',
    country: 'USA',
    tagline: 'The city that never sleeps',
    temp: '18°C',
    photo: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=80',
    tags: ['Urban', 'Food', 'Art'],
  },
  {
    city: 'Bali',
    country: 'Indonesia',
    tagline: 'Rice terraces & sacred temples',
    temp: '27°C',
    photo: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
    tags: ['Nature', 'Wellness', 'Beach'],
  },
  {
    city: 'Paris',
    country: 'France',
    tagline: 'City of light, love & cuisine',
    temp: '16°C',
    photo: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
    tags: ['Romance', 'Art', 'Food'],
  },
];

const TRAVEL_STYLES = ['Culture', 'Beach', 'Adventure', 'Gastronomie', 'Nature', 'Shopping', 'Wellness', 'Nightlife'];

const STEPS = [
  {
    num: '01',
    title: 'Tell us your dream',
    desc: 'Enter your destination, budget, and how many days you have. Pick what excites you most.',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'AI builds your trip',
    desc: 'Our engine finds flights, hotels, activities and restaurants — all within your budget.',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Refine with AI chat',
    desc: 'Ask anything — visa requirements, packing lists, local tips. Your AI travel expert is always on.',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
  },
];

export default function HomePage() {
  const router = useRouter();
  const [destination, setDestination] = useState('');
  const [budget, setBudget] = useState('');
  const [days, setDays] = useState('');
  const [travelers, setTravelers] = useState('2');
  const [selectedStyles, setSelectedStyles] = useState(['Culture', 'Gastronomie']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleStyle = (style) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalizedDestination = normalizeDestination(destination);
    if (!normalizedDestination || !budget || !days) return;
    setLoading(true);
    setError('');
    try {
      const plan = await generateTravelPlan({ destination: normalizedDestination, budget, days, travelers, styles: selectedStyles });
      sessionStorage.setItem('current_travel_plan', JSON.stringify(plan));
      const params = new URLSearchParams({
        destination: plan.destination.city,
        budget: String(plan.inputs.budget),
        days: String(plan.inputs.days),
        travelers: String(plan.inputs.travelers),
        styles: plan.inputs.styles.join(','),
      });
      router.push(`/trip?${params.toString()}`);
    } catch (err) {
      setError(err.message || 'Could not generate this trip. Check that the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-white font-sans">
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* background layers */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1800&q=85"
            alt="World travel"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#080c14] via-[#080c14]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080c14] via-transparent to-transparent" />
        </div>

        {/* animated orbs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 left-1/3 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-32 pb-16 grid lg:grid-cols-2 gap-16 items-center w-full">
          {/* left copy */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-2 text-sm text-amber-300 mb-8">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              AI-powered travel planning
            </div>
            <h1 className="text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
              Your next
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">
                adventure
              </span>
              <br />
              planned in seconds.
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed mb-10 max-w-lg">
              Tell us where you want to go and your budget. Our AI handles flights, hotels, daily itineraries, restaurants — everything.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                No hidden fees
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                Personalized to you
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                Instant generation
              </span>
            </div>
          </div>

          {/* right — FORM CARD */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-xl font-semibold mb-6 text-white">Plan my trip</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* destination */}
              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-widest mb-2">Destination</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Paris, Tokyo, Bali..."
                  required
                  className="w-full bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:bg-white/15 transition-all"
                />
              </div>

              {/* budget + days + travelers */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 uppercase tracking-widest mb-2">Budget (MAD)</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="15 000"
                    required
                    className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase tracking-widest mb-2">Days</label>
                  <input
                    type="number"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    placeholder="7"
                    required
                    min="1"
                    max="30"
                    className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase tracking-widest mb-2">Travelers</label>
                  <select
                    value={travelers}
                    onChange={(e) => setTravelers(e.target.value)}
                    className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all appearance-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n} className="bg-slate-800">
                        {n} {n === 1 ? 'person' : 'people'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* travel styles */}
              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-widest mb-3">Travel style</label>
                <div className="flex flex-wrap gap-2">
                  {TRAVEL_STYLES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleStyle(s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        selectedStyles.includes(s)
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-white/5 border-white/15 text-slate-400 hover:border-white/30'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Building your trip...
                  </>
                ) : (
                  <>
                    Generate my trip with AI
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </button>
              {error && (
                <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500 text-xs animate-bounce">
          <span>Scroll to explore</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
        </div>
      </section>

      {/* ─── STATS BAND ─── */}
      <section className="border-y border-white/10 bg-white/3 backdrop-blur py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { val: '50K+', label: 'Trips planned' },
            { val: '120+', label: 'Destinations' },
            { val: '4.9★', label: 'Average rating' },
            { val: '< 30s', label: 'Generation time' },
          ].map(({ val, label }) => (
            <div key={label}>
              <div className="text-3xl font-bold text-white mb-1">{val}</div>
              <div className="text-sm text-slate-400">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURED DESTINATIONS ─── */}
      <section className="py-24 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-indigo-400 text-sm font-medium uppercase tracking-widest mb-3">Popular right now</p>
            <h2 className="text-4xl font-bold text-white">Trending destinations</h2>
          </div>
          <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1">
            View all
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DESTINATIONS.map((dest, i) => (
            <div
              key={dest.city}
              onClick={() => setDestination(dest.city)}
              className="group relative overflow-hidden rounded-2xl cursor-pointer"
              style={{ aspectRatio: i === 0 ? '16/10' : '4/3' }}
            >
              <img
                src={dest.photo}
                alt={dest.city}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* tags */}
              <div className="absolute top-4 left-4 flex gap-2">
                {dest.tags.slice(0, 2).map((t) => (
                  <span key={t} className="bg-black/40 backdrop-blur border border-white/20 rounded-full px-2.5 py-1 text-xs text-white/80">
                    {t}
                  </span>
                ))}
              </div>

              {/* temp */}
              <div className="absolute top-4 right-4 bg-black/40 backdrop-blur border border-white/20 rounded-full px-2.5 py-1 text-xs text-white/80">
                {dest.temp}
              </div>

              {/* bottom info */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">{dest.city}</p>
                    <p className="text-sm text-white/70">{dest.country}</p>
                    <p className="text-xs text-slate-400 mt-1">{dest.tagline}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur border border-white/20 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-24 bg-gradient-to-b from-transparent via-indigo-950/20 to-transparent">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <p className="text-indigo-400 text-sm font-medium uppercase tracking-widest mb-3">Simple process</p>
            <h2 className="text-4xl font-bold text-white">How Wandr works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step) => (
              <div key={step.num} className="relative group">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-indigo-500/40 hover:bg-white/8 transition-all">
                  <div className="w-14 h-14 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400 mb-6">
                    {step.icon}
                  </div>
                  <div className="text-5xl font-black text-white/5 absolute top-6 right-8">{step.num}</div>
                  <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BAND ─── */}
      <section className="py-24 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 p-16 text-center">
          <div className="absolute inset-0 opacity-20">
            <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=70" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10">
            <h2 className="text-5xl font-bold text-white mb-6">Ready to explore the world?</h2>
            <p className="text-xl text-indigo-200 mb-10 max-w-2xl mx-auto">
              Join thousands of travelers who've let AI plan their perfect trips. It only takes 30 seconds.
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-white text-indigo-900 font-bold px-10 py-4 rounded-xl hover:bg-indigo-50 transition-all transform hover:scale-105"
            >
              Start planning — it's free
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
