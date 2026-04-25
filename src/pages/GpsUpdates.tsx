import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts'
import { useAsync } from '../lib/useAsync'
import { getGpsUpdateStats } from '../services/api'
import PageHeader from '../components/PageHeader'
import KpiCard from '../components/KpiCard'
import ChartCard from '../components/ChartCard'
import Loading from '../components/Loading'

export default function GpsUpdates() {
  const { data, loading } = useAsync(getGpsUpdateStats)

  if (loading || !data) {
    return <><PageHeader title="BQ4 · GPS Coverage on Listings" question="What % of landlord listings have GPS coordinates set (latitude & longitude not null)?" /><Loading /></>
  }

  const split = [
    { name: 'With GPS coordinates', value: data.summary.listingsWithGPS },
    { name: 'Missing GPS',          value: data.summary.listingsWithoutGPS },
  ]

  return (
    <>
      <PageHeader
        title="BQ4 · GPS Coverage on Listings"
        question="What % of landlord listings have GPS coordinates set (latitude & longitude not null)?"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total listings" value={data.summary.totalListings} accent="gray" />
        <KpiCard label="With GPS coordinates" value={data.summary.listingsWithGPS} accent="brand" />
        <KpiCard label="Listing coverage" value={`${data.summary.listingCoverageRate}%`} hint="listings with lat & lng" accent="green" />
        <KpiCard label="Landlord coverage" value={`${data.summary.landlordCoverageRate}%`} hint="≥1 listing with GPS" accent="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Listings with vs without GPS" description="lat/lng NOT NULL across all listings">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={split} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                <Cell fill="#10b981" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Coverage rate by city" description="Where are landlords adding GPS more reliably?">
          <ResponsiveContainer>
            <BarChart data={data.byCity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="city" />
              <YAxis unit="%" />
              <Tooltip />
              <Bar dataKey="rate" fill="#4f6df0" radius={[8, 8, 0, 0]} name="GPS coverage %" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Coverage rate by number of listings per landlord" description="Do landlords with more listings keep GPS more complete?">
        <ResponsiveContainer>
          <BarChart data={data.byListingsCount}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
            <XAxis dataKey="category" />
            <YAxis unit="%" />
            <Tooltip />
            <Bar dataKey="rate" fill="#4f6df0" radius={[8, 8, 0, 0]} name="Landlords with ≥1 GPS listing %" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </>
  )
}
