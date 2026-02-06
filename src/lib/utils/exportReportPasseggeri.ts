import { ReportPasseggeroRow } from '@/hooks/useReportPasseggeri';
import { format } from 'date-fns';

interface ExportCsvOptions {
  dataInizio: string;
  dataFine: string;
  aziendaFiltrata?: {
    id: string;
    nome: string;
    firma_digitale_attiva: boolean;
  } | null;
}

// Escape CSV field to handle commas, quotes, and newlines
function escapeCsvField(field: string | number | null | undefined): string {
  const str = String(field ?? '-');
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes(';')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Sanitizza testo per CSV - rimuove caratteri non supportati
const sanitizeForCsv = (text: string): string => {
  if (!text) return '-';
  return text
    .replace(/→/g, '->')           // Freccia Unicode
    .replace(/€/g, '')             // Simbolo euro
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, '')  // Altri caratteri non-latin
    .trim() || '-';
};

export const exportReportPasseggeri = (
  data: ReportPasseggeroRow[],
  dataInizio: string,
  dataFine: string,
  aziendaFiltrata?: { id: string; nome: string; firma_digitale_attiva: boolean } | null
) => {
  // Determina quali colonne mostrare in base al filtro azienda
  const mostraCommessa = !aziendaFiltrata || !aziendaFiltrata.firma_digitale_attiva;
  const mostraFirma = !aziendaFiltrata || aziendaFiltrata.firma_digitale_attiva;

  // Header dinamico - RIMOSSO "Stato"
  const headerColumns = [
    'Referente',
    'Data',
    'N° Passeggeri',
    'Passeggeri',
    'Percorso',
    'Importo',
    'Ore Attesa',
    'Note',
  ];

  // Aggiungi colonne condizionali
  if (mostraCommessa) headerColumns.push('N° Commessa');
  if (mostraFirma) headerColumns.push('Firma');

  const header = headerColumns.join(';');

  // Create CSV rows con logica condizionale
  const rows = data.map((row) => {
    const baseColumns = [
      escapeCsvField(row.referente_nome || '-'),
      escapeCsvField(format(new Date(row.data_servizio), 'dd/MM/yyyy')),
      escapeCsvField(row.num_passeggeri.toString()),
      escapeCsvField(row.passeggeri_nomi || '-'),
      escapeCsvField(sanitizeForCsv(row.percorso)),
      escapeCsvField(row.importo.toFixed(2)),  // Senza simbolo €
      escapeCsvField(row.ore_fatturate > 0 ? row.ore_fatturate.toString() : '-'),
      escapeCsvField(row.note || '-'),
    ];

    // Aggiungi colonne condizionali
    if (mostraCommessa) {
      baseColumns.push(escapeCsvField(row.numero_commessa || '-'));
    }
    if (mostraFirma) {
      const firmaValue = row.firma_url ? 'Sì' : 'No';
      baseColumns.push(escapeCsvField(firmaValue));
    }

    return baseColumns.join(';');
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
