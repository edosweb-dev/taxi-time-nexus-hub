import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Users, 
  Car,
  Settings,
  FileText,
  FileBarChart
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  roles: string[];
}

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();

  const allNavItems: NavItem[] = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', path: '/dashboard', roles: ['admin', 'socio', 'dipendente'] },
    { id: 'dashboard-cliente', icon: Home, label: 'Dashboard', path: '/dashboard-cliente', roles: ['cliente'] },
    { id: 'servizi', icon: Calendar, label: 'Servizi', path: '/servizi', roles: ['admin', 'socio', 'dipendente'] },
    { id: 'servizi-cliente', icon: FileText, label: 'Servizi', path: '/dashboard-cliente/servizi', roles: ['cliente'] },
    { id: 'report-cliente', icon: FileBarChart, label: 'Report', path: '/dashboard-cliente/report', roles: ['cliente'] },
    { id: 'veicoli', icon: Car, label: 'Veicoli', path: '/veicoli', roles: ['admin', 'socio'] },
    { id: 'users', icon: Users, label: 'Utenti', path: '/users', roles: ['admin', 'socio'] },
    { id: 'settings', icon: Settings, label: 'Altro', path: '/impostazioni', roles: ['admin', 'socio'] },
  ];

  const userRole = profile?.role || 'dipendente';
  const navItems = allNavItems.filter(item => item.roles.includes(userRole));

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
