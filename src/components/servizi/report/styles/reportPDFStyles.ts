
import { StyleSheet } from '@react-pdf/renderer';

// Create styles
export const styles = StyleSheet.create({
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
