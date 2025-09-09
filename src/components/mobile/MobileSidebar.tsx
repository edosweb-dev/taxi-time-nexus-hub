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
        role="presentation"
      />
      
      {/* Sidebar */}
      <div className={`mobile-sidebar ${open ? 'open' : ''}`} role="dialog" aria-modal="true">
        {/* Header */}
        <div className="mobile-sidebar-header">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Menu</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="mobile-sidebar-nav">
          {filteredItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`nav-item ${
                location.pathname === item.path ? 'active' : ''
              }`}
              type="button"
            >
              <item.icon />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}