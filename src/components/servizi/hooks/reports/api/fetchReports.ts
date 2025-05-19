
import { supabase } from '@/lib/supabase';
import { Report } from '@/lib/types/index';

/**
 * Fetches all reports from the database
 */
export const fetchReports = async (): Promise<Report[]> => {
  console.log('Fetching reports...');
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
  
  console.log(`Retrieved ${data?.length || 0} reports`);
  if (data && data.length > 0) {
    console.log('Sample report data:', {
      id: data[0].id,
      azienda_id: data[0].azienda_id,
      referente_id: data[0].referente_id,
      servizi_ids: data[0].servizi_ids?.length || 0
    });
  } else {
    console.log('No reports found in database');
  }
  
  return data as Report[];
};
