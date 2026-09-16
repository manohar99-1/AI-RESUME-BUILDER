export default function Field({ label, value, onChange, placeholder, className = '' }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="text-[12px] font-medium text-ink/70">{label}</span>}
      <input
        type="text"
        className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-moss/40"
        placeholder={placeholder}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}
