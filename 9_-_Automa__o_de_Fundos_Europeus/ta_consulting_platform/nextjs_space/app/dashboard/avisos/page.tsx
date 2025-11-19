
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { AvisosComponent } from '@/components/dashboard/avisos-component'

export const dynamic = "force-dynamic"

export const metadata = {
  title: 'Avisos & Oportunidades - TA Consulting',
  description: 'Gestão de avisos de fundos europeus e oportunidades de financiamento',
}

export default async function AvisosPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Avisos & Oportunidades</h1>
        <p className="text-gray-600 mt-2">
          Monitorize e gerencie avisos de fundos europeus em tempo real
        </p>
      </div>
      
      <AvisosComponent />
    </div>
  )
}
