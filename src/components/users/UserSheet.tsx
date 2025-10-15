
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { UserForm } from "./UserForm";
import { ClientForm } from "./ClientForm";
import { Profile } from "@/lib/types";
import { UserFormData } from "@/lib/api/users/types";
import { Azienda } from "@/lib/types";

interface UserSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UserFormData) => void;
  user: Profile | null;
  isSubmitting: boolean;
  formType: 'user' | 'client';
  preselectedAzienda?: Azienda | null;
}

export function UserSheet({
  isOpen,
  onOpenChange,
  onSubmit,
  user,
  isSubmitting,
  formType,
  preselectedAzienda,
}: UserSheetProps) {
  const handleFormSubmit = (data: UserFormData) => {
    onSubmit(data);
  };

  const isClientForm = formType === 'client' || user?.role === 'cliente';

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="section-title">
            {user 
              ? `Modifica ${isClientForm ? 'Cliente' : 'Utente'}` 
              : `Crea Nuovo ${isClientForm ? 'Cliente' : 'Utente'}`
            }
          </SheetTitle>
          
          <SheetDescription className="text-left">
            {user 
              ? `Modifica i dettagli ${isClientForm ? 'del cliente' : "dell'utente"}. Lascia vuoto il campo password per non modificarla.`
              : `Inserisci i dettagli del nuovo ${isClientForm ? 'cliente' : 'utente'}.`
            }
          </SheetDescription>
        </SheetHeader>
        
        <div className="pt-6">
          {isClientForm ? (
            <ClientForm
              user={user}
              onSubmit={handleFormSubmit}
              onCancel={() => onOpenChange(false)}
              isSubmitting={isSubmitting}
              preselectedAzienda={preselectedAzienda}
            />
          ) : (
            <UserForm
              user={user}
              onSubmit={handleFormSubmit}
              onCancel={() => onOpenChange(false)}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
