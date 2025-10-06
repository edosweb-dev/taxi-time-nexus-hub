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
      <DialogContent className="max-w-4xl max-h-[85vh] sm:max-h-[80vh] overflow-hidden flex flex-col p-4 sm:p-6">
        <DialogHeader className="flex-shrink-0 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Users className="h-5 w-5 text-primary" />
            Passeggeri dell'azienda
            <Badge variant="secondary" className="ml-auto">
              {passeggeri.length} {passeggeri.length === 1 ? 'passeggero' : 'passeggeri'}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto -mx-4 px-4 sm:-mx-6 sm:px-6 py-4">
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
            <div className="text-center py-12 text-muted-foreground">
              <div className="bg-muted/50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Users className="h-10 w-10 opacity-50" />
              </div>
              <p className="text-base font-medium">Nessun passeggero trovato</p>
              <p className="text-sm mt-1">Non ci sono passeggeri per questa azienda e referente.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {passeggeri.map((passeggero) => (
                <Card key={passeggero.id} className="hover:shadow-lg hover:border-primary/50 transition-all duration-200">
                  <CardHeader className="pb-3 bg-muted/30">
                    <CardTitle className="text-base sm:text-lg flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
                      <span className="font-semibold text-foreground">{passeggero.nome_cognome}</span>
                      <Badge variant="outline" className="text-xs w-fit">
                        ID: {passeggero.id.slice(-8)}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Nome e Cognome separati */}
                      {(passeggero.nome || passeggero.cognome) && (
                        <div className="flex items-start gap-3 text-sm p-2 rounded-md bg-background">
                          <Users className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground font-medium mb-0.5">Nome completo</p>
                            <p className="text-foreground truncate">
                              {passeggero.nome} {passeggero.cognome}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Email */}
                      {passeggero.email && (
                        <div className="flex items-start gap-3 text-sm p-2 rounded-md bg-background">
                          <Mail className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground font-medium mb-0.5">Email</p>
                            <p className="text-foreground truncate">{passeggero.email}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Telefono */}
                      {passeggero.telefono && (
                        <div className="flex items-start gap-3 text-sm p-2 rounded-md bg-background">
                          <Phone className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground font-medium mb-0.5">Telefono</p>
                            <p className="text-foreground">{passeggero.telefono}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Località */}
                      {passeggero.localita && (
                        <div className="flex items-start gap-3 text-sm p-2 rounded-md bg-background">
                          <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground font-medium mb-0.5">Località</p>
                            <p className="text-foreground truncate">{passeggero.localita}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Indirizzo */}
                      {passeggero.indirizzo && (
                        <div className="flex items-start gap-3 text-sm p-2 rounded-md bg-background">
                          <Home className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground font-medium mb-0.5">Indirizzo</p>
                            <p className="text-foreground truncate">{passeggero.indirizzo}</p>
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