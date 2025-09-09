import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, CreditCard, LogOut, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MobileMenuContent } from "./MobileMenuContent";

export function MobileNavBar() {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  
  if (!profile) return null;

  // Main navigation items always visible
  const mainItems = [
    {
      to: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard"
    },
    {
      to: "/servizi",
      icon: FileText,
      label: "Servizi"
    },
    {
      to: "/spese",
      icon: CreditCard,
      label: "Spese"
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-primary/95 backdrop-blur-md border-t border-white/20 flex items-center justify-around z-50 text-white animate-fade-in shadow-lg mobile-nav-safe">
      {mainItems.map((item) => {
        const isActive = location.pathname === item.to;
        
        return (
          <Link 
            key={item.to}
            to={item.to} 
            className={cn(
              "mobile-nav-item flex-1 relative group no-select",
              isActive 
                ? "bg-white text-primary shadow-lg transform scale-105" 
                : "text-white hover:bg-white/10 active:bg-white/20"
            )}
          >
            <item.icon className={cn(
              "h-5 w-5 xs:h-6 xs:w-6 transition-all duration-300",
              isActive ? "scale-110" : "group-hover:scale-110"
            )} />
            <span className={cn(
              "text-xs xs:text-sm font-medium transition-all duration-300 mt-1",
              isActive ? "font-bold" : "font-medium"
            )}>
              {item.label}
            </span>
            {/* Active indicator dot */}
            {isActive && (
              <div className="absolute -top-1 right-1 w-2 h-2 bg-primary rounded-full animate-scale-in" />
            )}
          </Link>
        );
      })}
      
      {/* Three dots menu */}
      <Sheet>
        <SheetTrigger asChild>
          <button className="mobile-nav-item text-white hover:bg-white/10 active:bg-white/20 group no-select">
            <MoreHorizontal className="h-5 w-5 xs:h-6 xs:w-6 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-xs xs:text-sm font-medium mt-1">Menu</span>
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[85vh] xs:h-[80vh] rounded-t-2xl border-t border-white/20 bg-background/95 backdrop-blur-md safe-area-bottom">
          <SheetHeader className="pb-4 safe-area-top">
            <SheetTitle className="text-center text-fluid-heading-sm">Menu Completo</SheetTitle>
          </SheetHeader>
          <MobileMenuContent />
        </SheetContent>
      </Sheet>
      
      {/* Logout always visible */}
      <button 
        onClick={() => signOut()}
        className="mobile-nav-item text-white hover:bg-red-500/20 active:bg-red-500/30 group no-select"
      >
        <LogOut className="h-5 w-5 xs:h-6 xs:w-6 group-hover:scale-110 transition-transform duration-300" />
        <span className="text-xs xs:text-sm font-medium mt-1">Esci</span>
      </button>
    </nav>
  );
}