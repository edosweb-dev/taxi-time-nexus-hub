-- Add color field to profiles table for employee color coding
ALTER TABLE public.profiles 
ADD COLUMN color TEXT DEFAULT NULL;

-- Create a function to auto-assign colors to employees
CREATE OR REPLACE FUNCTION public.assign_employee_color()
RETURNS TRIGGER AS $$
DECLARE
    colors TEXT[] := ARRAY[
        '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', 
        '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
        '#14B8A6', '#F472B6', '#A855F7', '#22C55E', '#FB7185'
    ];
    assigned_colors TEXT[];
    new_color TEXT;
BEGIN
    -- Only assign color for employees (admin, socio, dipendente)
    IF NEW.role IN ('admin', 'socio', 'dipendente') AND NEW.color IS NULL THEN
        -- Get already assigned colors for employees
        SELECT ARRAY_AGG(color) INTO assigned_colors
        FROM public.profiles 
        WHERE role IN ('admin', 'socio', 'dipendente') 
        AND color IS NOT NULL;
        
        -- Find first available color
        FOR i IN 1..array_length(colors, 1) LOOP
            IF assigned_colors IS NULL OR NOT (colors[i] = ANY(assigned_colors)) THEN
                new_color := colors[i];
                EXIT;
            END IF;
        END LOOP;
        
        -- If all colors are used, pick a random one
        IF new_color IS NULL THEN
            new_color := colors[1 + (EXTRACT(EPOCH FROM NOW())::INTEGER % array_length(colors, 1))];
        END IF;
        
        NEW.color := new_color;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-assign colors
CREATE TRIGGER assign_employee_color_trigger
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.assign_employee_color();

-- Assign colors to existing employees
UPDATE public.profiles 
SET color = (
    CASE 
        WHEN id = (SELECT id FROM public.profiles WHERE role IN ('admin', 'socio', 'dipendente') ORDER BY first_name LIMIT 1 OFFSET 0) THEN '#3B82F6'
        WHEN id = (SELECT id FROM public.profiles WHERE role IN ('admin', 'socio', 'dipendente') ORDER BY first_name LIMIT 1 OFFSET 1) THEN '#EF4444'
        WHEN id = (SELECT id FROM public.profiles WHERE role IN ('admin', 'socio', 'dipendente') ORDER BY first_name LIMIT 1 OFFSET 2) THEN '#10B981'
        WHEN id = (SELECT id FROM public.profiles WHERE role IN ('admin', 'socio', 'dipendente') ORDER BY first_name LIMIT 1 OFFSET 3) THEN '#F59E0B'
        WHEN id = (SELECT id FROM public.profiles WHERE role IN ('admin', 'socio', 'dipendente') ORDER BY first_name LIMIT 1 OFFSET 4) THEN '#8B5CF6'
        WHEN id = (SELECT id FROM public.profiles WHERE role IN ('admin', 'socio', 'dipendente') ORDER BY first_name LIMIT 1 OFFSET 5) THEN '#EC4899'
        ELSE '#3B82F6'
    END
)
WHERE role IN ('admin', 'socio', 'dipendente') AND color IS NULL;