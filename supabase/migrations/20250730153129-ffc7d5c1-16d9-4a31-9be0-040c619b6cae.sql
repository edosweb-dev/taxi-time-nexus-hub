-- Cancellazione massiva dei turni da Luglio a Dicembre 2025
-- ATTENZIONE: Questa operazione è irreversibile

DELETE FROM public.shifts 
WHERE shift_date >= '2025-07-01' 
AND shift_date <= '2025-12-31';