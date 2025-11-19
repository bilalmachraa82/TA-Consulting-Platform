
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { ConfiguracoesComponent } from '@/components/dashboard/configuracoes-component'

export const dynamic = "force-dynamic"

export const metadata = {
  title: 'Configurações - TA Consulting',
  description: 'Configurações da plataforma e preferências do sistema',
}

export default async function ConfiguracoesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-2">
          Configurações da plataforma, notificações e integrações
        </p>
      </div>
      
      <ConfiguracoesComponent />
    </div>
  )
}
