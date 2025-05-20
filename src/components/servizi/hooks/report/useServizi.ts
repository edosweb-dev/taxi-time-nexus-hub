
import { useState, useEffect } from 'react';
import { useGenerateReport } from '../useGenerateReport';
import { toast } from '@/components/ui/use-toast';

export const useServizi = (
  aziendaId: string | null, 
  referenteId: string | null, 
  month: string | null, 
  year: string | null
) => {
  const [servizi, setServizi] = useState<any[]>([]);
  const [isLoadingServizi, setIsLoadingServizi] = useState(false);
  const { fetchServizi } = useGenerateReport();

  // Function to fetch services when filters change
  const loadServizi = async () => {
    if (!aziendaId || !referenteId || !month || !year) {
      return;
    }
    
    setIsLoadingServizi(true);
    try {
      const result = await fetchServizi(aziendaId, referenteId, parseInt(month), parseInt(year));
      setServizi(result);
    } catch (error) {
      console.error('Error loading servizi:', error);
      toast({
        title: "Errore",
        description: 'Si è verificato un errore nel caricamento dei servizi.',
        variant: "destructive",
      });
    } finally {
      setIsLoadingServizi(false);
    }
  };

  // When the filters change, load the servizi
  useEffect(() => {
    if (aziendaId && referenteId && month && year) {
      loadServizi();
    }
  }, [aziendaId, referenteId, month, year]);

  return {
    servizi,
    isLoadingServizi,
    loadServizi
  };
};
