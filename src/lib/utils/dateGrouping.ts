import { format, isToday, isTomorrow, isYesterday } from "date-fns";
import { it } from "date-fns/locale";

/**
 * Groups items by date with localized date headers
 */
export function groupByDate<T extends { data_servizio: string }>(
  items: T[]
): { date: string; label: string; items: T[] }[] {
  const groups = new Map<string, T[]>();

  items.forEach(item => {
    const date = item.data_servizio;
    if (!groups.has(date)) {
      groups.set(date, []);
    }
    groups.get(date)!.push(item);
  });

  return Array.from(groups.entries())
    .map(([date, items]) => ({
      date,
      label: getDateLabel(date),
      items
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Returns a localized date label (OGGI, DOMANI, IERI, or formatted date)
 */
export function getDateLabel(dateString: string): string {
  const date = new Date(dateString);

  if (isToday(date)) {
    return `OGGI - ${format(date, "EEEE d MMMM", { locale: it })}`;
  }
  
  if (isTomorrow(date)) {
    return `DOMANI - ${format(date, "EEEE d MMMM", { locale: it })}`;
  }
  
  if (isYesterday(date)) {
    return `IERI - ${format(date, "EEEE d MMMM", { locale: it })}`;
  }

  return format(date, "EEEE d MMMM yyyy", { locale: it }).toUpperCase();
}
