
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  BarChart3,
  Building2,
  Calendar,
  FileText,
  Home,
  Settings,
  Users,
  Workflow,
  TrendingUp,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Avisos & Oportunidades',
    href: '/dashboard/avisos',
    icon: AlertTriangle,
  },
  {
    name: 'Empresas Clientes',
    href: '/dashboard/empresas',
    icon: Building2,
  },
  {
    name: 'Candidaturas',
    href: '/dashboard/candidaturas',
    icon: FileText,
  },
  {
    name: 'Calendário & Deadlines',
    href: '/dashboard/calendario',
    icon: Calendar,
  },
  {
    name: 'Documentação',
    href: '/dashboard/documentacao',
    icon: Users,
  },
  {
    name: 'Workflows',
    href: '/dashboard/workflows',
    icon: Workflow,
  },
  {
    name: 'Relatórios',
    href: '/dashboard/relatorios',
    icon: BarChart3,
  },
  {
    name: 'Configurações',
    href: '/dashboard/configuracoes',
    icon: Settings,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className={cn(
      'flex flex-col h-[calc(100vh-4rem)] bg-white border-r transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-64'
    )}>
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-gray-900">Navegação</h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-blue-100 text-blue-900'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="ml-3 truncate">{item.name}</span>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
