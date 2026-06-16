"use client";
import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import SendMessage from './SendMessage';

function cleanDestination(value) {
  return (value || '').split(',')[0].replace(/\s+/g, ' ').trim() || 'your destination';
}

function quickSuggestions(destination, days) {
  return [
    { label: '📋 Visa requirements', prompt: `What are the visa requirements to visit ${destination} from Morocco?` },
    { label: '💊 Travel insurance', prompt: `What travel insurance do I need for my ${destination} trip?` },
    { label: '🌦️ Weather', prompt: `What is the weather usually like in ${destination}?` },
    { label: '💶 Currency & payments', prompt: `What currency should I bring to ${destination} and can I use cards everywhere?` },
    { label: '🚇 Public transport', prompt: `How does public transport work in ${destination}? Which pass should I buy?` },
    { label: '📞 Emergency contacts', prompt: `What emergency numbers should I know in ${destination}?` },
    { label: '🧳 Packing list', prompt: `Give me a packing list for ${days} days in ${destination}.` },
    { label: '🍽️ Tipping culture', prompt: `Do I need to tip in ${destination}? What is the tipping culture?` },
  ];
}

function initialMessages(destination, days, travelers, budget) {
  return [
    {
      id: 1,
      role: 'assistant',
      content: `Hi! I'm your Wandr AI travel assistant.\n\nI'm fully briefed on your upcoming **${destination} trip** — ${days} days, ${travelers} ${Number(travelers) === 1 ? 'traveler' : 'travelers'}, ${Number(budget).toLocaleString()} MAD budget. I can help you with:\n\n• Visa and entry requirements\n• Local transport and navigation\n• Restaurant recommendations\n• Cultural tips and etiquette\n• Packing and preparation\n• Emergency contacts and safety\n\nWhat would you like to know?`,
      time: 'Just now',
    },
  ];
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3">
      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold flex-shrink-0">W</div>
      <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  const lines = msg.content.split('\n');

  return (
    <div className={`flex items-end gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold flex-shrink-0">W</div>
      )}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-slate-700 border border-white/15 flex items-center justify-center text-sm flex-shrink-0">You</div>
      )}
      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-indigo-600 text-white rounded-br-sm'
              : 'bg-white/5 border border-white/10 text-slate-200 rounded-bl-sm'
          }`}
        >
          {lines.map((line, i) => {
            if (!line.trim()) return <div key={i} className="h-2" />;
            // bold markdown **text**
            const parts = line.split(/(\*\*[^*]+\*\*)/g);
            return (
              <div key={i} className={line.startsWith('•') ? 'ml-2' : ''}>
                {parts.map((part, j) =>
                  part.startsWith('**') && part.endsWith('**')
                    ? <strong key={j}>{part.slice(2, -2)}</strong>
                    : <span key={j}>{part}</span>
                )}
              </div>
            );
          })}
        </div>
        <span className="text-xs text-slate-600 px-1">{msg.time}</span>
      </div>
    </div>
  );
}

