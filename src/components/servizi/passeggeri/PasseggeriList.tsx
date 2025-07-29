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
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Passeggeri dell'azienda
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto pr-4">
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
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nessun passeggero trovato per questa azienda e referente.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {passeggeri.map((passeggero) => (
                <Card key={passeggero.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>{passeggero.nome_cognome}</span>
                      <Badge variant="secondary" className="text-xs">
                        ID: {passeggero.id.slice(-8)}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Nome e Cognome separati */}
                      {(passeggero.nome || passeggero.cognome) && (
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {passeggero.nome} {passeggero.cognome}
                          </span>
                        </div>
                      )}
                      
                      {/* Email */}
                      {passeggero.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{passeggero.email}</span>
                        </div>
                      )}
                      
                      {/* Telefono */}
                      {passeggero.telefono && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{passeggero.telefono}</span>
                        </div>
                      )}
                      
                      {/* Località */}
                      {passeggero.localita && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{passeggero.localita}</span>
                        </div>
                      )}
                      
                      {/* Indirizzo */}
                      {passeggero.indirizzo && (
                        <div className="flex items-center gap-2 text-sm">
                          <Home className="h-4 w-4 text-muted-foreground" />
                          <span>{passeggero.indirizzo}</span>
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