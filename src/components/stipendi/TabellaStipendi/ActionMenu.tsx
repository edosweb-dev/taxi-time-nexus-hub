
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, Edit, Trash, CheckCircle, CreditCard } from 'lucide-react';
import { Stipendio } from '@/lib/api/stipendi';

interface ActionMenuProps {
  stipendio: Stipendio;
  onViewDetails: (stipendio: Stipendio) => void;
  onEdit: (stipendio: Stipendio) => void;
  onChangeStatus: (stipendio: Stipendio, newStatus: string) => void;
  onDelete: (stipendio: Stipendio) => void;
}

export function ActionMenu({
  stipendio,
  onViewDetails,
  onEdit,
  onChangeStatus,
  onDelete
}: ActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onViewDetails(stipendio)}>
          <Eye className="mr-2 h-4 w-4" />
          Visualizza dettaglio
        </DropdownMenuItem>
        
        {stipendio.stato === 'bozza' && (
          <>
            <DropdownMenuItem onClick={() => onEdit(stipendio)}>
              <Edit className="mr-2 h-4 w-4" />
              Modifica
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onChangeStatus(stipendio, 'confermato')}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Conferma stipendio
            </DropdownMenuItem>
          </>
        )}
        
        {stipendio.stato === 'confermato' && (
          <>
            <DropdownMenuItem onClick={() => onChangeStatus(stipendio, 'pagato')}>
              <CreditCard className="mr-2 h-4 w-4" />
              Segna come pagato
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onChangeStatus(stipendio, 'bozza')}
              className="text-orange-600"
            >
              <Edit className="mr-2 h-4 w-4" />
              Riporta a Bozza
            </DropdownMenuItem>
          </>
        )}
        
        {stipendio.stato === 'bozza' && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600"
              onClick={() => onDelete(stipendio)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Elimina
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
