type Props = { title: string; subtitle?: string; question?: string }

export default function PageHeader({ title, subtitle, question }: Props) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
      {question && (
        <div className="mt-3 px-4 py-2 bg-brand-50 border border-brand-100 rounded-lg text-sm text-brand-700">
          <span className="font-semibold">Business Question:</span> {question}
        </div>
      )}
    </div>
  )
}
