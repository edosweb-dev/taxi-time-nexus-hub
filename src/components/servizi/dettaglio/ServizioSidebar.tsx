import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Pencil, Trash2, UserPlus, Building2, User, Car, ArrowLeft, CheckCircle2, FileText
} from "lucide-react";
import { Servizio } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";

interface ServizioSidebarProps {
  servizio: Servizio;
  canBeEdited: boolean;
  canBeCompleted: boolean;
  canBeConsuntivato: boolean;
  isAdmin: boolean;
  users: Profile[];
  getAziendaName: (id?: string) => string;
  getUserName: (users: Profile[], id?: string) => string | null;
  onEdit: () => void;
  onAssegna: () => void;
  onDelete: () => void;
  onCompleta: () => void;
  onConsuntiva: () => void;
  onBack: () => void;
  veicoloModello?: string;
}

export function ServizioSidebar({
  servizio,
  canBeEdited,
  canBeCompleted,
  canBeConsuntivato,
  isAdmin,
  users,
  getAziendaName,
  getUserName,
  veicoloModello,
  onEdit,
  onAssegna,
  onDelete,
  onCompleta,
  onConsuntiva,
  onBack,
}: ServizioSidebarProps) {
  return (
    <aside className="w-64 border-r bg-muted/30 sticky top-0 h-screen overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Pulsante Indietro */}
        <Button 
          onClick={onBack} 
          variant="ghost" 
          size="sm"
          className="w-full justify-start"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Torna ai Servizi
        </Button>

        {/* ID Progressivo */}
        <div className="space-y-1">
          <div className="text-2xl font-bold text-foreground">
            {servizio.id_progressivo || `#${servizio.id.slice(0, 8)}`}
          </div>
        </div>

        <div className="border-t pt-4 space-y-3">
          {/* Nome Azienda */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" />
              <span>Azienda</span>
            </div>
            <div className="text-sm font-medium truncate">
              {getAziendaName(servizio.azienda_id)}
            </div>
          </div>

          {/* Referente */}
          {servizio.referente_id && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                <span>Referente</span>
              </div>
              <div className="text-sm font-medium truncate">
                {getUserName(users, servizio.referente_id) || "—"}
              </div>
            </div>
          )}

          {/* Assegnato a */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span>Assegnato a</span>
            </div>
            <div className="text-sm font-medium">
              {servizio.conducente_esterno 
                ? servizio.conducente_esterno_nome || "Conducente esterno"
                : getUserName(users, servizio.assegnato_a) || "Non assegnato"}
            </div>
          </div>

          {/* Veicolo */}
          {veicoloModello && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Car className="h-3.5 w-3.5" />
                <span>Veicolo</span>
              </div>
              <div className="text-sm font-medium truncate">
                {veicoloModello}
              </div>
            </div>
          )}
        </div>

        {/* Azioni Primarie */}
        <div className="border-t pt-4 space-y-2">
          {canBeCompleted && (
            <Button onClick={onCompleta} className="w-full" size="sm">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Completa Servizio
            </Button>
          )}

          {canBeConsuntivato && (
            <Button onClick={onConsuntiva} className="w-full" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Consuntiva Servizio
            </Button>
          )}

          {canBeEdited && (
            <Button onClick={onEdit} className="w-full" size="sm" variant="outline">
              <Pencil className="mr-2 h-4 w-4" />
              Modifica
            </Button>
          )}

          {servizio.stato === "da_assegnare" && isAdmin && (
            <Button onClick={onAssegna} className="w-full" size="sm" variant="outline">
              <UserPlus className="mr-2 h-4 w-4" />
              Assegna
            </Button>
          )}

          {isAdmin && (
            <Button 
              onClick={onDelete} 
              className="w-full" 
              size="sm" 
              variant="destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Elimina
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}
