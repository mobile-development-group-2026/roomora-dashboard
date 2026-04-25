# Backend Queries — Roomora Analytics

Una query por BQ. Cada query devuelve la shape exacta que `src/services/api.ts` espera. Probadas mentalmente contra el schema real de Roomora.

> **Notas generales**
> - `applications.status` se asume con valores `'approved'`, `'pending'`, `'rejected'` (ajusta si el enum es distinto).
> - `users.role` se asume con valores `'student'` y `'landlord'`.
> - Todas las queries van en el `analytics_controller.rb` y se exponen como `/api/analytics/*`.

---

## BQ1 — Onboarding completion (`GET /api/analytics/onboarding`)

```sql
-- Totales globales
SELECT
  COUNT(*) AS registered,
  COUNT(*) FILTER (WHERE onboarded = TRUE) AS completed_onboarding
FROM users;

-- Por rol
SELECT
  role,
  COUNT(*) AS registered,
  COUNT(*) FILTER (WHERE onboarded = TRUE) AS completed_onboarding,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE onboarded = TRUE) / NULLIF(COUNT(*), 0),
    1
  ) AS completion_rate
FROM users
GROUP BY role
ORDER BY role;

-- Trend mensual (últimos 6 meses)
SELECT
  TO_CHAR(date_trunc('month', created_at), 'Mon') AS month,
  COUNT(*) AS registered,
  COUNT(*) FILTER (WHERE onboarded = TRUE) AS onboarded
FROM users
WHERE created_at >= NOW() - INTERVAL '6 months'
GROUP BY date_trunc('month', created_at)
ORDER BY date_trunc('month', created_at);
```

**ActiveRecord:**
```ruby
def onboarding_stats
  totals = User.pick(
    Arel.sql("COUNT(*)"),
    Arel.sql("COUNT(*) FILTER (WHERE onboarded = TRUE)")
  )

  by_role = User.group(:role).pluck(
    :role,
    Arel.sql("COUNT(*)"),
    Arel.sql("COUNT(*) FILTER (WHERE onboarded = TRUE)")
  ).map do |role, registered, completed|
    {
      role: role,
      registered: registered,
      completedOnboarding: completed,
      completionRate: ((completed.to_f / registered) * 100).round(1)
    }
  end

  render json: {
    totals: { registered: totals[0], completedOnboarding: totals[1] },
    byRole: by_role,
    monthlyTrend: monthly_onboarding_trend
  }
end
```

---

## BQ2 — Favorites → Application funnel (`GET /api/analytics/favorites_funnel`)

```sql
-- Students que favoritearon (distinct)
WITH student_favs AS (
  SELECT DISTINCT f.user_id
  FROM favorites f
  JOIN users u ON u.id = f.user_id
  WHERE u.role = 'student'
),
student_apps AS (
  SELECT DISTINCT a.student_id
  FROM applications a
)
SELECT
  (SELECT COUNT(*) FROM student_favs) AS students_who_favorited,
  (SELECT COUNT(*) FROM student_favs sf
    WHERE EXISTS (SELECT 1 FROM student_apps sa WHERE sa.student_id = sf.user_id)
  ) AS students_who_applied;

-- Trend mensual
SELECT
  TO_CHAR(date_trunc('month', f.created_at), 'Mon') AS month,
  COUNT(DISTINCT f.id) AS favorited,
  COUNT(DISTINCT a.id) AS applied
FROM favorites f
LEFT JOIN applications a
  ON a.student_id = f.user_id
 AND a.listing_id = f.listing_id
 AND a.created_at >= f.created_at
JOIN users u ON u.id = f.user_id AND u.role = 'student'
WHERE f.created_at >= NOW() - INTERVAL '6 months'
GROUP BY date_trunc('month', f.created_at)
ORDER BY date_trunc('month', f.created_at);

-- Time-to-apply buckets
SELECT
  CASE
    WHEN EXTRACT(EPOCH FROM (a.created_at - f.created_at))/86400 < 1  THEN 'Same day'
    WHEN EXTRACT(EPOCH FROM (a.created_at - f.created_at))/86400 < 4  THEN '1-3 days'
    WHEN EXTRACT(EPOCH FROM (a.created_at - f.created_at))/86400 < 8  THEN '4-7 days'
    WHEN EXTRACT(EPOCH FROM (a.created_at - f.created_at))/86400 < 15 THEN '8-14 days'
    ELSE '15+ days'
  END AS bucket,
  COUNT(DISTINCT a.student_id) AS students
FROM applications a
JOIN favorites f
  ON f.user_id = a.student_id
 AND f.listing_id = a.listing_id
 AND f.created_at <= a.created_at
GROUP BY 1
ORDER BY MIN(EXTRACT(EPOCH FROM (a.created_at - f.created_at)));
```

