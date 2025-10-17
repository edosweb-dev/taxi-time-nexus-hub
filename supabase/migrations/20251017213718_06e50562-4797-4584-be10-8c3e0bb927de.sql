-- ============================================
-- FASE 2: Sistema Tariffe KM
-- Migration per tabella tariffe_km_fissi e estensione configurazione_stipendi
-- ============================================

-- 1. Estendi configurazione_stipendi con tariffa oltre 200km
ALTER TABLE public.configurazione_stipendi
ADD COLUMN IF NOT EXISTS tariffa_oltre_200km NUMERIC NOT NULL DEFAULT 0.25;

COMMENT ON COLUMN public.configurazione_stipendi.tariffa_oltre_200km IS 'Tariffa per km oltre i 200km (€/km)';

-- 2. Aggiorna configurazione anno 2025 se esiste
UPDATE public.configurazione_stipendi
SET tariffa_oltre_200km = 0.25
WHERE anno = 2025 AND tariffa_oltre_200km IS NULL;

-- 3. Inserisci configurazione 2025 se non esiste
INSERT INTO public.configurazione_stipendi (
  anno,
  coefficiente_aumento,
  tariffa_oraria_attesa,
  tariffa_oltre_200km
)
VALUES (2025, 1.17, 15.00, 0.25)
ON CONFLICT DO NOTHING;

-- 4. Crea tabella tariffe_km_fissi
CREATE TABLE IF NOT EXISTS public.tariffe_km_fissi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anno INTEGER NOT NULL,
  km INTEGER NOT NULL,
  importo_base NUMERIC NOT NULL,
  attivo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT tariffe_km_fissi_km_range CHECK (km >= 12 AND km <= 200),
  CONSTRAINT tariffe_km_fissi_importo_positive CHECK (importo_base > 0),
  CONSTRAINT tariffe_km_fissi_unique_anno_km UNIQUE (anno, km)
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_tariffe_km_fissi_anno ON public.tariffe_km_fissi(anno);
CREATE INDEX IF NOT EXISTS idx_tariffe_km_fissi_km ON public.tariffe_km_fissi(km);
CREATE INDEX IF NOT EXISTS idx_tariffe_km_fissi_attivo ON public.tariffe_km_fissi(attivo);

-- Trigger per updated_at
CREATE TRIGGER update_tariffe_km_fissi_updated_at
  BEFORE UPDATE ON public.tariffe_km_fissi
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 5. RLS Policies per tariffe_km_fissi
ALTER TABLE public.tariffe_km_fissi ENABLE ROW LEVEL SECURITY;

-- Admin e soci possono gestire tutto
CREATE POLICY "Admin e soci gestiscono tariffe km"
  ON public.tariffe_km_fissi
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'socio')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'socio')
    )
  );

-- Dipendenti possono solo leggere
CREATE POLICY "Dipendenti leggono tariffe km"
  ON public.tariffe_km_fissi
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'dipendente'
    )
  );

-- 6. Seed data anno 2025 (tariffe 12-200km a scaglioni di 5)
INSERT INTO public.tariffe_km_fissi (anno, km, importo_base, attivo) VALUES
  (2025, 12, 15.00, true),
  (2025, 15, 18.00, true),
  (2025, 20, 20.00, true),
  (2025, 25, 22.50, true),
  (2025, 30, 25.00, true),
  (2025, 35, 27.50, true),
  (2025, 40, 30.00, true),
  (2025, 45, 32.50, true),
  (2025, 50, 35.00, true),
  (2025, 55, 37.50, true),
  (2025, 60, 40.00, true),
  (2025, 65, 42.50, true),
  (2025, 70, 45.00, true),
  (2025, 75, 47.50, true),
  (2025, 80, 50.00, true),
  (2025, 85, 52.50, true),
  (2025, 90, 55.00, true),
  (2025, 95, 57.50, true),
  (2025, 100, 60.00, true),
  (2025, 105, 62.50, true),
  (2025, 110, 65.00, true),
  (2025, 115, 67.50, true),
  (2025, 120, 70.00, true),
  (2025, 125, 72.50, true),
  (2025, 130, 75.00, true),
  (2025, 135, 77.50, true),
  (2025, 140, 80.00, true),
  (2025, 145, 82.50, true),
  (2025, 150, 85.00, true),
  (2025, 155, 87.50, true),
  (2025, 160, 90.00, true),
  (2025, 165, 92.50, true),
  (2025, 170, 95.00, true),
  (2025, 175, 97.50, true),
  (2025, 180, 100.00, true),
  (2025, 185, 102.50, true),
  (2025, 190, 105.00, true),
  (2025, 195, 107.50, true),
  (2025, 200, 110.00, true)
ON CONFLICT (anno, km) DO NOTHING;