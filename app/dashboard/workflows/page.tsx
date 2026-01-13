
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { WorkflowsComponent } from '@/components/dashboard/workflows-component'

export const dynamic = "force-dynamic"

export const metadata = {
  title: 'Workflows & Automações - TA Consulting',
  description: 'Gestão de automações e fluxos de trabalho automatizados',
}

export default async function WorkflowsPage() {
  // DEMO MODE: Auth disabled for demo
  // const session = await getServerSession(authOptions)
  // if (!session) {
  //   redirect('/auth/login')
  // }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Workflows & Automações</h1>
        <p className="text-gray-600 mt-2">
          Controlo e configuração de processos automatizados de scraping e notificações
        </p>
      </div>
      
      <WorkflowsComponent />
    </div>
  )
}
