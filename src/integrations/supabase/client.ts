// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://iczxhmzwjopfdvbxwzjs.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljenhobXp3am9wZmR2Ynh3empzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MDQzMjMsImV4cCI6MjA2MjM4MDMyM30.gkm8NiZrwvtmVskV1SQJc48WE7Q3Yn-xRBOt4qf_seo";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);