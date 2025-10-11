/**
 * Utilities per la gestione delle date nel sistema di gestione turni
 * Corregge i problemi di mapping giorni settimana e ottimizza la logica date
 */

import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isWithinInterval 
} from 'date-fns';
import { it } from 'date-fns/locale';

// Mapping semplificato e robusto per i giorni della settimana
export const WEEKDAY_MAPPING = {
  // JavaScript getDay() mapping: 0=Dom, 1=Lun, 2=Mar, 3=Mer, 4=Gio, 5=Ven, 6=Sab
  // UI array mapping: 0=Lun, 1=Mar, 2=Mer, 3=Gio, 4=Ven, 5=Sab, 6=Dom
  jsToUi: (jsDay: number): number => {
    return jsDay === 0 ? 6 : jsDay - 1;
  },
  
  uiToJs: (uiDay: number): number => {
    return uiDay === 6 ? 0 : uiDay + 1;
  }
};

export const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

/**
 * Calcola tutte le date valide per la creazione batch dei turni
 */
export function calculateBatchDates(params: {
  targetMonth: Date;
  periodType: 'week' | 'month';
  weekdays: number[];
  weekNumber?: number;
}): Date[] {
  const { targetMonth, periodType, weekdays, weekNumber } = params;
  
  console.log(`🗓️ [BATCH DATES] Calcolo date per ${format(targetMonth, 'MMMM yyyy', { locale: it })}`);
  console.log(`🗓️ [BATCH DATES] Tipo: ${periodType}, Giorni UI: [${weekdays.join(', ')}], Settimana: ${weekNumber || 'N/A'}`);
  
  const monthStart = startOfMonth(targetMonth);
  const monthEnd = endOfMonth(targetMonth);
  
  let dates: Date[] = [];
  
  if (periodType === 'month') {
    // Tutte le date del mese che corrispondono ai giorni selezionati
    const allDates = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    dates = allDates.filter(date => {
      const jsDay = date.getDay();
      const uiDay = WEEKDAY_MAPPING.jsToUi(jsDay);
      const isSelected = weekdays.includes(uiDay);
      
      console.log(`🗓️ [FILTER] ${format(date, 'yyyy-MM-dd (EEEE)', { locale: it })}: JS=${jsDay} → UI=${uiDay} (${WEEKDAY_LABELS[uiDay]}) → ${isSelected ? '✅' : '❌'}`);
      
      return isSelected;
    });
    
  } else if (periodType === 'week' && weekNumber) {
    // Date di una settimana specifica
    const weekStart = startOfWeek(
      new Date(monthStart.getFullYear(), monthStart.getMonth(), 1 + (weekNumber - 1) * 7),
      { weekStartsOn: 1 }
    );
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    
    console.log(`🗓️ [WEEK] Settimana ${weekNumber}: ${format(weekStart, 'yyyy-MM-dd')} - ${format(weekEnd, 'yyyy-MM-dd')}`);
    
    const weekDates = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    dates = weekDates.filter(date => {
      // Solo date che cadono nel mese target
      if (!isWithinInterval(date, { start: monthStart, end: monthEnd })) {
        return false;
      }
      
      const jsDay = date.getDay();
      const uiDay = WEEKDAY_MAPPING.jsToUi(jsDay);
      return weekdays.includes(uiDay);
    });
  }
  
  console.log(`🗓️ [RESULT] Date calcolate: ${dates.length}`);
  dates.forEach((date, index) => {
    console.log(`🗓️ [RESULT] ${index + 1}. ${format(date, 'yyyy-MM-dd (EEEE)', { locale: it })}`);
  });
  
  return dates;
}

/**
 * Calcola le settimane di un mese per la UI
 */
export function getMonthWeeks(date: Date) {
  try {
    const weeks = [];
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    
    let currentWeek = 1;
    let weekStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    
    while (weekStart <= monthEnd && currentWeek <= 5) {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const daysInMonth = eachDayOfInterval({
        start: weekStart,
        end: weekEnd
      }).filter(day => isWithinInterval(day, { start: monthStart, end: monthEnd }));
      
      if (daysInMonth.length > 0) {
        weeks.push({
          number: currentWeek,
          start: weekStart,
          end: weekEnd,
          label: `Settimana ${currentWeek} (${format(weekStart, 'd MMM', { locale: it })} - ${format(weekEnd, 'd MMM', { locale: it })})`
        });
      }
      currentWeek++;
      weekStart = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
    
    return weeks;
  } catch (error) {
    console.error('Error in getMonthWeeks:', error);
    return [];
  }
}