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

// Sanitizza percorso - sostituisce caratteri non supportati dal font Helvetica
const sanitizePercorso = (percorso: string): string => {
  if (!percorso) return '-';
  return percorso
    .replace(/→/g, '->')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, '')
    .trim() || '-';
};

export const exportReportPasseggeriPdf = (
  data: ReportPasseggeroRow[],
  options: ExportPdfOptions
) => {
  const { dataInizio, dataFine, aziendaNome, referenteNome } = options;

  // Landscape per più spazio orizzontale (297mm vs 210mm)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Title
  doc.setFontSize(14);
  doc.text('Report Passeggeri', 14, 15);

  // Subtitle with period
  doc.setFontSize(9);
  let yPos = 22;
  doc.text(`Periodo: ${format(new Date(dataInizio), 'dd/MM/yyyy')} - ${format(new Date(dataFine), 'dd/MM/yyyy')}`, 14, yPos);
  
  if (aziendaNome) {
    yPos += 5;
    doc.text(`Azienda: ${aziendaNome}`, 14, yPos);
  }
  
  if (referenteNome) {
    yPos += 5;
    doc.text(`Referente: ${referenteNome}`, 14, yPos);
  }

  // Table
  autoTable(doc, {
    startY: yPos + 8,
    head: [['Referente', 'Data', 'N°', 'Passeggeri', 'Percorso', 'Importo', 'Ore', 'Note', 'Stato']],
    body: data.map(row => [
      row.referente_nome || '-',
      format(new Date(row.data_servizio), 'dd/MM/yyyy'),
      row.num_passeggeri.toString(),
      row.passeggeri_nomi || '-',
      sanitizePercorso(row.percorso),
      `€${row.importo.toFixed(2)}`,
      row.ore_fatturate > 0 ? row.ore_fatturate.toString() : '-',
      row.note || '-',
      row.stato
    ]),
    styles: { 
      fontSize: 7, 
      cellPadding: 1.5,
      overflow: 'linebreak',
      minCellHeight: 8
    },
    headStyles: { 
      fillColor: [66, 66, 66],
      fontSize: 7,
      fontStyle: 'bold',
      halign: 'center'
    },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    columnStyles: {
      0: { cellWidth: 28 },   // Referente
      1: { cellWidth: 22 },   // Data
      2: { cellWidth: 12, halign: 'center' },  // N° Pass
      3: { cellWidth: 55 },   // Passeggeri
      4: { cellWidth: 60 },   // Percorso
      5: { cellWidth: 20, halign: 'right' },   // Importo
      6: { cellWidth: 15, halign: 'center' },  // Ore
      7: { cellWidth: 35 },   // Note
      8: { cellWidth: 22, halign: 'center' },  // Stato
    }
  });

  // Footer totals
  const finalY = (doc as any).lastAutoTable.finalY + 8;
  const totaleImporto = data.reduce((sum, s) => sum + (s.importo || 0), 0);
  const totaleOre = data.reduce((sum, s) => sum + (s.ore_fatturate || 0), 0);
  const totalePasseggeri = data.reduce((sum, s) => sum + (s.num_passeggeri || 0), 0);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Totale: ${data.length} servizi (${totalePasseggeri} passeggeri)  |  Importo: €${totaleImporto.toFixed(2)}  |  Ore attesa: ${totaleOre.toFixed(1)}h`, 14, finalY);

  // Download
  doc.save(`report-passeggeri-${dataInizio}-${dataFine}.pdf`);
};
