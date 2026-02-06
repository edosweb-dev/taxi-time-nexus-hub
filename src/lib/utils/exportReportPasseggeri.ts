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
  // Data is already aggregated by service (one row per service)
  // Create CSV header with correct columns
  const header = [
    'Referente',
    'Data',
    'N° Passeggeri',
    'Passeggeri',
    'Percorso',
    'Importo',
    'Ore Attesa',
    'Note',
    'Stato',
  ].join(';');

  // Create CSV rows
  const rows = data.map((row) => {
    return [
      escapeCsvField(row.referente_nome || '-'),
      escapeCsvField(format(new Date(row.data_servizio), 'dd/MM/yyyy')),
      escapeCsvField(row.num_passeggeri.toString()),
      escapeCsvField(row.passeggeri_nomi || '-'),
      escapeCsvField(row.percorso),
      escapeCsvField(`€${row.importo.toFixed(2)}`),
      escapeCsvField(row.ore_fatturate > 0 ? row.ore_fatturate.toString() : '-'),
      escapeCsvField(row.note || '-'),
      escapeCsvField(row.stato || '-'),
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
