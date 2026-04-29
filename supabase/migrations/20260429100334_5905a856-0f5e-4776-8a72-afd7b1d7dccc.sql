CREATE TRIGGER trg_impostazioni_set_updated_at
BEFORE UPDATE ON public.impostazioni
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();