
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';

interface ServizioSelectionTableProps {
  servizi: any[];
  selectedServizi: { id: string; selected: boolean }[];
  toggleServizioSelection: (id: string) => void;
  isLoading: boolean;
}

export const ServizioSelectionTable: React.FC<ServizioSelectionTableProps> = ({
  servizi,
  selectedServizi,
  toggleServizioSelection,
  isLoading
}) => {
  if (isLoading) {
    return <div className="text-center py-4">Caricamento servizi in corso...</div>;
  }

  if (selectedServizi.length === 0) {
    return <div className="text-center py-4">Nessun servizio consuntivato trovato per i criteri selezionati.</div>;
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Seleziona
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Data
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Partenza
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Destinazione
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Importo
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {servizi.map((servizio, index) => {
            const isSelected = selectedServizi.find(s => s.id === servizio.id)?.selected || false;
            return (
              <tr key={servizio.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Checkbox 
                    checked={isSelected}
                    onCheckedChange={() => toggleServizioSelection(servizio.id)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(servizio.data_servizio).toLocaleDateString('it-IT')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {servizio.indirizzo_presa}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {servizio.indirizzo_destinazione}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {servizio.incasso_previsto ? 
                    new Intl.NumberFormat('it-IT', { 
                      style: 'currency', 
                      currency: 'EUR' 
                    }).format(servizio.incasso_previsto) : 
                    '€ 0,00'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
