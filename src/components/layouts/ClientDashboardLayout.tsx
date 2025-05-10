
import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, 
  FileText, 
  PlusCircle, 
  BarChart, 
  UserCircle, 
  LogOut 
} from 'lucide-react';

interface ClientDashboardLayoutProps {
  children: ReactNode;
}

export function ClientDashboardLayout({ children }: ClientDashboardLayoutProps) {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  
  const fullName = profile?.first_name && profile?.last_name 
    ? `${profile.first_name} ${profile.last_name}`
    : profile?.first_name || 'Cliente';
    
  const navItems = [
    {
      title: 'Dashboard',
      href: '/dashboard-cliente',
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: 'Nuovo Servizio',
      href: '/dashboard-cliente/nuovo-servizio',
      icon: <PlusCircle className="h-5 w-5" />,
    },
    {
      title: 'I Miei Servizi',
      href: '/dashboard-cliente/servizi',
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: 'Report',
      href: '/dashboard-cliente/report',
      icon: <BarChart className="h-5 w-5" />,
    },
    {
      title: 'Profilo',
      href: '/dashboard-cliente/profilo',
      icon: <UserCircle className="h-5 w-5" />,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <div className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-medium">T</div>
          <span className="text-lg font-semibold tracking-tight">TAXITIME</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {fullName}
          </span>
          <Button variant="outline" size="icon" onClick={signOut}>
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Logout</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-1">
        <div className="hidden md:flex w-64 flex-col border-r bg-muted/20 p-4">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                  location.pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted hover:text-foreground"
                )}
              >
                {item.icon}
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex-1 overflow-auto">
          <main className="container py-6 md:py-8 lg:py-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
