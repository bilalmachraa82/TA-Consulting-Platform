
'use client'

import { User } from 'next-auth'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { LogOut, User as UserIcon, Settings } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Link from 'next/link'
import { NotificationBell } from '@/components/layout/notification-bell'
import { ThemeToggle } from '@/components/theme-toggle'


interface DashboardHeaderProps {
  user: User
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      ?.map(n => n[0])
      ?.join('')
      ?.toUpperCase() ?? 'U'
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl transition-colors duration-300">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center shadow-sm">
              <span className="text-foreground font-bold text-lg">TA<span className="text-primary">.</span></span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">TA Platform</h1>
              <p className="text-xs text-primary">Consulting Console</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <NotificationBell />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-muted transition-colors">
                <Avatar className="h-9 w-9 border border-border">
                  <AvatarFallback className="bg-card text-primary font-bold">
                    {getInitials(user?.name || '')}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-card border-border text-card-foreground" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-foreground">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem asChild className="focus:bg-muted focus:text-foreground cursor-pointer">
                <Link href="/dashboard/configuracoes" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem onClick={handleSignOut} className="focus:bg-destructive/10 focus:text-destructive cursor-pointer text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Terminar Sessão</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
