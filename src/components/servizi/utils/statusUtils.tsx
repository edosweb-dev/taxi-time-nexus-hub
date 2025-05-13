
import { StatoServizio } from "@/lib/types/servizi";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, UserX, CheckCircle, XCircle } from "lucide-react";

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
    case 'consuntivato':
      return <Badge variant="outline" className="bg-slate-100 text-slate-700 hover:bg-slate-100">Consuntivato</Badge>;
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
    case 'consuntivato':
      return <CheckCircle className="h-5 w-5 text-slate-500" />;
  }
};

// Get text label for service status
export const getStatoLabel = (stato: StatoServizio): string => {
  switch (stato) {
    case 'da_assegnare':
      return 'Da assegnare';
    case 'assegnato':
      return 'Assegnato';
    case 'completato':
      return 'Completato';
    case 'annullato':
      return 'Annullato';
    case 'non_accettato':
      return 'Non accettato';
    case 'consuntivato':
      return 'Consuntivato';
    default:
      return stato;
  }
};
