import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface StipendioCardProps {
  stipendio: {
    id: string;
    mese: number;
    anno: number;
    stato: 'bozza' | 'confermato' | 'pagato';
    totale_netto: number;
    totale_km: number;
    totale_ore_lavorate: number;
  };
  onClick: () => void;
}

export function StipendioCard({ stipendio, onClick }: StipendioCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatMeseAnno = (mese: number, anno: number) => {
    const date = new Date(anno, mese - 1);
    return format(date, 'MMMM yyyy', { locale: it });
  };

  const getBadgeClasses = (stato: string) => {
    switch (stato) {
      case 'confermato':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100/80';
      case 'pagato':
        return 'bg-green-100 text-green-800 hover:bg-green-100/80';
      case 'bozza':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100/80';
      default:
        return '';
    }
  };


  const getStatoLabel = (stato: string) => {
    switch (stato) {
      case 'confermato':
        return 'CONFERMATO';
      case 'pagato':
        return 'PAGATO';
      case 'bozza':
        return 'BOZZA';
      default:
        return stato.toUpperCase();
    }
  };

  return (
    <Card 
      className={cn(
        "p-4 space-y-3 min-h-[100px] transition-all duration-200",
        "hover:scale-[1.01] hover:shadow-md cursor-pointer"
      )}
      onClick={onClick}
    >
      {/* Badge Stato */}
      <Badge className={cn(getBadgeClasses(stipendio.stato))}>
        {getStatoLabel(stipendio.stato)}
      </Badge>

      {/* Mese Anno */}
      <h3 className="font-bold text-lg">
        {formatMeseAnno(stipendio.mese, stipendio.anno)}
      </h3>

      {/* Totale Netto */}
      <div className="text-2xl font-bold text-primary">
        {formatCurrency(stipendio.totale_netto)} netto
      </div>

      {/* Breakdown Summary */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{stipendio.totale_km || 0} km</span>
        <span>•</span>
        <span>{stipendio.totale_ore_lavorate || 0}h lavorate</span>
      </div>

      {/* Action Button */}
      <Button variant="outline" size="sm" className="w-full gap-2 mt-2">
        <Eye className="h-4 w-4" />
        Dettagli
      </Button>
    </Card>
  );
}
