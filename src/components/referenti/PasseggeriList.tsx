import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Passeggero } from '@/hooks/useReferentiPasseggeri';
import { User, Mail, Phone, MapPin, Building2 } from 'lucide-react';

interface PasseggeriListProps {
  passeggeri: Passeggero[];
}

export function PasseggeriList({ passeggeri }: PasseggeriListProps) {
  if (passeggeri.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <User className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Nessun passeggero collegato a questo referente
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
      {passeggeri.map((passeggero) => (
        <Card key={passeggero.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 truncate">
              <User className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="truncate">{passeggero.nome_cognome}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {passeggero.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{passeggero.email}</span>
                </div>
              )}
              {passeggero.telefono && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span>{passeggero.telefono}</span>
                </div>
              )}
              {passeggero.indirizzo && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="truncate" title={passeggero.indirizzo}>
                    {passeggero.indirizzo}
                  </span>
                </div>
              )}
              {passeggero.localita && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{passeggero.localita}</span>
                </div>
              )}
            </div>
            
            {!passeggero.email && !passeggero.telefono && !passeggero.indirizzo && !passeggero.localita && (
              <p className="text-xs text-muted-foreground italic text-center py-2">
                Informazioni di contatto non disponibili
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}