---

## BQ3 — Application approval rate (`GET /api/analytics/applications`)

```sql
-- Resumen (filtrando por role=student por seguridad,
-- aunque applications.student_id ya apunta a users.id se valida el rol)
SELECT
  COUNT(*) AS total_applications,
  COUNT(*) FILTER (WHERE a.status = 'approved') AS approved,
  COUNT(*) FILTER (WHERE a.status = 'pending')  AS pending,
  COUNT(*) FILTER (WHERE a.status = 'rejected') AS rejected,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE a.status = 'approved') / NULLIF(COUNT(*), 0),
    1
  ) AS approval_rate
FROM applications a
JOIN users u ON u.id = a.student_id AND u.role = 'student';

-- Con vs sin preferred_visit_at (responde la sub-pregunta de BQ3)
SELECT
  CASE
    WHEN a.preferred_visit_at IS NOT NULL THEN 'With preferred_visit_at'
    ELSE 'Without preferred_visit_at'
  END AS category,
  COUNT(*) AS applications,
  COUNT(*) FILTER (WHERE a.status = 'approved') AS approved,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE a.status = 'approved') / NULLIF(COUNT(*), 0),
    1
  ) AS approval_rate
FROM applications a
JOIN users u ON u.id = a.student_id AND u.role = 'student'
GROUP BY 1
ORDER BY 1;

-- Top listings por volumen (con approval rate)
SELECT
  l.id        AS listing_id,
  l.title,
  COUNT(a.*)  AS applications,
  COUNT(a.*) FILTER (WHERE a.status = 'approved') AS approved,
  ROUND(
    100.0 * COUNT(a.*) FILTER (WHERE a.status = 'approved') / NULLIF(COUNT(a.*), 0),
    1
  ) AS approval_rate
FROM listings l
JOIN applications a ON a.listing_id = l.id
JOIN users u        ON u.id = a.student_id AND u.role = 'student'
GROUP BY l.id, l.title
ORDER BY applications DESC
LIMIT 8;
```

---

## BQ4 — GPS coverage (`GET /api/analytics/gps_coverage`)

```sql
-- Resumen a nivel listing y landlord
WITH listings_with_gps AS (
  SELECT id, user_id, latitude, longitude, city
  FROM listings
),
landlord_summary AS (
  SELECT
    user_id,
    COUNT(*)                                                      AS total_listings,
    COUNT(*) FILTER (WHERE latitude IS NOT NULL AND longitude IS NOT NULL) AS gps_listings
  FROM listings
  GROUP BY user_id
)
SELECT
  (SELECT COUNT(*) FROM listings_with_gps) AS total_listings,
  (SELECT COUNT(*) FROM listings_with_gps WHERE latitude IS NOT NULL AND longitude IS NOT NULL) AS listings_with_gps,
  (SELECT COUNT(*) FROM listings_with_gps WHERE latitude IS NULL OR longitude IS NULL) AS listings_without_gps,
  (SELECT COUNT(*) FROM landlord_summary) AS total_landlords_with_listings,
  (SELECT COUNT(*) FROM landlord_summary WHERE gps_listings >= 1) AS landlords_with_at_least_one_gps;

-- Por ciudad
SELECT
  COALESCE(NULLIF(city, ''), 'Otras') AS city,
  COUNT(*) AS total_listings,
  COUNT(*) FILTER (WHERE latitude IS NOT NULL AND longitude IS NOT NULL) AS with_gps,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE latitude IS NOT NULL AND longitude IS NOT NULL) / NULLIF(COUNT(*), 0),
    1
  ) AS rate
FROM listings
GROUP BY 1
ORDER BY total_listings DESC;

-- Por número de listings que tiene el landlord
WITH ls AS (
  SELECT
    user_id,
    COUNT(*) AS n,
    BOOL_OR(latitude IS NOT NULL AND longitude IS NOT NULL) AS has_any_gps
  FROM listings
  GROUP BY user_id
)
SELECT
  CASE
    WHEN n = 1            THEN '1 listing'
    WHEN n BETWEEN 2 AND 3 THEN '2-3 listings'
    ELSE '4+ listings'
  END AS category,
  COUNT(*) AS total_landlords,
  COUNT(*) FILTER (WHERE has_any_gps) AS with_gps,
  ROUND(100.0 * COUNT(*) FILTER (WHERE has_any_gps) / NULLIF(COUNT(*), 0), 1) AS rate
FROM ls
GROUP BY 1
ORDER BY MIN(n);
```

