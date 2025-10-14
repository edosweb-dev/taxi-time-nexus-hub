import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StipendiFiltersProps {
  anni: number[];
  selectedAnno: number;
  onAnnoChange: (anno: number) => void;
  selectedStato: string;
  onStatoChange: (stato: string) => void;
}

export function StipendiFilters({
  anni,
  selectedAnno,
  onAnnoChange,
  selectedStato,
  onStatoChange
}: StipendiFiltersProps) {
  const stati = [
    { value: 'tutti', label: 'Tutti' },
    { value: 'confermato', label: 'Confermati' },
    { value: 'pagato', label: 'Pagati' },
  ];

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium mb-2 block">
            FILTRI
          </Label>
        </div>

        {/* Anno Select */}
        <div className="space-y-2">
          <Label htmlFor="anno-select">Anno</Label>
          <Select
            value={selectedAnno.toString()}
            onValueChange={(value) => onAnnoChange(parseInt(value))}
          >
            <SelectTrigger id="anno-select">
              <SelectValue placeholder="Seleziona anno" />
            </SelectTrigger>
            <SelectContent>
              {anni.map((anno) => (
                <SelectItem key={anno} value={anno.toString()}>
                  {anno}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stato Chips */}
        <div className="space-y-2">
          <Label>Stato</Label>
          <div className="flex flex-wrap gap-2">
            {stati.map((stato) => (
              <Button
                key={stato.value}
                variant={selectedStato === stato.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onStatoChange(stato.value)}
              >
                {stato.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
