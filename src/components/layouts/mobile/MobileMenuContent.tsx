
import { Link, useLocation } from "react-router-dom";
import { 
  FilePlus, 
  Calendar, 
  Wallet, 
  Car, 
  FileBarChart, 
  Building, 
  Users, 
  Settings, 
  UserCircle,
  FileText,
  MessageCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface MenuItem {
  title: string;
  path: string;
  icon: any;
  roles: string[];
}

export function MobileMenuContent() {
  const location = useLocation();
  const { profile } = useAuth();
  
  if (!profile) return null;

  // Definizione delle sezioni menu per tutti i ruoli (escluse le voci principali già nella navbar)
  const menuSections: MenuSection[] = [
    {
      title: 'Operazioni',
      items: [
        { title: 'Nuovo Servizio', path: '/nuovo-servizio', icon: FilePlus, roles: ['admin', 'socio'] },
        { title: 'Turni', path: '/calendario-turni', icon: Calendar, roles: ['admin', 'socio', 'dipendente'] },
        { title: 'Le mie spese', path: '/spese-dipendente', icon: Wallet, roles: ['dipendente'] },
        { title: 'Report Spese', path: '/spese-aziendali', icon: FileText, roles: ['admin', 'socio'] },
        { title: 'Movimenti', path: '/movimenti', icon: Wallet, roles: ['admin', 'socio'] },
        { title: 'Veicoli', path: '/veicoli', icon: Car, roles: ['admin', 'socio'] }
      ]
    },
    {
      title: 'Reportistica',
      items: [
        { title: 'Report', path: '/reports', icon: FileBarChart, roles: ['admin', 'socio', 'cliente'] },
        { title: 'Feedback', path: '/feedback', icon: MessageCircle, roles: ['admin', 'socio'] }
      ]
    },
    {
      title: 'Amministrazione',
      items: [
        { title: 'Aziende', path: '/aziende', icon: Building, roles: ['admin', 'socio'] },
        { title: 'Utenti', path: '/users', icon: Users, roles: ['admin'] },
        { title: 'Impostazioni', path: '/impostazioni', icon: Settings, roles: ['admin', 'socio'] }
      ]
    },
    {
      title: 'Account',
      items: [
        { title: 'Profilo', path: '/profilo', icon: UserCircle, roles: ['cliente'] }
      ]
    }
  ];

  const renderMenuItem = (item: MenuItem) => {
    // Verifica permessi
    if (!item.roles.includes(profile.role)) {
      return null;
    }

    return (
      <Link 
        key={item.path}
        to={item.path} 
        className={cn(
          "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
          location.pathname === item.path 
            ? "bg-primary text-white" 
            : "text-gray-700 hover:bg-gray-100"
        )}
      >
        <item.icon className="mr-3 h-5 w-5" />
        {item.title}
      </Link>
    );
  };

  const renderSection = (section: MenuSection) => {
    const visibleItems = section.items.filter(item => 
      item.roles.includes(profile.role)
    );

    if (visibleItems.length === 0) return null;

    return (
      <div key={section.title} className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-4">
          {section.title}
        </h3>
        <div className="space-y-1">
          {section.items.map(renderMenuItem)}
        </div>
      </div>
    );
  };

  return (
    <div className="py-4 space-y-6 max-h-full overflow-y-auto">
      {menuSections.map(renderSection)}
    </div>
  );
}
