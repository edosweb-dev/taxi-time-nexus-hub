
import { Badge } from '@/components/ui/badge';

export const getInitials = (firstName?: string | null, lastName?: string | null) => {
  const first = firstName?.charAt(0) || '';
  const last = lastName?.charAt(0) || '';
  return (first + last).toUpperCase() || '?';
};

export const getRuoloBadge = (ruolo: string) => {
  return ruolo === 'dipendente' ? (
    <Badge variant="outline" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
      Dipendente
    </Badge>
  ) : (
    <Badge variant="outline" className="bg-green-100 text-green-700 hover:bg-green-100">
      Socio
    </Badge>
  );
};

export const getStatoBadge = (stato: string) => {
  switch (stato) {
    case 'bozza':
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Bozza</Badge>;
    case 'confermato':
      return <Badge variant="outline" className="bg-green-100 text-green-700 hover:bg-green-100">Confermato</Badge>;
    case 'pagato':
      return <Badge variant="outline" className="bg-blue-100 text-blue-700 hover:bg-blue-100">Pagato</Badge>;
    default:
      return <Badge variant="outline">{stato}</Badge>;
  }
};

export const getStatusOptions = (currentStatus: string) => {
  const options = ['bozza', 'confermato', 'pagato'];
  return options.filter(status => status !== currentStatus);
};

export type SortField = 'nome' | 'km_ore' | 'base_lordo' | 'detrazioni' | 'aggiunte' | 'netto' | 'percentuale';
export type SortDirection = 'asc' | 'desc';
