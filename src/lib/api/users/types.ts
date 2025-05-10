
import { UserRole } from '@/lib/types';

export type UserFormData = {
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  azienda_id?: string | null;
};
