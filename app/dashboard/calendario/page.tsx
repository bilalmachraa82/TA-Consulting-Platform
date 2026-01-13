
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { CalendarioComponent } from '@/components/dashboard/calendario-component'

export const dynamic = "force-dynamic"

export const metadata = {
  title: 'Calendário & Deadlines - TA Consulting',
  description: 'Calendário de deadlines e cronograma de avisos de fundos europeus',
}

export default async function CalendarioPage() {
  // DEMO MODE: Auth disabled for demo
  // const session = await getServerSession(authOptions)
  // if (!session) {
  //   redirect('/auth/login')
  // }

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
