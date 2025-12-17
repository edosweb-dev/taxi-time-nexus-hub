-- Aggiungi F24 come metodo di pagamento
INSERT INTO modalita_pagamenti (nome, attivo) 
VALUES ('F24', true)
ON CONFLICT (nome) DO NOTHING;