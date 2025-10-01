import { ArrowLeft, Edit, MoreVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Azienda } from '@/lib/types';

interface MobileAziendaDetailHeaderProps {
  azienda: Azienda;
  onBack: () => void;
  onEdit: () => void;
}

export function MobileAziendaDetailHeader({ 
  azienda, 
  onBack, 
  onEdit
}: MobileAziendaDetailHeaderProps) {
  return (
    <div className="w-full sticky top-0 z-20 bg-background border-b md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Back button + Title */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="flex-shrink-0 min-h-[44px] min-w-[44px]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-base truncate">{azienda.nome}</h1>
            <p className="text-xs text-muted-foreground truncate">
              P.IVA {azienda.partita_iva}
            </p>
          </div>
        </div>

        {/* Actions menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Modifica Azienda
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
