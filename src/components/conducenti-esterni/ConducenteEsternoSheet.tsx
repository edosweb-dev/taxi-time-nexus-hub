import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ConducenteEsternoForm } from './ConducenteEsternoForm';
import { ConducenteEsterno } from '@/lib/types/conducenti-esterni';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Edit, Plus } from 'lucide-react';

interface ConducenteEsternoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conducente?: ConducenteEsterno | null;
  mode: 'create' | 'edit';
}

export function ConducenteEsternoSheet({
  open,
  onOpenChange,
  conducente,
  mode,
}: ConducenteEsternoSheetProps) {
  const isEditing = mode === 'edit' && !!conducente;

  // Helper function to get driver initials
  const getDriverInitials = (nomeCognome: string) => {
    return nomeCognome
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[700px] overflow-y-auto">
        <SheetHeader className="space-y-4 pb-6 border-b">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                {isEditing ? getDriverInitials(conducente.nome_cognome) : <Plus className="h-8 w-8" />}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <SheetTitle className="section-title flex items-center gap-3">
                {isEditing ? (
                  <>
                    <Edit className="h-6 w-6 text-amber-500" />
                    Modifica Conducente
                  </>
                ) : (
                  <>
                    <Plus className="h-6 w-6 text-green-500" />
                    Nuovo Conducente
                  </>
                )}
              </SheetTitle>
              {isEditing && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="text-lg font-medium">{conducente.nome_cognome}</span>
                </div>
              )}
            </div>
          </div>
          
          <SheetDescription className="text-left">
            {isEditing 
              ? "Modifica i dettagli e le configurazioni del conducente esterno"
              : "Inserisci tutti i dettagli necessari per aggiungere un nuovo conducente esterno"
            }
          </SheetDescription>
        </SheetHeader>
        
        <div className="pt-6">
          <ConducenteEsternoForm
            conducente={conducente}
            mode={mode}
            onSuccess={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}