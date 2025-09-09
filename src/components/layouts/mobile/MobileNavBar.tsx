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
    <nav className="fixed bottom-0 left-0 right-0 bg-primary/95 dark:bg-primary border-t border-white/20 p-2 flex justify-around items-center z-50 backdrop-blur-md">
      {mainItems.map((item) => {
        const isActive = location.pathname === item.to;
        
        return (
          <Link 
            key={item.to}
            to={item.to} 
            className={cn(
              "flex flex-col items-center gap-1 p-2 min-w-[60px] rounded-lg transition-all duration-200 touch-manipulation",
              isActive 
                ? "bg-white text-primary shadow-lg" 
                : "text-white hover:bg-white/10 active:bg-white/20"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs font-medium">{item.label}</span>
            {isActive && (
              <div className="absolute -top-1 right-1 w-2 h-2 bg-white rounded-full" />
            )}
          </Link>
        );
      })}
      
      {/* Three dots menu */}
      <Sheet>
        <SheetTrigger asChild>
          <button className="flex flex-col items-center gap-1 p-2 min-w-[60px] rounded-lg text-white hover:bg-white/10 active:bg-white/20 transition-all duration-200 touch-manipulation">
            <MoreHorizontal className="h-5 w-5" />
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
        className="flex flex-col items-center gap-1 p-2 min-w-[60px] rounded-lg text-white hover:bg-red-500/20 active:bg-red-500/30 transition-all duration-200 touch-manipulation"
      >
        <LogOut className="h-5 w-5" />
        <span className="text-xs font-medium">Esci</span>
      </button>
    </nav>
  );
}