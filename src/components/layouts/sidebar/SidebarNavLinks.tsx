
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
  ChevronRight,
  FileText
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface MenuItem {
  title: string;
  path: string;
  icon: any;
  adminOnly?: boolean;
}

export function SidebarNavLinks() {
  const { profile } = useAuth();
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  
  if (!profile) {
    return null;
  }

  const toggleSection = (sectionTitle: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  // Definizione delle sezioni menu per Admin e Socio
  const adminSocioSections: MenuSection[] = [
    {
      title: 'Dashboard',
      items: [
        { title: 'Dashboard', path: '/dashboard', icon: Home }
      ]
    },
    {
      title: 'Operazioni',
      items: [
        { title: 'Servizi', path: '/servizi', icon: ClipboardList },
        { title: 'Nuovo Servizio', path: '/nuovo-servizio', icon: FilePlus },
        { title: 'Turni', path: '/turni', icon: Calendar },
        { title: 'Spese', path: '/spese', icon: CreditCard },
        { title: 'Report Spese', path: '/spese-aziendali', icon: FileText },
        { title: 'Movimenti', path: '/movimenti', icon: Wallet },
        { title: 'Veicoli', path: '/veicoli', icon: Car }
      ]
    },
    {
      title: 'Reportistica',
      items: [
        { title: 'Report', path: '/reports', icon: FileBarChart }
      ]
    },
    {
      title: 'Amministrazione',
      items: [
        { title: 'Aziende', path: '/aziende', icon: ShoppingBag },
        { title: 'Utenti', path: '/users', icon: Users, adminOnly: true },
        { title: 'Impostazioni', path: '/impostazioni', icon: Settings }
      ]
    }
  ];

  // Definizione delle sezioni menu per Dipendente
  const dipendenteSections: MenuSection[] = [
    {
      title: 'Dashboard',
      items: [
        { title: 'Dashboard', path: '/dashboard', icon: Home }
      ]
    },
    {
      title: 'Operazioni',
      items: [
        { title: 'Servizi', path: '/servizi', icon: ClipboardList },
        { title: 'Le mie spese', path: '/spese-dipendente', icon: Wallet }
      ]
    }
  ];

  // Definizione delle sezioni menu per Cliente
  const clienteSections: MenuSection[] = [
    {
      title: 'Dashboard',
      items: [
        { title: 'Dashboard', path: '/dashboard', icon: Home }
      ]
    },
    {
      title: 'Account',
      items: [
        { title: 'Profilo', path: '/profilo', icon: UserCircle },
        { title: 'Report', path: '/reports', icon: FileBarChart }
      ]
    }
  ];

  // Seleziona le sezioni appropriate in base al ruolo
  let sections: MenuSection[] = [];
  if (profile.role === 'admin' || profile.role === 'socio') {
    sections = adminSocioSections;
  } else if (profile.role === 'dipendente') {
    sections = dipendenteSections;
  } else if (profile.role === 'cliente') {
    sections = clienteSections;
  }

  const renderMenuItem = (item: MenuItem) => {
    // Verifica permessi per elementi admin-only
    if (item.adminOnly && profile.role !== 'admin') {
      return null;
    }

    return (
      <NavLink 
        key={item.path}
        to={item.path} 
        className={({ isActive }) => 
          `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg sidebar-nav-link ml-4 ${
            isActive 
              ? 'bg-white text-primary' 
              : 'text-white hover:bg-white hover:text-primary'
          }`
        }
      >
        <item.icon className="mr-3 h-4 w-4" />
        {item.title}
      </NavLink>
    );
  };

  const renderSection = (section: MenuSection) => {
    const isCollapsed = collapsedSections[section.title];
    const hasVisibleItems = section.items.some(item => 
      !item.adminOnly || profile.role === 'admin'
    );

    if (!hasVisibleItems) return null;

    // Se la sezione ha un solo elemento, renderizzalo direttamente senza raggrupparsi
    if (section.items.length === 1) {
      return renderMenuItem(section.items[0]);
    }

    return (
      <div key={section.title} className="space-y-1">
        <button
          onClick={() => toggleSection(section.title)}
          className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <span className="font-semibold">{section.title}</span>
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        
        {!isCollapsed && (
          <div className="space-y-1">
            {section.items.map(renderMenuItem)}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="space-y-2">
      {sections.map(renderSection)}
    </nav>
  );
}
