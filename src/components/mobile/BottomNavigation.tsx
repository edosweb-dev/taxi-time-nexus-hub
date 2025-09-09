import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Users, 
  Car,
  Settings 
} from 'lucide-react';

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      id: 'dashboard',
      icon: Home,
      label: 'Dashboard',
      path: '/dashboard'
    },
    {
      id: 'servizi',
      icon: Calendar,
      label: 'Servizi',
      path: '/servizi'
    },
    {
      id: 'veicoli',
      icon: Car,
      label: 'Veicoli',
      path: '/veicoli'
    },
    {
      id: 'users',
      icon: Users,
      label: 'Utenti',
      path: '/users'
    },
    {
      id: 'settings',
      icon: Settings,
      label: 'Altro',
      path: '/impostazioni'
    }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => {
    return location.pathname === path || 
           (path === '/servizi' && location.pathname.startsWith('/servizi'));
  };

  return (
    <nav className="bottom-nav-container">
      <div className="bottom-nav-items">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigation(item.path)}
            className={`bottom-nav-item ${isActive(item.path) ? 'active' : ''}`}
            type="button"
          >
            <item.icon className="bottom-nav-icon" />
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}