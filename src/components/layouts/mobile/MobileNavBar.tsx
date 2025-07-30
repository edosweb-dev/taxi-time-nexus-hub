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
    <nav className="fixed bottom-0 left-0 right-0 bg-primary/95 backdrop-blur-md border-t border-white/20 flex items-center justify-around py-3 px-2 z-50 text-white animate-fade-in shadow-lg">
      {mainItems.map((item) => {
        const isActive = location.pathname === item.to;
        
        return (
          <Link 
            key={item.to}
            to={item.to} 
            className={cn(
              "flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 min-w-0 flex-1 relative group active:scale-95",
              isActive 
                ? "bg-white text-primary shadow-lg transform scale-105" 
                : "text-white hover:bg-white/10 active:bg-white/20"
            )}
          >
            <item.icon className={cn(
              "h-6 w-6 mb-1 transition-all duration-300",
              isActive ? "scale-110" : "group-hover:scale-110"
            )} />
            <span className={cn(
              "text-xs truncate transition-all duration-300 font-medium",
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
          <button className="flex flex-col items-center justify-center p-3 rounded-xl text-white hover:bg-white/10 active:bg-white/20 active:scale-95 transition-all duration-300 min-w-0 group">
            <MoreHorizontal className="h-6 w-6 mb-1 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-xs font-medium">Menu</span>
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl border-t border-white/20 bg-background/95 backdrop-blur-md">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-center">Menu Completo</SheetTitle>
          </SheetHeader>
          <MobileMenuContent />
        </SheetContent>
      </Sheet>
      
      {/* Logout always visible */}
      <button 
        onClick={() => signOut()}
        className="flex flex-col items-center justify-center p-3 rounded-xl text-white hover:bg-red-500/20 active:bg-red-500/30 active:scale-95 transition-all duration-300 min-w-0 group"
      >
        <LogOut className="h-6 w-6 mb-1 group-hover:scale-110 transition-transform duration-300" />
        <span className="text-xs font-medium">Esci</span>
      </button>
    </nav>
  );
}