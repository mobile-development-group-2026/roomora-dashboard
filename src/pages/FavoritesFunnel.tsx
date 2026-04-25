import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, LineChart, Line } from 'recharts'
import { useAsync } from '../lib/useAsync'
import { getFavoritesFunnel } from '../services/api'
import PageHeader from '../components/PageHeader'
import KpiCard from '../components/KpiCard'
import ChartCard from '../components/ChartCard'
import Loading from '../components/Loading'

export default function FavoritesFunnel() {
  const { data, loading } = useAsync(getFavoritesFunnel)

  if (loading || !data) {
    return <><PageHeader title="BQ2 · Favorites → Application Funnel" question="What % of students who favorited a listing went on to apply for it?" /><Loading /></>
  }

  return (
    <>
      <PageHeader
        title="BQ2 · Favorites → Application Funnel"
        question="What % of students who favorited a listing went on to apply for it?"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <KpiCard label="Students who favorited" value={data.summary.studentsWhoFavorited} accent="gray" />
        <KpiCard label="Students who applied" value={data.summary.studentsWhoApplied} accent="brand" />
        <KpiCard
          label="Conversion rate"
          value={`${data.summary.conversionRate}%`}
          hint="Favorited → Applied"
          accent="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Monthly funnel" description="Favorites and applications over time">
          <ResponsiveContainer>
            <LineChart data={data.monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="favorited" stroke="#4f6df0" strokeWidth={2} />
              <Line type="monotone" dataKey="applied" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Time to apply after favoriting" description="How quickly students convert">
          <ResponsiveContainer>
            <BarChart data={data.byTimeToApply}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="bucket" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="students" fill="#4f6df0" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </>
  )
}
