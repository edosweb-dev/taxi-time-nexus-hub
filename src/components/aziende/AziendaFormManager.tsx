import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AziendaForm } from './AziendaForm';
import { Azienda } from '@/lib/types';
import { AziendaFormData } from '@/lib/api/aziende';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Building2, Edit, Plus } from 'lucide-react';

interface AziendaFormManagerProps {
  mode: 'sheet' | 'dialog' | 'page';
  azienda?: Azienda | null;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit: (data: AziendaFormData) => void;
  isSubmitting: boolean;
}

export function AziendaFormManager({
  mode,
  azienda,
  isOpen = true,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: AziendaFormManagerProps) {
  const isEditing = !!azienda;

  // Helper function to get company initials
  const getCompanyInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const handleFormSubmit = (data: AziendaFormData) => {
    console.log("AziendaFormManager - Form submitted with data:", data);
    onSubmit(data);
  };

  const handleCancel = () => {
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  // Header content for modals
  const HeaderContent = () => (
    <div className="flex items-start gap-4">
      <Avatar className="h-16 w-16 border-2 border-primary/20">
        <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
          {isEditing ? getCompanyInitials(azienda.nome) : <Plus className="h-8 w-8" />}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 space-y-2">
        <div className="section-title flex items-center gap-3">
          {isEditing ? (
            <>
              <Edit className="h-6 w-6 text-amber-500" />
              Modifica Azienda
            </>
          ) : (
            <>
              <Plus className="h-6 w-6 text-green-500" />
              Nuova Azienda
            </>
          )}
        </div>
        {isEditing && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span className="text-lg font-medium">{azienda.nome}</span>
          </div>
        )}
      </div>
    </div>
  );

  // Form content
  const formContent = (
    <AziendaForm
      azienda={azienda}
      onSubmit={handleFormSubmit}
      onCancel={handleCancel}
      isSubmitting={isSubmitting}
    />
  );

  // Render based on mode
  switch (mode) {
    case 'sheet':
      return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
          <SheetContent className="sm:max-w-[700px] overflow-y-auto">
            <SheetHeader className="space-y-4 pb-6 border-b">
              <HeaderContent />
              <div className="text-left text-muted-foreground">
                {isEditing 
                  ? "Modifica i dettagli e le configurazioni dell'azienda esistente"
                  : "Inserisci tutti i dettagli necessari per creare una nuova azienda nel sistema"
                }
              </div>
            </SheetHeader>
            
            <div className="pt-6">
              {formContent}
            </div>
          </SheetContent>
        </Sheet>
      );

    case 'dialog':
      return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="space-y-4 pb-6 border-b">
              <DialogTitle asChild>
                <div>
                  <HeaderContent />
                </div>
              </DialogTitle>
              <div className="text-left text-muted-foreground">
                {isEditing 
                  ? "Modifica i dettagli e le configurazioni dell'azienda esistente"
                  : "Inserisci tutti i dettagli necessari per creare una nuova azienda nel sistema"
                }
              </div>
            </DialogHeader>
            
            <div className="pt-6">
              {formContent}
            </div>
          </DialogContent>
        </Dialog>
      );

    case 'page':
      return (
        <div className="container mx-auto max-w-2xl py-8 space-y-8">
          <div className="space-y-4">
            <HeaderContent />
            <p className="text-muted-foreground">
              {isEditing 
                ? "Modifica i dettagli e le configurazioni dell'azienda esistente"
                : "Inserisci tutti i dettagli necessari per creare una nuova azienda nel sistema"
              }
            </p>
          </div>
          
          {formContent}
        </div>
      );

    default:
      return null;
  }
}