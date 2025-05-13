
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, CalendarDays, FileText, Users, Building, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export function MobileNavBar() {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  
  // Check if user is admin or socio for showing users menu
  const isAdminOrSocio = profile?.role === 'admin' || profile?.role === 'socio';
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-primary border-t border-white/20 flex items-center justify-around py-2 px-4 z-50 text-white">
      <Link 
        to="/dashboard" 
        className={cn(
          "flex flex-col items-center justify-center p-2 rounded-md transition-colors",
          location.pathname === "/dashboard" ? "bg-white text-primary" : "text-white hover:bg-white hover:text-primary"
        )}
      >
        <LayoutDashboard className="h-5 w-5" />
        <span className="text-xs mt-1">Dashboard</span>
      </Link>
      <Link 
        to="/shifts" 
        className={cn(
          "flex flex-col items-center justify-center p-2 rounded-md transition-colors",
          location.pathname === "/shifts" ? "bg-white text-primary" : "text-white hover:bg-white hover:text-primary"
        )}
      >
        <CalendarDays className="h-5 w-5" />
        <span className="text-xs mt-1">Turni</span>
      </Link>
      
      {/* Add Servizi to mobile navigation - visible to all users */}
      <Link 
        to="/servizi" 
        className={cn(
          "flex flex-col items-center justify-center p-2 rounded-md transition-colors",
          location.pathname === "/servizi" ? "bg-white text-primary" : "text-white hover:bg-white hover:text-primary"
        )}
      >
        <FileText className="h-5 w-5" />
        <span className="text-xs mt-1">Servizi</span>
      </Link>
      
      {/* Add Users menu item to mobile navigation - only visible to admin and socio roles */}
      {isAdminOrSocio && (
        <Link 
          to="/users" 
          className={cn(
            "flex flex-col items-center justify-center p-2 rounded-md transition-colors",
            location.pathname === "/users" ? "bg-white text-primary" : "text-white hover:bg-white hover:text-primary"
          )}
        >
          <Users className="h-5 w-5" />
          <span className="text-xs mt-1">Utenti</span>
        </Link>
      )}
      
      {/* Add Aziende menu item to mobile navigation - only visible to admin and socio roles */}
      {isAdminOrSocio && (
        <Link 
          to="/aziende" 
          className={cn(
            "flex flex-col items-center justify-center p-2 rounded-md transition-colors",
            location.pathname === "/aziende" ? "bg-white text-primary" : "text-white hover:bg-white hover:text-primary"
          )}
        >
          <Building className="h-5 w-5" />
          <span className="text-xs mt-1">Aziende</span>
        </Link>
      )}
      
      <button 
        onClick={() => signOut()}
        className="flex flex-col items-center justify-center p-2 rounded-md text-white hover:bg-white hover:text-primary transition-colors"
      >
        <LogOut className="h-5 w-5" />
        <span className="text-xs mt-1">Esci</span>
      </button>
    </div>
  );
}
