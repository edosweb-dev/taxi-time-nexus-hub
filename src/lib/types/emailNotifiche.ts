export interface EmailNotifica {
  id: string;
  nome: string;
  email: string;
  attivo: boolean;
  created_at: string;
  created_by: string;
  note?: string;
}

export interface ServizioEmailNotifica {
  id: string;
  servizio_id: string;
  email_notifica_id: string;
  created_at: string;
}

export interface EmailNotificaFormData {
  nome: string;
  email: string;
  note?: string;
}