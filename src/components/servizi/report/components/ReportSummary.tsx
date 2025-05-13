
import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { styles } from '../styles/reportPDFStyles';
import { Servizio } from '@/lib/types/servizi';
import { formatCurrency } from '@/components/servizi/utils/formatUtils';

interface ReportSummaryProps {
  servizi: Servizio[];
}

export const ReportSummary: React.FC<ReportSummaryProps> = ({ servizi }) => {
  const totalAmount = servizi.reduce((sum, servizio) => sum + (servizio.incasso_previsto || 0), 0);
  const totalHours = servizi.reduce((sum, servizio) => sum + (servizio.ore_finali || 0), 0);
  
  return (
    <View style={styles.summary}>
      <Text style={styles.summaryText}>Totale servizi: {servizi.length}</Text>
      <Text style={styles.summaryText}>Totale ore: {totalHours.toFixed(1)}</Text>
      <Text style={styles.summaryText}>Totale: {formatCurrency(totalAmount)}</Text>
    </View>
  );
};
