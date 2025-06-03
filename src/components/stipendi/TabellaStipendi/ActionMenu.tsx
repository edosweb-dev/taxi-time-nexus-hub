
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, Edit, Trash } from 'lucide-react';
import { Stipendio } from '@/lib/api/stipendi';
import { getStatusOptions } from './utils';

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
          <DropdownMenuItem onClick={() => onEdit(stipendio)}>
            <Edit className="mr-2 h-4 w-4" />
            Modifica
          </DropdownMenuItem>
        )}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            Cambia stato
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {getStatusOptions(stipendio.stato).map((status) => (
              <DropdownMenuItem 
                key={status}
                onClick={() => onChangeStatus(stipendio, status)}
              >
                {status === 'bozza' && 'Bozza'}
                {status === 'confermato' && 'Confermato'}
                {status === 'pagato' && 'Pagato'}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
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
