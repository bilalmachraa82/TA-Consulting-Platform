
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { DocumentacaoComponent } from '@/components/dashboard/documentacao-component'

export const dynamic = "force-dynamic"

export const metadata = {
  title: 'Documentação & Compliance - TA Consulting',
  description: 'Gestão de documentos empresariais e controlo de validade',
}

export default async function DocumentacaoPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Documentação & Compliance</h1>
        <p className="text-gray-600 mt-2">
          Controlo centralizado de documentos empresariais e alertas de expiração
        </p>
      </div>
      
      <DocumentacaoComponent />
    </div>
  )
}
