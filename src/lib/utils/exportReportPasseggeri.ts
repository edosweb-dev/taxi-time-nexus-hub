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
    'Passeggero',
    'Percorso',
    'Importo',
    'Consegna',
    'Stato',
  ].join(';');

  // Create CSV rows
  const rows = data.map((row) => {
    const consegna = row.metodo_pagamento === 'Contanti' 
      ? (row.consegnato_a_nome || 'NON CONSEGNATO')
      : '-';
    
    return [
      row.id_progressivo,
      format(new Date(row.data_servizio), 'dd/MM/yyyy'),
      row.passeggero_nome,
      row.percorso,
      row.importo.toFixed(2),
      consegna,
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
