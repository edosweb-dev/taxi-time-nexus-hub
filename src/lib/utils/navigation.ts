import { UserRole } from '@/lib/types';

/**
 * Restituisce la route dashboard corretta in base al ruolo utente
 */
export function getDashboardRoute(role: UserRole): string {
  switch (role) {
    case 'admin':
    case 'socio':
      return '/dashboard';
    
    case 'dipendente':
      return '/dipendente/calendario';
    
    case 'cliente':
      return '/dashboard-cliente';
    
    default:
      console.warn(`[getDashboardRoute] Unknown role: ${role}, defaulting to /dashboard`);
      return '/dashboard';
  }
}

/**
 * Restituisce la route home corretta (alias di getDashboardRoute)
 */
export function getHomeRoute(role: UserRole): string {
  return getDashboardRoute(role);
}
