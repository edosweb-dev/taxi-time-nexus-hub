import React from 'react';
import { Home, Calendar, Users, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Calendar, label: 'Servizi', path: '/servizi' },
    { icon: Users, label: 'Utenti', path: '/users' },
    { icon: Settings, label: 'Impostazioni', path: '/impostazioni' }
  ];

  return (
    <nav className="bottom-navigation">
      {navItems.map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className={`bottom-nav-item ${
            location.pathname === item.path ? 'active' : ''
          }`}
        >
          <item.icon className="bottom-nav-icon" />
          <span className="bottom-nav-text">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}