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
import { usePasseggeri } from '@/hooks/usePasseggeri';

interface ReportPasseggeriFiltersProps {
  filters: {
    dataInizio: string;
    dataFine: string;
    aziendaId: string;
    referenteId: string;
    metodoPagamento: string;
    passeggeroId: string;
  };
  onFiltersChange: (filters: any) => void;
}

export function ReportPasseggeriFilters({
  filters,
  onFiltersChange,
}: ReportPasseggeriFiltersProps) {
  const { aziende } = useAziende();
  const { users } = useUsers();
  const { data: passeggeriData } = usePasseggeri(filters.aziendaId, filters.referenteId);

  const referenti = users.filter((u) => u.role === 'cliente');

  // Get passengers from the query result
  const passeggeri = passeggeriData?.passeggeri || [];

  // Filter passengers based on selected company and referent (already filtered in the query)
  const filteredPasseggeri = passeggeri;

  const handleReset = () => {
    onFiltersChange({
      dataInizio: new Date(new Date().setDate(new Date().getDate() - 30))
        .toISOString()
        .split('T')[0],
      dataFine: new Date().toISOString().split('T')[0],
      aziendaId: '',
      referenteId: '',
      metodoPagamento: '',
      passeggeroId: '',
    });
  };

  const metodiPagamento = [
    'Bonifico',
    'Contanti',
    'Assegno',
    'Carta di credito',
    'PayPal',
    'Altro',
  ];

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
            <Label htmlFor="metodoPagamento">Metodo Pagamento</Label>
            <Select
              value={filters.metodoPagamento || 'all'}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, metodoPagamento: value === 'all' ? '' : value })
              }
            >
              <SelectTrigger id="metodoPagamento">
                <SelectValue placeholder="Tutti i metodi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i metodi</SelectItem>
                {metodiPagamento.map((metodo) => (
                  <SelectItem key={metodo} value={metodo}>
                    {metodo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="passeggero">Passeggero</Label>
            <Select
              value={filters.passeggeroId || 'all'}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, passeggeroId: value === 'all' ? '' : value })
              }
              disabled={!filters.aziendaId}
            >
              <SelectTrigger id="passeggero">
                <SelectValue placeholder="Tutti i passeggeri" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i passeggeri</SelectItem>
                {filteredPasseggeri.map((passeggero) => (
                  <SelectItem key={passeggero.id} value={passeggero.id}>
                    {passeggero.nome_cognome}
                  </SelectItem>
                ))}
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
