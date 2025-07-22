
import { Shift } from '../types';

export const getUserDisplayName = (shift: Shift): string => {
  // Try first name + last name
  if (shift.user_first_name && shift.user_last_name) {
    return `${shift.user_first_name} ${shift.user_last_name}`;
  }
  
  // Try first name only
  if (shift.user_first_name) {
    return shift.user_first_name;
  }
  
  // Try last name only
  if (shift.user_last_name) {
    return shift.user_last_name;
  }
  
  // Fallback to email
  if (shift.user_email) {
    return shift.user_email.split('@')[0]; // Show only the part before @
  }
  
  // Last resort
  return 'Utente sconosciuto';
};

export const getUserInitials = (shift: Shift): string => {
  if (shift.user_first_name && shift.user_last_name) {
    return `${shift.user_first_name.charAt(0)}.${shift.user_last_name.charAt(0)}.`;
  }
  
  if (shift.user_first_name) {
    return `${shift.user_first_name.charAt(0)}.`;
  }
  
  if (shift.user_last_name) {
    return `${shift.user_last_name.charAt(0)}.`;
  }
  
  if (shift.user_email) {
    return shift.user_email.charAt(0).toUpperCase();
  }
  
  return '?';
};
