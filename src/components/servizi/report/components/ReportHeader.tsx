
import React from 'react';
import { Text, View, Image } from '@react-pdf/renderer';
import { styles } from '../styles/reportPDFStyles';
import { format } from 'date-fns';
import { Azienda } from '@/lib/types';

interface ReportHeaderProps {
  azienda: Azienda;
  referenteName: string;
  month: number;
  year: number;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({
  azienda,
  referenteName,
  month,
  year,
}) => {
  const monthName = new Intl.DateTimeFormat('it-IT', { month: 'long' }).format(new Date(year, month - 1));
  
  return (
    <>
      <View style={styles.header}>
        <View>
          {/* Logo placeholder */}
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
    </>
  );
};
