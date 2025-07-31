
import { StatoServizio } from "@/lib/types/servizi";
import { Badge, BadgeProps } from "@/components/ui/badge";
import { Users, UserCheck, UserX, CheckCircle, XCircle } from "lucide-react";

// Get badge component based on service status
export const getStatoBadge = (stato: StatoServizio) => {
  switch (stato) {
    case 'da_assegnare':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100">Da assegnare</Badge>;
    case 'assegnato':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">Assegnato</Badge>;
    case 'completato':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">Completato</Badge>;
    case 'annullato':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100">Annullato</Badge>;
    case 'non_accettato':
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100">Non accettato</Badge>;
    case 'consuntivato':
      return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">Consuntivato</Badge>;
    default:
      return <Badge variant="outline">{stato}</Badge>;
  }
};

// Get icon component based on service status
export const getStateIcon = (stato: StatoServizio) => {
  switch (stato) {
    case 'da_assegnare':
      return <Users className="h-5 w-5 text-yellow-600" />;
    case 'assegnato':
      return <UserCheck className="h-5 w-5 text-blue-600" />;
    case 'completato':
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case 'annullato':
      return <XCircle className="h-5 w-5 text-red-600" />;
    case 'non_accettato':
      return <UserX className="h-5 w-5 text-purple-600" />;
    case 'consuntivato':
      return <CheckCircle className="h-5 w-5 text-primary" />;
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

// Get badge variant for service status
export function getStatusBadgeVariant(stato: StatoServizio): BadgeProps['variant'] {
  switch (stato) {
    case 'da_assegnare':
      return 'destructive';
    case 'assegnato':
      return 'secondary';
    case 'completato':
      return 'default';
    case 'consuntivato':
      return 'outline';
    case 'annullato':
      return 'destructive';
    case 'non_accettato':
      return 'destructive';
    default:
      return 'secondary';
  }
}
