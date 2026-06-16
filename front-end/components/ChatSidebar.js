"use client"

import { useState } from 'react'

export default function ChatSidebar(){
  const [query, setQuery] = useState('')
  const quick = ['Add more food', 'Cheaper hotels', 'More nature']

  function send(q){
    alert('Would send to assistant: ' + q)
  }

  return (
    <aside className="bg-white/60 dark:bg-smarttravel.carddark/80 backdrop-blur-md rounded-2xl p-4">
      <div className="font-semibold mb-2">Assistant</div>
      <div className="text-sm text-slate-500 mb-4">Quick suggestions</div>
      <div className="flex flex-col gap-2 mb-4">
        {quick.map((q,i)=> (
          <button key={i} onClick={()=>send(q)} className="text-left px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5">{q}</button>
        ))}
      </div>

      <div className="mt-2">
        <label className="text-xs text-slate-400">Ask something</label>
        <div className="flex gap-2 mt-2">
          <input value={query} onChange={e=>setQuery(e.target.value)} className="flex-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5" />
          <button onClick={()=>send(query)} className="px-3 py-2 rounded-lg bg-smarttravel-primary text-white">Ask</button>
        </div>
      </div>
    </aside>
  )
}
"use client"
import { useState } from 'react'
import { Send, X } from 'lucide-react'

export default function ChatSidebar(){
  const [open, setOpen] = useState(true)
  const [messages, setMessages] = useState([
    {id:1, role:'ai', text:'Hi! I can help plan your trip.'}
  ])
  const [text, setText] = useState('')

  function send(){
    if(!text) return
    setMessages(prev=>[...prev, {id:Date.now(), role:'user', text}])
    setText('')
    setTimeout(()=>{
      setMessages(prev=>[...prev, {id:Date.now()+1, role:'ai', text:'Great! I suggest visiting the downtown market and a rooftop bar tonight.'}])
    }, 600)
  }

  return (
    <aside className={`fixed right-6 bottom-6 w-80 bg-white rounded-2xl card-shadow overflow-hidden flex flex-col ${open?'' : 'h-12'} `}>
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="font-medium flex items-center gap-2">AI Assistant</div>
        <div className="flex items-center gap-2">
          <button onClick={()=>setOpen(!open)} className="text-sm text-slate-500 p-1 rounded hover:bg-slate-50"><X size={14} /></button>
        </div>
      </div>
      {open && (
        <div className="flex-1 p-3 flex flex-col">
          <div className="flex-1 overflow-auto space-y-3 mb-3">
            {messages.map(m=> (
              <div key={m.id} className={`max-w-[85%] p-3 rounded-lg ${m.role==='user' ? 'bg-indigo-50 self-end text-right' : 'bg-slate-100 self-start'}` }>{m.text}</div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input value={text} onChange={e=>setText(e.target.value)} className="flex-1 px-3 py-2 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-100 soft-transition" placeholder="Ask about your trip..." />
            <button onClick={send} className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-xl soft-transition hover:opacity-95"><Send size={14} /></button>
          </div>
        </div>
      )}
    </aside>
  )
}
