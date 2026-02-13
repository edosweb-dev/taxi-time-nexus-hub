import { ReportPasseggeroRow } from '@/hooks/useReportPasseggeri';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cleanupFirmaUrl } from '@/components/servizi/utils/firmaUtils';

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

/**
 * Scarica un'immagine da URL e la converte in dataURL per jsPDF
 */
async function fetchImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const cleanUrl = cleanupFirmaUrl(url);
    const cacheBustUrl = `${cleanUrl}?v=${Date.now()}`;
    
    const response = await fetch(cacheBustUrl, {
      mode: 'cors',
      credentials: 'omit',
    });
    
    if (!response.ok) {
      console.warn('Errore download firma per PDF:', response.status, url);
      return null;
    }
    
    const blob = await response.blob();
    if (blob.size < 100) {
      console.warn('Firma troppo piccola, saltata:', blob.size);
      return null;
    }
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Errore fetch firma per PDF:', error);
    return null;
  }
}

export const exportReportPasseggeriPdf = async (
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
      0: { cellWidth: 28 },
      1: { cellWidth: 22 },
      2: { cellWidth: 12, halign: 'center' },
      3: { cellWidth: 55 },
      4: { cellWidth: 60 },
      5: { cellWidth: 20, halign: 'right' },
      6: { cellWidth: 15, halign: 'center' },
      7: { cellWidth: 35 },
      8: { cellWidth: 22, halign: 'center' },
    }
  });

  // Footer totals
  let finalY = (doc as any).lastAutoTable.finalY + 8;
  const totaleImporto = data.reduce((sum, s) => sum + (s.importo || 0), 0);
  const totaleOre = data.reduce((sum, s) => sum + (s.ore_fatturate || 0), 0);
  const totalePasseggeri = data.reduce((sum, s) => sum + (s.num_passeggeri || 0), 0);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Totale: ${data.length} servizi (${totalePasseggeri} passeggeri)  |  Importo: €${totaleImporto.toFixed(2)}  |  Ore attesa: ${totaleOre.toFixed(1)}h`, 14, finalY);

  // Sezione Firme Digitali
  const serviziConFirma = data.filter(row => row.firma_url && row.firma_url.trim() !== '');
  
  if (serviziConFirma.length > 0) {
    // Nuova pagina per le firme
    doc.addPage();
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Firme Digitali', 14, 15);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`${serviziConFirma.length} servizi con firma digitale`, 14, 21);
    
    let firmaY = 30;
    const pageHeight = 200; // margine inferiore landscape A4
    
    for (const row of serviziConFirma) {
      // Controlla spazio pagina
      if (firmaY + 40 > pageHeight) {
        doc.addPage();
        firmaY = 15;
      }
      
      // Header servizio
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      const label = `${row.id_progressivo} - ${format(new Date(row.data_servizio), 'dd/MM/yyyy')} - ${row.passeggeri_nomi || 'N/D'}`;
      doc.text(label, 14, firmaY);
      firmaY += 5;
      
      // Download e render firma
      const dataUrl = await fetchImageAsDataUrl(row.firma_url!);
      
      if (dataUrl) {
        try {
          doc.addImage(dataUrl, 'PNG', 14, firmaY, 60, 20);
          firmaY += 25;
        } catch (imgErr) {
          console.error('Errore addImage firma:', imgErr);
          doc.setFontSize(7);
          doc.setFont('helvetica', 'italic');
          doc.text('(Errore rendering firma)', 14, firmaY);
          firmaY += 5;
        }
      } else {
        doc.setFontSize(7);
        doc.setFont('helvetica', 'italic');
        doc.text('(Firma non disponibile)', 14, firmaY);
        firmaY += 5;
      }
      
      // Linea separatrice
      doc.setDrawColor(200, 200, 200);
      doc.line(14, firmaY, 283, firmaY);
      firmaY += 5;
    }
  }

  // Download
  doc.save(`report-passeggeri-${dataInizio}-${dataFine}.pdf`);
};
