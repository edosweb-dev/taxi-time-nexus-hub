
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/components/ui/sidebar';
import {
  LayoutDashboard, 
  Users, 
  Building2, 
  Car, 
  Calendar, 
  Euro, 
  Settings, 
  FileText,
  UserCheck,
  MessageCircle,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'socio', 'dipendente'],
  },
  {
    title: 'Servizi',
    href: '/servizi',
    icon: FileText,
    roles: ['admin', 'socio', 'dipendente'],
  },
  {
    title: 'Aziende',
    href: '/aziende',
    icon: Building2,
    roles: ['admin', 'socio'],
  },
  {
    title: 'Utenti',
    href: '/users',
    icon: Users,
    roles: ['admin', 'socio'],
  },
  {
    title: 'Feedback',
    href: '/feedback',
    icon: MessageCircle,
    roles: ['admin', 'socio'],
  },
  {
    title: 'Veicoli',
    href: '/veicoli',
    icon: Car,
    roles: ['admin', 'socio'],
  },
  {
    title: 'Conducenti Esterni',
    href: '/conducenti-esterni',
    icon: UserCheck,
    roles: ['admin', 'socio'],
  },
  {
    title: 'Turni',
    href: '/calendario-turni',
    icon: Calendar,
    roles: ['admin', 'socio', 'dipendente'],
  },
  {
    title: 'Stipendi',
    href: '/stipendi',
    icon: Euro,
    roles: ['admin', 'socio'],
  },
  {
    title: 'Spese Aziendali',
    href: '/spese-aziendali',
    icon: Clock,
    roles: ['admin', 'socio'],
  },
  {
    title: 'Impostazioni',
    href: '/impostazioni',
    icon: Settings,
    roles: ['admin', 'socio'],
  },
];

export function SidebarNavLinks() {
  const { profile } = useAuth();
  const location = useLocation();
  const { state } = useSidebar();

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => 
    profile?.role && item.roles.includes(profile.role)
  );

  // Group items for better organization (optimized for no scroll)
  const groupedItems = {
    main: filteredNavItems.filter(item => ['Dashboard', 'Servizi', 'Turni'].includes(item.title)),
    management: filteredNavItems.filter(item => ['Aziende', 'Utenti', 'Veicoli', 'Conducenti Esterni', 'Feedback'].includes(item.title)),
    finance: filteredNavItems.filter(item => ['Stipendi', 'Spese Aziendali', 'Impostazioni'].includes(item.title))
  };

  const renderNavGroup = (title: string, items: any[], isLast = false) => {
    if (items.length === 0) return null;
    
    return (
      <div key={title} className="space-y-0.5">
        {state !== "collapsed" && (
          <div className="px-3 py-1">
            <span className="text-xs font-medium text-white/50 uppercase tracking-wide">{title}</span>
          </div>
        )}
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center text-sm font-medium rounded-lg transition-all duration-200 mx-2 group relative overflow-hidden",
                isActive
                  ? "bg-white text-primary shadow-md"
                  : "text-white/80 hover:text-white hover:bg-white/15"
              )}
            >
              <div className={cn(
                "flex items-center w-full px-3 py-2 relative z-10",
                state === "collapsed" ? "justify-center" : ""
              )}>
                <Icon className={cn(
                  "h-4 w-4 transition-all duration-200 flex-shrink-0",
                  isActive ? "text-primary" : "text-white/80 group-hover:text-white",
                  state !== "collapsed" && "mr-3"
                )} />
                {state !== "collapsed" && (
                  <span className="font-medium text-sm truncate">{item.title}</span>
                )}
                {state !== "collapsed" && isActive && (
                  <div className="ml-auto flex-shrink-0">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
        {!isLast && state !== "collapsed" && items.length > 0 && (
          <div className="mx-4 my-2 h-px bg-white/10"></div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1 py-1 px-1">
      {renderNavGroup("Principale", groupedItems.main)}
      {renderNavGroup("Gestione", groupedItems.management)}
      {renderNavGroup("Sistema", groupedItems.finance, true)}
    </div>
  );
}
