
import { useAuth } from '@/contexts/AuthContext';
import { BarChart4, Calendar, ClipboardList, FilePlus, Home, Settings, ShoppingBag, UserCircle, Users, CreditCard, Wallet, Car } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export function SidebarNavLinks() {
  const { profile } = useAuth();
  
  if (!profile) {
    return null;
  }

  // Admin and Socio links
  if (profile.role === 'admin' || profile.role === 'socio') {
    return (
      <nav className="space-y-1">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => 
            `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg sidebar-nav-link ${
              isActive 
                ? 'bg-white text-primary' 
                : 'text-white hover:bg-white hover:text-primary'
            }`
          }
        >
          <Home className="mr-3 h-5 w-5" />
          Dashboard
        </NavLink>
        
        <NavLink 
          to="/servizi" 
          className={({ isActive }) => 
            `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg sidebar-nav-link ${
              isActive 
                ? 'bg-white text-primary' 
                : 'text-white hover:bg-white hover:text-primary'
            }`
          }
        >
          <ClipboardList className="mr-3 h-5 w-5" />
          Servizi
        </NavLink>
        
        <NavLink 
          to="/nuovo-servizio" 
          className={({ isActive }) => 
            `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg sidebar-nav-link ${
              isActive 
                ? 'bg-white text-primary' 
                : 'text-white hover:bg-white hover:text-primary'
            }`
          }
        >
          <FilePlus className="mr-3 h-5 w-5" />
          Nuovo servizio
        </NavLink>
        
        <NavLink 
          to="/turni" 
          className={({ isActive }) => 
            `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg sidebar-nav-link ${
              isActive 
                ? 'bg-white text-primary' 
                : 'text-white hover:bg-white hover:text-primary'
            }`
          }
        >
          <Calendar className="mr-3 h-5 w-5" />
          Turni
        </NavLink>
        
        <NavLink 
          to="/spese" 
          className={({ isActive }) => 
            `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg sidebar-nav-link ${
              isActive 
                ? 'bg-white text-primary' 
                : 'text-white hover:bg-white hover:text-primary'
            }`
          }
        >
          <CreditCard className="mr-3 h-5 w-5" />
          Spese
        </NavLink>
        
        <NavLink 
          to="/movimenti" 
          className={({ isActive }) => 
            `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg sidebar-nav-link ${
              isActive 
                ? 'bg-white text-primary' 
                : 'text-white hover:bg-white hover:text-primary'
            }`
          }
        >
          <Wallet className="mr-3 h-5 w-5" />
          Movimenti
        </NavLink>
        
        <NavLink 
          to="/veicoli" 
          className={({ isActive }) => 
            `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg sidebar-nav-link ${
              isActive 
                ? 'bg-white text-primary' 
                : 'text-white hover:bg-white hover:text-primary'
            }`
          }
        >
          <Car className="mr-3 h-5 w-5" />
          Veicoli
        </NavLink>
        
        <NavLink 
          to="/impostazioni" 
          className={({ isActive }) => 
            `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg sidebar-nav-link ${
              isActive 
                ? 'bg-white text-primary' 
                : 'text-white hover:bg-white hover:text-primary'
            }`
          }
        >
          <Settings className="mr-3 h-5 w-5" />
          Impostazioni
        </NavLink>
        
        <NavLink 
          to="/aziende" 
          className={({ isActive }) => 
            `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg sidebar-nav-link ${
              isActive 
                ? 'bg-white text-primary' 
                : 'text-white hover:bg-white hover:text-primary'
            }`
          }
        >
          <ShoppingBag className="mr-3 h-5 w-5" />
          Aziende
        </NavLink>
        
        {profile.role === 'admin' && (
          <NavLink 
            to="/users" 
            className={({ isActive }) => 
              `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg sidebar-nav-link ${
                isActive 
                  ? 'bg-white text-primary' 
                  : 'text-white hover:bg-white hover:text-primary'
              }`
            }
          >
            <Users className="mr-3 h-5 w-5" />
            Utenti
          </NavLink>
        )}
      </nav>
    );
  }
  
  // Dipendente links
  if (profile.role === 'dipendente') {
    return (
      <nav className="space-y-1">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => 
            `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg sidebar-nav-link ${
              isActive 
                ? 'bg-white text-primary' 
                : 'text-white hover:bg-white hover:text-primary'
            }`
          }
        >
          <Home className="mr-3 h-5 w-5" />
          Dashboard
        </NavLink>
        
        <NavLink 
          to="/servizi" 
          className={({ isActive }) => 
            `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg sidebar-nav-link ${
              isActive 
                ? 'bg-white text-primary' 
                : 'text-white hover:bg-white hover:text-primary'
            }`
          }
        >
          <ClipboardList className="mr-3 h-5 w-5" />
          Servizi
        </NavLink>

        <NavLink 
          to="/spese" 
          className={({ isActive }) => 
            `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg sidebar-nav-link ${
              isActive 
                ? 'bg-white text-primary' 
                : 'text-white hover:bg-white hover:text-primary'
            }`
          }
        >
          <CreditCard className="mr-3 h-5 w-5" />
          Spese
        </NavLink>
      </nav>
    );
  }
  
  // Cliente links
  if (profile.role === 'cliente') {
    return (
      <nav className="space-y-1">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => 
            `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg sidebar-nav-link ${
              isActive 
                ? 'bg-white text-primary' 
                : 'text-white hover:bg-white hover:text-primary'
            }`
          }
        >
          <Home className="mr-3 h-5 w-5" />
          Dashboard
        </NavLink>

        <NavLink 
          to="/profilo" 
          className={({ isActive }) => 
            `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg sidebar-nav-link ${
              isActive 
                ? 'bg-white text-primary' 
                : 'text-white hover:bg-white hover:text-primary'
            }`
          }
        >
          <UserCircle className="mr-3 h-5 w-5" />
          Profilo
        </NavLink>
      </nav>
    );
  }
  
  return null;
}
