'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  BarChart3,
  LogOut,
  GraduationCap,
  Settings,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const navItems = [
  { title: 'Dashboard', href: '/', icon: LayoutDashboard },
  { title: 'Clases', href: '/clases', icon: BookOpen },
  { title: 'Pasar Lista', href: '/asistencia', icon: ClipboardCheck },
  { title: 'Reportes', href: '/reportes', icon: BarChart3 },
  { title: 'Configuración', href: '/configuracion', icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-base font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            Asistencia Escolar
          </span>
        </Link>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegacion</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.href)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
        {session?.user && (
          <div className="flex items-center gap-3 px-2 py-2 group-data-[collapsible=icon]:justify-center">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
              <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs">
                {session.user.name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
              <span className="truncate text-sm font-medium">{session.user.name}</span>
              <span className="truncate text-xs text-sidebar-foreground/60">
                {session.user.email}
              </span>
            </div>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut({ callbackUrl: '/login' })}
              tooltip="Cerrar sesion"
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar sesion</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
