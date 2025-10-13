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

  const getBadgeVariant = (stato: string) => {
    switch (stato) {
      case 'in_attesa':
      case 'in_revisione':
        return 'default';
      case 'approvata':
        return 'success';
      case 'non_autorizzata':
        return 'destructive';
      default:
        return 'default';
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
        "p-4 space-y-3 min-h-[80px] transition-all duration-200",
        "hover:scale-[1.01] hover:shadow-md cursor-pointer"
      )}
      onClick={onClick}
    >
      {/* Badge Stato */}
      <Badge className={cn("gap-1", getBadgeClasses(spesa.stato))}>
        <span>{getBadgeIcon(spesa.stato)}</span>
        <span>{getStatoLabel(spesa.stato)}</span>
      </Badge>

      {/* Causale */}
      <h3 className="font-bold text-lg">{spesa.causale}</h3>

      {/* Importo e Data */}
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold text-primary">
          {formatCurrency(spesa.importo)}
        </span>
        <span className="text-muted-foreground">•</span>
        <span className="text-muted-foreground">
          {format(parseISO(spesa.data_spesa), 'dd/MM/yyyy')}
        </span>
      </div>

      {/* Note preview */}
      {spesa.note && (
        <p className="text-sm text-muted-foreground line-clamp-1">
          {spesa.note}
        </p>
      )}

      {/* Info Approvazione */}
      {spesa.stato === 'approvata' && spesa.approved_by_profile && (
        <div className="text-sm space-y-1 pt-2 border-t">
          <p className="text-green-600 flex items-center gap-1">
            <span>✅</span>
            <span>
              Approvata da: {spesa.approved_by_profile.first_name} {spesa.approved_by_profile.last_name}
            </span>
          </p>
          {spesa.approved_at && (
            <p className="text-muted-foreground">
              {format(parseISO(spesa.approved_at), "dd MMMM yyyy", { locale: it })}
            </p>
          )}
        </div>
      )}

      {/* Info Rifiuto */}
      {spesa.stato === 'non_autorizzata' && spesa.note_revisione && (
        <div className="text-sm space-y-1 pt-2 border-t">
          <p className="text-red-600 font-medium flex items-center gap-1">
            <span>❌</span>
            <span>Motivo rifiuto:</span>
          </p>
          <p className="text-muted-foreground italic">
            "{spesa.note_revisione}"
          </p>
        </div>
      )}

      {/* Action Button */}
      <Button variant="outline" size="sm" className="w-full gap-2">
        <Eye className="h-4 w-4" />
        Dettagli
      </Button>
    </Card>
  );
}
