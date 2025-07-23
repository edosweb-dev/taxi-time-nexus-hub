
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
        <SheetHeader className="space-y-4 pb-6 border-b">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              {user ? (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              )}
            </div>
            
            <div className="flex-1 space-y-2">
              <SheetTitle className="section-title">
                {user ? "Modifica Utente" : "Crea Nuovo Utente"}
              </SheetTitle>
              {preselectedAzienda && (
                <div className="text-sm text-muted-foreground">
                  {preselectedAzienda.nome}
                </div>
              )}
            </div>
          </div>
          
          <SheetDescription className="text-left">
            {user 
              ? "Modifica i dettagli dell'utente esistente. Lascia vuoto il campo password per non modificarla."
              : isNewUser && preselectedAzienda
                ? `Inserisci i dettagli del nuovo referente per ${preselectedAzienda.nome}`
                : "Inserisci i dettagli del nuovo utente."}
          </SheetDescription>
        </SheetHeader>
        
        <div className="pt-6">
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
