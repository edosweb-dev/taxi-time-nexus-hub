
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserForm } from "./UserForm";
import { ClientForm } from "./ClientForm";
import { Profile } from "@/lib/types";
import { UserFormData } from "@/lib/api/users/types";
import { Azienda } from "@/lib/types";

interface UserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UserFormData) => void;
  user: Profile | null;
  isSubmitting: boolean;
  formType: 'user' | 'client';
  preselectedAzienda?: Azienda | null;
}

export function UserDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  user,
  isSubmitting,
  formType,
  preselectedAzienda,
}: UserDialogProps) {
  const isClientForm = formType === 'client' || user?.role === 'cliente';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {user 
              ? `Modifica ${isClientForm ? 'Cliente' : 'Utente'}` 
              : `Crea Nuovo ${isClientForm ? 'Cliente' : 'Utente'}`
            }
          </DialogTitle>
          <DialogDescription>
            {user 
              ? `Modifica i dettagli ${isClientForm ? 'del cliente' : "dell'utente"}. Lascia vuoto il campo password per non modificarla.`
              : `Inserisci i dettagli del nuovo ${isClientForm ? 'cliente' : 'utente'}.`
            }
          </DialogDescription>
        </DialogHeader>
        {isClientForm ? (
          <ClientForm
            user={user}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
            preselectedAzienda={preselectedAzienda}
          />
        ) : (
          <UserForm
            user={user}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
