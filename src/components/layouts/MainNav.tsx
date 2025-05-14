
// Aggiorna il MainNav per includere i link alle nuove pagine

import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Building, 
  Calendar, 
  CreditCard, 
  Home, 
  Receipt, 
  Settings, 
  TruckIcon, 
  Users 
} from "lucide-react";

interface MainNavProps {
  className?: string;
}

export function MainNav({ className }: MainNavProps) {
  const { profile } = useAuth();
  const location = useLocation();
  const isAdminOrSocio = profile?.role === "admin" || profile?.role === "socio";
  const isAdmin = profile?.role === "admin";
  const isCliente = profile?.role === "cliente";

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
    >
      {isCliente ? (
        <>
          <Link
            to="/dashboard-cliente"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary flex items-center",
              location.pathname === "/dashboard-cliente" ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
          <Link
            to="/servizi"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary flex items-center",
              location.pathname.startsWith("/servizi") ? "text-primary" : "text-muted-foreground"
            )}
          >
            <TruckIcon className="mr-2 h-4 w-4" />
            Servizi
          </Link>
        </>
      ) : (
        <>
          <Link
            to="/dashboard"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary flex items-center",
              location.pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
          <Link
            to="/servizi"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary flex items-center",
              location.pathname.startsWith("/servizi") ? "text-primary" : "text-muted-foreground"
            )}
          >
            <TruckIcon className="mr-2 h-4 w-4" />
            Servizi
          </Link>
          <Link
            to="/shifts"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary flex items-center",
              location.pathname === "/shifts" ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Turni
          </Link>
          {isAdminOrSocio && (
            <Link
              to="/users"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary flex items-center",
                location.pathname === "/users" ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Users className="mr-2 h-4 w-4" />
              Utenti
            </Link>
          )}
          {isAdminOrSocio && (
            <Link
              to="/aziende"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary flex items-center",
                location.pathname.startsWith("/aziende") ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Building className="mr-2 h-4 w-4" />
              Aziende
            </Link>
          )}
          <Link
            to="/spese"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary flex items-center",
              location.pathname === "/spese" ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Receipt className="mr-2 h-4 w-4" />
            Spese
          </Link>
          {isAdminOrSocio && (
            <Link
              to="/movimenti"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary flex items-center",
                location.pathname === "/movimenti" ? "text-primary" : "text-muted-foreground"
              )}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Movimenti
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/impostazioni"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary flex items-center",
                location.pathname === "/impostazioni" ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Settings className="mr-2 h-4 w-4" />
              Impostazioni
            </Link>
          )}
        </>
      )}
    </nav>
  );
}
