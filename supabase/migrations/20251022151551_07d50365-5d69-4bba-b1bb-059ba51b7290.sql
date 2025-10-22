-- Pulizia database: eliminazione dati da tabelle servizi, shifts e spese_aziendali

-- Prima elimino i record correlati ai servizi dalla tabella servizi_passeggeri
DELETE FROM servizi_passeggeri;

-- Elimino tutti i servizi
DELETE FROM servizi;

-- Elimino tutti i turni
DELETE FROM shifts;

-- Elimino tutte le spese aziendali
DELETE FROM spese_aziendali;