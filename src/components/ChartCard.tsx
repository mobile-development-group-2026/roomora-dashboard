import { ReactNode } from 'react'

type Props = { title: string; description?: string; children: ReactNode; height?: number }

export default function ChartCard({ title, description, children, height = 320 }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
      </div>
      <div style={{ width: '100%', height }}>{children}</div>
    </div>
  )
}
