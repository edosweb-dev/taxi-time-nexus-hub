
import { useAuth } from '@/contexts/AuthContext';
import { BarChart4, Calendar, ClipboardList, FilePlus, FileText, Home, Settings, ShoppingBag, UserCircle, Users } from 'lucide-react';
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
            `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg ${
              isActive 
                ? 'bg-accent text-accent-foreground' 
                : 'text-muted-foreground hover:bg-muted'
            }`
          }
        >
          <Home className="mr-3 h-5 w-5" />
          Dashboard
        </NavLink>
        
        <NavLink 
          to="/servizi" 
          className={({ isActive }) => 
            `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg ${
              isActive 
                ? 'bg-accent text-accent-foreground' 
                : 'text-muted-foreground hover:bg-muted'
            }`
          }
        >
          <ClipboardList className="mr-3 h-5 w-5" />
          Servizi
        </NavLink>
        
        <NavLink 
          to="/nuovo-servizio" 
          className={({ isActive }) => 
            `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg ${
              isActive 
                ? 'bg-accent text-accent-foreground' 
                : 'text-muted-foreground hover:bg-muted'
            }`
          }
        >
          <FilePlus className="mr-3 h-5 w-5" />
          Nuovo servizio
        </NavLink>
        
        <NavLink 
          to="/turni" 
          className={({ isActive }) => 
            `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg ${
              isActive 
                ? 'bg-accent text-accent-foreground' 
                : 'text-muted-foreground hover:bg-muted'
            }`
          }
        >
          <Calendar className="mr-3 h-5 w-5" />
          Turni
        </NavLink>
        
        <NavLink 
          to="/reports" 
          className={({ isActive }) => 
            `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg ${
              isActive 
                ? 'bg-accent text-accent-foreground' 
                : 'text-muted-foreground hover:bg-muted'
            }`
          }
        >
          <FileText className="mr-3 h-5 w-5" />
          Report Aziende
        </NavLink>
        
        <NavLink 
          to="/aziende" 
          className={({ isActive }) => 
            `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg ${
              isActive 
                ? 'bg-accent text-accent-foreground' 
                : 'text-muted-foreground hover:bg-muted'
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
              `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg ${
                isActive 
                  ? 'bg-accent text-accent-foreground' 
                  : 'text-muted-foreground hover:bg-muted'
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
            `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg ${
              isActive 
                ? 'bg-accent text-accent-foreground' 
                : 'text-muted-foreground hover:bg-muted'
            }`
          }
        >
          <Home className="mr-3 h-5 w-5" />
          Dashboard
        </NavLink>
        
        <NavLink 
          to="/servizi" 
          className={({ isActive }) => 
            `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg ${
              isActive 
                ? 'bg-accent text-accent-foreground' 
                : 'text-muted-foreground hover:bg-muted'
            }`
          }
        >
          <ClipboardList className="mr-3 h-5 w-5" />
          Servizi
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
            `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg ${
              isActive 
                ? 'bg-accent text-accent-foreground' 
                : 'text-muted-foreground hover:bg-muted'
            }`
          }
        >
          <Home className="mr-3 h-5 w-5" />
          Dashboard
        </NavLink>
        
        <NavLink 
          to="/reports" 
          className={({ isActive }) => 
            `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg ${
              isActive 
                ? 'bg-accent text-accent-foreground' 
                : 'text-muted-foreground hover:bg-muted'
            }`
          }
        >
          <FileText className="mr-3 h-5 w-5" />
          I miei report
        </NavLink>

        <NavLink 
          to="/profilo" 
          className={({ isActive }) => 
            `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg ${
              isActive 
                ? 'bg-accent text-accent-foreground' 
                : 'text-muted-foreground hover:bg-muted'
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
