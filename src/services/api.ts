// Capa de servicios. Hoy lee mocks; cuando conectes el backend Rails,
// reemplaza el cuerpo de cada función por un fetch() al endpoint correspondiente.
// Los componentes NO deberían cambiar.

import onboarding from '../data/onboarding.json'
import favorites from '../data/favorites.json'
import applications from '../data/applications.json'
import gps from '../data/gps.json'
import conversion from '../data/conversion.json'

const delay = (ms = 250) => new Promise(r => setTimeout(r, ms))

export type OnboardingData = typeof onboarding
export type FavoritesData = typeof favorites
export type ApplicationsData = typeof applications
export type GpsData = typeof gps
export type ConversionData = typeof conversion

// BQ1
export async function getOnboardingStats(): Promise<OnboardingData> {
  await delay()
  return onboarding
  // FUTURO: return fetch('/api/analytics/onboarding').then(r => r.json())
}

// BQ2
export async function getFavoritesFunnel(): Promise<FavoritesData> {
  await delay()
  return favorites
  // FUTURO: return fetch('/api/analytics/favorites_funnel').then(r => r.json())
}

// BQ3
export async function getApplicationStats(): Promise<ApplicationsData> {
  await delay()
  return applications
  // FUTURO: return fetch('/api/analytics/applications').then(r => r.json())
}

// BQ4
export async function getGpsUpdateStats(): Promise<GpsData> {
  await delay()
  return gps
  // FUTURO: return fetch('/api/analytics/gps_updates').then(r => r.json())
}

// BQ5
export async function getConversionMatrix(): Promise<ConversionData> {
  await delay()
  return conversion
  // FUTURO: return fetch('/api/analytics/conversion_matrix').then(r => r.json())
}
