
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
    <div className="fixed bottom-0 left-0 right-0 bg-primary border-t border-white/20 flex items-center justify-around py-2 px-4 z-50 text-white">
      {mainItems.map((item) => (
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
      
      {/* Menu a tre puntini */}
      <Sheet>
        <SheetTrigger asChild>
          <button className="flex flex-col items-center justify-center p-2 rounded-md text-white hover:bg-white hover:text-primary transition-colors min-w-0">
            <MoreHorizontal className="h-5 w-5 mb-1" />
            <span className="text-xs">Menu</span>
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[70vh]">
          <SheetHeader>
            <SheetTitle>Menu Completo</SheetTitle>
          </SheetHeader>
          <MobileMenuContent />
        </SheetContent>
      </Sheet>
      
      {/* Logout sempre visibile */}
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
