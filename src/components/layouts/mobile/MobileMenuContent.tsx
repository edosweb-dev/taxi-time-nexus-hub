
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
        { title: 'Calendario Servizi', path: '/calendario-servizi', icon: Calendar, roles: ['admin', 'socio', 'dipendente'] },
        { title: 'Report Servizi', path: '/report-servizi', icon: FileBarChart, roles: ['admin', 'socio'] },
        // Only show turni if user is not dipendente (since dipendenti have it in main nav)
        ...(profile.role !== 'dipendente' ? [{ title: 'Turni', path: '/calendario-turni', icon: Calendar, roles: ['admin', 'socio'] }] : []),
        { title: 'Spese Aziendali', path: '/spese-aziendali', icon: Wallet, roles: ['admin', 'socio'] },
        { title: 'Stipendi', path: '/stipendi', icon: Wallet, roles: ['admin', 'socio'] },
        { title: 'Conducenti Esterni', path: '/conducenti-esterni', icon: UserCircle, roles: ['admin', 'socio'] }
      ]
    },
    {
      title: 'Gestione',
      items: [
        // Only show aziende/users if not admin/socio (since they have them in main nav)
        ...(profile.role !== 'admin' && profile.role !== 'socio' ? [] : [
          { title: 'Aziende', path: '/aziende', icon: Building, roles: ['admin', 'socio'] }
        ]),
        { title: 'Feedback', path: '/feedback', icon: MessageCircle, roles: ['admin', 'socio'] }
      ]
    },
    {
      title: 'Sistema',
      items: [
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
            ? "bg-primary text-primary-foreground" 
            : "text-foreground hover:bg-muted hover:text-foreground"
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
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-4">
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
