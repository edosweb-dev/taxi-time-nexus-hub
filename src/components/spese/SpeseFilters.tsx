
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, RotateCcw } from 'lucide-react';
import { useDipendenti } from '@/hooks/useSpeseDipendenti';
import { SpeseFilters as SpeseFiltersType } from '@/hooks/useSpeseDipendenti';

interface SpeseFiltersProps {
  onFiltersChange: (filters: SpeseFiltersType) => void;
  currentFilters: SpeseFiltersType;
}

export function SpeseFilters({ onFiltersChange, currentFilters }: SpeseFiltersProps) {
  const [localFilters, setLocalFilters] = useState<SpeseFiltersType>(currentFilters);
  const { data: dipendenti = [] } = useDipendenti();

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleResetFilters = () => {
    const emptyFilters: SpeseFiltersType = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtri
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Dipendente</label>
            <Select
              value={localFilters.user_id || ''}
              onValueChange={(value) => 
                setLocalFilters(prev => ({ ...prev, user_id: value || undefined }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tutti i dipendenti" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tutti i dipendenti</SelectItem>
                {dipendenti.map((dipendente) => (
                  <SelectItem key={dipendente.id} value={dipendente.id}>
                    {dipendente.first_name} {dipendente.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Data inizio</label>
            <Input
              type="date"
              value={formatDateForInput(localFilters.startDate)}
              onChange={(e) => 
                setLocalFilters(prev => ({ 
                  ...prev, 
                  startDate: e.target.value || undefined 
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Data fine</label>
            <Input
              type="date"
              value={formatDateForInput(localFilters.endDate)}
              onChange={(e) => 
                setLocalFilters(prev => ({ 
                  ...prev, 
                  endDate: e.target.value || undefined 
                }))
              }
            />
          </div>

          <div className="space-y-2 flex flex-col justify-end">
            <div className="flex gap-2">
              <Button onClick={handleApplyFilters} className="flex-1">
                Applica
              </Button>
              <Button 
                variant="outline" 
                onClick={handleResetFilters}
                className="flex-1"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
