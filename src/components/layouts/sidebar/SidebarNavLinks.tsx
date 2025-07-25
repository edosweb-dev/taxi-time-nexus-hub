
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
    href: '/turni',
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

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => 
    profile?.role && item.roles.includes(profile.role)
  );

  return (
    <div className="space-y-1">
      {filteredNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;
        
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center text-sm font-medium rounded-md transition-colors px-3 py-2",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-white/80 hover:text-white hover:bg-white/15"
            )}
          >
            <Icon className="h-4 w-4 mr-3" />
            {item.title}
          </Link>
        );
      })}
    </div>
  );
}
