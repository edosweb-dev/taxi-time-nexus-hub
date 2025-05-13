
import { Profile } from "@/lib/types";

/**
 * Returns role name for display
 */
export const getRoleName = (role: string): string => {
  switch(role) {
    case 'admin': 
      return 'Amministratore';
    case 'socio': 
      return 'Socio';
    case 'dipendente': 
      return 'Dipendente';
    case 'cliente': 
      return 'Cliente';
    default: 
      return 'Utente';
  }
};

/**
 * Filter users by role
 */
export const filterUsersByRole = (users: Profile[], roles: string[]): Profile[] => {
  return users.filter(user => roles.includes(user.role));
};
