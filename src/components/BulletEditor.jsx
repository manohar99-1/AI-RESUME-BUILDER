export default function BulletEditor({ label, value, onChange, rows = 3, placeholder }) {
  return (
    <label className="block">
      {label && <span className="text-[12px] font-medium text-ink/70">{label}</span>}
      <textarea
        className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-[13px] leading-snug focus:outline-none focus:ring-2 focus:ring-moss/40"
        rows={rows}
        placeholder={placeholder || 'One item per line'}
        value={(value || []).join('\n')}
        onChange={(e) => onChange(e.target.value.split('\n'))}
      />
    </label>
  )
}
