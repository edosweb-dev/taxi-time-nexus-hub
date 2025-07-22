import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Azienda } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, Building2, CreditCard, CheckCircle, XCircle } from "lucide-react";

interface AziendaViewSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  azienda: Azienda | null;
}

export function AziendaViewSheet({
  isOpen,
  onOpenChange,
  azienda,
}: AziendaViewSheetProps) {
  if (!azienda) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-primary" />
            {azienda.nome}
          </SheetTitle>
          <SheetDescription>
            Dettagli e informazioni dell'azienda
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Informazioni principali */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Informazioni principali</h3>
            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Nome Azienda</p>
                  <p className="text-base">{azienda.nome}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Partita IVA</p>
                  <p className="text-base font-mono">{azienda.partita_iva}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contatti */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contatti</h3>
            <div className="grid gap-4">
              {azienda.email && (
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-base">{azienda.email}</p>
                  </div>
                </div>
              )}
              
              {azienda.telefono && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Telefono</p>
                    <p className="text-base">{azienda.telefono}</p>
                  </div>
                </div>
              )}
              
              {azienda.indirizzo && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Indirizzo</p>
                    <p className="text-base">{azienda.indirizzo}</p>
                  </div>
                </div>
              )}
            </div>
            
            {!azienda.email && !azienda.telefono && !azienda.indirizzo && (
              <p className="text-muted-foreground text-sm">Nessun contatto disponibile</p>
            )}
          </div>

          <Separator />

          {/* Configurazioni */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Configurazioni</h3>
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Firma digitale</p>
                  <p className="text-xs text-muted-foreground">Richiede firma digitale per i servizi</p>
                </div>
                <Badge variant={azienda.firma_digitale_attiva ? "default" : "secondary"} className="flex items-center gap-2">
                  {azienda.firma_digitale_attiva ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                  {azienda.firma_digitale_attiva ? "Attiva" : "Disattivata"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Sistema provvigioni</p>
                  <p className="text-xs text-muted-foreground">Calcolo automatico delle provvigioni</p>
                </div>
                <Badge variant={azienda.provvigione ? "default" : "secondary"} className="flex items-center gap-2">
                  {azienda.provvigione ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                  {azienda.provvigione ? "Attivo" : "Disattivo"}
                </Badge>
              </div>
            </div>
          </div>

          {azienda.created_at && (
            <>
              <Separator />
              <div className="text-xs text-muted-foreground">
                Creata il {new Date(azienda.created_at).toLocaleDateString('it-IT')}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}