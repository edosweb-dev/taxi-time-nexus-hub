
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, CreditCard, Users, Building, LogOut, UserCircle, FileBarChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export function MobileNavBar() {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  
  if (!profile) return null;

  // Definizione dei link per ogni ruolo
  const getNavItems = () => {
    const baseItems = [
      {
        to: "/dashboard",
        icon: LayoutDashboard,
        label: "Dashboard",
        roles: ['admin', 'socio', 'dipendente', 'cliente']
      }
    ];

    if (profile.role === 'admin' || profile.role === 'socio') {
      return [
        ...baseItems,
        {
          to: "/servizi",
          icon: FileText,
          label: "Servizi",
          roles: ['admin', 'socio', 'dipendente']
        },
        {
          to: "/spese",
          icon: CreditCard,
          label: "Spese",
          roles: ['admin', 'socio', 'dipendente']
        },
        {
          to: "/reports",
          icon: FileBarChart,
          label: "Report",
          roles: ['admin', 'socio']
        },
        {
          to: "/aziende",
          icon: Building,
          label: "Aziende",
          roles: ['admin', 'socio']
        },
        ...(profile.role === 'admin' ? [{
          to: "/users",
          icon: Users,
          label: "Utenti",
          roles: ['admin']
        }] : [])
      ];
    } else if (profile.role === 'dipendente') {
      return [
        ...baseItems,
        {
          to: "/servizi",
          icon: FileText,
          label: "Servizi",
          roles: ['admin', 'socio', 'dipendente']
        },
        {
          to: "/spese",
          icon: CreditCard,
          label: "Spese",
          roles: ['admin', 'socio', 'dipendente']
        }
      ];
    } else if (profile.role === 'cliente') {
      return [
        ...baseItems,
        {
          to: "/profilo",
          icon: UserCircle,
          label: "Profilo",
          roles: ['cliente']
        },
        {
          to: "/reports",
          icon: FileBarChart,
          label: "Report",
          roles: ['cliente']
        }
      ];
    }

    return baseItems;
  };

  const navItems = getNavItems().filter(item => 
    item.roles.includes(profile.role)
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-primary border-t border-white/20 flex items-center justify-around py-2 px-4 z-50 text-white">
      {navItems.map((item) => (
        <Link 
          key={item.to}
          to={item.to} 
          className={cn(
            "flex flex-col items-center justify-center p-2 rounded-md transition-colors min-w-0 flex-1",
            location.pathname === item.to 
              ? "bg-white text-primary" 
              : "text-white hover:bg-white hover:text-primary"
          )}
        >
          <item.icon className="h-5 w-5 mb-1" />
          <span className="text-xs truncate">{item.label}</span>
        </Link>
      ))}
      
      <button 
        onClick={() => signOut()}
        className="flex flex-col items-center justify-center p-2 rounded-md text-white hover:bg-white hover:text-primary transition-colors min-w-0"
      >
        <LogOut className="h-5 w-5 mb-1" />
        <span className="text-xs">Esci</span>
      </button>
    </div>
  );
}
