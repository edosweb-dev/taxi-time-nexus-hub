
import { Servizio, StatoServizio } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";
import { Calendar, Users, UserCheck, UserX, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Get badge component based on service status
export const getStatoBadge = (stato: StatoServizio) => {
  switch (stato) {
    case 'da_assegnare':
      return <Badge variant="outline" className="bg-amber-100 text-amber-700 hover:bg-amber-100">Da assegnare</Badge>;
    case 'assegnato':
      return <Badge variant="outline" className="bg-blue-100 text-blue-700 hover:bg-blue-100">Assegnato</Badge>;
    case 'completato':
      return <Badge variant="outline" className="bg-green-100 text-green-700 hover:bg-green-100">Completato</Badge>;
    case 'annullato':
      return <Badge variant="outline" className="bg-red-100 text-red-700 hover:bg-red-100">Annullato</Badge>;
    case 'non_accettato':
      return <Badge variant="outline" className="bg-purple-100 text-purple-700 hover:bg-purple-100">Non accettato</Badge>;
    default:
      return <Badge variant="outline">{stato}</Badge>;
  }
};

// Get icon component based on service status
export const getStateIcon = (stato: StatoServizio) => {
  switch (stato) {
    case 'da_assegnare':
      return <Users className="h-5 w-5 text-amber-500" />;
    case 'assegnato':
      return <UserCheck className="h-5 w-5 text-blue-500" />;
    case 'completato':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'annullato':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'non_accettato':
      return <UserX className="h-5 w-5 text-purple-500" />;
  }
};

// Find user details by ID
export const getUserName = (users: Profile[], userId?: string) => {
  if (!userId) return null;
  const user = users.find(u => u.id === userId);
  return user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : null;
};

// Group services by status
export const groupServiziByStatus = (servizi: Servizio[]) => {
  return {
    da_assegnare: servizi.filter(s => s.stato === 'da_assegnare'),
    assegnato: servizi.filter(s => s.stato === 'assegnato'),
    completato: servizi.filter(s => s.stato === 'completato'),
    annullato: servizi.filter(s => s.stato === 'annullato'),
    non_accettato: servizi.filter(s => s.stato === 'non_accettato')
  };
};
