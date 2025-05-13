
import React from 'react';
import { Text, View, Image } from '@react-pdf/renderer';
import { styles } from '../styles/reportPDFStyles';
import { format } from 'date-fns';
import { Servizio } from '@/lib/types/servizi';
import { Profile } from '@/lib/types';
import { getUserName } from '@/components/servizi/utils/userUtils';
import { formatCurrency } from '@/components/servizi/utils/formatUtils';

interface ReportTableProps {
  servizi: Servizio[];
  passeggeriCounts: Record<string, number>;
  users: Profile[];
}

export const ReportTable: React.FC<ReportTableProps> = ({
  servizi,
  passeggeriCounts,
  users,
}) => {
  // Sort services by date to ensure chronological order
  const sortedServizi = [...servizi].sort((a, b) => 
    new Date(a.data_servizio).getTime() - new Date(b.data_servizio).getTime()
  );

  return (
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
      {sortedServizi.map((servizio) => (
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
  );
};
