import React, { useState } from 'react';
import { Filter, Calendar, Building2, User, Users, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export interface ReportFiltersData {
  aziendaId: string;
  referenteId: string;
  conducenteId: string;
  veicoloId: string;
  statoServizi: string[];
  dataInizio?: Date;
  dataFine?: Date;
}

interface ReportFiltersProps {
  filters: ReportFiltersData;
  onFiltersChange: (filters: ReportFiltersData) => void;
  aziende?: any[];
  referenti?: any[];
  conducenti?: any[];
  veicoli?: any[];
}

const PERIODO_PRESETS = [
  { label: 'Oggi', value: 'today' },
  { label: 'Settimana', value: 'week' },
  { label: 'Mese', value: 'month' },
  { label: 'Custom', value: 'custom' }
];

const STATI_SERVIZI = [
  { value: 'da_assegnare', label: 'Da Assegnare' },
  { value: 'assegnato', label: 'Assegnato' },
  { value: 'completato', label: 'Completato' },
  { value: 'annullato', label: 'Annullato' },
  { value: 'consuntivato', label: 'Consuntivato' }
];

export function ReportFilters({ 
  filters, 
  onFiltersChange, 
  aziende = [], 
  referenti = [], 
  conducenti = [], 
  veicoli = [] 
}: ReportFiltersProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const handleFilterChange = (key: keyof ReportFiltersData, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    const today = new Date();
    let dataInizio: Date | undefined;
    let dataFine: Date | undefined;

    switch (period) {
      case 'today':
        dataInizio = today;
        dataFine = today;
        break;
      case 'week':
        dataInizio = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        dataFine = today;
        break;
      case 'month':
        dataInizio = new Date(today.getFullYear(), today.getMonth(), 1);
        dataFine = today;
        break;
      default:
        // custom - don't change dates
        return;
    }

    onFiltersChange({
      ...filters,
      dataInizio,
      dataFine
    });
  };

  const handleStatiChange = (stato: string) => {
    const currentStati = filters.statoServizi || [];
    const newStati = currentStati.includes(stato)
      ? currentStati.filter(s => s !== stato)
      : [...currentStati, stato];
    
    handleFilterChange('statoServizi', newStati);
  };

  const resetFilters = () => {
    onFiltersChange({
      aziendaId: '',
      referenteId: '',
      conducenteId: '',
      veicoloId: '',
      statoServizi: [],
      dataInizio: undefined,
      dataFine: undefined
    });
    setSelectedPeriod('month');
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5" />
          Filtri Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Period Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Periodo</Label>
          <div className="flex flex-wrap gap-2">
            {PERIODO_PRESETS.map((preset) => (
              <Button
                key={preset.value}
                variant={selectedPeriod === preset.value ? "default" : "outline"}
                size="sm"
                onClick={() => handlePeriodChange(preset.value)}
                className="min-h-[36px]"
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              Data Inizio
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left min-h-[40px]">
                  {filters.dataInizio ? format(filters.dataInizio, 'dd/MM/yyyy', { locale: it }) : 'Seleziona data'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={filters.dataInizio}
                  onSelect={(date) => handleFilterChange('dataInizio', date)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              Data Fine
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left min-h-[40px]">
                  {filters.dataFine ? format(filters.dataFine, 'dd/MM/yyyy', { locale: it }) : 'Seleziona data'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={filters.dataFine}
                  onSelect={(date) => handleFilterChange('dataFine', date)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Filter Selects */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Azienda */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4" />
              Azienda
            </Label>
            <Select value={filters.aziendaId} onValueChange={(value) => handleFilterChange('aziendaId', value)}>
              <SelectTrigger className="min-h-[40px]">
                <SelectValue placeholder="Tutte le aziende" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tutte le aziende</SelectItem>
                {aziende.map(azienda => (
                  <SelectItem key={azienda.id} value={azienda.id}>
                    {azienda.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Referente */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              Referente
            </Label>
            <Select value={filters.referenteId} onValueChange={(value) => handleFilterChange('referenteId', value)}>
              <SelectTrigger className="min-h-[40px]">
                <SelectValue placeholder="Tutti i referenti" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tutti i referenti</SelectItem>
                {referenti.map(referente => (
                  <SelectItem key={referente.id} value={referente.id}>
                    {referente.first_name} {referente.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Conducente */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              Conducente
            </Label>
            <Select value={filters.conducenteId} onValueChange={(value) => handleFilterChange('conducenteId', value)}>
              <SelectTrigger className="min-h-[40px]">
                <SelectValue placeholder="Tutti i conducenti" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tutti i conducenti</SelectItem>
                {conducenti.map(conducente => (
                  <SelectItem key={conducente.id} value={conducente.id}>
                    {conducente.first_name} {conducente.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Veicolo */}
          <div className="space-y-2">
            <Label className="text-sm">Veicolo</Label>
            <Select value={filters.veicoloId} onValueChange={(value) => handleFilterChange('veicoloId', value)}>
              <SelectTrigger className="min-h-[40px]">
                <SelectValue placeholder="Tutti i veicoli" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tutti i veicoli</SelectItem>
                {veicoli.map(veicolo => (
                  <SelectItem key={veicolo.id} value={veicolo.id}>
                    {veicolo.targa} - {veicolo.modello}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stati Servizi */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Stato Servizi</Label>
          <div className="flex flex-wrap gap-2">
            {STATI_SERVIZI.map((stato) => (
              <Button
                key={stato.value}
                variant={filters.statoServizi?.includes(stato.value) ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatiChange(stato.value)}
                className="min-h-[36px]"
              >
                {stato.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={resetFilters} variant="outline" className="flex-1 min-h-[44px]">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Filtri
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}