
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { AIAssistant } from '@/components/modern/ai-assistant'
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
    <div className="min-h-screen bg-gradient relative">
      {/* Modern Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      
      <DashboardHeader user={session.user!} />
      <div className="flex relative z-10">
        <DashboardSidebar />
        <main className="flex-1 overflow-hidden">
          <div className="p-6 scrollbar-modern">
            {children}
          </div>
        </main>
      </div>
      
      {/* AI Assistant */}
      <AIAssistant />
      
      <Toaster position="top-right" richColors />
    </div>
  )
}
