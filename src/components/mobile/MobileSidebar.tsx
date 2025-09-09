import React from 'react';
import { 
  X, Home, Calendar, Users, Settings, Building, Car, DollarSign, Clock, 
  FileText, MessageCircle, UserCheck, LogOut, ChevronRight, User
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  roles: string[];
  badge?: number;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, signOut } = useAuth();

  const getInitials = () => {
    if (!profile?.first_name && !profile?.last_name) return 'U';
    return `${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`.toUpperCase();
  };

  const menuSections: MenuSection[] = [
    {
      title: 'Principale',
      items: [
        { icon: Home, label: 'Dashboard', path: '/dashboard', roles: ['admin', 'socio', 'dipendente', 'cliente'] },
        { icon: Calendar, label: 'Servizi', path: '/servizi', roles: ['admin', 'socio', 'dipendente'] },
        { icon: Clock, label: 'Turni', path: '/calendario-turni', roles: ['admin', 'socio', 'dipendente'] }
      ]
    },
    {
      title: 'Gestione',
      items: [
        { icon: Building, label: 'Aziende', path: '/aziende', roles: ['admin', 'socio'] },
        { icon: Users, label: 'Utenti', path: '/users', roles: ['admin', 'socio'] },
        { icon: Car, label: 'Veicoli', path: '/veicoli', roles: ['admin', 'socio'] },
        { icon: UserCheck, label: 'Conducenti Esterni', path: '/conducenti-esterni', roles: ['admin', 'socio'] },
        { icon: MessageCircle, label: 'Feedback', path: '/feedback', roles: ['admin', 'socio'] }
      ]
    },
    {
      title: 'Finanze',
      items: [
        { icon: DollarSign, label: 'Spese Aziendali', path: '/spese-aziendali', roles: ['admin', 'socio'] },
        { icon: FileText, label: 'Stipendi', path: '/stipendi', roles: ['admin', 'socio'] }
      ]
    },
    {
      title: 'Sistema',
      items: [
        { icon: Settings, label: 'Impostazioni', path: '/impostazioni', roles: ['admin', 'socio'] }
      ]
    }
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleSignOut = () => {
    signOut();
    onClose();
  };

  const isActive = (path: string) => {
    return location.pathname === path || 
           (path === '/servizi' && location.pathname.startsWith('/servizi'));
  };

  const filterItemsByRole = (items: MenuItem[]) => {
    return items.filter(item => item.roles.includes(profile?.role || 'dipendente'));
  };

  return (
    <>
      {/* Enhanced Overlay with blur effect */}
      <div 
        className={`
          fixed inset-0 z-50 bg-black/20 backdrop-blur-sm
          transition-opacity duration-300 ease-in-out
          ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
        role="presentation"
      />
      
      {/* Enhanced Sidebar */}
      <div 
        className={`
          fixed top-0 left-0 h-full w-80 max-w-[85vw] z-50
          bg-background border-r border-border
          shadow-2xl shadow-black/10
          transform transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          flex flex-col
        `}
        role="dialog" 
        aria-modal="true"
      >
        {/* Enhanced Header with User Profile */}
        <div className="bg-primary text-primary-foreground p-6 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">TAXITIME</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="text-primary-foreground hover:bg-primary-foreground/20 w-8 h-8 p-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            {/* User Profile Section */}
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-primary-foreground/20">
                <AvatarFallback className="bg-primary-foreground text-primary font-bold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">
                  {profile?.first_name} {profile?.last_name}
                </p>
                <p className="text-sm text-primary-foreground/70 capitalize">
                  {profile?.role}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {menuSections.map((section) => {
            const filteredItems = filterItemsByRole(section.items);
            
            if (filteredItems.length === 0) return null;
            
            return (
              <div key={section.title}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {filteredItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => handleNavigate(item.path)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-lg
                        text-sm font-medium transition-all duration-200
                        touch-manipulation active:scale-95
                        ${isActive(item.path)
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'text-foreground hover:bg-muted hover:text-foreground'
                        }
                      `}
                      type="button"
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0 pl-0.5" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className="bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>
        
        {/* Enhanced Footer with Logout */}
        <div className="p-4 border-t border-border bg-muted/30">
          <Button
            onClick={handleSignOut}
            variant="ghost"
            className="
              w-full justify-start gap-3 text-destructive 
              hover:bg-destructive/10 hover:text-destructive
              h-12 px-3
            "
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Esci</span>
          </Button>
        </div>
      </div>
    </>
  );
}