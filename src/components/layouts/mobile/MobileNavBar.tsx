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
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-background/95 dark:bg-background/95 border-t border-border p-2 flex justify-around items-center z-50 backdrop-blur-md safe-area-inset-bottom"
      role="navigation"
      aria-label="Navigazione principale"
    >
      {mainItems.map((item) => {
        const isActive = location.pathname === item.to || 
                        (item.to === '/servizi' && location.pathname.startsWith('/servizi'));
        
        return (
          <Link 
            key={item.to}
            to={item.to} 
            className={cn(
              "flex flex-col items-center gap-1 p-3 min-w-[64px] min-h-[48px] rounded-xl transition-all duration-200 touch-manipulation active:scale-95",
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              isActive 
                ? "bg-primary text-primary-foreground shadow-lg scale-105" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted/80"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span className="text-xs font-medium truncate max-w-[48px]">{item.label}</span>
            {isActive && (
              <div className="absolute -top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
            )}
          </Link>
        );
      })}
      
      {/* Three dots menu */}
      <Sheet>
        <SheetTrigger asChild>
          <button 
            className="flex flex-col items-center gap-1 p-3 min-w-[64px] min-h-[48px] rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted/80 active:scale-95 transition-all duration-200 touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="Apri menu completo"
          >
            <MoreHorizontal className="h-5 w-5 shrink-0" />
            <span className="text-xs font-medium">Menu</span>
          </button>
        </SheetTrigger>
        <SheetContent 
          side="bottom" 
          className="h-[85vh] max-h-[600px] rounded-t-2xl border-t border-border bg-background/95 backdrop-blur-md safe-area-inset-bottom"
        >
          <SheetHeader className="pb-4">
            <SheetTitle className="text-center text-lg">Menu Completo</SheetTitle>
          </SheetHeader>
          <div className="h-full overflow-y-auto pb-4">
            <MobileMenuContent />
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Logout always visible */}
      <button 
        onClick={() => signOut()}
        className="flex flex-col items-center gap-1 p-3 min-w-[64px] min-h-[48px] rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive active:bg-destructive/20 active:scale-95 transition-all duration-200 touch-manipulation focus:outline-none focus:ring-2 focus:ring-destructive/50"
        aria-label="Disconnetti"
      >
        <LogOut className="h-5 w-5 shrink-0" />
        <span className="text-xs font-medium">Esci</span>
      </button>
    </nav>
  );
}