import { ReportPasseggeroRow } from '@/hooks/useReportPasseggeri';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportPdfOptions {
  dataInizio: string;
  dataFine: string;
  aziendaNome?: string;
  referenteNome?: string;
}

export const exportReportPasseggeriPdf = (
  data: ReportPasseggeroRow[],
  options: ExportPdfOptions
) => {
  const { dataInizio, dataFine, aziendaNome, referenteNome } = options;

  // Data is already aggregated by service (one row per service)
  // Create PDF
  const doc = new jsPDF();

  // Title
  doc.setFontSize(16);
  doc.text('Report Passeggeri', 14, 15);

  // Subtitle with period
  doc.setFontSize(10);
  let yPos = 22;
  doc.text(`Periodo: ${format(new Date(dataInizio), 'dd/MM/yyyy')} - ${format(new Date(dataFine), 'dd/MM/yyyy')}`, 14, yPos);
  
  if (aziendaNome) {
    yPos += 6;
    doc.text(`Azienda: ${aziendaNome}`, 14, yPos);
  }
  
  if (referenteNome) {
    yPos += 6;
    doc.text(`Referente: ${referenteNome}`, 14, yPos);
  }

  // Table
  autoTable(doc, {
    startY: yPos + 10,
    head: [['Referente', 'Data', 'N°', 'Passeggeri', 'Percorso', 'Importo', 'Ore', 'Note', 'Stato']],
    body: data.map(row => [
      row.referente_nome || '-',
      format(new Date(row.data_servizio), 'dd/MM/yyyy'),
      row.num_passeggeri.toString(),
      row.passeggeri_nomi || '-',
      row.percorso || '-',
      `€${row.importo.toFixed(2)}`,
      row.ore_fatturate > 0 ? row.ore_fatturate.toString() : '-',
      row.note || '-',
      row.stato
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [66, 66, 66] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      2: { cellWidth: 10 }, // N° Passeggeri - narrow
      4: { cellWidth: 35 }, // Percorso - wider
      7: { cellWidth: 20 }, // Note
    }
  });

  // Footer totals
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  const totaleImporto = data.reduce((sum, s) => sum + (s.importo || 0), 0);
  const totaleOre = data.reduce((sum, s) => sum + (s.ore_fatturate || 0), 0);
  const totalePasseggeri = data.reduce((sum, s) => sum + (s.num_passeggeri || 0), 0);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Totale: ${data.length} servizi (${totalePasseggeri} passeggeri)`, 14, finalY);
  doc.text(`Importo totale: €${totaleImporto.toFixed(2)}`, 14, finalY + 6);
  doc.text(`Ore attesa totali: ${totaleOre.toFixed(1)}h`, 14, finalY + 12);

  // Download
  doc.save(`report-passeggeri-${dataInizio}-${dataFine}.pdf`);
};
