-- Cancella tutti i turni di Luglio 2025 (seconda esecuzione)
DELETE FROM public.shifts 
WHERE shift_date >= '2025-07-01' 
AND shift_date <= '2025-07-31';