
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Using direct values instead of environment variables
const supabaseUrl = "https://iczxhmzwjopfdvbxwzjs.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljenhobXp3am9wZmR2Ynh3empzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MDQzMjMsImV4cCI6MjA2MjM4MDMyM30.gkm8NiZrwvtmVskV1SQJc48WE7Q3Yn-xRBOt4qf_seo";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
