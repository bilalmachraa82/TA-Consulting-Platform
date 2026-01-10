
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { EmpresasComponent } from '@/components/dashboard/empresas-component'

export const dynamic = "force-dynamic"

export const metadata = {
  title: 'Empresas Clientes - TA Consulting',
  description: 'Gestão de empresas clientes e perfis de elegibilidade',
}

export default async function EmpresasPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Empresas Clientes</h1>
        <p className="text-gray-600 mt-2">
          Gerencie o portfólio de empresas e perfis de elegibilidade
        </p>
      </div>
      
      <EmpresasComponent />
    </div>
  )
}
