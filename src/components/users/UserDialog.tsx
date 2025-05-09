
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserForm } from "./UserForm";
import { Profile } from "@/lib/types";
import { UserFormData } from "@/lib/usersApi";

interface UserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UserFormData) => void;
  user: Profile | null;
  isSubmitting: boolean;
}

export function UserDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  user,
  isSubmitting,
}: UserDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {user ? "Modifica Utente" : "Crea Nuovo Utente"}
          </DialogTitle>
          <DialogDescription>
            {user 
              ? "Modifica i dettagli dell'utente esistente. Lascia vuoto il campo password per non modificarla."
              : "Inserisci i dettagli del nuovo utente."}
          </DialogDescription>
        </DialogHeader>
        <UserForm
          user={user}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
