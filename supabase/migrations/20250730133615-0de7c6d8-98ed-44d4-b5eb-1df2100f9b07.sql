-- Rimuovi TUTTI i duplicati da TUTTI i mesi (non solo luglio)
WITH duplicates AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, shift_date, shift_type, start_time, end_time, half_day_type 
      ORDER BY created_at DESC
    ) as row_num
  FROM shifts 
  WHERE shift_date >= '2025-01-01' 
    AND shift_date <= '2025-12-31'
)
DELETE FROM shifts 
WHERE id IN (
  SELECT id 
  FROM duplicates 
  WHERE row_num > 1
);