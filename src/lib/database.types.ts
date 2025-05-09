
// This file should be replaced with the Supabase generated types
// Run: npx supabase gen types typescript --project-id your-project-id > src/lib/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          role: 'admin' | 'socio' | 'dipendente' | 'cliente'
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          role: 'admin' | 'socio' | 'dipendente' | 'cliente'
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          role?: 'admin' | 'socio' | 'dipendente' | 'cliente'
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
