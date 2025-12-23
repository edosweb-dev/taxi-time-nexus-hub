import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Upload, Download, Copy, Loader2 } from 'lucide-react';
import { useTariffeKm, useConfigurazioneStipendi, useGenerateFromPreviousYear, useUploadTariffeCsv } from '@/hooks/useConfigurazioneStipendi';
import { TariffeFisseTable } from './TariffeFisseTable';
import { ParametriGlobaliCard } from './ParametriGlobaliCard';
import { SimulatoreDialog } from './SimulatoreDialog';
import { NuovaTariffaDialog } from './NuovaTariffaDialog';
import { downloadTemplateCsv } from '@/lib/api/stipendi/configurazione';
import { toast } from '@/hooks/use-toast';

export function TariffeKmTab() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: tariffe, isLoading: tariffeLoading } = useTariffeKm(selectedYear);
  const { data: config, isLoading: configLoading } = useConfigurazioneStipendi(selectedYear);
  const generateMutation = useGenerateFromPreviousYear();
  const uploadMutation = useUploadTariffeCsv();

  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: 'Formato non valido',
        description: 'Il file deve essere in formato CSV',
        variant: 'destructive'
      });
      return;
    }

    await uploadMutation.mutateAsync({ file, anno: selectedYear });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCopyFromPrevious = async () => {
    await generateMutation.mutateAsync(selectedYear);
  };

  return (
    <div className="space-y-6">
      {/* Header con controlli */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Anno:</label>
          <Select
            value={selectedYear.toString()}
            onValueChange={(val) => setSelectedYear(parseInt(val))}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-2">
          <NuovaTariffaDialog anno={selectedYear} />
          <Button
            variant="outline"
            size="sm"
            onClick={downloadTemplateCsv}
          >
            <Download className="mr-2 h-4 w-4" />
            Template CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Carica CSV
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileUpload}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyFromPrevious}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            Copia Anno Precedente
          </Button>

          <SimulatoreDialog anno={selectedYear} />
        </div>
      </div>

      {/* Grid layout: Tabella + Parametri */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabella Tariffe (2/3 larghezza desktop) */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Tariffe KM Fisse</CardTitle>
              <CardDescription>
                Tariffe applicate per chilometraggi da 12km a 200km
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TariffeFisseTable 
                tariffe={tariffe || []} 
                isLoading={tariffeLoading} 
              />
            </CardContent>
          </Card>
        </div>

        {/* Parametri Globali (1/3 larghezza desktop) */}
        <div>
          <ParametriGlobaliCard 
            config={config || null}
            anno={selectedYear}
            isLoading={configLoading}
          />
        </div>
      </div>
    </div>
  );
}
