
import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { styles } from '../styles/reportPDFStyles';
import { format } from 'date-fns';

export const ReportFooter: React.FC = () => {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>TaxiTime - Report generato il {format(new Date(), 'dd/MM/yyyy HH:mm')}</Text>
    </View>
  );
};
