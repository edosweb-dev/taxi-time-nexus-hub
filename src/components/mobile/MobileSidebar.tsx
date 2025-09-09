import React from 'react';
import { X, Home, Calendar, Users, Settings, Building, Car, DollarSign, Clock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();

  const isAdminOrSocio = profile?.role === 'admin' || profile?.role === 'socio';

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard', roles: ['admin', 'socio', 'dipendente'] },
    { icon: Calendar, label: 'Servizi', path: '/servizi', roles: ['admin', 'socio', 'dipendente'] },
    { icon: Building, label: 'Aziende', path: '/aziende', roles: ['admin', 'socio'] },
    { icon: Users, label: 'Utenti', path: '/users', roles: ['admin', 'socio'] },
    { icon: Car, label: 'Veicoli', path: '/veicoli', roles: ['admin', 'socio'] },
    { icon: Clock, label: 'Turni', path: '/calendario-turni', roles: ['admin', 'socio', 'dipendente'] },
    { icon: DollarSign, label: 'Spese', path: '/spese-aziendali', roles: ['admin', 'socio'] },
    { icon: Settings, label: 'Impostazioni', path: '/impostazioni', roles: ['admin', 'socio'] }
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const filteredItems = menuItems.filter(item => 
    item.roles.includes(profile?.role || 'dipendente')
  );

  return (
    <>
      {/* Overlay */}
      <div 
        className={`mobile-overlay ${open ? 'open' : ''}`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`mobile-sidebar ${open ? 'open' : ''}`}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Menu</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        <nav className="p-4">
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                  location.pathname === item.path
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
}