
export * from './servizi';
export * from './impostazioni';
export * from './auth';
export * from './spese';

export interface Report {
  id: string;
  azienda_id: string;
  referente_id: string;
  month: number;
  year: number;
  created_at: string;
  created_by: string;
  file_path: string;
  file_name: string;
  servizi_ids: string[];
  bucket_name?: string; // Added optional bucket name to support storage in different buckets
}
