
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAziende } from '@/hooks/useAziende';
import { useUsers } from '@/hooks/useUsers';
import { useAuth } from '@/contexts/AuthContext';
import { useGenerateReport } from './useGenerateReport';
import { toast } from '@/components/ui/use-toast';

export interface ReportFormValues {
  aziendaId: string;
  referenteId: string;
  month: string;
  year: string;
}

export const useReportGeneratorForm = (onCancel: () => void) => {
  const { aziende } = useAziende();
  const { users } = useUsers();
  const { profile } = useAuth();
  const [referenti, setReferenti] = useState<any[]>([]);
  const [selectedAziendaId, setSelectedAziendaId] = useState<string>('');
  const [servizi, setServizi] = useState<any[]>([]);
  const [selectedServizi, setSelectedServizi] = useState<{ id: string; selected: boolean }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingServizi, setIsLoadingServizi] = useState(false);
  
  const { fetchServizi, generateReport } = useGenerateReport();
  
  const form = useForm<ReportFormValues>({
    defaultValues: {
      aziendaId: '',
      referenteId: '',
      month: new Date().getMonth() + 1 + '',
      year: new Date().getFullYear() + '',
    }
  });

  // Function to fetch services when filters change
  const loadServizi = async () => {
    const aziendaId = form.watch('aziendaId');
    const referenteId = form.watch('referenteId');
    const month = parseInt(form.watch('month'));
    const year = parseInt(form.watch('year'));
    
    if (!aziendaId || !referenteId || !month || !year) {
      return;
    }
    
    setIsLoadingServizi(true);
    try {
      const result = await fetchServizi(aziendaId, referenteId, month, year);
      setServizi(result);
      setSelectedServizi(result.map(s => ({ id: s.id, selected: true })));
    } catch (error) {
      console.error('Error loading servizi:', error);
    } finally {
      setIsLoadingServizi(false);
    }
  };

  const onSubmit = async (data: ReportFormValues) => {
    setIsLoading(true);
    try {
      // Get selected servizi IDs
      const selectedServiziIds = selectedServizi
        .filter(s => s.selected)
        .map(s => s.id);
      
      if (selectedServiziIds.length === 0) {
        toast({
          title: "Errore",
          description: 'Seleziona almeno un servizio per generare il report.',
          variant: "destructive",
        });
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
      setServizi([]);
      setSelectedServizi([]);
    }
  }, [form.watch('aziendaId'), users]);

  // When the filters change, load the servizi
  useEffect(() => {
    const aziendaId = form.watch('aziendaId');
    const referenteId = form.watch('referenteId');
    const month = form.watch('month');
    const year = form.watch('year');
    
    if (aziendaId && referenteId && month && year) {
      loadServizi();
    }
  }, [
    form.watch('aziendaId'),
    form.watch('referenteId'),
    form.watch('month'),
    form.watch('year')
  ]);

  const toggleSelectAll = (select: boolean) => {
    setSelectedServizi(prev => prev.map(s => ({ ...s, selected: select })));
  };

  const toggleServizioSelection = (id: string) => {
    setSelectedServizi(prev => 
      prev.map(s => s.id === id ? { ...s, selected: !s.selected } : s)
    );
  };

  const selectedServiziCount = selectedServizi.filter(s => s.selected).length;

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

  return {
    form,
    isLoading,
    isLoadingServizi,
    servizi,
    selectedServizi,
    referenti,
    selectedAziendaId,
    monthOptions,
    yearOptions,
    selectedServiziCount,
    onSubmit,
    toggleSelectAll,
    toggleServizioSelection,
    aziende,
  };
};
