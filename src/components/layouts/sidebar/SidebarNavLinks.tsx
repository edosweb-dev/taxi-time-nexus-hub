
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  Building2,
  Calendar,
  FileBarChart,
  Settings
} from "lucide-react";

export function SidebarNavLinks() {
  const { pathname } = useLocation();
  const { profile } = useAuth();

  // Link nascosti per ruoli specifici
  const isAdmin = profile?.role === 'admin';
  const isSocio = profile?.role === 'socio';
  const isCliente = profile?.role === 'cliente';
  const isDipendente = profile?.role === 'dipendente';

  if (isCliente) {
    return (
      <nav className="grid gap-1 px-2">
        <Link
          to="/cliente"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
            pathname === '/cliente' && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
          )}
        >
          <Home className="h-4 w-4" />
          <span>Dashboard</span>
        </Link>
      </nav>
    );
  }

  return (
    <nav className="grid gap-1 px-2">
      <Link
        to="/dashboard"
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
          pathname === '/dashboard' && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
        )}
      >
        <Home className="h-4 w-4" />
        <span>Dashboard</span>
      </Link>

      {(isAdmin || isSocio) && (
        <>
          <Link
            to="/servizi"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
              pathname.includes('/servizi') && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
            )}
          >
            <Calendar className="h-4 w-4" />
            <span>Servizi</span>
          </Link>

          <Link
            to="/turni"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
              pathname.includes('/turni') && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
            )}
          >
            <Calendar className="h-4 w-4" />
            <span>Turni</span>
          </Link>

          <Link
            to="/reports"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
              pathname === '/reports' && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
            )}
          >
            <FileBarChart className="h-4 w-4" />
            <span>Report</span>
          </Link>
        </>
      )}

      {isDipendente && (
        <Link
          to="/servizi"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
            pathname.includes('/servizi') && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
          )}
        >
          <Calendar className="h-4 w-4" />
          <span>I Miei Servizi</span>
        </Link>
      )}

      {isAdmin && (
        <>
          <Link
            to="/users"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
              pathname === '/users' && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
            )}
          >
            <Users className="h-4 w-4" />
            <span>Utenti</span>
          </Link>

          <Link
            to="/aziende"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
              pathname.includes('/aziende') && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
            )}
          >
            <Building2 className="h-4 w-4" />
            <span>Aziende</span>
          </Link>

          <Link
            to="/impostazioni"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
              pathname === '/impostazioni' && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
            )}
          >
            <Settings className="h-4 w-4" />
            <span>Impostazioni</span>
          </Link>
        </>
      )}
    </nav>
  );
}
