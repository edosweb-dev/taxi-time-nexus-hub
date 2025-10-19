import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ChevronDown } from 'lucide-react';
import { Stipendio } from '@/lib/api/stipendi';

interface StatoDropdownProps {
  stipendio: Stipendio;
  onChangeStatus: (stipendio: Stipendio, newStatus: string) => void;
}

export function StatoDropdown({ stipendio, onChangeStatus }: StatoDropdownProps) {
  const stato = stipendio.stato;

  // Determina badge colore basato su stato attuale
  const getBadgeClasses = () => {
    switch (stato) {
      case 'bozza':
        return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200';
      case 'confermato':
        return 'bg-green-100 text-green-700 hover:bg-green-200';
      case 'pagato':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
      default:
        return '';
    }
  };

  // Determina transizioni permesse
  const getAvailableTransitions = () => {
    switch (stato) {
      case 'bozza':
        return [{ value: 'confermato', label: 'Conferma', description: 'Conferma stipendio' }];
      case 'confermato':
        return [
          { value: 'pagato', label: 'Segna come Pagato', description: 'Crea spesa aziendale' },
          { value: 'bozza', label: 'Riporta a Bozza', description: 'Ricalcola automaticamente', warning: true }
        ];
      case 'pagato':
        return []; // Stato finale, nessuna transizione
      default:
        return [];
    }
  };

  const availableTransitions = getAvailableTransitions();

  // Se pagato, mostra solo badge senza dropdown
  if (stato === 'pagato') {
    return (
      <Badge variant="outline" className={getBadgeClasses()}>
        Pagato
      </Badge>
    );
  }

  // Altrimenti dropdown interattivo
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1 focus:outline-none">
          <Badge variant="outline" className={getBadgeClasses()}>
            {stato === 'bozza' ? 'Bozza' : 'Confermato'}
          </Badge>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {availableTransitions.length > 0 ? (
          availableTransitions.map((transition) => (
            <DropdownMenuItem
              key={transition.value}
              onClick={() => onChangeStatus(stipendio, transition.value)}
              className={transition.warning ? 'text-orange-600' : ''}
            >
              <div className="flex flex-col">
                <span className="font-medium">{transition.label}</span>
                <span className="text-xs text-muted-foreground">
                  {transition.description}
                </span>
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>
            Nessuna azione disponibile
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
