// Re-export del client Supabase canonico per evitare istanze multiple di GoTrueClient.
// Mantiene retro-compatibilità con gli import esistenti da '@/lib/supabase'.
export { supabase } from '@/integrations/supabase/client';
export type { Database } from '@/integrations/supabase/types';
