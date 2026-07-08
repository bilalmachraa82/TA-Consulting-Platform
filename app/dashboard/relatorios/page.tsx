
import { requireSession } from '@/lib/auth-guard'
import { RelatoriosComponent } from '@/components/dashboard/relatorios-component'

export const dynamic = "force-dynamic"

export const metadata = {
  title: 'Relatórios & Analytics - TA Consulting',
  description: 'Relatórios analíticos e métricas de performance da plataforma',
}

export default async function RelatoriosPage() {
  await requireSession()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Relatórios & Analytics</h1>
        <p className="text-gray-600 mt-2">
          Análise de performance e métricas dos fundos europeus
        </p>
      </div>
      
      <RelatoriosComponent />
    </div>
  )
}
