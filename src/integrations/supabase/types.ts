export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      aziende: {
        Row: {
          created_at: string | null
          email: string | null
          firma_digitale_attiva: boolean | null
          id: string
          indirizzo: string | null
          nome: string
          partita_iva: string
          telefono: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          firma_digitale_attiva?: boolean | null
          id?: string
          indirizzo?: string | null
          nome: string
          partita_iva: string
          telefono?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          firma_digitale_attiva?: boolean | null
          id?: string
          indirizzo?: string | null
          nome?: string
          partita_iva?: string
          telefono?: string | null
        }
        Relationships: []
      }
      passeggeri: {
        Row: {
          created_at: string
          destinazione: string
          email: string | null
          id: string
          luogo_presa: string
          nome_cognome: string
          orario_presa: string
          servizio_id: string
          telefono: string | null
          usa_indirizzo_personalizzato: boolean
        }
        Insert: {
          created_at?: string
          destinazione: string
          email?: string | null
          id?: string
          luogo_presa: string
          nome_cognome: string
          orario_presa: string
          servizio_id: string
          telefono?: string | null
          usa_indirizzo_personalizzato?: boolean
        }
        Update: {
          created_at?: string
          destinazione?: string
          email?: string | null
          id?: string
          luogo_presa?: string
          nome_cognome?: string
          orario_presa?: string
          servizio_id?: string
          telefono?: string | null
          usa_indirizzo_personalizzato?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "passeggeri_servizio_id_fkey"
            columns: ["servizio_id"]
            isOneToOne: false
            referencedRelation: "servizi"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          azienda_id: string | null
          first_name: string | null
          id: string
          last_name: string | null
          role: string
        }
        Insert: {
          azienda_id?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          role: string
        }
        Update: {
          azienda_id?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_azienda_id_fkey"
            columns: ["azienda_id"]
            isOneToOne: false
            referencedRelation: "aziende"
            referencedColumns: ["id"]
          },
        ]
      }
      servizi: {
        Row: {
          assegnato_a: string | null
          azienda_id: string
          conducente_esterno: boolean | null
          conducente_esterno_email: string | null
          conducente_esterno_nome: string | null
          created_at: string
          created_by: string
          data_servizio: string
          id: string
          metodo_pagamento: string
          note: string | null
          numero_commessa: string | null
          referente_id: string
          stato: string
        }
        Insert: {
          assegnato_a?: string | null
          azienda_id: string
          conducente_esterno?: boolean | null
          conducente_esterno_email?: string | null
          conducente_esterno_nome?: string | null
          created_at?: string
          created_by: string
          data_servizio: string
          id?: string
          metodo_pagamento: string
          note?: string | null
          numero_commessa?: string | null
          referente_id: string
          stato?: string
        }
        Update: {
          assegnato_a?: string | null
          azienda_id?: string
          conducente_esterno?: boolean | null
          conducente_esterno_email?: string | null
          conducente_esterno_nome?: string | null
          created_at?: string
          created_by?: string
          data_servizio?: string
          id?: string
          metodo_pagamento?: string
          note?: string | null
          numero_commessa?: string | null
          referente_id?: string
          stato?: string
        }
        Relationships: [
          {
            foreignKeyName: "servizi_assegnato_a_fkey"
            columns: ["assegnato_a"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "servizi_azienda_id_fkey"
            columns: ["azienda_id"]
            isOneToOne: false
            referencedRelation: "aziende"
            referencedColumns: ["id"]
          },
        ]
      }
      shifts: {
        Row: {
          created_at: string
          created_by: string
          end_date: string | null
          end_time: string | null
          half_day_type: string | null
          id: string
          notes: string | null
          shift_date: string
          shift_type: string
          start_date: string | null
          start_time: string | null
          updated_at: string
          updated_by: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          end_date?: string | null
          end_time?: string | null
          half_day_type?: string | null
          id?: string
          notes?: string | null
          shift_date: string
          shift_type: string
          start_date?: string | null
          start_time?: string | null
          updated_at?: string
          updated_by: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          end_date?: string | null
          end_time?: string | null
          half_day_type?: string | null
          id?: string
          notes?: string | null
          shift_date?: string
          shift_type?: string
          start_date?: string | null
          start_time?: string | null
          updated_at?: string
          updated_by?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
