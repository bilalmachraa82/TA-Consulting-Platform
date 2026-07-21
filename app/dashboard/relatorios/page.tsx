
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { RelatoriosComponent } from '@/components/dashboard/relatorios-component'

export const dynamic = "force-dynamic"

export const metadata = {
  title: 'Relatórios & Analytics - TA Consulting',
  description: 'Relatórios analíticos e métricas de performance da plataforma',
}

export default async function RelatoriosPage() {
  // DEMO MODE: Auth disabled for demo
  // const session = await getServerSession(authOptions)
  // if (!session) {
  //   redirect('/auth/login')
  // }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Relatórios & Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Análise de performance e métricas dos fundos europeus
        </p>
      </div>
      
      <RelatoriosComponent />
    </div>
  )
}
