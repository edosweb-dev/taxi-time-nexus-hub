import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface SpesaCardProps {
  spesa: {
    id: string;
    causale: string;
    importo: number;
    data_spesa: string;
    note?: string | null;
    stato: 'in_attesa' | 'approvata' | 'non_autorizzata' | 'in_revisione';
    approved_by_profile?: {
      first_name: string | null;
      last_name: string | null;
    };
    approved_at?: string | null;
    note_revisione?: string | null;
  };
  onClick: () => void;
}

export function SpesaCard({ spesa, onClick }: SpesaCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getCardBorderColor = (stato: string) => {
    switch (stato) {
      case 'in_attesa':
      case 'in_revisione':
        return 'border-l-4 border-l-yellow-400';
      case 'approvata':
        return 'border-l-4 border-l-green-400';
      case 'non_autorizzata':
        return 'border-l-4 border-l-red-400';
      default:
        return 'border-l-4 border-l-yellow-400';
    }
  };

  const getBadgeClasses = (stato: string) => {
    switch (stato) {
      case 'in_attesa':
      case 'in_revisione':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80';
      case 'approvata':
        return 'bg-green-100 text-green-800 hover:bg-green-100/80';
      case 'non_autorizzata':
        return 'bg-red-100 text-red-800 hover:bg-red-100/80';
      default:
        return '';
    }
  };

  const getBadgeIcon = (stato: string) => {
    switch (stato) {
      case 'in_attesa':
      case 'in_revisione':
        return '🟡';
      case 'approvata':
        return '🟢';
      case 'non_autorizzata':
        return '🔴';
      default:
        return '';
    }
  };

  const getStatoLabel = (stato: string) => {
    switch (stato) {
      case 'in_attesa':
        return 'IN ATTESA';
      case 'in_revisione':
        return 'IN REVISIONE';
      case 'approvata':
        return 'APPROVATA';
      case 'non_autorizzata':
        return 'RIFIUTATA';
      default:
        return stato.toUpperCase();
    }
  };

  return (
    <Card 
      className={cn(
        "p-4 transition-all cursor-pointer min-h-[120px]",
        "hover:shadow-md",
        getCardBorderColor(spesa.stato)
      )}
      onClick={onClick}
    >
      <div className="space-y-3">
        {/* Header: Badge + Importo */}
        <div className="flex items-center justify-between">
          <Badge className={cn("gap-1", getBadgeClasses(spesa.stato))}>
            <span>{getBadgeIcon(spesa.stato)}</span>
            <span>{getStatoLabel(spesa.stato)}</span>
          </Badge>
          <span className="text-lg font-bold text-primary">
            {formatCurrency(spesa.importo)}
          </span>
        </div>

        {/* Causale */}
        <div className="font-semibold truncate">{spesa.causale}</div>

        {/* Data */}
        <div className="text-sm text-muted-foreground">
          {format(parseISO(spesa.data_spesa), 'dd/MM/yyyy')}
        </div>

        {/* Note preview */}
        {spesa.note && (
          <div className="text-xs text-muted-foreground line-clamp-1">
            {spesa.note}
          </div>
        )}

        {/* Info Approvazione */}
        {spesa.stato === 'approvata' && spesa.approved_by_profile && (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Approvata da {spesa.approved_by_profile.first_name} {spesa.approved_by_profile.last_name}
            {spesa.approved_at && ` il ${format(parseISO(spesa.approved_at), "dd/MM/yyyy")}`}
          </div>
        )}

        {/* Info Rifiuto */}
        {spesa.stato === 'non_autorizzata' && spesa.note_revisione && (
          <div className="text-xs text-red-600 pt-2 border-t line-clamp-2">
            Rifiutata: {spesa.note_revisione}
          </div>
        )}
      </div>
    </Card>
  );
}
