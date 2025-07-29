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
    <div className="space-y-4">
      {passeggeri.map((passeggero) => (
        <Card key={passeggero.id}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              {passeggero.nome_cognome}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {passeggero.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{passeggero.email}</span>
                </div>
              )}
              {passeggero.telefono && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{passeggero.telefono}</span>
                </div>
              )}
              {passeggero.indirizzo && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{passeggero.indirizzo}</span>
                </div>
              )}
              {passeggero.localita && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{passeggero.localita}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}