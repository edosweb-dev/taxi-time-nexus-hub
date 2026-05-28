/** Extract city from a route segment like "VIA MONTANARA 10, LECCO" → "LECCO" */
export function extractCity(segment: string): string {
  const trimmed = segment.trim();
  const commaIdx = trimmed.lastIndexOf(',');
  if (commaIdx !== -1) {
    return trimmed.substring(commaIdx + 1).trim();
  }
  return trimmed;
}

/** Build a city-only route from the full percorso (separator " → ") */
export function buildCityRoute(percorso: string): string {
  if (!percorso) return '';
  const segments = percorso.split(' → ');
  if (segments.length === 0) return percorso;

  const firstCity = extractCity(segments[0]);
  const lastCity = extractCity(segments[segments.length - 1]);

  if (segments.length <= 2) {
    return `${firstCity} → ${lastCity}`;
  }

  const intermediateCities = segments.slice(1, -1).map(extractCity);
  return [firstCity, ...intermediateCities, lastCity].join(' → ');
}
