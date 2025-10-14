import { useNavigate, useLocation } from "react-router-dom";
import { Home, Calendar, Clock, DollarSign, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { DipendenteMobileSidebar } from "./DipendenteMobileSidebar";

export function DipendenteMobileNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    {
      id: 'dashboard',
      icon: Home,
      label: 'Home',
      path: '/dipendente/dashboard'
    },
    {
      id: 'servizi',
      icon: Calendar,
      label: 'Servizi',
      path: '/dipendente/servizi-assegnati'
    },
    {
      id: 'turni',
      icon: Clock,
      label: 'Turni',
      path: '/dipendente/turni'
    },
    {
      id: 'spese',
      icon: DollarSign,
      label: 'Spese',
      path: '/dipendente/spese'
    },
    {
      id: 'altro',
      icon: MoreHorizontal,
      label: 'Altro',
      path: null // Opens sidebar
    }
  ];

  const isActive = (path: string | null) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.path) {
      navigate(item.path);
    } else {
      setMenuOpen(true);
    }
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t pb-safe shadow-lg">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-1 h-full touch-manipulation transition-colors",
                  active 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
      
      <DipendenteMobileSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
