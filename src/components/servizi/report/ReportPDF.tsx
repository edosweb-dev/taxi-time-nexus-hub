
import React, { useEffect } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { Servizio } from '@/lib/types/servizi';
import { Profile, Azienda } from '@/lib/types';
import { getUserName } from '@/components/servizi/utils/userUtils';
import { formatCurrency } from '@/components/servizi/utils/formatUtils';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 40,
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: 'bold',
  },
  companyInfo: {
    fontSize: 12,
    marginBottom: 10,
  },
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  tableHeaderCell: {
    padding: 4,
    fontSize: 10,
    fontWeight: 'bold',
    borderRightWidth: 1,
    borderRightColor: '#000',
  },
  tableCell: {
    padding: 4,
    fontSize: 8,
    borderRightWidth: 1,
    borderRightColor: '#000',
  },
  cellDate: { width: '8%' },
  cellTime: { width: '8%' },
  cellPickup: { width: '15%' },
  cellDestination: { width: '15%' },
  cellPassengers: { width: '5%' },
  cellDriver: { width: '10%' },
  cellPayment: { width: '8%' },
  cellCommessa: { width: '8%' },
  cellHours: { width: '5%' },
  cellAmount: { width: '8%' },
  cellSignature: { width: '10%' },
  lastCell: {
    borderRightWidth: 0,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  signatureImage: {
    width: 80,
    height: 30,
    objectFit: 'contain',
  },
  footerText: {
    fontSize: 8,
    textAlign: 'center',
    marginTop: 10,
    color: '#666',
  },
});

interface ReportPDFProps {
  servizi: Servizio[];
  passeggeriCounts: Record<string, number>;
  azienda: Azienda | null;
  referenteName: string;
  month: number;
  year: number;
  users: Profile[];
}

const ReportPDF: React.FC<ReportPDFProps> = ({
  servizi,
  passeggeriCounts,
  azienda,
  referenteName,
  month,
  year,
  users,
}) => {
  if (!azienda) return null;

  const monthName = new Intl.DateTimeFormat('it-IT', { month: 'long' }).format(new Date(year, month - 1));
  const totalAmount = servizi.reduce((sum, servizio) => sum + (servizio.incasso_previsto || 0), 0);
  const totalHours = servizi.reduce((sum, servizio) => sum + (servizio.ore_finali || 0), 0);
  
  return (
    <PDFViewer width="100%" height={600} style={{ border: 'none' }}>
      <Document>
        <Page size="A4" orientation="landscape" style={styles.page}>
          <View style={styles.header}>
            <View>
              {/* Logo placeholder - replace with your actual logo */}
              <Image 
                src="/taxitime-logo.png" 
                style={styles.logo} 
              />
            </View>
            <View>
              <Text style={styles.title}>Report Servizi - {monthName} {year}</Text>
            </View>
          </View>

          <View style={styles.companyInfo}>
            <Text>Azienda: {azienda.nome}</Text>
            <Text>Referente: {referenteName}</Text>
            <Text>Data generazione: {format(new Date(), 'dd/MM/yyyy')}</Text>
          </View>

          <View style={styles.table}>
            {/* Table Headers */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableHeaderCell, styles.cellDate]}>Data</Text>
              <Text style={[styles.tableHeaderCell, styles.cellTime]}>Orario</Text>
              <Text style={[styles.tableHeaderCell, styles.cellPickup]}>Partenza</Text>
              <Text style={[styles.tableHeaderCell, styles.cellDestination]}>Destinazione</Text>
              <Text style={[styles.tableHeaderCell, styles.cellPassengers]}>Pass.</Text>
              <Text style={[styles.tableHeaderCell, styles.cellDriver]}>Autista</Text>
              <Text style={[styles.tableHeaderCell, styles.cellPayment]}>Pagamento</Text>
              <Text style={[styles.tableHeaderCell, styles.cellCommessa]}>Commessa</Text>
              <Text style={[styles.tableHeaderCell, styles.cellHours]}>Ore</Text>
              <Text style={[styles.tableHeaderCell, styles.cellAmount]}>Importo</Text>
              <Text style={[styles.tableHeaderCell, styles.cellSignature, styles.lastCell]}>Firma</Text>
            </View>

            {/* Table Rows */}
            {servizi.map((servizio) => (
              <View key={servizio.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.cellDate]}>{format(new Date(servizio.data_servizio), 'dd/MM/yyyy')}</Text>
                <Text style={[styles.tableCell, styles.cellTime]}>{servizio.orario_servizio.substring(0, 5)}</Text>
                <Text style={[styles.tableCell, styles.cellPickup]}>{servizio.indirizzo_presa}</Text>
                <Text style={[styles.tableCell, styles.cellDestination]}>{servizio.indirizzo_destinazione}</Text>
                <Text style={[styles.tableCell, styles.cellPassengers]}>{passeggeriCounts[servizio.id] || 0}</Text>
                <Text style={[styles.tableCell, styles.cellDriver]}>
                  {servizio.conducente_esterno 
                    ? servizio.conducente_esterno_nome 
                    : getUserName(users, servizio.assegnato_a) || 'Non assegnato'}
                </Text>
                <Text style={[styles.tableCell, styles.cellPayment]}>{servizio.metodo_pagamento}</Text>
                <Text style={[styles.tableCell, styles.cellCommessa]}>{servizio.numero_commessa || '-'}</Text>
                <Text style={[styles.tableCell, styles.cellHours]}>{servizio.ore_finali || '-'}</Text>
                <Text style={[styles.tableCell, styles.cellAmount]}>{formatCurrency(servizio.incasso_previsto)}</Text>
                <View style={[styles.tableCell, styles.cellSignature, styles.lastCell]}>
                  {servizio.firma_url && (
                    <Image src={servizio.firma_url} style={styles.signatureImage} />
                  )}
                </View>
              </View>
            ))}
          </View>

          <View style={styles.summary}>
            <Text style={styles.summaryText}>Totale servizi: {servizi.length}</Text>
            <Text style={styles.summaryText}>Totale ore: {totalHours.toFixed(1)}</Text>
            <Text style={styles.summaryText}>Totale: {formatCurrency(totalAmount)}</Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>TaxiTime - Report generato il {format(new Date(), 'dd/MM/yyyy HH:mm')}</Text>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default ReportPDF;
