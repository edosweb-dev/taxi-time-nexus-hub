-- Aggiunge il nuovo campo per salvare il NETTO separatamente
ALTER TABLE servizi ADD COLUMN incasso_netto_previsto NUMERIC DEFAULT NULL;

-- Popola i dati esistenti scorporando l'IVA dal lordo
UPDATE servizi 
SET incasso_netto_previsto = CASE 
  WHEN iva > 0 THEN ROUND(incasso_previsto / (1 + iva / 100), 2)
  ELSE incasso_previsto
END
WHERE incasso_previsto IS NOT NULL;

-- Documenta la semantica dei campi
COMMENT ON COLUMN servizi.incasso_netto_previsto IS 'Importo NETTO (senza IVA) inserito dall utente';
COMMENT ON COLUMN servizi.incasso_previsto IS 'Importo LORDO (con IVA) = netto × (1 + iva/100)';