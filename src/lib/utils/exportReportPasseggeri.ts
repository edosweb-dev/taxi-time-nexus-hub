import { ReportPasseggeroRow } from '@/hooks/useReportPasseggeri';
import { format } from 'date-fns';

export const exportReportPasseggeri = (
  data: ReportPasseggeroRow[],
  dataInizio: string,
  dataFine: string
) => {
  // Create CSV header
  const header = [
    'ID',
    'Data',
    'Orario',
    'Passeggero',
    'Azienda',
    'Indirizzo Presa',
    'Indirizzo Destinazione',
    'Nr Passeggeri',
    'Metodo Pagamento',
    'Importo',
    'Stato',
  ].join(';');

  // Create CSV rows
  const rows = data.map((row) => {
    return [
      row.id_progressivo,
      format(new Date(row.data_servizio), 'dd/MM/yyyy'),
      row.orario_servizio.substring(0, 5),
      row.passeggero_nome,
      row.azienda_nome || '',
      row.indirizzo_presa,
      row.indirizzo_destinazione,
      row.nr_passeggeri_totale,
      row.metodo_pagamento,
      row.importo.toFixed(2),
      row.stato,
    ]
      .map((cell) => `"${cell}"`)
      .join(';');
  });

  // Combine header and rows
  const csv = [header, ...rows].join('\n');

  // Create blob and download
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
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
