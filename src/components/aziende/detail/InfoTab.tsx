
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Azienda } from '@/lib/types';

interface InfoTabProps {
  azienda: Azienda;
}

export function InfoTab({ azienda }: InfoTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Anagrafica Azienda</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="font-medium text-sm">Nome Azienda</h3>
            <p className="text-lg">{azienda.nome}</p>
          </div>
          <div>
            <h3 className="font-medium text-sm">Partita IVA</h3>
            <p className="text-lg">{azienda.partita_iva}</p>
          </div>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="font-medium text-sm">Email</h3>
            <p className="text-lg">{azienda.email || '-'}</p>
          </div>
          <div>
            <h3 className="font-medium text-sm">Telefono</h3>
            <p className="text-lg">{azienda.telefono || '-'}</p>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium text-sm">Indirizzo</h3>
          <p className="text-lg">{azienda.indirizzo || '-'}</p>
        </div>
        
        <div>
          <h3 className="font-medium text-sm">Firma Digitale</h3>
          <p className="text-lg">{azienda.firma_digitale_attiva ? 'Attiva' : 'Non attiva'}</p>
        </div>
        
        <div>
          <h3 className="font-medium text-sm">Data Creazione</h3>
          <p className="text-lg">
            {new Date(azienda.created_at).toLocaleDateString('it-IT', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
