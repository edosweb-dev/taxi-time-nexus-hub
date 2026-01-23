import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { useAziende } from '@/hooks/useAziende';
import { useUsers } from '@/hooks/useUsers';

interface ReportPasseggeriFiltersProps {
  filters: {
    dataInizio: string;
    dataFine: string;
    aziendaId: string;
    referenteId: string;
    dipendenteId: string;
    socioId: string;
    stato: string;
  };
  onFiltersChange: (filters: any) => void;
}

export function ReportPasseggeriFilters({
  filters,
  onFiltersChange,
}: ReportPasseggeriFiltersProps) {
  const { aziende } = useAziende();
  const { users } = useUsers();

  const referenti = users.filter((u) => u.role === 'cliente');
  const dipendenti = users.filter((u) => u.role === 'dipendente');
  const soci = users.filter((u) => u.role === 'socio' || u.role === 'admin');

  const handleReset = () => {
    onFiltersChange({
      dataInizio: new Date(new Date().setDate(new Date().getDate() - 30))
        .toISOString()
        .split('T')[0],
      dataFine: new Date().toISOString().split('T')[0],
      aziendaId: '',
      referenteId: '',
      dipendenteId: '',
      socioId: '',
      stato: 'tutti',
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dataInizio">Data Inizio</Label>
            <Input
              id="dataInizio"
              type="date"
              value={filters.dataInizio}
              onChange={(e) =>
                onFiltersChange({ ...filters, dataInizio: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataFine">Data Fine</Label>
            <Input
              id="dataFine"
              type="date"
              value={filters.dataFine}
              onChange={(e) =>
                onFiltersChange({ ...filters, dataFine: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="azienda">Azienda</Label>
            <Select
              value={filters.aziendaId || 'all'}
              onValueChange={(value) =>
                onFiltersChange({ 
                  ...filters, 
                  aziendaId: value === 'all' ? '' : value, 
                  referenteId: '' 
                })
              }
            >
              <SelectTrigger id="azienda">
                <SelectValue placeholder="Tutte le aziende" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le aziende</SelectItem>
                {aziende.map((azienda) => (
                  <SelectItem key={azienda.id} value={azienda.id}>
                    {azienda.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="referente">Referente</Label>
            <Select
              value={filters.referenteId || 'all'}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, referenteId: value === 'all' ? '' : value })
              }
              disabled={!filters.aziendaId}
            >
              <SelectTrigger id="referente">
                <SelectValue placeholder="Tutti i referenti" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i referenti</SelectItem>
                {referenti
                  .filter((r) => !filters.aziendaId || r.azienda_id === filters.aziendaId)
                  .map((referente) => (
                    <SelectItem key={referente.id} value={referente.id}>
                      {referente.first_name} {referente.last_name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dipendente">Dipendente</Label>
            <Select
              value={filters.dipendenteId || 'all'}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, dipendenteId: value === 'all' ? '' : value })
              }
            >
              <SelectTrigger id="dipendente">
                <SelectValue placeholder="Tutti i dipendenti" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i dipendenti</SelectItem>
                {dipendenti.map((dipendente) => (
                  <SelectItem key={dipendente.id} value={dipendente.id}>
                    {dipendente.first_name} {dipendente.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="socio">Socio/Admin</Label>
            <Select
              value={filters.socioId || 'all'}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, socioId: value === 'all' ? '' : value })
              }
            >
              <SelectTrigger id="socio">
                <SelectValue placeholder="Tutti i soci" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i soci</SelectItem>
                {soci.map((socio) => (
                  <SelectItem key={socio.id} value={socio.id}>
                    {socio.first_name} {socio.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stato">Stato Servizio</Label>
            <Select
              value={filters.stato || 'tutti'}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, stato: value })
              }
            >
              <SelectTrigger id="stato">
                <SelectValue placeholder="Tutti gli stati" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tutti">Tutti gli stati</SelectItem>
                <SelectItem value="completato">Completato</SelectItem>
                <SelectItem value="consuntivato">Consuntivato</SelectItem>
                <SelectItem value="fatturato">Fatturato</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button variant="outline" onClick={handleReset} className="w-full">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Filtri
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
