
import { supabase } from '@/lib/supabase';
import { Report } from '@/lib/types/index';
import { toast } from '@/components/ui/use-toast';

/**
 * Fetches all reports
 */
export const fetchReports = async (): Promise<Report[]> => {
  try {
    console.log('[fetchReports] Fetching reports from database');
    
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('[fetchReports] Error fetching reports:', error);
      toast({
        title: 'Errore',
        description: `Errore nel recupero dei report: ${error.message}`,
        variant: 'destructive',
      });
      throw error;
    }
    
    console.log(`[fetchReports] Retrieved ${data?.length || 0} reports`);
    return data as Report[];
  } catch (error: any) {
    console.error('[fetchReports] Unexpected error:', error);
    toast({
      title: 'Errore',
      description: `Si è verificato un errore nel recupero dei report: ${error.message}`,
      variant: 'destructive',
    });
    throw error;
  }
};
