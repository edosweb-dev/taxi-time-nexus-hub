-- Fix servizi con assegnato_a valorizzato ma stato ancora 'da_assegnare'
UPDATE servizi 
SET stato = 'assegnato' 
WHERE (assegnato_a IS NOT NULL OR conducente_esterno_id IS NOT NULL)
  AND stato = 'da_assegnare';