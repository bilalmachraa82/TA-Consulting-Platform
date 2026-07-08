
import { requireSession } from '@/lib/auth-guard'
import { CalendarioComponent } from '@/components/dashboard/calendario-component'

export const dynamic = "force-dynamic"

export const metadata = {
  title: 'Calendário & Deadlines - TA Consulting',
  description: 'Calendário de deadlines e cronograma de avisos de fundos europeus',
}

export default async function CalendarioPage() {
  await requireSession()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Calendário & Deadlines</h1>
        <p className="text-gray-600 mt-2">
          Cronograma de avisos e deadlines para não perder oportunidades
        </p>
      </div>
      
      <CalendarioComponent />
    </div>
  )
}
