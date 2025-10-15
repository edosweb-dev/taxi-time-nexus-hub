-- ============================================================================
-- Migration: Aggiungi referente_id a email_notifiche per isolamento dati
-- Priorità: P0 - Security/GDPR compliance
-- ============================================================================

-- Step 1: Aggiungi colonna (nullable per retro-compatibilità)
ALTER TABLE email_notifiche 
ADD COLUMN IF NOT EXISTS referente_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- Step 2: Crea indice per performance query filtrate
CREATE INDEX IF NOT EXISTS idx_email_notifiche_referente_id 
ON email_notifiche(referente_id);

-- Step 3: Crea indice composito per query comuni (azienda + referente)
CREATE INDEX IF NOT EXISTS idx_email_notifiche_azienda_referente 
ON email_notifiche(azienda_id, referente_id);

-- Step 4: Aggiungi commento documentazione
COMMENT ON COLUMN email_notifiche.referente_id IS 
'ID del referente (cliente) che ha creato questa email notifica. Usato per isolamento dati tra referenti della stessa azienda (GDPR compliance). NULL per email create da admin (accessibili a tutti i referenti dell azienda).';

-- Step 5: NON aggiornare dati esistenti
-- I 5 record storici creati da admin resteranno con referente_id = NULL
-- Questo è corretto: email admin-created sono condivise nell'azienda
-- I nuovi record creati da referenti avranno referente_id popolato

-- Step 6: Log migration
DO $$
BEGIN
  RAISE NOTICE 'Migration completata: referente_id aggiunto a email_notifiche';
  RAISE NOTICE 'Righe esistenti (referente_id NULL, ok): %', (SELECT COUNT(*) FROM email_notifiche WHERE referente_id IS NULL);
  RAISE NOTICE 'Indici creati: idx_email_notifiche_referente_id, idx_email_notifiche_azienda_referente';
END $$;