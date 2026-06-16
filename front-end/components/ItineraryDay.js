export default function ItineraryDay({ time, title, description, price }){
  return (
    <div className="flex items-start gap-4">
      <div className="w-14 text-sm text-slate-500">{time}</div>
      <div className="flex-1 bg-white/60 dark:bg-smarttravel.carddark/70 backdrop-blur rounded-xl p-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-medium">{title}</div>
            {description && <div className="text-sm text-slate-500">{description}</div>}
          </div>
          {price !== undefined && <div className="text-sm font-semibold">${price}</div>}
        </div>
      </div>
    </div>
  )
}
