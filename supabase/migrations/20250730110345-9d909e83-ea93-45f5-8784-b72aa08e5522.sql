-- Cancellazione di tutti i turni del mese di agosto 2025
DELETE FROM public.shifts 
WHERE shift_date >= '2025-08-01' 
AND shift_date <= '2025-08-31';