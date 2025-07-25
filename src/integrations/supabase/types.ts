export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      aziende: {
        Row: {
          created_at: string | null
          email: string | null
          emails: string[] | null
          firma_digitale_attiva: boolean | null
          id: string
          indirizzo: string | null
          nome: string
          partita_iva: string
          provvigione: boolean | null
          telefoni: string[] | null
          telefono: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          emails?: string[] | null
          firma_digitale_attiva?: boolean | null
          id?: string
          indirizzo?: string | null
          nome: string
          partita_iva: string
          provvigione?: boolean | null
          telefoni?: string[] | null
          telefono?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          emails?: string[] | null
          firma_digitale_attiva?: boolean | null
          id?: string
          indirizzo?: string | null
          nome?: string
          partita_iva?: string
          provvigione?: boolean | null
          telefoni?: string[] | null
          telefono?: string | null
        }
        Relationships: []
      }
      conducenti_esterni: {
        Row: {
          attivo: boolean
          created_at: string
          created_by: string
          email: string | null
          id: string
          nome_cognome: string
          note: string | null
          telefono: string | null
          updated_at: string
        }
        Insert: {
          attivo?: boolean
          created_at?: string
          created_by: string
          email?: string | null
          id?: string
          nome_cognome: string
          note?: string | null
          telefono?: string | null
          updated_at?: string
        }
        Update: {
          attivo?: boolean
          created_at?: string
          created_by?: string
          email?: string | null
          id?: string
          nome_cognome?: string
          note?: string | null
          telefono?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conducenti_esterni_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      configurazione_stipendi: {
        Row: {
          anno: number
          coefficiente_aumento: number
          created_at: string
          id: string
          tariffa_km_extra: number
          tariffa_oraria_attesa: number
          updated_at: string
        }
        Insert: {
          anno: number
          coefficiente_aumento: number
          created_at?: string
          id?: string
          tariffa_km_extra?: number
          tariffa_oraria_attesa?: number
          updated_at?: string
        }
        Update: {
          anno?: number
          coefficiente_aumento?: number
          created_at?: string
          id?: string
          tariffa_km_extra?: number
          tariffa_oraria_attesa?: number
          updated_at?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          admin_comment: string | null
          created_at: string
          email: string | null
          id: string
          messaggio: string
          pagina: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
          timestamp: string
          tipo: string
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          admin_comment?: string | null
          created_at?: string
          email?: string | null
          id?: string
          messaggio: string
          pagina: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          timestamp?: string
          tipo: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          admin_comment?: string | null
          created_at?: string
          email?: string | null
          id?: string
          messaggio?: string
          pagina?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          timestamp?: string
          tipo?: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      impostazioni: {
        Row: {
          aliquote_iva: Json | null
          created_at: string | null
          email: string | null
          id: string
          indirizzo_sede: string | null
          metodi_pagamento: Json | null
          nome_azienda: string
          partita_iva: string | null
          telefono: string | null
          updated_at: string | null
        }
        Insert: {
          aliquote_iva?: Json | null
          created_at?: string | null
          email?: string | null
          id?: string
          indirizzo_sede?: string | null
          metodi_pagamento?: Json | null
          nome_azienda?: string
          partita_iva?: string | null
          telefono?: string | null
          updated_at?: string | null
        }
        Update: {
          aliquote_iva?: Json | null
          created_at?: string | null
          email?: string | null
          id?: string
          indirizzo_sede?: string | null
          metodi_pagamento?: Json | null
          nome_azienda?: string
          partita_iva?: string | null
          telefono?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      metodi_pagamento_spese: {
        Row: {
          created_at: string
          descrizione: string | null
          id: string
          nome: string
        }
        Insert: {
          created_at?: string
          descrizione?: string | null
          id?: string
          nome: string
        }
        Update: {
          created_at?: string
          descrizione?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      modalita_pagamenti: {
        Row: {
          attivo: boolean
          created_at: string
          id: string
          nome: string
        }
        Insert: {
          attivo?: boolean
          created_at?: string
          id?: string
          nome: string
        }
        Update: {
          attivo?: boolean
          created_at?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      movimenti_aziendali: {
        Row: {
          causale: string
          created_at: string
          created_by: string
          data: string
          effettuato_da_id: string | null
          id: string
          importo: number
          metodo_pagamento_id: string | null
          note: string | null
          servizio_id: string | null
          spesa_personale_id: string | null
          stato: Database["public"]["Enums"]["movimento_stato"] | null
          tipo: Database["public"]["Enums"]["movimento_tipo"]
          updated_at: string
        }
        Insert: {
          causale: string
          created_at?: string
          created_by: string
          data?: string
          effettuato_da_id?: string | null
          id?: string
          importo: number
          metodo_pagamento_id?: string | null
          note?: string | null
          servizio_id?: string | null
          spesa_personale_id?: string | null
          stato?: Database["public"]["Enums"]["movimento_stato"] | null
          tipo: Database["public"]["Enums"]["movimento_tipo"]
          updated_at?: string
        }
        Update: {
          causale?: string
          created_at?: string
          created_by?: string
          data?: string
          effettuato_da_id?: string | null
          id?: string
          importo?: number
          metodo_pagamento_id?: string | null
          note?: string | null
          servizio_id?: string | null
          spesa_personale_id?: string | null
          stato?: Database["public"]["Enums"]["movimento_stato"] | null
          tipo?: Database["public"]["Enums"]["movimento_tipo"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "movimenti_aziendali_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimenti_aziendali_effettuato_da_id_fkey"
            columns: ["effettuato_da_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimenti_aziendali_metodo_pagamento_id_fkey"
            columns: ["metodo_pagamento_id"]
            isOneToOne: false
            referencedRelation: "metodi_pagamento_spese"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimenti_aziendali_servizio_id_fkey"
            columns: ["servizio_id"]
            isOneToOne: false
            referencedRelation: "servizi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimenti_aziendali_spesa_personale_id_fkey"
            columns: ["spesa_personale_id"]
            isOneToOne: false
            referencedRelation: "spese_personali"
            referencedColumns: ["id"]
          },
        ]
      }
      passeggeri: {
        Row: {
          azienda_id: string
          cognome: string | null
          created_at: string
          email: string | null
          id: string
          indirizzo: string | null
          localita: string | null
          nome: string | null
          nome_cognome: string
          referente_id: string | null
          telefono: string | null
        }
        Insert: {
          azienda_id: string
          cognome?: string | null
          created_at?: string
          email?: string | null
          id?: string
          indirizzo?: string | null
          localita?: string | null
          nome?: string | null
          nome_cognome: string
          referente_id?: string | null
          telefono?: string | null
        }
        Update: {
          azienda_id?: string
          cognome?: string | null
          created_at?: string
          email?: string | null
          id?: string
          indirizzo?: string | null
          localita?: string | null
          nome?: string | null
          nome_cognome?: string
          referente_id?: string | null
          telefono?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "passeggeri_azienda_id_fkey"
            columns: ["azienda_id"]
            isOneToOne: false
            referencedRelation: "aziende"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "passeggeri_referente_id_fkey"
            columns: ["referente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          azienda_id: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          role: string
        }
        Insert: {
          azienda_id?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          role: string
        }
        Update: {
          azienda_id?: string | null
          email?: string | null
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
      reports: {
        Row: {
          azienda_id: string
          bucket_name: string | null
          created_at: string
          created_by: string
          data_fine: string
          data_inizio: string
          errore_messaggio: string | null
          id: string
          nome_file: string
          numero_servizi: number | null
          referente_id: string | null
          stato: string
          totale_documento: number | null
          totale_imponibile: number | null
          totale_iva: number | null
          updated_at: string
          url_file: string | null
        }
        Insert: {
          azienda_id: string
          bucket_name?: string | null
          created_at?: string
          created_by: string
          data_fine: string
          data_inizio: string
          errore_messaggio?: string | null
          id?: string
          nome_file: string
          numero_servizi?: number | null
          referente_id?: string | null
          stato?: string
          totale_documento?: number | null
          totale_imponibile?: number | null
          totale_iva?: number | null
          updated_at?: string
          url_file?: string | null
        }
        Update: {
          azienda_id?: string
          bucket_name?: string | null
          created_at?: string
          created_by?: string
          data_fine?: string
          data_inizio?: string
          errore_messaggio?: string | null
          id?: string
          nome_file?: string
          numero_servizi?: number | null
          referente_id?: string | null
          stato?: string
          totale_documento?: number | null
          totale_imponibile?: number | null
          totale_iva?: number | null
          updated_at?: string
          url_file?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_azienda_id_fkey"
            columns: ["azienda_id"]
            isOneToOne: false
            referencedRelation: "aziende"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_referente_id_fkey"
            columns: ["referente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      servizi: {
        Row: {
          assegnato_a: string | null
          azienda_id: string
          citta_destinazione: string | null
          citta_presa: string | null
          conducente_esterno: boolean | null
          conducente_esterno_email: string | null
          conducente_esterno_id: string | null
          conducente_esterno_nome: string | null
          consegna_contanti_a: string | null
          created_at: string
          created_by: string
          data_servizio: string
          firma_timestamp: string | null
          firma_url: string | null
          id: string
          incasso_previsto: number | null
          incasso_ricevuto: number | null
          indirizzo_destinazione: string
          indirizzo_presa: string
          iva: number | null
          metodo_pagamento: string
          note: string | null
          numero_commessa: string | null
          orario_servizio: string
          ore_effettive: number | null
          ore_fatturate: number | null
          ore_finali: number | null
          ore_lavorate: number | null
          referente_id: string
          stato: string
          veicolo_id: string | null
        }
        Insert: {
          assegnato_a?: string | null
          azienda_id: string
          citta_destinazione?: string | null
          citta_presa?: string | null
          conducente_esterno?: boolean | null
          conducente_esterno_email?: string | null
          conducente_esterno_id?: string | null
          conducente_esterno_nome?: string | null
          consegna_contanti_a?: string | null
          created_at?: string
          created_by: string
          data_servizio: string
          firma_timestamp?: string | null
          firma_url?: string | null
          id?: string
          incasso_previsto?: number | null
          incasso_ricevuto?: number | null
          indirizzo_destinazione?: string
          indirizzo_presa?: string
          iva?: number | null
          metodo_pagamento: string
          note?: string | null
          numero_commessa?: string | null
          orario_servizio?: string
          ore_effettive?: number | null
          ore_fatturate?: number | null
          ore_finali?: number | null
          ore_lavorate?: number | null
          referente_id: string
          stato?: string
          veicolo_id?: string | null
        }
        Update: {
          assegnato_a?: string | null
          azienda_id?: string
          citta_destinazione?: string | null
          citta_presa?: string | null
          conducente_esterno?: boolean | null
          conducente_esterno_email?: string | null
          conducente_esterno_id?: string | null
          conducente_esterno_nome?: string | null
          consegna_contanti_a?: string | null
          created_at?: string
          created_by?: string
          data_servizio?: string
          firma_timestamp?: string | null
          firma_url?: string | null
          id?: string
          incasso_previsto?: number | null
          incasso_ricevuto?: number | null
          indirizzo_destinazione?: string
          indirizzo_presa?: string
          iva?: number | null
          metodo_pagamento?: string
          note?: string | null
          numero_commessa?: string | null
          orario_servizio?: string
          ore_effettive?: number | null
          ore_fatturate?: number | null
          ore_finali?: number | null
          ore_lavorate?: number | null
          referente_id?: string
          stato?: string
          veicolo_id?: string | null
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
          {
            foreignKeyName: "servizi_conducente_esterno_id_fkey"
            columns: ["conducente_esterno_id"]
            isOneToOne: false
            referencedRelation: "conducenti_esterni"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "servizi_veicolo_id_fkey"
            columns: ["veicolo_id"]
            isOneToOne: false
            referencedRelation: "veicoli"
            referencedColumns: ["id"]
          },
        ]
      }
      servizi_passeggeri: {
        Row: {
          created_at: string
          destinazione_personalizzato: string | null
          id: string
          luogo_presa_personalizzato: string | null
          orario_presa_personalizzato: string | null
          passeggero_id: string
          servizio_id: string
          usa_indirizzo_personalizzato: boolean
        }
        Insert: {
          created_at?: string
          destinazione_personalizzato?: string | null
          id?: string
          luogo_presa_personalizzato?: string | null
          orario_presa_personalizzato?: string | null
          passeggero_id: string
          servizio_id: string
          usa_indirizzo_personalizzato?: boolean
        }
        Update: {
          created_at?: string
          destinazione_personalizzato?: string | null
          id?: string
          luogo_presa_personalizzato?: string | null
          orario_presa_personalizzato?: string | null
          passeggero_id?: string
          servizio_id?: string
          usa_indirizzo_personalizzato?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "servizi_passeggeri_passeggero_id_fkey"
            columns: ["passeggero_id"]
            isOneToOne: false
            referencedRelation: "passeggeri"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "servizi_passeggeri_servizio_id_fkey"
            columns: ["servizio_id"]
            isOneToOne: false
            referencedRelation: "servizi"
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
      spese_aziendali: {
        Row: {
          causale: string
          created_at: string
          created_by: string
          data_movimento: string
          id: string
          importo: number
          modalita_pagamento_id: string
          note: string | null
          socio_id: string | null
          stato_pagamento: string
          tipologia: string
        }
        Insert: {
          causale: string
          created_at?: string
          created_by: string
          data_movimento: string
          id?: string
          importo: number
          modalita_pagamento_id: string
          note?: string | null
          socio_id?: string | null
          stato_pagamento?: string
          tipologia: string
        }
        Update: {
          causale?: string
          created_at?: string
          created_by?: string
          data_movimento?: string
          id?: string
          importo?: number
          modalita_pagamento_id?: string
          note?: string | null
          socio_id?: string | null
          stato_pagamento?: string
          tipologia?: string
        }
        Relationships: [
          {
            foreignKeyName: "spese_aziendali_modalita_pagamento_id_fkey"
            columns: ["modalita_pagamento_id"]
            isOneToOne: false
            referencedRelation: "modalita_pagamenti"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spese_aziendali_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      spese_categorie: {
        Row: {
          created_at: string
          descrizione: string | null
          id: string
          nome: string
        }
        Insert: {
          created_at?: string
          descrizione?: string | null
          id?: string
          nome: string
        }
        Update: {
          created_at?: string
          descrizione?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      spese_dipendenti: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          causale: string
          converted_to_spesa_aziendale: boolean
          created_at: string
          data_spesa: string | null
          id: string
          importo: number
          note: string | null
          note_revisione: string | null
          registered_by: string
          stato: string | null
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          causale: string
          converted_to_spesa_aziendale?: boolean
          created_at?: string
          data_spesa?: string | null
          id?: string
          importo: number
          note?: string | null
          note_revisione?: string | null
          registered_by: string
          stato?: string | null
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          causale?: string
          converted_to_spesa_aziendale?: boolean
          created_at?: string
          data_spesa?: string | null
          id?: string
          importo?: number
          note?: string | null
          note_revisione?: string | null
          registered_by?: string
          stato?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spese_dipendenti_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spese_dipendenti_registered_by_fkey"
            columns: ["registered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spese_dipendenti_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      spese_personali: {
        Row: {
          causale: string
          convertita_aziendale: boolean | null
          created_at: string
          data: string
          id: string
          importo: number
          note: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          causale: string
          convertita_aziendale?: boolean | null
          created_at?: string
          data?: string
          id?: string
          importo: number
          note?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          causale?: string
          convertita_aziendale?: boolean | null
          created_at?: string
          data?: string
          id?: string
          importo?: number
          note?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spese_personali_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stipendi: {
        Row: {
          anno: number
          base_calcolo: number | null
          coefficiente_applicato: number | null
          created_at: string
          created_by: string
          id: string
          incassi_da_dipendenti: number | null
          mese: number
          note: string | null
          percentuale_su_totale: number | null
          riporto_mese_precedente: number | null
          stato: string
          tipo_calcolo: string
          totale_km: number | null
          totale_lordo: number | null
          totale_netto: number | null
          totale_ore_attesa: number | null
          totale_ore_lavorate: number | null
          totale_prelievi: number | null
          totale_spese: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          anno: number
          base_calcolo?: number | null
          coefficiente_applicato?: number | null
          created_at?: string
          created_by: string
          id?: string
          incassi_da_dipendenti?: number | null
          mese: number
          note?: string | null
          percentuale_su_totale?: number | null
          riporto_mese_precedente?: number | null
          stato?: string
          tipo_calcolo: string
          totale_km?: number | null
          totale_lordo?: number | null
          totale_netto?: number | null
          totale_ore_attesa?: number | null
          totale_ore_lavorate?: number | null
          totale_prelievi?: number | null
          totale_spese?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          anno?: number
          base_calcolo?: number | null
          coefficiente_applicato?: number | null
          created_at?: string
          created_by?: string
          id?: string
          incassi_da_dipendenti?: number | null
          mese?: number
          note?: string | null
          percentuale_su_totale?: number | null
          riporto_mese_precedente?: number | null
          stato?: string
          tipo_calcolo?: string
          totale_km?: number | null
          totale_lordo?: number | null
          totale_netto?: number | null
          totale_ore_attesa?: number | null
          totale_ore_lavorate?: number | null
          totale_prelievi?: number | null
          totale_spese?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stipendi_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tariffe_km: {
        Row: {
          anno: number
          created_at: string
          id: string
          km: number
          tariffa_base: number
        }
        Insert: {
          anno?: number
          created_at?: string
          id?: string
          km: number
          tariffa_base: number
        }
        Update: {
          anno?: number
          created_at?: string
          id?: string
          km?: number
          tariffa_base?: number
        }
        Relationships: []
      }
      user_deletion_backup: {
        Row: {
          altri_dati: Json | null
          created_at: string
          deleted_at: string
          deleted_by: string
          deleted_user_id: string
          id: string
          servizi_data: Json | null
          spese_data: Json | null
          stipendi_data: Json | null
          turni_data: Json | null
          user_data: Json | null
        }
        Insert: {
          altri_dati?: Json | null
          created_at?: string
          deleted_at?: string
          deleted_by: string
          deleted_user_id: string
          id?: string
          servizi_data?: Json | null
          spese_data?: Json | null
          stipendi_data?: Json | null
          turni_data?: Json | null
          user_data?: Json | null
        }
        Update: {
          altri_dati?: Json | null
          created_at?: string
          deleted_at?: string
          deleted_by?: string
          deleted_user_id?: string
          id?: string
          servizi_data?: Json | null
          spese_data?: Json | null
          stipendi_data?: Json | null
          turni_data?: Json | null
          user_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "user_deletion_backup_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      veicoli: {
        Row: {
          anno: number | null
          attivo: boolean
          colore: string | null
          created_at: string
          created_by: string
          id: string
          modello: string
          note: string | null
          numero_posti: number | null
          targa: string
          updated_at: string
        }
        Insert: {
          anno?: number | null
          attivo?: boolean
          colore?: string | null
          created_at?: string
          created_by: string
          id?: string
          modello: string
          note?: string | null
          numero_posti?: number | null
          targa: string
          updated_at?: string
        }
        Update: {
          anno?: number | null
          attivo?: boolean
          colore?: string | null
          created_at?: string
          created_by?: string
          id?: string
          modello?: string
          note?: string | null
          numero_posti?: number | null
          targa?: string
          updated_at?: string
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
      movimento_stato: "saldato" | "pending"
      movimento_tipo: "spesa" | "incasso" | "prelievo"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      movimento_stato: ["saldato", "pending"],
      movimento_tipo: ["spesa", "incasso", "prelievo"],
    },
  },
} as const
