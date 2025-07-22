
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AziendaForm } from "./AziendaForm";
import { Azienda } from "@/lib/types";
import { AziendaFormData } from "@/lib/api/aziende";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Building2, Edit, Plus } from "lucide-react";

interface AziendaSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AziendaFormData) => void;
  azienda: Azienda | null;
  isSubmitting: boolean;
}

export function AziendaSheet({
  isOpen,
  onOpenChange,
  onSubmit,
  azienda,
  isSubmitting,
}: AziendaSheetProps) {
  if (isOpen) {
    console.log("AziendaSheet opened with data:", azienda);
  }

  const isEditing = !!azienda;

  // Helper function to get company initials
  const getCompanyInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const handleAziendaFormSubmit = (data: AziendaFormData) => {
    console.log("AziendaSheet - Form submitted with data:", data);
    onSubmit(data);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[700px] overflow-y-auto">
        <SheetHeader className="space-y-4 pb-6 border-b">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                {isEditing ? getCompanyInitials(azienda.nome) : <Plus className="h-8 w-8" />}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <SheetTitle className="section-title flex items-center gap-3">
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
              </SheetTitle>
              {isEditing && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span className="text-lg font-medium">{azienda.nome}</span>
                </div>
              )}
            </div>
          </div>
          
          <SheetDescription className="text-left">
            {isEditing 
              ? "Modifica i dettagli e le configurazioni dell'azienda esistente"
              : "Inserisci tutti i dettagli necessari per creare una nuova azienda nel sistema"
            }
          </SheetDescription>
        </SheetHeader>
        
        <div className="pt-6">
          <AziendaForm
            azienda={azienda}
            onSubmit={handleAziendaFormSubmit}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
