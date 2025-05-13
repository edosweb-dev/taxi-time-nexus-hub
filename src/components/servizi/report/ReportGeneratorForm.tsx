
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAziende } from '@/hooks/useAziende';
import { useUsers } from '@/hooks/useUsers';
import { useAuth } from '@/contexts/AuthContext';
import { useGenerateReport } from '../hooks/useGenerateReport';

interface ReportFormValues {
  aziendaId: string;
  referenteId: string;
  month: string;
  year: string;
}

export const ReportGeneratorForm = ({ onCancel }: { onCancel: () => void }) => {
  const { aziende } = useAziende();
  const { users } = useUsers();
  const { profile } = useAuth();
  const [referenti, setReferenti] = useState<any[]>([]);
  const [selectedAziendaId, setSelectedAziendaId] = useState<string>('');
  const [selectedServizi, setSelectedServizi] = useState<{ id: string; selected: boolean }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { servizi, isLoadingServizi, generateReport } = useGenerateReport();
  
  const form = useForm<ReportFormValues>({
    defaultValues: {
      aziendaId: '',
      referenteId: '',
      month: new Date().getMonth() + 1 + '',
      year: new Date().getFullYear() + '',
    }
  });

  const onSubmit = async (data: ReportFormValues) => {
    setIsLoading(true);
    try {
      // Get selected servizi IDs
      const selectedServiziIds = selectedServizi
        .filter(s => s.selected)
        .map(s => s.id);
      
      if (selectedServiziIds.length === 0) {
        alert('Seleziona almeno un servizio per generare il report.');
        setIsLoading(false);
        return;
      }
      
      await generateReport({
        aziendaId: data.aziendaId,
        referenteId: data.referenteId,
        month: parseInt(data.month),
        year: parseInt(data.year),
        serviziIds: selectedServiziIds,
        createdBy: profile?.id || ''
      });
      
      onCancel(); // Close the form after successful generation
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // When azienda changes, filter referenti
    const aziendaId = form.watch('aziendaId');
    if (aziendaId) {
      setSelectedAziendaId(aziendaId);
      
      // Get all referenti (clients) for this azienda
      const filteredReferenti = users.filter(user => 
        user.role === 'cliente' && user.azienda_id === aziendaId
      );
      setReferenti(filteredReferenti);
      
      // Reset referente selection
      form.setValue('referenteId', '');
    }
  }, [form.watch('aziendaId'), users]);

  // When servizi are loaded or filter changes, reset selected servizi
  useEffect(() => {
    if (servizi) {
      setSelectedServizi(servizi.map(s => ({ id: s.id, selected: true })));
    } else {
      setSelectedServizi([]);
    }
  }, [servizi]);

  const toggleSelectAll = (select: boolean) => {
    setSelectedServizi(prev => prev.map(s => ({ ...s, selected: select })));
  };

  const toggleServizioSelection = (id: string) => {
    setSelectedServizi(prev => 
      prev.map(s => s.id === id ? { ...s, selected: !s.selected } : s)
    );
  };

  const monthOptions = [
    { value: '1', label: 'Gennaio' },
    { value: '2', label: 'Febbraio' },
    { value: '3', label: 'Marzo' },
    { value: '4', label: 'Aprile' },
    { value: '5', label: 'Maggio' },
    { value: '6', label: 'Giugno' },
    { value: '7', label: 'Luglio' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Settembre' },
    { value: '10', label: 'Ottobre' },
    { value: '11', label: 'Novembre' },
    { value: '12', label: 'Dicembre' },
  ];

  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - 2 + i;
    return { value: year.toString(), label: year.toString() };
  });

  const watchAziendaId = form.watch('aziendaId');
  const watchReferenteId = form.watch('referenteId');
  const watchMonth = form.watch('month');
  const watchYear = form.watch('year');

  const selectedServiziCount = selectedServizi.filter(s => s.selected).length;

  // Get company name and referente name for display
  const aziendaName = aziende.find(a => a.id === watchAziendaId)?.nome || '';
  const referenteName = users.find(u => u.id === watchReferenteId)?.first_name + ' ' + 
                        users.find(u => u.id === watchReferenteId)?.last_name || '';
  const monthName = monthOptions.find(m => m.value === watchMonth)?.label || '';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Company selection */}
          <FormField
            control={form.control}
            name="aziendaId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Azienda</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona l'azienda" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {aziende.map((azienda) => (
                      <SelectItem key={azienda.id} value={azienda.id}>
                        {azienda.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Referente selection */}
          <FormField
            control={form.control}
            name="referenteId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Referente</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!selectedAziendaId}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona il referente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {referenti.map((referente) => (
                      <SelectItem key={referente.id} value={referente.id}>
                        {referente.first_name} {referente.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Month selection */}
          <FormField
            control={form.control}
            name="month"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mese</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona il mese" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {monthOptions.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Year selection */}
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Anno</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona l'anno" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {yearOptions.map((year) => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Service selection section */}
        {watchAziendaId && watchReferenteId && watchMonth && watchYear && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">
                Servizi consuntivati per {aziendaName} - {referenteName} - {monthName} {watchYear}
              </h3>
              <div className="space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => toggleSelectAll(true)}
                >
                  Seleziona tutti
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => toggleSelectAll(false)}
                >
                  Deseleziona tutti
                </Button>
              </div>
            </div>

            {isLoadingServizi ? (
              <div className="text-center py-4">Caricamento servizi in corso...</div>
            ) : selectedServizi.length === 0 ? (
              <div className="text-center py-4">Nessun servizio consuntivato trovato per i criteri selezionati.</div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Seleziona
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Partenza
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Destinazione
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Importo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {servizi.map((servizio, index) => {
                      const isSelected = selectedServizi.find(s => s.id === servizio.id)?.selected || false;
                      return (
                        <tr key={servizio.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Checkbox 
                              checked={isSelected}
                              onCheckedChange={() => toggleServizioSelection(servizio.id)}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {new Date(servizio.data_servizio).toLocaleDateString('it-IT')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {servizio.indirizzo_presa}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {servizio.indirizzo_destinazione}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {servizio.incasso_previsto ? 
                              new Intl.NumberFormat('it-IT', { 
                                style: 'currency', 
                                currency: 'EUR' 
                              }).format(servizio.incasso_previsto) : 
                              '€ 0,00'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {selectedServizi.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                Servizi selezionati: {selectedServiziCount} di {selectedServizi.length}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={onCancel}>
            Annulla
          </Button>
          <Button type="submit" disabled={isLoading || !watchReferenteId || selectedServiziCount === 0}>
            {isLoading ? 'Generazione...' : 'Genera Report PDF'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
