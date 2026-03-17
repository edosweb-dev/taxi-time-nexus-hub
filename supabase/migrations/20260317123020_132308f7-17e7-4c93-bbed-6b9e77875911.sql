
ALTER TABLE tariffe_km_fissi DROP CONSTRAINT tariffe_km_fissi_km_range;
ALTER TABLE tariffe_km_fissi ADD CONSTRAINT tariffe_km_fissi_km_range CHECK (km >= 0 AND km <= 200);

ALTER TABLE tariffe_km_fissi DROP CONSTRAINT tariffe_km_fissi_importo_positive;
ALTER TABLE tariffe_km_fissi ADD CONSTRAINT tariffe_km_fissi_importo_non_negative CHECK (importo_base >= 0);
