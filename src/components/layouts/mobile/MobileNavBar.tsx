
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

  // Voci principali sempre visibili
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
    <nav className="fixed bottom-0 left-0 right-0 bg-primary border-t border-white/20 flex items-center justify-around py-2 px-2 z-50 text-white animate-fade-in">
      {mainItems.map((item) => {
        const isActive = location.pathname === item.to;
        
        return (
          <Link 
            key={item.to}
            to={item.to} 
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-0 flex-1 relative",
              isActive 
                ? "bg-white text-primary transform scale-105 shadow-lg" 
                : "text-white hover:bg-white/20 hover:scale-105"
            )}
          >
            <item.icon className={cn(
              "h-5 w-5 mb-1 transition-all duration-200",
              isActive ? "animate-pulse" : ""
            )} />
            <span className={cn(
              "text-xs truncate transition-all duration-200",
              isActive ? "font-semibold" : "font-normal"
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
      
      {/* Menu a tre puntini */}
      <Sheet>
        <SheetTrigger asChild>
          <button className="flex flex-col items-center justify-center p-2 rounded-lg text-white hover:bg-white/20 hover:scale-105 transition-all duration-200 min-w-0">
            <MoreHorizontal className="h-5 w-5 mb-1" />
            <span className="text-xs font-normal">Menu</span>
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[75vh] rounded-t-xl border-t border-white/20">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-center">Menu Completo</SheetTitle>
          </SheetHeader>
          <MobileMenuContent />
        </SheetContent>
      </Sheet>
      
      {/* Logout sempre visibile */}
      <button 
        onClick={() => signOut()}
        className="flex flex-col items-center justify-center p-2 rounded-lg text-white hover:bg-red-500/20 hover:scale-105 transition-all duration-200 min-w-0 group"
      >
        <LogOut className="h-5 w-5 mb-1 group-hover:animate-pulse" />
        <span className="text-xs font-normal">Esci</span>
      </button>
    </nav>
  );
}
