import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { ServizioFormData } from "@/lib/types/servizi";
import { usePasseggeri } from "@/hooks/usePasseggeri";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Mail, Phone, MapPin, Home } from "lucide-react";

interface PasseggeriListProps {
  userRole?: string;
}

export function PasseggeriList({ userRole }: PasseggeriListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { control } = useFormContext<ServizioFormData>();
  
  // Watch per azienda_id e referente_id
  const azienda_id = useWatch({ control, name: "azienda_id" });
  const referente_id = useWatch({ control, name: "referente_id" });

  const { data: { passeggeri = [], isLoading = false } = {} } = usePasseggeri(azienda_id, referente_id);

  // Mostra solo ad admin e soci
  if (!userRole || (userRole !== 'admin' && userRole !== 'socio')) {
    return null;
  }

  // Non mostrare se non ci sono azienda_id e referente_id
  if (!azienda_id || !referente_id) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Users className="h-4 w-4" />
          Visualizza tutti i passeggeri ({passeggeri.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full h-full max-h-full sm:max-w-4xl sm:max-h-[80vh] sm:rounded-lg overflow-hidden flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 p-4 sm:p-6 pb-3 border-b bg-muted/30">
          <DialogTitle className="flex items-center gap-3 text-lg sm:text-xl">
            <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">Passeggeri dell'azienda</h3>
              <p className="text-xs text-muted-foreground font-normal mt-0.5">
                {passeggeri.length} {passeggeri.length === 1 ? 'passeggero trovato' : 'passeggeri trovati'}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : passeggeri.length === 0 ? (
            <div className="text-center py-16 px-4 text-muted-foreground">
              <div className="bg-muted/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <Users className="h-12 w-12 opacity-40" />
              </div>
              <p className="text-lg font-semibold text-foreground mb-2">Nessun passeggero trovato</p>
              <p className="text-sm">Non ci sono passeggeri registrati per questa azienda e referente.</p>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {passeggeri.map((passeggero) => (
                <Card key={passeggero.id} className="border-2 hover:border-primary/50 transition-all duration-200 overflow-hidden">
                  <CardHeader className="pb-3 pt-4 px-4 bg-gradient-to-r from-muted/50 to-muted/20">
                    <CardTitle className="text-base font-semibold flex items-start justify-between gap-3">
                      <span className="flex-1 text-foreground leading-snug">{passeggero.nome_cognome}</span>
                      <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-mono flex-shrink-0">
                        #{passeggero.id.slice(-6)}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 px-4 pb-4">
                    <div className="space-y-3">
                      {/* Nome e Cognome separati */}
                      {(passeggero.nome || passeggero.cognome) && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-muted">
                          <div className="bg-primary/10 p-2 rounded-md flex-shrink-0">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide mb-1">Nome completo</p>
                            <p className="text-sm text-foreground font-medium">
                              {passeggero.nome} {passeggero.cognome}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Email */}
                      {passeggero.email && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-muted">
                          <div className="bg-primary/10 p-2 rounded-md flex-shrink-0">
                            <Mail className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide mb-1">Email</p>
                            <p className="text-sm text-foreground break-all">{passeggero.email}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Telefono */}
                      {passeggero.telefono && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-muted">
                          <div className="bg-primary/10 p-2 rounded-md flex-shrink-0">
                            <Phone className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide mb-1">Telefono</p>
                            <p className="text-sm text-foreground font-medium">{passeggero.telefono}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Località */}
                      {passeggero.localita && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-muted">
                          <div className="bg-primary/10 p-2 rounded-md flex-shrink-0">
                            <MapPin className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide mb-1">Località</p>
                            <p className="text-sm text-foreground font-medium">{passeggero.localita}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Indirizzo */}
                      {passeggero.indirizzo && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-muted">
                          <div className="bg-primary/10 p-2 rounded-md flex-shrink-0">
                            <Home className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide mb-1">Indirizzo</p>
                            <p className="text-sm text-foreground">{passeggero.indirizzo}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}