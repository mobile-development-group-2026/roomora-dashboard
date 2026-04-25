import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts'
import { useAsync } from '../lib/useAsync'
import { getApplicationStats } from '../services/api'
import PageHeader from '../components/PageHeader'
import KpiCard from '../components/KpiCard'
import ChartCard from '../components/ChartCard'
import Loading from '../components/Loading'

const STATUS_COLORS = ['#10b981', '#f59e0b', '#ef4444']

export default function Applications() {
  const { data, loading } = useAsync(getApplicationStats)

  if (loading || !data) {
    return <><PageHeader title="BQ3 · Application Approval Rate" question="What is the application approval rate per listing, and does including a preferred_visit_at increase the approval rate?" /><Loading /></>
  }

  const statusData = [
    { name: 'Approved', value: data.summary.approved },
    { name: 'Pending',  value: data.summary.pending },
    { name: 'Rejected', value: data.summary.rejected },
  ]

  const lift = (data.withVsWithoutVisitAt[0].approvalRate - data.withVsWithoutVisitAt[1].approvalRate).toFixed(1)

  return (
    <>
      <PageHeader
        title="BQ3 · Application Approval Rate"
        question="What is the application approval rate per listing, and does including a preferred_visit_at increase the approval rate?"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total applications" value={data.summary.totalApplications} accent="gray" />
        <KpiCard label="Overall approval rate" value={`${data.summary.approvalRate}%`} accent="brand" />
        <KpiCard label="With preferred_visit_at" value={`${data.withVsWithoutVisitAt[0].approvalRate}%`} accent="green" />
        <KpiCard label="Lift from preferred_visit_at" value={`+${lift} pp`} hint="percentage points" accent="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Approval rate: with vs without preferred_visit_at" description="Direct answer to the second part of BQ3">
          <ResponsiveContainer>
            <BarChart data={data.withVsWithoutVisitAt} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis type="number" unit="%" domain={[0, 100]} />
              <YAxis type="category" dataKey="category" width={200} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="approvalRate" fill="#4f6df0" radius={[0, 8, 8, 0]} name="Approval %" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Status breakdown" description="applications.status across all rows">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                {statusData.map((_, i) => <Cell key={i} fill={STATUS_COLORS[i]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Approval rate per listing" description="Top 8 listings by application volume" height={360}>
        <ResponsiveContainer>
          <BarChart data={data.byListing} margin={{ bottom: 50 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
            <XAxis dataKey="title" angle={-25} textAnchor="end" height={80} tick={{ fontSize: 11 }} interval={0} />
            <YAxis unit="%" />
            <Tooltip />
            <Bar dataKey="approvalRate" fill="#4f6df0" radius={[8, 8, 0, 0]} name="Approval %" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </>
  )
}
