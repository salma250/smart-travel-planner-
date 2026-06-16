export default function Card({title, subtitle, image, children, small, className=''}){
  return (
    <article className={`rounded-2xl p-5 ${small? 'text-sm':'text-base'} soft-transition ${className}`}>
      <div className="bg-white/70 dark:bg-smarttravel.carddark/80 backdrop-blur-md rounded-2xl p-5 card-shadow">
        {image && <div className="h-44 w-full rounded-md overflow-hidden mb-4 bg-gray-100"><img src={image} alt={title} className="w-full h-full object-cover"/></div>}
        <div className="flex items-start justify-between mb-3">
          <div>
            {subtitle && <div className="text-sm text-slate-500 dark:text-slate-300">{subtitle}</div>}
            {title && <div className="text-lg font-semibold">{title}</div>}
          </div>
        </div>
        <div className="text-slate-700 dark:text-slate-200">{children}</div>
      </div>
    </article>
  )
}
