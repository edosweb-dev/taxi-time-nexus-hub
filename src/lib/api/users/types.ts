
import { UserRole } from '@/lib/types';

export type UserFormData = {
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  telefono?: string;
  azienda_id?: string | null;
};
