
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAziende, getAziendaById, createAzienda, updateAzienda, deleteAzienda, AziendaFormData } from '@/lib/api/aziende';
import { toast } from '@/components/ui/sonner';
import { Azienda } from '@/lib/types';

export function useAziende() {
  const queryClient = useQueryClient();

  const {
    data: aziende = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['aziende'],
    queryFn: async () => {
      console.log('[useAziende] Fetching companies');
      try {
        const aziende = await getAziende();
        console.log(`[useAziende] Query completed, received ${aziende.length} companies`);
        return aziende;
      } catch (err) {
        console.error('[useAziende] Error during companies query:', err);
        throw err;
      }
    },
  });

  const getCompanyDetails = (id: string) => {
    return useQuery({
      queryKey: ['azienda', id],
      queryFn: () => getAziendaById(id),
      enabled: !!id
    });
  };

  const createCompanyMutation = useMutation({
    mutationFn: (companyData: AziendaFormData) => createAzienda(companyData),
    onSuccess: (data) => {
      if (data.azienda) {
        queryClient.invalidateQueries({ queryKey: ['aziende'] });
        toast.success('Azienda creata con successo');
      } else if (data.error) {
        toast.error(`Errore nella creazione dell'azienda: ${data.error.message}`);
      }
    },
    onError: (error: any) => {
      console.error('Error creating company:', error);
      toast.error(`Errore nella creazione dell'azienda: ${error.message || 'Si è verificato un errore'}`);
    },
  });

  const updateCompanyMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AziendaFormData> }) => updateAzienda(id, data),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['aziende'] });
        queryClient.invalidateQueries({ queryKey: ['azienda'] });
        toast.success('Azienda aggiornata con successo');
      } else if (data.error) {
        toast.error(`Errore nell'aggiornamento dell'azienda: ${data.error.message}`);
      }
    },
    onError: (error: any) => {
      console.error('Error updating company:', error);
      toast.error(`Errore nell'aggiornamento dell'azienda: ${error.message || 'Si è verificato un errore'}`);
    },
  });

  const deleteCompanyMutation = useMutation({
    mutationFn: (id: string) => deleteAzienda(id),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['aziende'] });
        toast.success('Azienda eliminata con successo');
      } else if (data.error) {
        toast.error(`Errore nell'eliminazione dell'azienda: ${data.error.message}`);
      }
    },
    onError: (error: any) => {
      console.error('Error deleting company:', error);
      toast.error(`Errore nell'eliminazione dell'azienda: ${error.message || 'Si è verificato un errore'}`);
    },
  });

  return {
    aziende,
    isLoading,
    isError,
    error,
    refetch,
    getCompanyDetails,
    createCompany: (data: AziendaFormData) => createCompanyMutation.mutate(data),
    updateCompany: (id: string, data: Partial<AziendaFormData>) => updateCompanyMutation.mutate({ id, data }),
    deleteCompany: (id: string) => deleteCompanyMutation.mutate(id),
    isCreating: createCompanyMutation.isPending,
    isUpdating: updateCompanyMutation.isPending,
    isDeleting: deleteCompanyMutation.isPending,
  };
}
