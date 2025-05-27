
import React, { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Check, X, Clock, Eye } from 'lucide-react';
import { SpesaDipendente } from '@/hooks/useSpeseDipendenti';
import { SpesaStateModal } from './SpesaStateModal';

interface SpesaActionsProps {
  spesa: SpesaDipendente;
  onStatusUpdate?: () => void;
}

export function SpesaActions({ spesa, onStatusUpdate }: SpesaActionsProps) {
  const [stateModalOpen, setStateModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<{
    stato: 'approvata' | 'non_autorizzata' | 'in_revisione';
    title: string;
  } | null>(null);

  const handleActionClick = (action: { stato: 'approvata' | 'non_autorizzata' | 'in_revisione'; title: string }) => {
    setSelectedAction(action);
    setStateModalOpen(true);
  };

  const handleModalClose = () => {
    setStateModalOpen(false);
    setSelectedAction(null);
  };

  const handleStatusUpdated = () => {
    handleModalClose();
    onStatusUpdate?.();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Apri menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {spesa.stato !== 'approvata' && (
            <DropdownMenuItem 
              onClick={() => handleActionClick({ stato: 'approvata', title: 'Approva spesa' })}
              className="text-green-600"
            >
              <Check className="mr-2 h-4 w-4" />
              Approva
            </DropdownMenuItem>
          )}
          
          {spesa.stato !== 'non_autorizzata' && (
            <DropdownMenuItem 
              onClick={() => handleActionClick({ stato: 'non_autorizzata', title: 'Rifiuta spesa' })}
              className="text-red-600"
            >
              <X className="mr-2 h-4 w-4" />
              Rifiuta
            </DropdownMenuItem>
          )}
          
          {spesa.stato !== 'in_revisione' && (
            <DropdownMenuItem 
              onClick={() => handleActionClick({ stato: 'in_revisione', title: 'Metti in revisione' })}
              className="text-blue-600"
            >
              <Clock className="mr-2 h-4 w-4" />
              In revisione
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedAction && (
        <SpesaStateModal
          open={stateModalOpen}
          onOpenChange={setStateModalOpen}
          spesa={spesa}
          newStatus={selectedAction.stato}
          title={selectedAction.title}
          onSuccess={handleStatusUpdated}
        />
      )}
    </>
  );
}
