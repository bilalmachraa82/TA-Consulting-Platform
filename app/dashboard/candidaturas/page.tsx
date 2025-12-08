
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { CandidaturasComponent } from '@/components/dashboard/candidaturas-component'

export const dynamic = "force-dynamic"

export const metadata = {
  title: 'Gestão de Candidaturas - TA Consulting',
  description: 'Kanban board para gestão do pipeline de candidaturas',
}

export default async function CandidaturasPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestão de Candidaturas</h1>
        <p className="text-gray-600 mt-2">
          Pipeline de candidaturas com controlo de estados e timeline
        </p>
      </div>
      
      <CandidaturasComponent />
    </div>
  )
}
