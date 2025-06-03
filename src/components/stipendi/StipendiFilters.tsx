
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface StipendiFiltersProps {
  selectedTab: 'tutti' | 'dipendenti' | 'soci';
  selectedStato: string;
  onTabChange: (tab: 'tutti' | 'dipendenti' | 'soci') => void;
  onStatoChange: (stato: string) => void;
}

export function StipendiFilters({ 
  selectedTab, 
  selectedStato, 
  onTabChange, 
  onStatoChange 
}: StipendiFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
      {/* Tab per tipo */}
      <div className="flex gap-2">
        <Button
          variant={selectedTab === 'tutti' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onTabChange('tutti')}
        >
          Tutti
        </Button>
        <Button
          variant={selectedTab === 'dipendenti' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onTabChange('dipendenti')}
        >
          Dipendenti
        </Button>
        <Button
          variant={selectedTab === 'soci' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onTabChange('soci')}
        >
          Soci
        </Button>
      </div>

      {/* Filtro stato */}
      <Select value={selectedStato} onValueChange={onStatoChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Filtra per stato" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="tutti">Tutti gli stati</SelectItem>
          <SelectItem value="bozza">Bozza</SelectItem>
          <SelectItem value="confermato">Confermato</SelectItem>
          <SelectItem value="pagato">Pagato</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
