import { useAsync } from '../lib/useAsync'
import { getConversionMatrix } from '../services/api'
import PageHeader from '../components/PageHeader'
import Loading from '../components/Loading'

function colorFor(rate: number, hasData: boolean): string {
  if (!hasData) return '#f3f4f6'
  // 0% red → 70% green
  const t = Math.min(rate / 70, 1)
  const r = Math.round(239 + (16 - 239) * t)
  const g = Math.round(68  + (185 - 68) * t)
  const b = Math.round(68  + (129 - 68) * t)
  return `rgb(${r},${g},${b})`
}

// Pretty labels for property_type values stored in DB
const PROPERTY_LABELS: Record<string, string> = {
  habitacion:      'Habitación',
  apartaestudio:   'Apartaestudio',
  apartamento_1h:  'Apto 1H',
  apartamento_2h:  'Apto 2H',
  casa:            'Casa',
}
const labelFor = (k: string) => PROPERTY_LABELS[k] ?? k

export default function Conversion() {
  const { data, loading } = useAsync(getConversionMatrix)

  if (loading || !data) {
    return <><PageHeader title="BQ5 · Conversion by Price & Property Type" question="Which listing price ranges and property types have the highest favorites-to-application conversion rate?" /><Loading /></>
  }

  const top3 = [...data.matrix]
    .filter(c => c.favorites > 0)
    .sort((a, b) => b.conversionRate - a.conversionRate)
    .slice(0, 3)

  return (
    <>
      <PageHeader
        title="BQ5 · Conversion by Price & Property Type"
        question="Which listing price ranges and property types have the highest favorites-to-application conversion rate?"
      />

      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <h3 className="font-semibold text-gray-900 mb-1">Conversion rate heatmap</h3>
        <p className="text-sm text-gray-500 mb-4">Favorites → Applications, %. Gray cells = no data. Price buckets in COP.</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="p-2 text-left text-gray-500 font-medium">Property type</th>
                {data.priceRanges.map(p => (
                  <th key={p} className="p-2 text-center text-gray-500 font-medium text-xs">{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.propertyTypes.map(pt => (
                <tr key={pt}>
                  <td className="p-2 font-medium text-gray-700">{labelFor(pt)}</td>
                  {data.priceRanges.map(pr => {
                    const cell = data.matrix.find(c => c.propertyType === pt && c.priceRange === pr)
                    const rate = cell?.conversionRate ?? 0
                    const hasData = (cell?.favorites ?? 0) > 0
                    return (
                      <td
                        key={pr}
                        className="p-2 text-center font-semibold"
                        style={{
                          background: colorFor(rate, hasData),
                          color: hasData && rate > 35 ? 'white' : '#374151',
                          minWidth: 90,
                        }}
                        title={hasData ? `${cell?.applications}/${cell?.favorites}` : 'No data'}
                      >
                        {hasData ? `${rate.toFixed(1)}%` : '—'}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Top 3 conversion segments</h3>
        <div className="space-y-3">
          {top3.map((c, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">{labelFor(c.propertyType)} · {c.priceRange}</div>
                <div className="text-xs text-gray-500">{c.applications} applications from {c.favorites} favorites</div>
              </div>
              <div className="text-2xl font-bold text-emerald-600">{c.conversionRate.toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
