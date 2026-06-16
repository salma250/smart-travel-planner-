import { ArrowRight } from 'lucide-react'

export default function Button({ children, type = 'button', className = '', variant = 'primary', onClick }){
  const base = 'inline-flex items-center gap-3 px-4 py-2 rounded-2xl font-semibold soft-transition'
  if(variant === 'ghost') return (<button type={type} onClick={onClick} className={`${base} bg-transparent border ${className}`}>{children}</button>)
  if(variant === 'outline') return (<button type={type} onClick={onClick} className={`${base} bg-transparent border border-slate-300 dark:border-slate-600 ${className}`}>{children}</button>)
  return (
    <button type={type} onClick={onClick} className={`${base} bg-gradient-to-br from-smarttravel-primary to-indigo-500 text-white shadow ${className}`}>
      <span>{children}</span>
      <ArrowRight size={14} className="opacity-90" />
    </button>
  )
}
