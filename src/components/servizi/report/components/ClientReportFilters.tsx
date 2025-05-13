
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MonthOption {
  value: string;
  label: string;
}

interface YearOption {
  value: string;
  label: string;
}

interface ClientReportFiltersProps {
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  monthOptions: MonthOption[];
  yearOptions: YearOption[];
}

export const ClientReportFilters: React.FC<ClientReportFiltersProps> = ({
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  monthOptions,
  yearOptions
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 max-w-md mb-6">
      <Select 
        value={selectedMonth}
        onValueChange={setSelectedMonth}
      >
        <SelectTrigger>
          <SelectValue placeholder="Mese" />
        </SelectTrigger>
        <SelectContent>
          {monthOptions.map((month) => (
            <SelectItem key={month.value} value={month.value}>
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select 
        value={selectedYear} 
        onValueChange={setSelectedYear}
      >
        <SelectTrigger>
          <SelectValue placeholder="Anno" />
        </SelectTrigger>
        <SelectContent>
          {yearOptions.map((year) => (
            <SelectItem key={year.value} value={year.value}>
              {year.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
