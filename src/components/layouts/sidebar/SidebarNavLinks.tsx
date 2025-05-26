
import { useAuth } from '@/contexts/AuthContext';
import { 
  BarChart4, 
  Calendar, 
  ClipboardList, 
  FilePlus, 
  Home, 
  Settings, 
  ShoppingBag, 
  UserCircle, 
  Users, 
  CreditCard, 
  Wallet, 
  Car, 
  FileBarChart,
  ChevronDown,
  Clock,
  UserCheck
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from 'react';

export function SidebarNavLinks() {
  const { profile } = useAuth();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    servizi: false,
    gestione: false,
    impostazioni: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
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
        
        {/* Servizi Section */}
        <Collapsible open={openSections.servizi} onOpenChange={() => toggleSection('servizi')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium rounded-lg text-white hover:bg-white hover:text-primary">
            <div className="flex items-center">
              <ClipboardList className="mr-3 h-5 w-5" />
              Servizi
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${openSections.servizi ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-4 space-y-1">
            <NavLink 
              to="/servizi" 
              className={({ isActive }) => 
                `flex items-center px-4 py-2 text-sm rounded-lg sidebar-nav-link ${
                  isActive 
                    ? 'bg-white text-primary' 
                    : 'text-white/90 hover:bg-white hover:text-primary'
                }`
              }
            >
              <ClipboardList className="mr-3 h-4 w-4" />
              Tutti i servizi
            </NavLink>
            
            <NavLink 
              to="/servizi?filter=da-assegnare" 
              className={({ isActive }) => 
                `flex items-center px-4 py-2 text-sm rounded-lg sidebar-nav-link ${
                  isActive 
                    ? 'bg-white text-primary' 
                    : 'text-white/90 hover:bg-white hover:text-primary'
                }`
              }
            >
              <UserCheck className="mr-3 h-4 w-4" />
              Da assegnare
            </NavLink>
          </CollapsibleContent>
        </Collapsible>

        {/* Gestione Section */}
        <Collapsible open={openSections.gestione} onOpenChange={() => toggleSection('gestione')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium rounded-lg text-white hover:bg-white hover:text-primary">
            <div className="flex items-center">
              <Settings className="mr-3 h-5 w-5" />
              Gestione
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${openSections.gestione ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-4 space-y-1">
            <NavLink 
              to="/aziende" 
              className={({ isActive }) => 
                `flex items-center px-4 py-2 text-sm rounded-lg sidebar-nav-link ${
                  isActive 
                    ? 'bg-white text-primary' 
                    : 'text-white/90 hover:bg-white hover:text-primary'
                }`
              }
            >
              <ShoppingBag className="mr-3 h-4 w-4" />
              Aziende
            </NavLink>
            
            {profile.role === 'admin' && (
              <NavLink 
                to="/veicoli" 
                className={({ isActive }) => 
                  `flex items-center px-4 py-2 text-sm rounded-lg sidebar-nav-link ${
                    isActive 
                      ? 'bg-white text-primary' 
                      : 'text-white/90 hover:bg-white hover:text-primary'
                  }`
                }
              >
                <Car className="mr-3 h-4 w-4" />
                Veicoli
              </NavLink>
            )}
            
            <NavLink 
              to="/reports" 
              className={({ isActive }) => 
                `flex items-center px-4 py-2 text-sm rounded-lg sidebar-nav-link ${
                  isActive 
                    ? 'bg-white text-primary' 
                    : 'text-white/90 hover:bg-white hover:text-primary'
                }`
              }
            >
              <FileBarChart className="mr-3 h-4 w-4" />
              Report
            </NavLink>
            
            <NavLink 
              to="/turni" 
              className={({ isActive }) => 
                `flex items-center px-4 py-2 text-sm rounded-lg sidebar-nav-link ${
                  isActive 
                    ? 'bg-white text-primary' 
                    : 'text-white/90 hover:bg-white hover:text-primary'
                }`
              }
            >
              <Calendar className="mr-3 h-4 w-4" />
              Turni
            </NavLink>
          </CollapsibleContent>
        </Collapsible>

        {/* Impostazioni Section */}
        <Collapsible open={openSections.impostazioni} onOpenChange={() => toggleSection('impostazioni')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium rounded-lg text-white hover:bg-white hover:text-primary">
            <div className="flex items-center">
              <Settings className="mr-3 h-5 w-5" />
              Impostazioni
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${openSections.impostazioni ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-4 space-y-1">
            <NavLink 
              to="/impostazioni" 
              className={({ isActive }) => 
                `flex items-center px-4 py-2 text-sm rounded-lg sidebar-nav-link ${
                  isActive 
                    ? 'bg-white text-primary' 
                    : 'text-white/90 hover:bg-white hover:text-primary'
                }`
              }
            >
              <Settings className="mr-3 h-4 w-4" />
              Configurazione
            </NavLink>
            
            {profile.role === 'admin' && (
              <NavLink 
                to="/users" 
                className={({ isActive }) => 
                  `flex items-center px-4 py-2 text-sm rounded-lg sidebar-nav-link ${
                    isActive 
                      ? 'bg-white text-primary' 
                      : 'text-white/90 hover:bg-white hover:text-primary'
                  }`
                }
              >
                <Users className="mr-3 h-4 w-4" />
                Utenti
              </NavLink>
            )}
          </CollapsibleContent>
        </Collapsible>
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
