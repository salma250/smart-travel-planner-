export default function Input({ placeholder, value, onChange, type = 'text', icon: Icon }){
  return (
    <div className={`relative ${Icon ? 'input-with-icon' : ''}`}>
      {Icon && (
        <div className="input-icon">
          <Icon size={16} />
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
      />
    </div>
  )
}
