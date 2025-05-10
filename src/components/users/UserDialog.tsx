
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
import { Azienda } from "@/lib/types";
import { UserRole } from "@/lib/types";

interface UserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UserFormData) => void;
  user: Profile | null;
  isSubmitting: boolean;
  defaultRole?: UserRole;
  hiddenRoles?: UserRole[];
  isNewUser?: boolean;
  preselectedAzienda?: Azienda | null;
}

export function UserDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  user,
  isSubmitting,
  defaultRole,
  hiddenRoles,
  isNewUser,
  preselectedAzienda,
}: UserDialogProps) {
  // Log per tracciare i dati dell'utente quando il dialog si apre
  if (isOpen) {
    console.log("UserDialog opened with user data:", user);
    if (defaultRole) console.log("Default role:", defaultRole);
    if (hiddenRoles) console.log("Hidden roles:", hiddenRoles);
    if (preselectedAzienda) console.log("Preselected azienda:", preselectedAzienda);
  }

  const handleUserFormSubmit = (data: UserFormData) => {
    console.log("UserDialog - Form submitted with data:", data);
    onSubmit(data);
  };

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
              : isNewUser && preselectedAzienda
                ? `Inserisci i dettagli del nuovo referente per ${preselectedAzienda.nome}`
                : "Inserisci i dettagli del nuovo utente."}
          </DialogDescription>
        </DialogHeader>
        <UserForm
          user={user}
          onSubmit={handleUserFormSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
          defaultRole={defaultRole}
          hiddenRoles={hiddenRoles}
          preselectedAzienda={preselectedAzienda}
        />
      </DialogContent>
    </Dialog>
  );
}
