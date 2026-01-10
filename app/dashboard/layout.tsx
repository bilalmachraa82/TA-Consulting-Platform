
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
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden font-sans selection:bg-primary/30 selection:text-primary">

      {/* V2: Midnight Atmosphere Background (Dark Mode Only) */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-300" />
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none z-0 opacity-0 dark:opacity-100 transition-opacity duration-300" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none z-0 opacity-0 dark:opacity-100 transition-opacity duration-300" />

      {/* Light Mode Atmosphere (Subtle) */}
      <div className="fixed inset-0 z-0 bg-background pointer-events-none dark:hidden" />
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none z-0 dark:hidden" />

      {/* Grid Pattern Overlay (Subtle Tech Feel) - Adapted for both modes */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.05)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="relative z-10 text-foreground">
        <DashboardHeader user={session.user!} />
        <div className="flex">
          <DashboardSidebar />
          <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem)] scroll-smooth">
            <div className="p-8 max-w-7xl mx-auto animation-fade-in">
              {children}
            </div>
          </main>
        </div>
      </div>

      <AIAssistant />
      <Toaster position="top-right" richColors closeButton theme="system" />
    </div>
  )
}
