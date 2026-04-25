# Roomora Analytics Dashboard

Dashboard de analytics para Roomora que responde a 5 Business Questions sobre el comportamiento de usuarios, listings y aplicaciones.

## Stack

- **React 18 + TypeScript + Vite**
- **Tailwind CSS** para estilos
- **Recharts** para visualizaciones
- **React Router** para navegación

## Business Questions

| BQ  | Pregunta                                                              | Página         |
| --- | --------------------------------------------------------------------- | -------------- |
| BQ1 | % de usuarios registrados que completaron onboarding por rol          | `/onboarding`  |
| BQ2 | % de students que favoritearon un listing y luego aplicaron           | `/favorites`   |
| BQ3 | Approval rate por listing + efecto de preferred viewing datetime      | `/applications`|
| BQ4 | % de landlords que actualizaron GPS de sus listings                   | `/gps`         |
| BQ5 | Conversion favorites→applications por price range y property type     | `/conversion`  |

## Desarrollo local

```bash
npm install
npm run dev
```

App corre en http://localhost:5173

## Build

```bash
npm run build
npm run preview
```

## Deploy en Render

1. Sube el repo a GitHub.
2. En Render: **New → Web Service** y conecta el repo.
3. Render detecta `render.yaml` automáticamente.
4. Plan: Free.

Build command: `npm install && npm run build`
Start command: `npm run preview`

## Conectar al backend Rails

Hoy todos los datos vienen de archivos JSON en `src/data/`. Para conectar al backend real solo edita **`src/services/api.ts`** y reemplaza el cuerpo de cada función:

```ts
// Antes (mock):
export async function getOnboardingStats() {
  await delay()
  return onboarding
}

// Después (real):
export async function getOnboardingStats() {
  return fetch(`${API_URL}/api/analytics/onboarding`).then(r => r.json())
}
```

Los componentes no cambian.

## Schema esperado del backend

Las funciones en `services/api.ts` definen los tipos exactos que cada endpoint debe devolver. Los archivos en `src/data/*.json` son los contratos en formato real con datos de ejemplo. Cuando definas las queries en Rails, asegúrate que el JSON de respuesta haga match con esa shape.

## Estructura

```
src/
├── components/   # Layout, KpiCard, ChartCard, PageHeader, Loading
├── pages/        # Una por BQ + Overview
├── data/         # Mock JSON (reemplazado por backend después)
├── services/     # api.ts - capa de servicios
├── lib/          # useAsync hook
├── App.tsx       # Router
└── main.tsx
```
