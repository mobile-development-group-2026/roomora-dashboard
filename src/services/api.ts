// Types derived from mock shapes — kept so pages compile unchanged.
import type onboarding from '../data/onboarding.json'
import type favorites   from '../data/favorites.json'
import type applications from '../data/applications.json'
import type gps          from '../data/gps.json'
import type conversion   from '../data/conversion.json'

export type OnboardingData   = typeof onboarding
export type FavoritesData    = typeof favorites
export type ApplicationsData = typeof applications
export type GpsData          = typeof gps
export type ConversionData   = typeof conversion

const BASE = 'https://roomora-api.onrender.com/api/v1'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`API ${res.status} — ${path}`)
  return res.json() as Promise<T>
}

// BQ1 — Onboarding completion rate segmented by role
export function getOnboardingStats(): Promise<OnboardingData> {
  return get('/analytics/onboarding_funnel')
}

// BQ2 — % of students who favorited a listing and went on to apply for it
export function getFavoritesFunnel(): Promise<FavoritesData> {
  return get('/analytics/favorites_funnel')
}

// BQ3 — Application approval rate; impact of preferred_visit_at
export function getApplicationStats(): Promise<ApplicationsData> {
  return get('/analytics/application_approval')
}

// BQ4 — Favorites-to-application conversion by price range × property type
export function getConversionMatrix(): Promise<ConversionData> {
  return get('/analytics/conversion_matrix')
}

// GPS / proximity analytics (unchanged — still auth-gated on the iOS side)
export function getGpsUpdateStats(): Promise<GpsData> {
  return get('/analytics/gps_landlord')
}
