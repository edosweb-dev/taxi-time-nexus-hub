
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useSpeseAziendali } from '@/hooks/useSpeseAziendali';

export function ReportMensile() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { totaliMese } = useSpeseAziendali();

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'spesa':
        return <Badge variant="destructive" className="text-xs">Spesa</Badge>;
      case 'incasso':
        return <Badge variant="default" className="text-xs bg-green-600">Incasso</Badge>;
      case 'prelievo':
        return <Badge variant="secondary" className="text-xs bg-blue-600 text-white">Prelievo</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{tipo}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <CardTitle>Report Mensile</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium min-w-[120px] text-center">
                {format(currentDate, 'MMMM yyyy', { locale: it })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
                disabled={currentDate.getMonth() >= new Date().getMonth() && currentDate.getFullYear() >= new Date().getFullYear()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Esporta
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {totaliMese && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  €{totaliMese.spese.toFixed(2)}
                </div>
                <div className="text-sm text-red-600">Tot. Spese</div>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  €{totaliMese.incassi.toFixed(2)}
                </div>
                <div className="text-sm text-green-600">Tot. Incassi</div>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  €{totaliMese.prelievi.toFixed(2)}
                </div>
                <div className="text-sm text-blue-600">Tot. Prelievi</div>
              </CardContent>
            </Card>
            
            <Card className={`${totaliMese.saldo >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${totaliMese.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  €{totaliMese.saldo.toFixed(2)}
                </div>
                <div className={`text-sm ${totaliMese.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Saldo
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