---

## BQ5 — Conversion by price & property type (`GET /api/analytics/conversion_matrix`)

```sql
WITH price_buckets AS (
  SELECT
    l.id,
    l.property_type,
    CASE
      WHEN l.rent <  800000 THEN '< $800k'
      WHEN l.rent < 1200000 THEN '$800k - $1.2M'
      WHEN l.rent < 1800000 THEN '$1.2M - $1.8M'
      WHEN l.rent < 2500000 THEN '$1.8M - $2.5M'
      ELSE '> $2.5M'
    END AS price_range
  FROM listings l
),
fav_counts AS (
  SELECT pb.property_type, pb.price_range, COUNT(f.*) AS favorites
  FROM price_buckets pb
  LEFT JOIN favorites f ON f.listing_id = pb.id
  GROUP BY pb.property_type, pb.price_range
),
app_counts AS (
  SELECT pb.property_type, pb.price_range, COUNT(a.*) AS applications
  FROM price_buckets pb
  LEFT JOIN applications a ON a.listing_id = pb.id
  GROUP BY pb.property_type, pb.price_range
)
SELECT
  COALESCE(f.property_type, a.property_type) AS property_type,
  COALESCE(f.price_range,   a.price_range)   AS price_range,
  COALESCE(f.favorites,    0) AS favorites,
  COALESCE(a.applications, 0) AS applications,
  CASE
    WHEN COALESCE(f.favorites, 0) = 0 THEN 0
    ELSE ROUND(100.0 * COALESCE(a.applications, 0) / f.favorites, 1)
  END AS conversion_rate
FROM fav_counts f
FULL OUTER JOIN app_counts a
  ON f.property_type = a.property_type
 AND f.price_range   = a.price_range
ORDER BY property_type, price_range;
```

---

## Recomendación

Mete los 5 endpoints en un solo `AnalyticsController` con caché de 5-10 minutos (estos KPIs no necesitan ser real-time):

```ruby
class AnalyticsController < ApplicationController
  def onboarding
    render json: Rails.cache.fetch('analytics/onboarding', expires_in: 10.minutes) {
      AnalyticsService.onboarding_stats
    }
  end
  # ...
end
```

Y un `AnalyticsService` con un método por BQ, que es donde van las queries de arriba.

---

## Referencia · Foreign keys del schema

Para que las queries no se rompan, este es el mapa de relaciones que asumen:

```
users (id)
  ├── landlord_profiles.user_id
  ├── student_profiles.user_id
  ├── lifestyle_profiles.user_id
  ├── listing_profiles.user_id
  ├── listings.user_id              (landlord owner)
  ├── favorites.user_id             (filtrar por role='student' en BQ2)
  └── applications.student_id       (filtrar por role='student' en BQ3)

listings (id)
  ├── listing_photos.listing_id
  ├── favorites.listing_id
  └── applications.listing_id
```

**Nota importante sobre `applications.student_id`:** apunta a `users.id` (no hay tabla `students` separada). Por eso en BQ2 y BQ3 las queries hacen `JOIN users u ON u.id = a.student_id AND u.role = 'student'` para descartar cualquier registro huérfano o con rol incorrecto.

**Nota sobre `favorites.user_id`:** mismo caso. La tabla `favorites` no restringe el rol a nivel de schema, así que en BQ2 filtramos explícitamente por `users.role = 'student'`.
