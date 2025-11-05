
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Toaster } from 'sonner'

export const metadata = {
  title: 'Dashboard - TA Consulting',
  description: 'Dashboard de gestão de fundos europeus',
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={session.user!} />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 overflow-hidden">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  )
}
