-- Add "extra" to the shift_type enum
-- First, let's check if there are any existing constraints and update them
-- Since shift_type is character varying, we need to ensure validation allows "extra"

-- Add a check constraint to ensure valid shift types
ALTER TABLE public.shifts 
DROP CONSTRAINT IF EXISTS shifts_shift_type_check;

ALTER TABLE public.shifts 
ADD CONSTRAINT shifts_shift_type_check 
CHECK (shift_type IN ('specific_hours', 'full_day', 'half_day', 'sick_leave', 'unavailable', 'extra'));