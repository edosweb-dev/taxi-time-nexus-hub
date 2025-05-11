
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, CalendarDays, FileText, Users, Building } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export function SidebarNavLinks() {
  const location = useLocation();
  const { profile } = useAuth();
  
  // Check if user is admin or socio for showing users menu
  const isAdminOrSocio = profile?.role === 'admin' || profile?.role === 'socio';
  
  return (
    <div className="space-y-1">
      <Link 
        to="/dashboard" 
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/20",
          location.pathname === "/dashboard" ? "bg-white/30" : "transparent"
        )}
      >
        <LayoutDashboard className="h-4 w-4" />
        <span>Dashboard</span>
      </Link>
      <Link 
        to="/shifts" 
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/20",
          location.pathname === "/shifts" ? "bg-white/30" : "transparent"
        )}
      >
        <CalendarDays className="h-4 w-4" />
        <span>Turni</span>
      </Link>
      
      {/* Add Servizi menu item - visible to all users */}
      <Link 
        to="/servizi" 
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/20",
          location.pathname === "/servizi" ? "bg-white/30" : "transparent"
        )}
      >
        <FileText className="h-4 w-4" />
        <span>Servizi</span>
      </Link>
      
      {/* Add Users menu item - only visible to admin and socio roles */}
      {isAdminOrSocio && (
        <Link 
          to="/users" 
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/20",
            location.pathname === "/users" ? "bg-white/30" : "transparent"
          )}
        >
          <Users className="h-4 w-4" />
          <span>Utenti</span>
        </Link>
      )}
      
      {/* Add Aziende menu item - only visible to admin and socio roles */}
      {isAdminOrSocio && (
        <Link 
          to="/aziende" 
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/20",
            location.pathname === "/aziende" ? "bg-white/30" : "transparent"
          )}
        >
          <Building className="h-4 w-4" />
          <span>Aziende</span>
        </Link>
      )}
    </div>
  );
}
