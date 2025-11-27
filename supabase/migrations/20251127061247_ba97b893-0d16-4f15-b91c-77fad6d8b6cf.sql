-- =====================================================
-- Performance Indexes per Query Frequenti
-- Data: 27 Novembre 2025
-- =====================================================

-- Indice su servizi.assegnato_a (filtro per dipendente assegnato)
CREATE INDEX IF NOT EXISTS idx_servizi_assegnato_a 
ON servizi(assegnato_a);

-- Indice su servizi.referente_id (filtro per referente)
CREATE INDEX IF NOT EXISTS idx_servizi_referente_id 
ON servizi(referente_id);

-- Indice composito su shifts per query calendario (data + utente)
CREATE INDEX IF NOT EXISTS idx_shifts_date_user 
ON shifts(shift_date, user_id);

-- Indice composito su servizi per dashboard (data + stato)
CREATE INDEX IF NOT EXISTS idx_servizi_data_stato 
ON servizi(data_servizio, stato);

-- Indice su servizi.azienda_id (filtro per azienda)
CREATE INDEX IF NOT EXISTS idx_servizi_azienda_id 
ON servizi(azienda_id);

-- Indice su spese_dipendenti.user_id (filtro spese per utente)
CREATE INDEX IF NOT EXISTS idx_spese_dipendenti_user_id 
ON spese_dipendenti(user_id);