function ChatContent() {
  const searchParams = useSearchParams();
  const destination = cleanDestination(searchParams.get('destination'));
  const days = searchParams.get('days') || '7';
  const travelers = searchParams.get('travelers') || '2';
  const budget = searchParams.get('budget') || '15000';
  const suggestions = quickSuggestions(destination, days);
  const [messages, setMessages] = useState(() => initialMessages(destination, days, travelers, budget));
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    setMessages(initialMessages(destination, days, travelers, budget));
  }, [destination, days, travelers, budget]);

  const getReply = (userMsg) => {
    const lower = userMsg.toLowerCase();
    if (lower.includes('visa')) {
      return `**Visa requirements for Morocco to ${destination}:**\n\nVisa rules depend on your passport, residency, trip purpose, and transit airports. Check the official embassy or government visa portal for ${destination} before booking.\n\nFor your ${days}-day trip, prepare:\n\n• Valid passport\n• Accommodation confirmation\n• Return flight tickets\n• Travel insurance\n• Recent bank statements\n• Employment or student proof if applicable\n\nApply early and verify rules against the official source for ${destination}.`;
    }
    if (lower.includes('weather') || lower.includes('mai') || lower.includes('may')) {
      return `**Weather for ${destination}:**\n\nWeather depends on season, so check a live forecast close to departure. For planning your ${days}-day itinerary, pack flexible layers, comfortable walking shoes, and one compact rain layer.\n\nI can also help rebalance outdoor and indoor activities for ${destination} if you tell me your travel month.`;
    }
    if (lower.includes('transport') || lower.includes('metro') || lower.includes('pass')) {
      return `**Getting around ${destination}:**\n\nFor your ${destination} trip, group each day by nearby neighborhoods, confirm airport transfer options before arrival, and compare transit passes against pay-as-you-go fares.\n\nIf you share your hotel area, I can suggest a day-by-day transport strategy for ${destination}.`;
    }
    return `Great question about "${userMsg.slice(0, 40)}..."!\n\nHere's what I know based on your ${destination} trip:\n\nYour current plan is ${days} days for ${travelers} ${Number(travelers) === 1 ? 'traveler' : 'travelers'} with a ${Number(budget).toLocaleString()} MAD budget. I can answer in that context and keep recommendations specific to ${destination}.\n\nWhat else would you like to know?`;
  };

  const sendMessage = async (text) => {
    if (!text.trim() || isTyping) return;
    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: text.trim(),
      time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setIsTyping(true);
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));
    const reply = {
      id: Date.now() + 1,
      role: 'assistant',
      content: getReply(text),
      time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
    };
    setIsTyping(false);
    setMessages((m) => [...m, reply]);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-white flex flex-col">
      <Navbar />

      <div className="flex flex-1 max-w-7xl mx-auto w-full px-6 lg:px-12 py-8 gap-8">
        {/* sidebar — trip context */}
        <div className="hidden lg:flex flex-col gap-4 w-72 flex-shrink-0">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Current trip</div>
                <div className="text-xs text-slate-400">{destination}</div>
              </div>
            </div>
            {[
              { label: 'Duration', val: `${days} days` },
              { label: 'Travelers', val: `${travelers} ${Number(travelers) === 1 ? 'person' : 'people'}` },
              { label: 'Budget', val: `${Number(budget).toLocaleString()} MAD` },
            ].map(({ label, val }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 text-sm">
                <span className="text-slate-400">{label}</span>
                <span className="text-white font-medium">{val}</span>
              </div>
            ))}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="text-xs text-slate-400 uppercase tracking-widest mb-3">Quick questions</div>
            <div className="space-y-1.5">
              {suggestions.map((s) => (
                <button
                  key={s.label}
                  onClick={() => sendMessage(s.prompt)}
                  disabled={isTyping}
                  className="w-full text-left text-sm text-slate-300 hover:text-white bg-transparent hover:bg-white/5 px-3 py-2 rounded-xl transition-all border border-transparent hover:border-white/10 disabled:opacity-40"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* chat area */}
        <div className="flex-1 flex flex-col min-h-[calc(100vh-160px)]">
          {/* chat header */}
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold">W</div>
            <div>
              <div className="font-semibold text-white">Wandr AI Assistant</div>
              <div className="flex items-center gap-1.5 text-xs text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Online · Briefed on your {destination} trip
              </div>
            </div>
          </div>

          {/* messages */}
          <div className="flex-1 space-y-5 overflow-y-auto pr-2 mb-6">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* quick chips (mobile) */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-3 lg:hidden">
            {suggestions.slice(0, 4).map((s) => (
              <button
                key={s.label}
                onClick={() => sendMessage(s.prompt)}
                className="flex-shrink-0 text-xs bg-white/5 border border-white/10 text-slate-300 px-3 py-1.5 rounded-full hover:bg-white/10 transition-all"
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* multimodal input component */}
          <div className="mb-4">
            <SendMessage />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080c14] flex items-center justify-center text-white">Loading...</div>}>
      <ChatContent />
    </Suspense>
  );
}
