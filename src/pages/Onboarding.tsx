import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, LineChart, Line } from 'recharts'
import { useAsync } from '../lib/useAsync'
import { getOnboardingStats } from '../services/api'
import PageHeader from '../components/PageHeader'
import KpiCard from '../components/KpiCard'
import ChartCard from '../components/ChartCard'
import Loading from '../components/Loading'

export default function Onboarding() {
  const { data, loading } = useAsync(getOnboardingStats)

  if (loading || !data) {
    return <><PageHeader title="BQ1 · Onboarding Completion" question="What % of registered users have completed onboarding, segmented by role?" /><Loading /></>
  }

  return (
    <>
      <PageHeader
        title="BQ1 · Onboarding Completion"
        question="What % of registered users have completed onboarding, segmented by role?"
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {data.byRole.map(r => (
          <KpiCard
            key={r.role}
            label={`${r.role.charAt(0).toUpperCase() + r.role.slice(1)}s · completion`}
            value={`${r.completionRate}%`}
            hint={`${r.completedOnboarding} of ${r.registered}`}
            accent={r.completionRate > 60 ? 'green' : 'amber'}
          />
        ))}
        <KpiCard
          label="Overall completion"
          value={`${((data.totals.completedOnboarding / data.totals.registered) * 100).toFixed(1)}%`}
          hint={`${data.totals.completedOnboarding} of ${data.totals.registered}`}
          accent="brand"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Completion rate by role" description="users.onboarded = true, grouped by users.role">
          <ResponsiveContainer>
            <BarChart data={data.byRole}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="role" />
              <YAxis unit="%" />
              <Tooltip />
              <Bar dataKey="completionRate" fill="#4f6df0" radius={[8, 8, 0, 0]} name="Completion %" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Registration vs onboarding over time" description="Monthly trend">
          <ResponsiveContainer>
            <LineChart data={data.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="registered" stroke="#4f6df0" strokeWidth={2} />
              <Line type="monotone" dataKey="onboarded"  stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </>
  )
}
