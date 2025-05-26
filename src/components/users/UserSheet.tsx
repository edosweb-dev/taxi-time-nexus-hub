
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { UserForm } from "./UserForm";
import { Profile } from "@/lib/types";
import { UserFormData } from "@/lib/api/users/types";
import { Azienda } from "@/lib/types";
import { UserRole } from "@/lib/types";

interface UserSheetProps {
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

export function UserSheet({
  isOpen,
  onOpenChange,
  onSubmit,
  user,
  isSubmitting,
  defaultRole,
  hiddenRoles,
  isNewUser,
  preselectedAzienda,
}: UserSheetProps) {
  // Log per tracciare i dati dell'utente quando il sheet si apre
  if (isOpen) {
    console.log("UserSheet opened with user data:", user);
    if (defaultRole) console.log("Default role:", defaultRole);
    if (hiddenRoles) console.log("Hidden roles:", hiddenRoles);
    if (preselectedAzienda) console.log("Preselected azienda:", preselectedAzienda);
  }

  const handleUserFormSubmit = (data: UserFormData) => {
    console.log("UserSheet - Form submitted with data:", data);
    onSubmit(data);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {user ? "Modifica Utente" : "Crea Nuovo Utente"}
          </SheetTitle>
          <SheetDescription>
            {user 
              ? "Modifica i dettagli dell'utente esistente. Lascia vuoto il campo password per non modificarla."
              : isNewUser && preselectedAzienda
                ? `Inserisci i dettagli del nuovo referente per ${preselectedAzienda.nome}`
                : "Inserisci i dettagli del nuovo utente."}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <UserForm
            user={user}
            onSubmit={handleUserFormSubmit}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
            defaultRole={defaultRole}
            hiddenRoles={hiddenRoles}
            preselectedAzienda={preselectedAzienda}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
