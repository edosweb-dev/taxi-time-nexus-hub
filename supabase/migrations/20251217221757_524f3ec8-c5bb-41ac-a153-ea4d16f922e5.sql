-- Corregge tutti i servizi esistenti con IVA 22% a 10%
UPDATE servizi 
SET iva = 10 
WHERE iva = 22;