import { useAsync } from '../lib/useAsync'
import { getOnboardingStats, getFavoritesFunnel, getApplicationStats } from '../services/api'
import KpiCard from '../components/KpiCard'
import PageHeader from '../components/PageHeader'
import Loading from '../components/Loading'

export default function Overview() {
  const onb = useAsync(getOnboardingStats)
  const fav = useAsync(getFavoritesFunnel)
  const app = useAsync(getApplicationStats)

  const loading = onb.loading || fav.loading || app.loading
  if (loading || !onb.data || !fav.data || !app.data) {
    return <><PageHeader title="Overview" subtitle="High-level metrics across all business questions" /><Loading /></>
  }

  const overallOnboarding = ((onb.data.totals.completedOnboarding / onb.data.totals.registered) * 100).toFixed(1)

  return (
    <>
      <PageHeader
        title="Overview"
        subtitle="High-level metrics across all business questions"
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Registered users" value={onb.data.totals.registered.toLocaleString()} accent="gray" />
        <KpiCard label="Onboarding completion" value={`${overallOnboarding}%`} accent="brand" hint="BQ1" />
        <KpiCard label="Favorite → Apply rate" value={`${fav.data.summary.conversionRate}%`} accent="green" hint="BQ2" />
        <KpiCard label="Application approval rate" value={`${app.data.summary.approvalRate}%`} accent="amber" hint="BQ3" />
      </div>
    </>
  )
}
