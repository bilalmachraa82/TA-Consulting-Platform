
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  BarChart3,
  Building2,
  Calendar,
  CheckCircle,
  FileText,
  Home,
  Settings,
  Users,
  Workflow,
  TrendingUp,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassIcon } from '@/components/ui/glass-icon'

const navigationGroups = [
  {
    title: 'Intelligence',
    items: [
      { name: 'Consultor IA', href: '/dashboard/consultor', icon: Sparkles, isNew: true },
      { name: 'Recomendações', href: '/dashboard/recomendacoes', icon: Sparkles },
      { name: 'Alertas', href: '/dashboard/alertas-consolidados', icon: AlertTriangle },
    ]
  },
  {
    title: 'Workspace',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
      { name: 'Minhas Empresas', href: '/dashboard/minhas-empresas', icon: Building2 },
      { name: 'Candidaturas', href: '/dashboard/candidaturas', icon: FileText },
    ]
  },
  {
    title: 'Oportunidades',
    items: [
      { name: 'Avisos & Fundos', href: '/dashboard/avisos', icon: TrendingUp },
      { name: 'Elegibilidade', href: '/dashboard/elegibilidade', icon: CheckCircle },
    ]
  },
  {
    title: 'Gestão',
    items: [
      { name: 'Pós-Aprovação', href: '/dashboard/pos-award', icon: TrendingUp },
      { name: 'Calendário', href: '/dashboard/calendario', icon: Calendar },
      { name: 'Documentação', href: '/dashboard/documentacao', icon: FileText },
      { name: 'Equipas', href: '/dashboard/teams', icon: Users },
      { name: 'Relatórios', href: '/dashboard/relatorios', icon: BarChart3 },
      { name: 'Configurações', href: '/dashboard/configuracoes', icon: Settings },
    ]
  }
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [openGroups, setOpenGroups] = useState<string[]>(['Intelligence', 'Workspace', 'Oportunidades', 'Gestão'])

  const toggleGroup = (title: string) => {
    setOpenGroups(prev =>
      prev.includes(title) ? prev.filter(g => g !== title) : [...prev, title]
    )
  }

  return (
    <div className={cn(
      'flex flex-col h-[calc(100vh-4rem)] bg-background/80 backdrop-blur-xl border-r border-border transition-all duration-500 ease-in-out relative z-30',
      isCollapsed ? 'w-16' : 'w-64'
    )}>
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-[-1] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && (
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-2">Workspace</h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hover:bg-muted text-muted-foreground hover:text-primary transition-all"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 p-3 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        {navigationGroups.map((group) => {
          const isOpen = openGroups.includes(group.title)

          return (
            <div key={group.title} className="space-y-1">
              {!isCollapsed && (
                <button
                  onClick={() => toggleGroup(group.title)}
                  className="flex items-center justify-between w-full px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                >
                  {group.title}
                  <ChevronRight className={cn("w-3 h-3 transition-transform", isOpen ? "rotate-90" : "")} />
                </button>
              )}

              <div className={cn("space-y-1 overflow-hidden transition-all duration-300", isOpen || isCollapsed ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0")}>
                {group.items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all',
                        isActive
                          ? 'bg-primary/10 text-primary shadow-[0_0_15px_-3px_hsl(var(--primary)/0.3)]'
                          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                      )}
                    >
                      <GlassIcon
                        icon={item.icon}
                        active={isActive}
                        className={cn("mr-3", isCollapsed ? "mx-auto mr-0" : "")}
                      />
                      {!isCollapsed && (
                        <div className="flex-1 flex items-center justify-between">
                          <span>{item.name}</span>
                          {item.isNew && (
                            <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30 shadow-[0_0_10px_-2px_rgba(59,130,246,0.5)]">
                              AI
                            </span>
                          )}
                        </div>
                      )}

                      {isActive && !isCollapsed && (
                        <div className="absolute left-0 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_10px_2px_hsl(var(--primary)/0.5)]" />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>
    </div>
  )
}

