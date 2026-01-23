import { ReportPasseggeroRow } from '@/hooks/useReportPasseggeri';
import { format } from 'date-fns';

// Escape CSV field to handle commas, quotes, and newlines
function escapeCsvField(field: string | number | null | undefined): string {
  const str = String(field ?? '-');
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes(';')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export const exportReportPasseggeri = (
  data: ReportPasseggeroRow[],
  dataInizio: string,
  dataFine: string
) => {
  // Aggregate passengers by service (group by servizio_id)
  const serviziMap = new Map<string, {
    servizio_id: string;
    id_progressivo: string;
    data_servizio: string;
    referente_nome: string;
    passeggeri: string[];
    percorso: string;
    importo: number;
    ore_fatturate: number;
    note: string;
    stato: string;
  }>();

  data.forEach((row) => {
    const existing = serviziMap.get(row.servizio_id);
    
    if (existing) {
      // Add passenger to existing service
      if (row.passeggero_nome && row.passeggero_nome !== 'Nessun passeggero') {
        existing.passeggeri.push(row.passeggero_nome);
      }
    } else {
      // Create new service entry
      serviziMap.set(row.servizio_id, {
        servizio_id: row.servizio_id,
        id_progressivo: row.id_progressivo,
        data_servizio: row.data_servizio,
        referente_nome: row.referente_nome || '-',
        passeggeri: row.passeggero_nome && row.passeggero_nome !== 'Nessun passeggero'
          ? [row.passeggero_nome]
          : [],
        percorso: row.percorso,
        importo: row.importo,
        ore_fatturate: row.ore_fatturate || 0,
        note: row.note || '',
        stato: row.stato || '-'
      });
    }
  });

  // Convert map to array (already in chronological order from query)
  const aggregatedData = Array.from(serviziMap.values());

  // Create CSV header with correct columns
  const header = [
    'Referente',
    'Data',
    'Passeggero',
    'Percorso',
    'Importo',
    'Ore Attesa',
    'Note',
    'Stato',
  ].join(';');

  // Create CSV rows
  const rows = aggregatedData.map((servizio) => {
    const passeggeriAggregati = servizio.passeggeri.length > 0
      ? servizio.passeggeri.join(', ')
      : '-';

    return [
      escapeCsvField(servizio.referente_nome),
      escapeCsvField(format(new Date(servizio.data_servizio), 'dd/MM/yyyy')),
      escapeCsvField(passeggeriAggregati),
      escapeCsvField(servizio.percorso),
      escapeCsvField(`€${servizio.importo.toFixed(2)}`),
      escapeCsvField(servizio.ore_fatturate > 0 ? servizio.ore_fatturate.toString() : '-'),
      escapeCsvField(servizio.note || '-'),
      escapeCsvField(servizio.stato || '-'),
    ].join(';');
  });

  // Combine header and rows
  const csv = [header, ...rows].join('\n');

  // Create blob with BOM for UTF-8 (Excel compatibility)
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `report-passeggeri-${dataInizio}-${dataFine}.csv`
  );
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
