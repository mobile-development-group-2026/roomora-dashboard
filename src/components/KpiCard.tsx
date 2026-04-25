type Props = {
  label: string
  value: string | number
  hint?: string
  accent?: 'brand' | 'green' | 'amber' | 'rose' | 'gray'
}

const accentMap = {
  brand: 'text-brand-600',
  green: 'text-emerald-600',
  amber: 'text-amber-600',
  rose:  'text-rose-600',
  gray:  'text-gray-700',
}

export default function KpiCard({ label, value, hint, accent = 'brand' }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="text-sm text-gray-500">{label}</div>
      <div className={`text-3xl font-bold mt-2 ${accentMap[accent]}`}>{value}</div>
      {hint && <div className="text-xs text-gray-400 mt-1">{hint}</div>}
    </div>
  )
}
