-- Cancella tutti i turni da luglio a novembre 2025
DELETE FROM shifts 
WHERE shift_date >= '2025-07-01' 
  AND shift_date <= '2025-11-30';